# Project Milestones & Roadmap: Project Tactical Strike

## Roadmap Overview

Development is divided into sequential, self-contained milestones. Each milestone requires passing all acceptance criteria before proceeding to the next.

---

## Milestone 0: Engine & Project Initialization (Current Baseline)
- **Objective:** Establish the clean Unreal Engine 5 C++ project environment and repository structure.
- **Tasks:**
  - Create project using official UE5 First Person C++ template.
  - Setup `.gitignore` tailored for Unreal Engine (ignoring `Intermediate/`, `Saved/`, `Binaries/`, `.vs/`, etc.).
  - Verify project descriptor (`.uproject`) and default modules.
  - Generate initial Visual Studio / Rider solution files.
- **Exit Criteria:**
  - Project opens cleanly in Unreal Editor without missing plugin or module warnings.
  - Solution compiles in `Development Editor` mode with 0 errors.

---

## Milestone 1: Single-Player Playable Prototype (First Playable Deliverable)
- **Objective:** Establish the baseline first-person pawn, input binding, and physics interaction in a dedicated test map.
- **Tasks:**
  - Setup a minimal test map (`L_TestGym` or `L_GreyboxRange`) with floors, perimeter walls, ramps, and obstacle blocks.
  - Implement or configure the core First-Person Character (`ATacticalCharacter`).
  - Wire Enhanced Input System (`IMC_Default`):
    - `IA_Move` (WASD) with standard movement speed.
    - `IA_Look` (Mouse X/Y) with smooth pitch/yaw control and clamped vertical limits.
  - Establish capsule collision, ground detection, and physics interaction with world static geometry.
  - Provide a clean session lifecycle: Play in Editor (PIE), restart (`F5` or console `RestartLevel`), and graceful exit (`Esc`).
- **Exit Criteria:**
  - Project builds cleanly via UnrealBuildTool.
  - Player spawns reliably on ground level.
  - WASD moves character smoothly, mouse rotates camera without jitter.
  - Player collides cleanly with obstacles and cannot clip through walls or floors.
  - No memory leaks, crashes, or unhandled exceptions on level exit/restart.

---

## Milestone 2: Tactical Locomotion & Camera Tuning
- **Objective:** Transform arcade movement into crisp, deliberate tactical shooter locomotion.
- **Tasks:**
  - Implement tactical walk (`Shift`) with silent footstep state and restricted max speed (~130 uu/s).
  - Implement smooth crouch (`Ctrl`) with capsule half-height interpolation and camera height lerp (~85 uu/s).
  - Tune acceleration and braking deceleration to deliver instant counter-strafing feedback.
  - Implement jump momentum penalty (air velocity damping to discourage bunny-hopping).
- **Exit Criteria:**
  - Stance transitions (standing -> crouch -> standing) feel responsive and visually seamless.
  - Counter-strafing comes to a stop within acceptable tactical margins (< 0.15s).

---

## Milestone 3: Modular Weapon Architecture & Recoil Mechanics
- **Objective:** Deliver the primary assault rifle and sidearm with data-driven weapon stats and recoil.
- **Tasks:**
  - Create `UWeaponDataAsset` defining magazine capacity, fire rate, damage, and recoil curves.
  - Implement `ATacticalWeaponBase` with hitscan line-tracing from weapon muzzle / camera center.
  - Implement spray pattern offset system: vertical climb and horizontal sway during continuous fire.
  - Implement movement-based spread penalties (spread expands when moving or jumping).
  - Implement reloading logic with ammo counts and weapon state machine (`Idle`, `Firing`, `Reloading`).
- **Exit Criteria:**
  - Firing while stationary demonstrates a repeatable, controllable recoil pattern.
  - Firing while running exhibits significant bullet deviation.
  - Reloading properly updates ammo counters and prevents firing during animation/timer.

---

## Milestone 4: Damage, Health & Hitbox Registration
- **Objective:** Implement modular health, armor, bone-specific damage multipliers, and death handling.
- **Tasks:**
  - Implement `UHealthComponent` with damage reception and death delegates.
  - Configure skeletal mesh physics asset with bone hit zones: Head, Torso, Pelvis, Limbs.
  - Implement tagging slowdown effect (temporary speed reduction upon hit).
  - Implement target dummies / testing pawns with floating damage indicators and ragdoll physics on death.
- **Exit Criteria:**
  - Headshots register `4x` damage multiplier; limb shots register `0.75x`.
  - Target dummies react with tagging slow, register damage, and ragdoll cleanly upon reaching 0 HP.

---

## Milestone 5: Round Management & Game Loop
- **Objective:** Deliver the complete single-player round loop with buy freeze, action timer, and round reset.
- **Tasks:**
  - Implement `ATacticalGameMode` and `ATacticalGameState`.
  - Add Round Timer and state transitions (`BuyPhase`, `RoundActive`, `RoundEnded`).
  - Implement spawn point management and round reset (clearing dropped actors, restoring health and positioning).
- **Exit Criteria:**
  - Round timer counts down accurately.
  - Round ends properly upon condition trigger (elimination, timeout, or dummy clearance).
  - Map resets instantly for the next round without full level reload.

---

## Milestone 6: Bot AI & Combat Encounters
- **Objective:** Integrate tactical AI bots for single-player practice scenarios.
- **Tasks:**
  - Create `ATacticalAIController` with Behavior Tree and Blackboard.
  - Implement perception senses: sight cone and auditory stimulus (footsteps, gunshots).
  - Build AI tasks: Patrol waypoint, hold defensive angle, peek corner, engage player with burst fire.
- **Exit Criteria:**
  - Bots detect player when in line-of-sight or upon hearing un-silenced running/firing.
  - Bots take cover, peek, and fire in controlled bursts.
