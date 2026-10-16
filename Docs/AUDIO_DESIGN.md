# Audio Design Specification: Project V2

## 1. Sound Design Philosophy

Audio in Project V2 is an essential gameplay system providing immediate spatial and tactical awareness:
* **Zero Missing Asset Fallbacks:** All sound effects in the lightweight build are synthesized procedurally via `WebAudioAPI`. This eliminates 404 missing audio files, broken codecs, or heavy asset downloads.
* **Tactical Auditory Cues:** Actions have distinct acoustic signatures. Running produces footsteps; tactical walking is completely silent; reloads and weapon switches broadcast mechanical clicks detectable around corners.

---

## 2. Procedural Sound Synthesizer Specifications

### 2.1 Gunshot Blast (Tactical AR-556)
* **Layer 1 (Powder Detonation):** White noise burst passed through a resonant lowpass filter dropping from 3,500 Hz to 100 Hz over 150 ms.
* **Layer 2 (Mechanical Punch):** Triangle oscillator starting at 150 Hz with an exponential downward frequency ramp to 30 Hz over 120 ms.
* **Layer 3 (Tail):** Exponential decay gain envelope creating clean decay without clipping.

### 2.2 Hit Registration Confirmation ("Ding")
* **Waveform:** Pure sinusoidal oscillation at 1,200 Hz jumping to 1,600 Hz over 30 ms, decaying in 80 ms.
* **Psychological Impact:** Instant, unmistakable audible reward for on-target hits.

### 2.3 Mechanical Weapon Reload
* **Waveform:** Dual sawtooth clicks at 300 Hz rising to 800 Hz over 200 ms, simulating magazine ejection and chamber lock.

### 2.4 Impact & Damage Hurt
* **Waveform:** Low-frequency sawtooth sweep from 90 Hz down to 40 Hz over 180 ms, conveying physical impact shock.

---

## 3. Spatialization & Attenuation Rules

* **Falloff Curve:** Inverse-distance model `Gain = 1.0 / (1.0 + (Distance / 10.0))`.
* **Sound Occlusion:** Sounds originating behind solid walls have high frequencies attenuated by 60% to simulate physical barrier dampening.
