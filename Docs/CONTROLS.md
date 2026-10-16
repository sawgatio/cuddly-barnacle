# Controls & Input Mapping Specification: Project V2

## 1. Input Architecture

Project V2 supports two first-class input modalities:
1. **Desktop (Keyboard & Raw Mouse):** Utilizes Pointer Lock API and raw mouse deltas. Mouse smoothing and view acceleration are disabled by default to support competitive muscle memory.
2. **Mobile (Multi-Touch Interface):** Dual touch zones allowing simultaneous thumb movement, finger aiming, and button actuation without mutual cancellation.

---

## 2. Desktop Keyboard & Mouse Bindings

| Action | Primary Binding | Alternate | Category |
| :--- | :--- | :--- | :--- |
| **Move Forward** | `W` | `Up Arrow` | Locomotion |
| **Move Backward** | `S` | `Down Arrow` | Locomotion |
| **Strafe Left** | `A` | `Left Arrow` | Locomotion |
| **Strafe Right** | `D` | `Right Arrow` | Locomotion |
| **Look / Aim** | `Mouse Movement` | — | Camera |
| **Fire Weapon** | `Left Mouse Button` | — | Combat |
| **Reload** | `R` | — | Combat |
| **Jump** | `Space` | — | Locomotion |
| **Crouch** | `C` | `Left Ctrl` | Stance |
| **Tactical Walk** | `Left Shift` | `Right Shift` | Stance |
| **Pause / Menu** | `Esc` | — | System |

---

## 3. Mobile Touch Controls Layout

* **Movement Zone (Bottom-Left Quadrant):**
  * Dynamic virtual analog joystick.
  * Deadzone: 10px; Maximum deflection: 40px.
  * Computes relative forward and lateral strafe vectors based on camera yaw.
* **Aiming Zone (Right Viewport Half):**
  * Touch drag zone dedicated to yaw and pitch camera orientation.
  * Clamped vertical pitch: `[-85°, +85°]`.
* **Action Buttons (Bottom-Right Cluster):**
  * `FIRE` (Primary red circular button, 70px diameter).
  * `JUMP` (Circular utility button, 55px diameter).
  * `CROUCH` (Circular utility button, 55px diameter).
  * `RELOAD` (Circular utility button, 55px diameter).
