# Test Plan & Quality Assurance: Project Tactical Strike

## 1. Testing Philosophy & Verification Standards

To guarantee game stability, deterministic gunplay, and reliable physics, all features must be verified through structured test plans before being marked as complete.

### Core Testing Rules
1. **Zero Unverified Claims:** No feature, bug fix, or milestone may be reported as working without actual compilation and execution verification.
2. **Deterministic Mechanics:** Recoil patterns, movement friction, and damage multipliers must yield repeatable, mathematically verifiable results.
3. **Session Stability:** All level restarts, exits to main menu, and editor play sessions must terminate cleanly with 0 memory leaks, null-pointer dereferences, or dangling delegates.

---

## 2. Test Execution Matrices

### 2.1 Milestone 1: First Playable Prototype Matrix

| Test ID | Test Case | Action / Input | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **M1-01** | Editor Launch & Project Load | Launch Unreal Editor with `.uproject` | Project opens without missing plugin or blueprint compiler errors | No modal crash or compile error popups |
| **M1-02** | C++ Code Compilation | Run UnrealBuildTool build (Development Editor Win64) | Compilation finishes with code 0 and 0 fatal errors | Clean build log |
| **M1-03** | Play In Editor (PIE) Start | Click "Play" or Alt+P | Player spawns at designated PlayerStart actor at proper eye level | Viewport displays first-person camera |
| **M1-04** | Ground Collision & Gravity | Spawn in air / on floor | Gravity pulls player down until capsule bottom rests on floor geometry | Character does not fall through floor or oscillate |
| **M1-05** | Horizontal Movement (WASD) | Press W, A, S, D individually and in pairs | Character accelerates smoothly in the corresponding cardinal and diagonal directions | Velocity reaches configured standing max speed (~250 uu/s) |
| **M1-06** | Mouse Look & Rotation Clamping | Move mouse along horizontal (Yaw) and vertical (Pitch) axes | Character rotates smoothly. Pitch is clamped to [-89°, +89°] | No gimbal lock, camera flipping, or input stutter |
| **M1-07** | Wall & Obstacle Collision | Walk directly into vertical walls, pillars, and corners | Capsule collision prevents penetration; character slides along walls according to normal vector | No clipping through walls or snagging on seams |
| **M1-08** | Jump & Air Physics | Press Space while stationary and moving | Character jumps to configured height (~60-80 uu) and lands cleanly | Momentum decays predictably upon contact with floor |
| **M1-09** | Session Reset | Execute `RestartLevel` console command or press designated restart key | Level reloads immediately, character respawns at PlayerStart | No double-spawn, no lingering input context corruption |
| **M1-10** | Session Exit | Press `Esc` or click Stop | Editor returns to edit mode cleanly | Output log contains no unhandled assertion or critical error warnings |

---

### 2.2 Locomotion & Camera Test Matrix (Milestone 2)

| Test ID | Test Case | Target Metric | Verification Method |
| :--- | :--- | :--- | :--- |
| **LOC-01** | Standing Max Walk Speed | 250 uu/s ± 2 uu/s | Print `GetVelocity().Size()` to screen/log |
| **LOC-02** | Tactical Walk Speed (Shift) | 130 uu/s ± 2 uu/s | Verify speed reduction and footstep mute flag |
| **LOC-03** | Crouch Speed (Ctrl) | 85 uu/s ± 2 uu/s | Verify capsule half-height shrinks from 96 to 60 |
| **LOC-04** | Counter-Strafing Stop Time | < 0.15s to zero velocity | Time delta between releasing direction key and velocity < 10 uu/s |
| **LOC-05** | Bunny-Hop Velocity Damping | Land velocity penalty > 30% | Measure horizontal velocity immediately after repeated jumping |

---

### 2.3 Weapons & Ballistics Test Matrix (Milestone 3)

| Test ID | Test Case | Target Metric | Verification Method |
| :--- | :--- | :--- | :--- |
| **WEP-01** | First-Shot Precision (Stationary) | 100% center crosshair alignment at 20m | Line trace endpoint matches exact camera center vector |
| **WEP-02** | Continuous Fire Spray Pattern | Vertical climb and repeatable sway | Fire full magazine against flat wall; inspect decal cluster |
| **WEP-03** | Movement Inaccuracy Spread | Spread cone expands by > 300% when running | Compare bullet decal group radius while running vs stationary |
| **WEP-04** | Magazine & Ammo State Machine | Fire empty -> Reload -> Fire | Ammo drops to 0; firing disabled; reload restores ammo to max capacity |

---

### 2.4 Damage, Health & Hitbox Matrix (Milestone 4)

| Test ID | Test Case | Expected Result | Verification Method |
| :--- | :--- | :--- | :--- |
| **DMG-01** | Headshot Damage Multiplier | `BaseDamage * 4.0` | Line trace against head bone; verify damage float received |
| **DMG-02** | Torso Damage Multiplier | `BaseDamage * 1.0` | Line trace against spine bone |
| **DMG-03** | Limb Damage Multiplier | `BaseDamage * 0.75` | Line trace against arm/leg bones |
| **DMG-04** | Tagging Movement Slow | Max walk speed reduced by ~50% for 0.35s | Measure velocity immediately post-hit on moving player |
| **DMG-05** | Lethal Ragdoll Transition | Skeletal mesh activates ragdoll physics; controller unpossesses | Verify physics simulation active on character mesh |

---

## 3. Automation & Regression Strategy

### 3.1 Unreal Automation Framework
For critical mathematical systems (damage calculation, recoil curves, economy calculations), automated tests can be authored using UE's native automation test macros:
- `IMPLEMENT_SIMPLE_AUTOMATION_TEST(FTacticalDamageTest, "TacticalFPS.Damage.Calculation", ...)`
- `IMPLEMENT_SIMPLE_AUTOMATION_TEST(FTacticalRecoilTest, "TacticalFPS.Weapons.RecoilSpread", ...)`

### 3.2 Automated Build Verification
Before merging code:
1. Trigger clean compile via `UnrealBuildTool`:
   ```bat
   Engine\Build\BatchFiles\Build.bat TacticalFPSEditor Win64 Development "c:\Users\chhet\OneDrive\Desktop\Counter_Strike\TacticalFPS.uproject" -waitmutex
   ```
2. Verify zero warnings treated as errors, zero link failures.
3. Scan `Saved/Logs/TacticalFPS.log` for any `Error:` or critical warnings.
