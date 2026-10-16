# UI & UX Design Specification: Project V2

## 1. Visual Identity & Design Principles

* **Aesthetic:** Modern military-tactical with dark glassmorphic panels, clean geometric lines, and neon tactical accents (Tactical Blue `#3b82f6`, Combat Gold `#f59e0b`, Vital Green `#10b981`, Threat Red `#ef4444`).
* **Combat Readability:** HUD elements are anchored to the perimeter of the screen with low opacity (`rgba(14, 18, 27, 0.75)`) so central combat sightlines remain 100% unobstructed.
* **Typography:** Display headings in **Rajdhani** (technical, sharp, high-speed readability); body and telemetry data in **Inter**.

---

## 2. HUD Component Architecture

### 2.1 Dynamic Reticle & Hit Feedback
* **Crosshair:** 4-point dynamic reticle with center dot. Gap widens dynamically when running or firing; snaps tight when crouching or stationary.
* **Hitmarker:** Diagonal red `X` flashes at screen center for 80ms upon confirmed target damage, synchronized with an audio hit-ding.
* **Damage Vignette:** Radial edge flash pulses red when taking bullet damage, directing attention to health degradation.

### 2.2 Telemetry Panels
* **Health Panel (Bottom Left):** Green segmented vitality bar + large numeric display (0–100 HP). Turns amber below 40 HP and crimson below 20 HP.
* **Stance & Network Pill (Bottom Center):** Badges displaying current movement posture (`STAND`, `WALK`, `CROUCH`) and connection state (`P2P DIRECT` / `LAN`).
* **Ammunition Panel (Bottom Right):** Active magazine count displayed in high-contrast 32px numbers, with remaining reserve ammo (`30 / 90`).
* **Match Header (Top Center):** Team scores (Blue vs. Red) flanking a high-precision round countdown timer (`02:15`).
* **Kill Feed (Top Right):** Ephemeral combat event log showing killer, weapon icon, and eliminated player (fades after 3.5s).

---

## 3. Dual Desktop & Mobile Touch Layout

| Element | Desktop (PC) | Mobile (Android APK) |
| :--- | :--- | :--- |
| **Locomotion** | WASD keyboard keys | Floating left virtual joystick (40px deadzone) |
| **Aim / Camera** | Raw mouse input (Pointer Lock) | Right-screen touch swipe zone |
| **Fire Weapon** | Left Mouse Button | Large 70px red tactile `FIRE` button |
| **Reload** | `R` key | Circular `R` button |
| **Stance Transitions** | `C` / `Ctrl` (Crouch), `Shift` (Walk) | Circular `CROUCH` button |
| **Jump** | `Space` | Circular `JUMP` button |
