#!/usr/bin/env python3
"""Refresh streaming TTS metadata without modifying source text or WAV files.

Run: python3 scripts/generate-streaming-tts-data.py
"""

import json
from pathlib import Path
import runpy


SCRIPT_ROOT = Path(__file__).resolve().parent
AUDIO_ROOT = SCRIPT_ROOT.parent / "src/Source/audio/streaming_tts"
AUDIO_NAMES = ("prompt", "cosyvoice2", "cosyvoice3", "voxtream2", "ours")

# Reuse the same read-only extraction and mono/stereo validation as contextual TTS.
# Loading this helper does not run the contextual metadata generator.
read_audio_metadata = runpy.run_path(str(SCRIPT_ROOT / "generate-contextual-tts-data.py"))["read_audio_metadata"]


def main() -> None:
    examples = {}
    for path in sorted(AUDIO_ROOT.glob("*_target_text.txt")):
        example_id = path.name.removesuffix("_target_text.txt")
        target_text = path.read_text(encoding="utf-8").strip()
        if not target_text:
            raise ValueError(f"Expected nonempty target text: {path}")
        examples[example_id] = {
            "targetText": target_text,
            "audio": {
                name: read_audio_metadata(AUDIO_ROOT / f"{example_id}_{name}.wav")
                for name in AUDIO_NAMES
            },
        }
    if not examples:
        raise ValueError(f"No target texts found in {AUDIO_ROOT}")
    destination = AUDIO_ROOT / "metadata.json"
    destination.write_text(json.dumps(examples, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Validated {len(examples)} target texts and {len(examples) * len(AUDIO_NAMES)} WAVs; wrote {destination}")


if __name__ == "__main__":
    main()
