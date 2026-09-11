import sounddevice as sd
import numpy as np
import time

SAMPLE_RATE = 44100
DURATION = 3

QUIET_DISTANCE = 5
LOUD_DISTANCE = 8


def measure_sound(duration):
    print("Listening...")

    recording = sd.rec(
        int(duration * SAMPLE_RATE),
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype="float32"
    )

    sd.wait()

    rms = np.sqrt(np.mean(recording ** 2))

    if rms == 0:
        return -100

    db = 20 * np.log10(rms)

    return db


# ---------------- CALIBRATION ----------------

print("\n=== MICROPHONE CALIBRATION ===")

print("\nStay SILENT for 3 seconds...")
noise_level = measure_sound(DURATION)

print("\nNow speak in your NORMAL voice for 3 seconds...")
normal_level = measure_sound(DURATION)

print("\n=== CALIBRATION COMPLETE ===")
print(f"Background level : {noise_level:.1f} dB")
print(f"Normal voice     : {normal_level:.1f} dB")

# Fixed baseline
current_normal = normal_level

print("\nStarting voice detection...")
print("Press Ctrl+C to stop.\n")


# ---------------- DETECTION ----------------

try:
    while True:

        current_level = measure_sound(1)

        difference = current_level - current_normal

        if current_level < noise_level + 3:
            state = "SILENCE"

        elif difference < -QUIET_DISTANCE:
            state = "QUIET"

        elif difference > LOUD_DISTANCE:
            state = "LOUD"

        else:
            state = "NORMAL"

        print(
            f"Level: {current_level:6.1f} dB | "
            f"Difference: {difference:+6.1f} dB | "
            f"State: {state}"
        )

        time.sleep(0.1)

except KeyboardInterrupt:
    print("\nDetection stopped.")