#!/usr/bin/env python3
"""Match first utterances using ONE constant gain per complete WAV.

Requires FFmpeg (PATH, --ffmpeg, or imageio-ffmpeg). Defaults to measurement;
--apply validates all staged outputs before replacing any source. No backups.

Reference windows crop audio ONLY for analysis. Meter their gated loudness and
measure true peak over the ENTIRE file. Lower the common target until every
file can reach it safely. Actual mono uses dual_mono for stereo playback.
An additional stereo offset is a listening preference for these separate-speaker
stereo examples, beyond that meter compensation. Peak constraints can realize
the relative offset by reducing mono instead of increasing stereo.

The only output filter is volume=<one scalar>, identical for ALL samples and
ALL channels. No per-channel leveling, compressor, limiter, trimming, or
resampling. Every output sample is checked against the original times that
single scalar, allowing only PCM16 rounding. Regenerate waveform data after.
"""

from __future__ import annotations

import argparse
import array
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import wave

AUDIO_ROOT = Path(__file__).resolve().parents[1] / "src/Source/audio"
DEFAULT_WINDOWS = Path(__file__).with_name("first-utterance-windows.json")


def run(command: list[str]) -> subprocess.CompletedProcess:
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr[-3000:])
    return result


def measure(ffmpeg: str, path: Path, window: dict | None = None) -> dict:
    filters = []
    if window is not None:
        # Analysis only. The output-writing command never trims audio.
        filters += [f"atrim=start={window['start']}:end={window['end']}", "asetpts=PTS-STARTPTS"]
    filters.append("loudnorm=I=-18:TP=-1:LRA=50:dual_mono=true:print_format=json")
    result = run([ffmpeg, "-nostdin", "-hide_banner", "-nostats", "-i", str(path),
                  "-af", ",".join(filters), "-f", "null", "-"])
    match = re.search(r'\{\s*"input_i".*?\n\}', result.stderr, re.S)
    if not match:
        raise ValueError(f"No measurements returned for {path}")
    measured = json.loads(match.group())
    levels = {"lufs": float(measured["input_i"]), "true_peak_dbtp": float(measured["input_tp"])}
    if not all(math.isfinite(value) for value in levels.values()):
        raise ValueError(f"Silent or too-short reference: {path} {window}")
    return levels


def read_pcm(path: Path) -> tuple[dict, array.array]:
    with wave.open(str(path), "rb") as audio:
        if audio.getsampwidth() != 2 or audio.getcomptype() != "NONE":
            raise ValueError(f"Expected PCM16 WAV: {path}")
        header = {"frames": audio.getnframes(), "sample_rate": audio.getframerate(), "channels": audio.getnchannels()}
        samples = array.array("h", audio.readframes(audio.getnframes()))
    if sys.byteorder != "little":
        samples.byteswap()
    if len(samples) != header["frames"] * header["channels"]:
        raise ValueError(f"Incomplete PCM data: {path}")
    return header, samples


def validate_constant_gain(source: Path, output: Path, gain_db: float) -> dict:
    before_header, before = read_pcm(source)
    after_header, after = read_pcm(output)
    if before_header != after_header:
        raise ValueError(f"PCM dimensions changed: {source}")
    scale = 10 ** (gain_db / 20)
    # Every interleaved sample must follow the SAME gain. This also verifies
    # channel balance, silent samples, alignment, and no dynamic processing.
    max_error = 0.0
    for original, processed in zip(before, after):
        if processed in (-32768, 32767):
            raise ValueError(f"Full-scale output sample: {source}")
        max_error = max(max_error, abs(processed - original * scale))
    if max_error > 1.0:
        raise ValueError(f"Output violates uniform gain beyond PCM16 rounding: {source}, {max_error}")
    return {"all_samples_same_gain": True, "max_rounding_error_pcm": max_error, "rail_samples": 0}


