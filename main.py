import sounddevice as sd
import numpy as np
import time

from pycaw.pycaw import AudioUtilities


# ============================================================
# SETTINGS
# ============================================================

SAMPLE_RATE = 44100
CALIBRATION_DURATION = 3

QUIET_DISTANCE = 4
LOUD_DISTANCE = 8

VOLUME_STEP = 0.05       # 5%
COOLDOWN = -0.15            # seconds


# ============================================================
# MICROPHONE
# ============================================================

def measure_sound(duration):

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


# ============================================================
# VOLUME
# ============================================================

device = AudioUtilities.GetSpeakers()
volume = device.EndpointVolume


def change_volume(amount):

    current_volume = volume.GetMasterVolumeLevelScalar()

    new_volume = max(
        0.0,
        min(current_volume + amount, 1.0)
    )

    volume.SetMasterVolumeLevelScalar(new_volume, None)

    print(
        f"🔊 Volume: {current_volume * 100:.0f}% → "
        f"{new_volume * 100:.0f}%"
    )


# ============================================================
# CALIBRATION
# ============================================================

print("\n================================")
print("   VOICE VOLUME CONTROLLER")
print("================================")

print("\nStay SILENT for 3 seconds...")
noise_level = measure_sound(CALIBRATION_DURATION)

print("Now speak in your NORMAL voice for 3 seconds...")
normal_level = measure_sound(CALIBRATION_DURATION)

print("\n========== CALIBRATION ==========")
print(f"Background : {noise_level:.1f} dB")
print(f"Normal     : {normal_level:.1f} dB")
print("=================================\n")

print("Starting controller...")
print("QUIET  → Volume UP")
print("NORMAL → Nothing")
print("LOUD   → Volume DOWN")
print("Press Ctrl+C to stop.\n")


# ============================================================
# MAIN LOOP
# ============================================================

last_volume_change = 0

try:

    while True:

        current_level = measure_sound(1)

        difference = current_level - normal_level

        # ---------------- CLASSIFICATION ----------------

        if current_level < noise_level + 3:

            state = "SILENCE"

        elif difference < -QUIET_DISTANCE:

            state = "QUIET"

        elif difference > LOUD_DISTANCE:

            state = "LOUD"

        else:

            state = "NORMAL"


        # ---------------- DISPLAY ----------------

        print(
            f"Level: {current_level:6.1f} dB | "
            f"Difference: {difference:+6.1f} dB | "
            f"State: {state}"
        )


        # ---------------- VOLUME CONTROL ----------------

        current_time = time.time()

        if current_time - last_volume_change >= COOLDOWN:

            if state == "QUIET":

                change_volume(+VOLUME_STEP)
                last_volume_change = current_time

            elif state == "LOUD":

                change_volume(-VOLUME_STEP)
                last_volume_change = current_time


        time.sleep(0.1)


except KeyboardInterrupt:

    print("\n\nController stopped.")