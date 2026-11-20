"""Offline fallback using the Linux eSpeak NG shared library."""
import ctypes as c
import json
import sys
import wave

engine = c.CDLL('libespeak-ng.so.1')
sample_rate = engine.espeak_Initialize(2, 0, None, 0)
if sample_rate <= 0:
    raise RuntimeError('Could not initialize eSpeak NG')
engine.espeak_SetVoiceByName(b'en-us')
engine.espeak_SetParameter(1, 169, 0)
class Event(c.Structure):
    _fields_ = [
        ('type', c.c_int), ('identifier', c.c_uint),
        ('text_position', c.c_int), ('length', c.c_int),
        ('audio_position', c.c_int), ('sample', c.c_int),
        ('user_data', c.c_void_p), ('id', c.c_uint64),
    ]

words = []
callback_type = c.CFUNCTYPE(c.c_int, c.POINTER(c.c_short), c.c_int, c.POINTER(Event))
with wave.open(sys.argv[1], 'wb') as output:
    output.setparams((1, 2, sample_rate, 0, 'NONE', 'not compressed'))

    @callback_type
    def receive(samples, count, events):
        if samples and count:
            output.writeframesraw(c.string_at(samples, count * 2))
        if events:
            index = 0
            while events[index].type:
                event = events[index]
                if event.type == 1:
                    words.append({'index': event.text_position - 1, 'start': event.audio_position / 1000})
                index += 1
        return 0

    engine.espeak_SetSynthCallback(receive)
    utterance = sys.stdin.read().encode('utf-8')
    if engine.espeak_Synth(utterance, c.c_size_t(len(utterance) + 1), 0, 1, 0, 1, None, None):
        raise RuntimeError('eSpeak NG could not synthesize the supplied text')

print(json.dumps(words))
