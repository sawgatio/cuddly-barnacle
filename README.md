# Project Tactical Strike

An original, closed-source tactical first-person shooter prototype developed with **Unreal Engine 5** and **C++**.

Inspired by the competitive tactical shooter genre (round economy, high-lethality gunplay, positional strategy, and deliberate movement), this project provides a modular, clean-room foundation adhering strictly to original IP and licensing rules.

---

## 📁 Repository Overview

```
Counter_Strike/
├── Docs/                     <- Engineering & Game Specifications
│   ├── GAME_DESIGN.md        <- Core pillars, locomotion mechanics, ballistics & rules
│   ├── ARCHITECTURE.md       <- UE5 C++ class hierarchy & subsystem specifications
│   ├── MILESTONES.md         <- Staged development roadmap & acceptance gates
│   ├── TEST_PLAN.md          <- QA matrices, verification procedures, automation tests
│   └── RESEARCH.md           <- Empirical tactical FPS mechanics & REA investigation findings
├── Source/                   <- Native C++ Gameplay Module
│   └── TacticalFPS/
│       ├── Public/
│       │   ├── Character/    <- ATacticalCharacter (First-person locomotion & camera)
│       │   └── Game/         <- ATacticalGameMode, ATacticalPlayerController
│       └── Private/
│           ├── Character/    <- Stance movement, Enhanced Input, friction tuning
│           └── Game/         <- Camera clamping, level restart & session management
├── Config/                   <- Engine, Game, and Enhanced Input defaults
├── TacticalFPS.uproject      <- Unreal Engine 5 project descriptor
└── .gitignore                <- Engine-standard build & artifact filter
```

---

## 🎮 Core Mechanics (Milestone 1 Baseline)

* **Locomotion Tuning:** Counter-strafing stop under 150ms (`MaxAcceleration = 2400`, `BrakingDecelerationWalking = 2400`, `GroundFriction = 8.0`).
* **Stance System:**
  * **Standing:** 250 uu/s
  * **Tactical Walk (Shift):** 130 uu/s (silent footsteps)
  * **Crouching (Ctrl):** 85 uu/s (lowered collision profile)
* **First-Person Camera:** Mounted at realistic eye level (~156cm), pitch clamped to `[-89°, +89°]` to prevent camera flipping.
* **Enhanced Input:** Fully configured for WASD, raw mouse aim, jump, crouch, and tactical walk.

---

## 🛠️ Build & Setup Instructions

### Prerequisites
1. **Unreal Engine 5.4+** (installed via Epic Games Launcher)
2. **Visual Studio 2022** with the *Game development with C++* workload (MSVC v143 & Windows 10/11 SDK)

### Opening the Project
1. Clone the repository:
   ```bash
   git clone https://github.com/sawgatio/cuddly-barnacle.git
   ```
2. Right-click `TacticalFPS.uproject` and select **Generate Visual Studio project files**.
3. Double-click `TacticalFPS.uproject` to open and compile the game in Unreal Editor.
4. Press **Alt+P** to test in viewport.

---

## 📄 License & Intellectual Property
Closed-source prototype. All weapon models, game logic, characters, and assets are original or appropriately licensed. No proprietary assets or trademarks from other commercial games are used.
