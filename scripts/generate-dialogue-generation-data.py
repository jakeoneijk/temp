#!/usr/bin/env python3
"""Refresh generation metadata: python3 scripts/generate-dialogue-generation-data.py.

Requires PyYAML, or Ruby's standard YAML parser when PyYAML is unavailable.
Source YAML and WAV files stay unchanged; only metadata.json is generated.
No YAML parser or audio decoder is needed in the browser.
"""

import array
import json
from pathlib import Path
import shutil
import subprocess
import sys
import wave


AUDIO_ROOT = Path(__file__).resolve().parents[1] / "src/Source/audio/dialogue_generation"
BIN_COUNT = 320
AUDIO_CHANNELS = {
    "prompt_speakerA": 1,
    "prompt_speakerB": 1,
    "mooncast": 1,
    "vibevoice": 1,
    "zipvoice_dialog_stereo": 2,
    "ours": 2,
}


def read_yaml(path: Path) -> dict:
    try:
        import yaml
    except ImportError:
        if not shutil.which("ruby"):
            raise SystemExit("Install PyYAML to parse source scripts: python3 -m pip install PyYAML")
        result = subprocess.run(
            ["ruby", "-rjson", "-ryaml", "-e",
             "puts JSON.generate(YAML.safe_load(File.read(ARGV.fetch(0))))", str(path)],
            check=True, capture_output=True, text=True,
        )
        return json.loads(result.stdout)
    return yaml.safe_load(path.read_text())


def script_turns(path: Path) -> list[dict]:
    source = read_yaml(path)
    if not isinstance(source, dict) or set(source) != {"turns"}:
        raise ValueError(f"Expected a turns mapping in {path}")
    if not isinstance(source["turns"], list) or not source["turns"]:
        raise ValueError(f"Expected a nonempty turns list in {path}")

    turns = []
    for turn in source["turns"]:
        allowed = {"speaker", "text", "overlap", "interjection"}
        if not (
            isinstance(turn, dict)
            and set(turn) <= allowed
            and turn.get("speaker") in ("A", "B")
            and isinstance(turn.get("text"), str)
            and turn["text"].strip()
        ):
            raise ValueError(f"Invalid turn in {path}: {turn}")
        converted = {"speaker": turn["speaker"], "text": turn["text"]}
        for mark in ("overlap", "interjection"):
            if mark not in turn:
                continue
            enabled = turn[mark]
            if not isinstance(enabled, bool):
                raise ValueError(f"Expected a boolean {mark} flag in {path}: {enabled}")
            if enabled and not any(previous["speaker"] != turn["speaker"] for previous in turns):
                raise ValueError(f"{mark.capitalize()} has no previous other-speaker turn in {path}")
            converted[mark] = enabled
        if converted.get("overlap") and converted.get("interjection"):
            raise ValueError(f"A turn cannot have both overlap and interjection labels in {path}")
        turns.append(converted)
    return turns


def audio_metadata(path: Path, expected_channels: int) -> dict:
    with wave.open(str(path), "rb") as audio:
        frames = audio.getnframes()
        channels = audio.getnchannels()
        if channels != expected_channels or audio.getsampwidth() != 2 or frames <= 0:
            raise ValueError(f"Expected nonempty {expected_channels}-channel PCM16 audio: {path}")
        duration = frames / audio.getframerate()
        samples = array.array("h", audio.readframes(frames))
    if len(samples) != frames * channels:
        raise ValueError(f"Incomplete PCM data in {path}")
    if sys.byteorder != "little":
        samples.byteswap()

    channel_samples = [samples[channel::channels] for channel in range(channels)]
    peaks = [
        [
            max(
                (abs(sample) for sample in channel[
                    index * frames // BIN_COUNT:(index + 1) * frames // BIN_COUNT
                ]),
                default=0,
            )
            for index in range(BIN_COUNT)
        ]
        for channel in channel_samples
    ]
    # Normalize together to preserve the relative amplitudes of stereo channels.
    scale = max(max(channel) for channel in peaks) or 1
    return {
        "duration": duration,
        "channels": channels,
        "peaks": [[round(peak / scale, 4) for peak in channel] for channel in peaks],
    }


def main() -> None:
    examples = {}
    for path in sorted(AUDIO_ROOT.glob("*_script.yaml")):
        example_id = path.name.removesuffix("_script.yaml")
        examples[example_id] = {
            "script": script_turns(path),
            "audio": {
                name: audio_metadata(AUDIO_ROOT / f"{example_id}_{name}.wav", channels)
                for name, channels in AUDIO_CHANNELS.items()
            },
        }
    if not examples:
        raise ValueError(f"No scripts found in {AUDIO_ROOT}")
    destination = AUDIO_ROOT / "metadata.json"
    destination.write_text(json.dumps(examples, ensure_ascii=False, indent=2) + "\n")
    print(f"Validated {len(examples)} scripts and {len(examples) * len(AUDIO_CHANNELS)} WAVs; wrote {destination}")


if __name__ == "__main__":
    main()
