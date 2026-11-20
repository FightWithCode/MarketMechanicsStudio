"""Compose the short's original music and Foley as a stereo WAV.

Run with Python and NumPy, then encode the WAV to MP3. Pass --expanded for
the 96-second cut's cue sheet.
"""

import sys
import wave
import numpy as np

RATE = 48000
EXPANDED = "--expanded" in sys.argv[2:]
DURATION = 96 if EXPANDED else 60
RNG = np.random.default_rng(380)
mix = np.zeros((DURATION * RATE, 2), dtype=np.float32)


def place(when, samples, level=1.0, pan=0):
    start = int(when * RATE)
    end = min(len(mix), start + len(samples))
    if end <= start:
        return
    balance = np.sqrt(np.array([(1 - pan) / 2, (1 + pan) / 2]))
    mix[start:end] += samples[:end-start, None] * balance * level


def time(seconds):
    return np.arange(int(seconds * RATE)) / RATE


def note(when, pitch, seconds, level, pan=0, attack=.027, decay=2.4):
    t = time(seconds)
    fade = np.minimum(1, t / attack) * np.minimum(1, (seconds - t) / .075)
    sound = (np.sin(2*np.pi*pitch*t) + .21*np.sin(2*np.pi*pitch*2.003*t)
             + .14*np.sin(2*np.pi*pitch*3.017*t)) * np.exp(-t*decay) * fade
    place(when, sound, level, pan)
    place(when + .19, sound, level*.17, -pan)


def grain(when, seconds, level, pan=0, ringing=0):
    t = time(seconds)
    white = RNG.normal(0, 1, len(t))
    smoothed = np.convolve(white, np.ones(8)/8, mode="same")
    texture = .64*smoothed + .22*white
    if ringing:
        texture += .34*np.sin(2*np.pi*ringing*t) + .21*np.sin(2*np.pi*ringing*1.58*t)
    envelope = np.minimum(1, t / .006) * np.exp(-t*4.2/seconds)
    place(when, texture*envelope, level, pan)


if EXPANDED:
    tension = (61, 81.5)
    rings = [.34, .74, 1.07, 57.67, 57.99]
    paper = [(6.31,-.25),(9.75,.1),(11.8,.32),(15.82,.12),(17.92,-.18),
             (29.30,-.25),(32.15,.26),(35.44,.2),(38.8,-.15),(41.1,.16),
             (50.32,-.24),(53.45,.22),(57.32,.25),(82.54,-.2),(93.4,.12)]
    flips = [25.90,27.18,44.95,46.10,47.74,75.76,77.84,79.84]
    gavel = 69.17
    steps = (61.18,65.67,.39)
    ambience = [(0,6),(22,24.2),(61,67),(67.3,81.5)]
else:
    tension = (30.9,46.8)
    rings = [.22,.57,1.49,1.79,25.62,25.98,26.35,26.75]
    paper = [(4.26,-.25),(6.67,-.26),(8.51,.3),(12.8,.24),(13.72,-.2),
             (20.15,-.22),(22.41,.16),(23.2,.31),(27.64,.38),(48.09,-.2),(55.45,.19),(58.33,.4)]
    flips = [17.89,18.54,19.11,41.88,42.86,43.81,44.65,45.6,46.38]
    gavel = 39.93
    steps = (31.18,35.41,.29)
    ambience = [(0,4.3),(15.4,17.7),(31.1,35.6),(36,45.1)]

# A low four-note motif, with faster pulses as the crowd builds.
for when in np.arange(.42, DURATION-.6, 1.62):
    bar = int(when//6.48)
    bass = [55, 49, 58.27, 46.25, 55, 58.27, 49, 41.2, 55, 55][bar % 10]
    urgent = 1 + .34*((tension[0] <= when <= tension[1]) if EXPANDED else (25 < when < 48))
    if EXPANDED and 29 < when < 56:
        urgent *= .72
    note(when, bass, 2.6, .029*urgent, -.16, attack=.14, decay=.85)
    note(when+.3, bass*2.006, 1.5, .012, .2, attack=.07, decay=1.8)
    if bar not in (4, 5, 6):
        note(when+.75, bass*(2.997 if int(when)%2 else 3.364), 1.2, .012, .32)
for when in np.arange(*tension, .45):
    note(when, 82.41 if int(when)%2 else 73.42, .26, .024, -.23, attack=.018, decay=6.2)

# Phone buzz and countertop rumble.
for when in rings:
    t = time(.19)
    sound = (np.sin(2*np.pi*126*t) + .23*np.sin(2*np.pi*252*t))
    place(when, sound * np.sin(np.pi*t/.19)**.75, .068, .25)
    grain(when, .12, .027, .25, 183)
for when, pan in paper:
    grain(when,.31,.058,pan,114 if when in (20.15,48.09,29.30,82.54) else 0)

# Mechanical price flips and a wood gavel.
for when in flips:
    grain(when,.13,.083,.22,424)
    note(when+.025, 128,.14,.031,-.13,attack=.006,decay=21)
grain(gavel,.43,.23,.19,142)
note(gavel,72,.34,.094,.1,attack=.006,decay=14)
for when in np.arange(*steps):
    grain(when,.19,.087,-.28+((when-(steps[0] if EXPANDED else 31))%1)*.56,87)
    grain(when+.041,.11,.071,.1)

for start, end in ambience:
    t = time(end - start)
    air = np.convolve(RNG.normal(0,1,len(t)),np.ones(20)/20,mode="same")
    swell = np.minimum(1, t/.49) * np.minimum(1,(end-start-t)/.49)
    place(start,air*swell,.046 if start<tension[0]+5 else .055,.19)

end_fade = np.clip((DURATION - time(DURATION)) / 1.22, 0, 1)
mix *= end_fade[:,None]
with wave.open(sys.argv[1],"wb") as track:
    track.setparams((2,2,RATE,0,"NONE",""))
    track.writeframes((np.clip(mix,-1,1)*32767).astype("<i2").tobytes())
