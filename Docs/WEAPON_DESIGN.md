# Weapon Design & Ballistics Specification: Project V2

## 1. Modular Weapon Architecture

Weapons are governed by data-driven definitions (`UWeaponDataAsset` in UE5 / JSON configuration in lightweight engine). Core logic is decoupled into:
1. **Weapon State Machine:** `Idle`, `Equipping`, `Firing`, `Reloading`, `Inspect`, `Holstered`.
2. **Ballistics Pipeline:** Authoritative hitscan raycast with dynamic cone-of-dispersion (Spread) + View/Vector Offset (Recoil).
3. **Cosmetic Layer:** Procedural weapon sway, camera bobbing, muzzle flash particles, dynamic point lights, and shell ejection.

---

## 2. Baseline Weapon Roster

### Primary Weapon: AR-556 Tactical Rifle
* **Role:** Standard issue, high-precision assault rifle.
* **Fire Mode:** Fully Automatic.
* **Fire Rate:** 600 RPM (10 rounds / second).
* **Magazine / Reserve:** 30 / 90 rounds.
* **Base Damage (20m):**
  * Head: `140` (Lethal 1-shot kill).
  * Chest: `35` (3-shot kill).
  * Stomach: `39` (3-shot kill).
  * Legs: `26` (4-shot kill).
* **Recoil Pattern:**
  * Shots 1–4: Pure vertical climb.
  * Shots 5–12: Sway pull to the right.
  * Shots 13–30: Oscillating horizontal sway.
* **Reload Time:** 2.2 seconds.

### Secondary Weapon: P-900 Tactical Pistol
* **Role:** Reliable backup sidearm with high first-shot precision.
* **Fire Mode:** Semi-Automatic (User-triggered).
* **Fire Rate:** Up to 400 RPM (Trigger-capped).
* **Magazine / Reserve:** 15 / 45 rounds.
* **Base Damage (20m):**
  * Head: `85` (2-shot kill).
  * Chest: `28` (4-shot kill).
  * Stomach: `32` (4-shot kill).
  * Legs: `21` (5-shot kill).
* **Recoil:** Minor vertical rise with instant recovery (< 0.2s).
* **Reload Time:** 1.6 seconds.

---

## 3. Weapon Balance & Inaccuracy Matrix

| State | Spread Multiplier | First-Shot Precision (at 25m) | Description |
| :--- | :--- | :--- | :--- |
| **Crouched & Still** | `0.6x` | 99.8% | Maximum stability, lowest bullet deviation |
| **Standing & Still** | `1.0x` (Base) | 98.5% | Standard tactical baseline |
| **Tactical Walking** | `1.6x` | 85.0% | Moderate dispersion; viable at short range |
| **Running (Full Sprint)**| `4.5x` | 30.0% | Severe inaccuracy; bullets deviate across viewport |
| **Airborne / Jumping** | `8.0x` | 10.0% | Extreme inaccuracy; discourages jump-shooting |
