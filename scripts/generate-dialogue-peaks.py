#!/usr/bin/env python3
"""Regenerate stereo waveform previews: python3 scripts/generate-dialogue-peaks.py.

Uses only the Python standard library. Peaks are bundled with the page so audio
playback and waveform rendering also work on hosts without CORS support.
"""

import array
import json
import math
from pathlib import Path
import sys
import wave


AUDIO_ROOT = Path(__file__).resolve().parents[1] / "src/Source/audio/dialogue_continuation"
BIN_COUNT = 320


def waveform_peaks(path: Path) -> list[list[float]]:
    metadata = json.loads(path.with_suffix(".json").read_text())
    with wave.open(str(path), "rb") as audio:
        if audio.getnchannels() != 2 or audio.getsampwidth() != 2:
            raise ValueError(f"Expected stereo 16-bit PCM: {path}")
        frame_count = audio.getnframes()
        sample_rate = audio.getframerate()
        duration = frame_count / sample_rate
        samples = array.array("h", audio.readframes(frame_count))
    if sys.byteorder != "little":
        samples.byteswap()

    if metadata["audio"] != path.name or metadata["sample_rate"] != sample_rate:
        raise ValueError(f"Audio metadata does not match WAV: {path}")
    if not math.isclose(duration, metadata["duration_sec"], abs_tol=1 / sample_rate):
        raise ValueError(f"Duration does not match WAV: {path}")
    if not 0 < metadata["prompt_end_sec"] < duration:
        raise ValueError(f"Prompt boundary outside audio: {path}")
    for segment in metadata["segments"]:
        if not (
            segment["speaker"] in ("A", "B")
            and 0 <= segment["start"] < segment["end"] <= duration
            and isinstance(segment["text"], str)
            and isinstance(segment["generated"], bool)
        ):
            raise ValueError(f"Invalid caption in {path}: {segment}")

    channels = [samples[channel::2] for channel in range(2)]
    peaks = [
        [
            max(
                (abs(sample) for sample in channel[
                    index * frame_count // BIN_COUNT:(index + 1) * frame_count // BIN_COUNT
                ]),
                default=0,
            )
            for index in range(BIN_COUNT)
        ]
        for channel in channels
    ]
    # A single scale for both channels preserves their relative amplitudes.
    scale = max(max(channel) for channel in peaks) or 1
    return [[round(peak / scale, 4) for peak in channel] for channel in peaks]


def main() -> None:
    paths = sorted(AUDIO_ROOT.glob("*/*.wav"))
    if not paths:
        raise ValueError(f"No audio files found in {AUDIO_ROOT}")
    peaks = {
        path.relative_to(AUDIO_ROOT).with_suffix("").as_posix(): waveform_peaks(path)
        for path in paths
    }
    destination = AUDIO_ROOT / "peaks.json"
    destination.write_text(json.dumps(peaks, separators=(",", ":")) + "\n")
    print(f"Validated {len(paths)} clips; wrote {BIN_COUNT} peaks per channel to {destination}")


if __name__ == "__main__":
    main()
