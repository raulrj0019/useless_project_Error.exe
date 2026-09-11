import sounddevice as sd
import numpy as np


def audio_callback(indata, frames, time, status):
    if status:
        print(status)

    # Calculate RMS (Root Mean Square) of the audio signal
    rms = np.sqrt(np.mean(indata ** 2))

    # Convert RMS into a more readable percentage-like value
    level = min(rms * 1000, 100)

    print(f"\rSound Level: {level:5.1f}", end="")


print("Microphone test started.")
print("Speak, whisper, shout, or stay silent.")
print("Press Ctrl+C to stop.\n")

with sd.InputStream(
    channels=1,
    samplerate=44100,
    callback=audio_callback
):
    while True:
        sd.sleep(1000)