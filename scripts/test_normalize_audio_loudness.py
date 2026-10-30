"""Regression checks: every output sample must share one file-wide gain."""

import array
import importlib.util
from pathlib import Path
import tempfile
import unittest
import wave

spec = importlib.util.spec_from_file_location("normalizer", Path(__file__).with_name("normalize-audio-loudness.py"))
normalizer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normalizer)


class PlaybackBalanceTests(unittest.TestCase):
    @staticmethod
    def level(lufs, peak):
        return {"first_utterance": {"lufs": lufs}, "whole_file": {"true_peak_dbtp": peak}}

    def test_extra_stereo_offset_is_relative_to_mono(self):
        base, targets = normalizer.plan_gains([self.level(-20, -10)] * 2, [1, 2], -18, -1, 1.5)
        self.assertAlmostEqual(base, -18)
        self.assertAlmostEqual(targets[1] - targets[0], 1.5)

    def test_stereo_peak_limit_lowers_mono_instead_of_clipping(self):
        levels = [self.level(-20.2, -6), self.level(-20.2, -1.2)]
        _, targets = normalizer.plan_gains(levels, [1, 2], -18, -1, 1.5)
        self.assertLess(targets[0], -20.2)
        self.assertLessEqual(targets[1], -20.2)
        self.assertAlmostEqual(targets[1] - targets[0], 1.5)
        for level, target in zip(levels, targets):
            self.assertLessEqual(level["whole_file"]["true_peak_dbtp"] + target - level["first_utterance"]["lufs"], -1.2 + 1e-9)

    def test_zero_offset_uses_same_reference_target(self):
        _, targets = normalizer.plan_gains([self.level(-20, -6)] * 2, [1, 2], -18, -1, 0)
        self.assertEqual(targets[0], targets[1])


class UniformGainTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.source = Path(self.directory.name) / "source.wav"
        self.output = Path(self.directory.name) / "output.wav"
        # Unequal stereo levels, alternating signs, and silence.
        self.samples = [12000, -3000, -8000, 2000, 0, 0, 4000, -1000] * 100
        self.write(self.source, self.samples)

    def write(self, path, samples):
        with wave.open(str(path), "wb") as audio:
            audio.setnchannels(2)
            audio.setsampwidth(2)
            audio.setframerate(24000)
            audio.writeframes(array.array("h", samples).tobytes())

    def test_one_gain_preserves_every_sample_and_channel(self):
        gain = -4.0
        self.write(self.output, [round(value * 10 ** (gain / 20)) for value in self.samples])
        result = normalizer.validate_constant_gain(self.source, self.output, gain)
        self.assertTrue(result["all_samples_same_gain"])
        self.assertLessEqual(result["max_rounding_error_pcm"], 0.5)

    def test_rejects_separate_channel_gains(self):
        self.write(self.output, [round(value * (0.5 if index % 2 == 0 else 0.8)) for index, value in enumerate(self.samples)])
        with self.assertRaisesRegex(ValueError, "uniform gain"):
            normalizer.validate_constant_gain(self.source, self.output, -6.0206)

    def test_rejects_gain_that_changes_during_file(self):
        self.write(self.output, [round(value * (0.5 if index < len(self.samples) // 2 else 0.7)) for index, value in enumerate(self.samples)])
        with self.assertRaisesRegex(ValueError, "uniform gain"):
            normalizer.validate_constant_gain(self.source, self.output, -6.0206)

    def test_rejects_full_scale_samples(self):
        output = self.samples.copy()
        output[-1] = 32767
        self.write(self.output, output)
        with self.assertRaisesRegex(ValueError, "Full-scale"):
            normalizer.validate_constant_gain(self.source, self.output, 0)

    def test_rejects_changed_duration(self):
        self.write(self.output, self.samples[:-2])
        with self.assertRaisesRegex(ValueError, "dimensions"):
            normalizer.validate_constant_gain(self.source, self.output, 0)


if __name__ == "__main__":
    unittest.main()
