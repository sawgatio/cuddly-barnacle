# Game Design Document: Project Tactical Strike (Working Title)

## 1. Executive Summary & Creative Vision
**Project Tactical Strike** is an original, closed-source tactical first-person shooter developed in Unreal Engine 5. It takes inspiration from the high-stakes, round-based tactical shooter genre, combining round economy, lethal gunplay, positional strategy, and deliberate movement mechanics.

### Core Pillars
1. **Precision & Skill-Based Gunplay:** Accurate first-shot firing, predictable yet challenging recoil patterns, and significant movement inaccuracies penalizing run-and-gun tactics.
2. **Tactical Round Loop:** Defusal/Objective rounds featuring a pre-round buy/planning phase, active combat round, and post-round reset.
3. **Information & Positioning:** Auditory awareness (footsteps, reloading cues), sightlines, and smart utility usage over fast reflexes alone.
4. **Clean Architectural Modularity:** Built using Unreal Engine 5 C++ with Blueprint data assets and configurations, architected from day one for clean single-player prototype iteration and seamless multi-agent multiplayer expansion.

### Non-Infringement & Intellectual Property Protection
- **Original Lore & Assets:** All weapon models, character models, audio assets, visual effects, and maps are either custom-built or sourced from properly licensed engine/marketplace assets.
- **No Trademark or Asset Copying:** No proprietary Counter-Strike or Valve trademarks, weapon names (using generic or fictional military designations e.g., "AR-47", "Bullpup-556", "Tactical 9mm"), map layouts, audio files, or source code are used.

---

## 2. Gameplay Mechanics

### 2.1 Player Locomotion & Stances
- **Standing (Default):** Standard movement speed (~250 uu/s). Firing has normal recovery.
- **Tactical Walk (`Shift`):** Silent footstep audio, lower maximum speed (~130 uu/s), higher first-shot accuracy.
- **Crouch (`Ctrl`):** Reduced hit profile, slow movement speed (~85 uu/s), maximum recoil control bonus, smooth camera height interpolation.
- **Jump (`Space`):** Short air-time with momentum decay upon landing (preventing bunny-hopping exploits).
- **Tagging Effect:** Taking bullet damage inflicts an instantaneous movement speed reduction (~40-60% slow) for 0.35s before decaying back to normal speed.

### 2.2 Weapons & Ballistics
- **Hitscan Line Traces with Ballistic Spread:** High-speed bullet traces evaluating bone hits (Head, Upper Torso, Lower Torso, Limbs).
- **Recoil & Spread Model:**
  - Base weapon spread increases quadratically during continuous fire.
  - Dynamic recoil offset curve applied to the view rotation and aim vector.
  - Spread multiplier driven by player velocity state: `Moving > Airborne > Standing > Walking > Crouching`.
  - Recoil resets gradually when firing ceases (controlled by cooldown rate).
- **Weapon Categories:**
  - **Sidearms:** Reliable secondary pistols (e.g., Tactical 9mm, Heavy Mag).
  - **Rifles:** High-lethality tactical rifles (e.g., standard issue 5.56 assault rifle).
  - **Utility:** Standard tactical throwables (Smoke canister, Flash grenade, High Explosive grenade).
  - **Melee:** Tactical combat knife for silent or close-quarters fallback.

### 2.3 Damage & Hit Zones
- **Zone Multipliers:**
  - Head: `4.0x` (lethal single-shot for heavy rifles at close/medium range).
  - Upper Torso: `1.0x` (baseline).
  - Lower Torso / Pelvis: `1.1x`.
  - Limbs / Legs: `0.75x`.
- **Health & Armor:** 100 base HP. Optional Kevlar/Helmet armor reduces body penetration and negates non-heavy rifle one-shot headshots.

---

## 3. Round Lifecycle & Game Mode Structure

### 3.1 Round Phases
1. **Buy / Freeze Phase (15 seconds):**
   - Players are confined to spawn boundaries.
   - Economy menu available to purchase weapons and utilities.
2. **Active Combat Phase (100 seconds):**
   - Attackers seek to plant the tactical device at Site A or Site B, or eliminate all defenders.
   - Defenders protect sites and defuse planted devices or eliminate all attackers.
3. **Post-Round Phase (7 seconds):**
   - End-of-round fanfare, economy calculations distributed, score tally updated, players prepared for reset.

### 3.2 Single-Player Prototype Scope
The immediate development target is an offline single-player vertical slice:
- Single-player spawn in a dedicated greybox test range / CQB killhouse.
- Full movement, camera, jumping, crouching, and stance transitions.
- Functional weapon handling, firing, recoil, and reloading.
- Target dummies / collision test obstacles with damage feedback.