def plan_gains(levels: list[dict], channels: list[int], preferred: float,
               ceiling: float, stereo_offset: float) -> tuple[float, list[float]]:
    offsets = [stereo_offset if count == 2 else 0.0 for count in channels]
    # Each file still receives ONE scalar. Account for its offset before finding
    # the common base target so no part of any full file exceeds the ceiling.
    base = min(preferred, *(level["first_utterance"]["lufs"] + ceiling - 0.2
                           - level["whole_file"]["true_peak_dbtp"] - offset
                           for level, offset in zip(levels, offsets)))
    base = math.floor(base * 10) / 10
    return base, [base + offset for offset in offsets]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", default=shutil.which("ffmpeg"))
    parser.add_argument("--windows", type=Path, default=DEFAULT_WINDOWS)
    parser.add_argument("--target", type=float, default=-18.0, help="Preferred first-utterance LUFS; reduced for full-file peak headroom")
    parser.add_argument("--stereo-offset-db", type=float, default=2.5, help="Extra relative level for separate-speaker stereo beyond dual-mono metering, dB")
    parser.add_argument("--ceiling", type=float, default=-1.0, help="Maximum true peak anywhere in any file, dBTP")
    parser.add_argument("--report", type=Path, help="Optional measurement report outside the website")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if not args.ffmpeg:
        try:
            import imageio_ffmpeg
            args.ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        except ImportError:
            parser.error("FFmpeg is required; provide --ffmpeg or install imageio-ffmpeg")
    if not (-70 <= args.target <= -5 and -9 <= args.ceiling <= 0):
        parser.error("Use target -70..-5 LUFS and ceiling -9..0 dBTP")
    if not 0 <= args.stereo_offset_db <= 6:
        parser.error("Use stereo offset 0..6 dB")

    windows = json.loads(args.windows.read_text())["files"]
    paths = sorted(AUDIO_ROOT.rglob("*.wav"))
    if not paths or {str(path.relative_to(AUDIO_ROOT)) for path in paths} != set(windows):
        raise ValueError("Every WAV needs exactly one reviewed first-utterance window")
    records = []
    for path in paths:
        relative = str(path.relative_to(AUDIO_ROOT))
        window = windows[relative]
        header, _ = read_pcm(path)
        if header["channels"] not in (1, 2):
            raise ValueError(f"Expected mono or separate-speaker stereo: {relative}")
        duration = header["frames"] / header["sample_rate"]
        if not (0 <= window["start"] < window["end"] <= duration and window["end"] - window["start"] >= 0.4):
            raise ValueError(f"Invalid first-utterance window: {relative}")
        records.append({"file": relative, "reference": window, "pcm": header,
                        "input_sha256": hashlib.sha256(path.read_bytes()).hexdigest()})

    def levels(item: tuple[Path, dict]) -> dict:
        path, record = item
        return {"first_utterance": measure(args.ffmpeg, path, record["reference"]),
                "whole_file": measure(args.ffmpeg, path)}

    with ThreadPoolExecutor(max_workers=4) as executor:
        before = list(executor.map(levels, zip(paths, records)))
    target, file_targets = plan_gains(before, [record["pcm"]["channels"] for record in records],
                                     args.target, args.ceiling, args.stereo_offset_db)
    for record, level, file_target in zip(records, before, file_targets):
        record["before"] = level
        record["target_lufs"] = file_target
        gain = round(file_target - level["first_utterance"]["lufs"], 8)
        # Avoid rewriting files for insignificant meter/PCM rounding differences.
        record["gain_db"] = 0.0 if abs(gain) <= 0.05 else gain
        print(f"{record['file']}: first {level['first_utterance']['lufs']:.2f} LUFS; full peak {level['whole_file']['true_peak_dbtp']:.2f} dBTP; uniform gain {record['gain_db']:+.2f} dB", flush=True)
    report = {"method": "first-utterance reference; one constant gain per entire file", "mono_target_lufs": target,
              "stereo_target_lufs": target + args.stereo_offset_db, "stereo_offset_db": args.stereo_offset_db,
              "ceiling_dbtp": args.ceiling, "dual_mono": True, "applied": False, "files": records}
    print(f"First-utterance targets: mono {target:.1f}, stereo {target + args.stereo_offset_db:.1f} LUFS; full-file ceiling {args.ceiling:.1f} dBTP", flush=True)

    if args.apply:
        with tempfile.TemporaryDirectory(prefix=".audio-normalization-", dir=AUDIO_ROOT.parent) as directory:
            processed = []
            for index, (path, record) in enumerate(zip(paths, records)):
                if hashlib.sha256(path.read_bytes()).hexdigest() != record["input_sha256"]:
                    raise ValueError(f"Source changed during measurement: {path}")
                if record["gain_db"] == 0:
                    record["validation"] = validate_constant_gain(path, path, 0.0)
                    record["rewritten"] = False
                    processed.append(path)
                    continue
                destination = Path(directory) / f"{index:02d}.wav"
                run([args.ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(path),
                     "-af", f"volume={record['gain_db']:.8f}dB:precision=double",
                     "-c:a", "pcm_s16le", "-map_metadata", "0", str(destination)])
                record["validation"] = validate_constant_gain(path, destination, record["gain_db"])
                record["rewritten"] = True
                processed.append(destination)
            with ThreadPoolExecutor(max_workers=4) as executor:
                after = list(executor.map(levels, zip(processed, records)))
            for record, level in zip(records, after):
                if level["whole_file"]["true_peak_dbtp"] > args.ceiling or abs(level["first_utterance"]["lufs"] - record["target_lufs"]) > 0.2:
                    raise ValueError(f"Post-processing levels failed: {record['file']} {level}")
                record["after"] = level
            # Do not replace ANY input until ALL outputs pass validation.
            for path, record in zip(paths, records):
                if hashlib.sha256(path.read_bytes()).hexdigest() != record["input_sha256"]:
                    raise ValueError(f"Source changed during processing: {path}")
            for destination, path in zip(processed, paths):
                if destination != path:
                    destination.replace(path)
            report["applied"] = True
        print(f"Applied and verified {len(paths)} files: one gain per file, all samples checked, no new clipping.", flush=True)
    if args.report:
        args.report.write_text(json.dumps(report, indent=2) + "\n")


if __name__ == "__main__":
    main()
