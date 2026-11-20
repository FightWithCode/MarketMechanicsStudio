"""Render an episode's narration in one Piper session and time its sentences."""

import json
import re
import sys
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice, SynthesisConfig

model, output = sys.argv[1:3]
voice = PiperVoice.load(model)
sample_rate = voice.config.sample_rate
settings = SynthesisConfig(volume=0.83, length_scale=0.94, noise_scale=0.57, noise_w_scale=0.68)
takes = []

for index, text in enumerate(json.load(sys.stdin)):
    spans = []
    offset = 0
    with wave.open(str(Path(output) / f"take-{index}.wav"), "wb") as wav:
        wav.setparams((1, 2, sample_rate, 0, "NONE", ""))
        for sentence in re.finditer(r"\S.*?(?:[.!?](?=\s|$)|$)", text, flags=re.S):
            rendered = [chunk.audio_int16_array for chunk in voice.synthesize(sentence[0], settings)]
            if not rendered:
                continue
            samples = np.concatenate(rendered)
            audible = np.flatnonzero(np.abs(samples.astype(np.int32)) > 310)
            if audible.size:
                head = max(0, audible[0] - int(sample_rate * 0.04))
                tail = min(len(samples), audible[-1] + int(sample_rate * 0.095))
                samples = samples[head:tail]
            spans.append({
                "first": sentence.start(), "last": sentence.end(),
                "start": offset / sample_rate, "end": (offset + len(samples)) / sample_rate,
            })
            wav.writeframesraw(samples.astype("<i2", copy=False).tobytes())
            pause = int(sample_rate * 0.11)
            wav.writeframesraw(bytes(pause * 2))
            offset += len(samples) + pause
    if not offset:
        raise RuntimeError(f"Piper produced no speech for scene {index + 1}.")
    takes.append({"duration": offset / sample_rate, "spans": spans})

print(json.dumps(takes))
