# Technical Architecture Specification: Project Tactical Strike

## 1. Engine Core & Framework Hierarchy

The project is built on **Unreal Engine 5** utilizing native C++ for core gameplay systems and Blueprints for editor configuration, data binding, and asset tweaking.

```
                           +---------------------------+
                           |     ATacticalGameMode     | (Server Authority)
                           +-------------+-------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
 +-------------v-------------+                       +-------------v-------------+
 |     ATacticalGameState    |                       |   ATacticalPlayerState    |
 |  (Round time, scores,     |                       |  (K/D, Money, Team ID,    |
 |   objective state)        |                       |   Ping/Stats)             |
 +---------------------------+                       +---------------------------+
               ^                                                   ^
               |                                                   |
 +-------------+-------------+                       +-------------+-------------+
 | ATacticalPlayerController |                       |    ATacticalAIController  |
 |  (Input mapping, HUD,     |                       |  (Perception, BT/BB,      |
 |   client view management) |                       |   EQS Cover Evaluation)   |
 +-------------+-------------+                       +-------------+-------------+
               |                                                   |
               +-------------------------+-------------------------+
                                         | Possesses
                           +-------------v-------------+
                           |     ATacticalCharacter    |
                           +-------------+-------------+
                                         |
     +-------------------+---------------+-------------------+
     |                   |                                   |
+----v----+        +-----v-----+                       +-----v-----+
| Health  |        | Inventory |                       | Movement  |
|Component|        | Component |                       |Component  |
+---------+        +-----+-----+                       +-----------+
                         |
                   +-----v-----+
                   |  Weapon   |
                   | Instances |
                   +-----------+
```

---

## 2. Core Subsystems & Components

### 2.1 Player Character & Movement Subsystem
- **Class:** `ATacticalCharacter : public ACharacter`
- **Movement Management:** Extension and configuration of `UCharacterMovementComponent`.
  - Stance-dependent max walk speed: Standing (250 uu/s), Tactical Walking (130 uu/s), Crouched (85 uu/s).
  - Acceleration, braking friction, and ground friction tuned to eliminate "floaty" movement and deliver sharp, deliberate stop-and-shoot counter-strafing feel.
  - Tagging debuff: Temporarily throttles `MaxWalkSpeed` upon receiving damage.
- **Camera Rig:**
  - `UCameraComponent` attached directly to the character mesh socket or spring arm root at realistic eye level (~165 cm).
  - First-person mesh rendered with low-FOV / shadow-casting settings for authentic self-shadows and weapon holding alignment.

### 2.2 Enhanced Input System (UE5 Standard)
- **Subsystem:** `UEnhancedInputLocalPlayerSubsystem`
- **Mapping Contexts (`UInputMappingContext`):**
  - `IMC_Default`: Standard gameplay (Move, Look, Jump, Crouch, Walk, Fire, Reload, Weapon Switch, Drop, Interact, Scoreboard).
  - `IMC_FreezePhase`: Restricts movement or boundaries during buy freeze.
  - `IMC_UI`: Handles buy menu navigation and scoreboard inspection.
- **Input Actions (`UInputAction`):**
  - `IA_Move`: Vector2D (WASD).
  - `IA_Look`: Vector2D (Mouse X/Y with raw sensitivity scaling).
  - `IA_Fire`: Digital / Trigger (Hold for automatic, Press for semi-automatic).
  - `IA_AltFire`: Digital (Iron sights / Zoom / Secondary function).
  - `IA_Reload`: Digital (R).
  - `IA_Jump`: Digital (Space).
  - `IA_Crouch`: Digital (Left Ctrl, hold or toggle).
  - `IA_Walk`: Digital (Left Shift, tactical slow walk).
  - `IA_WeaponSlot`: Axis / Select (1: Primary, 2: Secondary, 3: Melee, 4: Utility).

### 2.3 Weapons & Inventory Architecture
- **Data-Driven Configuration (`UWeaponDataAsset : public UPrimaryDataAsset`):**
  - `WeaponName`, `WeaponType` (Pistol, Rifle, Sniper, Shotgun, Melee, Grenade).
  - `MagazineCapacity`, `ReserveAmmo`, `FireRate` (RPM), `ReloadTime`.
  - `BaseDamage`, `ArmorPenetrationPercentage`, `HeadshotMultiplier`, `LimbMultiplier`.
  - `DamageDropoffCurve` (Damage over Distance).
  - `HorizontalRecoilCurve`, `VerticalRecoilCurve` (Spray pattern control).
  - `SpreadMovementMultiplier`, `SpreadAirborneMultiplier`, `BaseSpreadAngle`.
  - `FireMontage`, `ReloadMontage`, `FireSound`, `DryFireSound`, `MuzzleFlashFX`, `ImpactFXTable`.
- **Weapon Actor (`ATacticalWeaponBase : public AActor`):**
  - Instantiated and attached to character hand/holster sockets.
  - State machine: `Idle`, `Firing`, `Reloading`, `Holstered`.
  - Line tracing: Executes synchronous/asynchronous raycasts from weapon muzzle / camera view with ballistic cone deviation.
- **Inventory Component (`UWeaponInventoryComponent : public UActorComponent`):**
  - Holds up to 4 weapon slots: Primary, Secondary, Melee, Utility.
  - Handles equipping, un-equipping, swapping animations, and dropping weapons into the world.

### 2.4 Health & Damage Architecture
- **Component:** `UHealthComponent : public UActorComponent`
  - Encapsulates `CurrentHealth` (0-100) and `CurrentArmor` (0-100).
  - Hooks into Unreal Engine’s built-in `AActor::TakeDamage` and `FDamageEvent` system.
  - Handles `FPointDamageEvent` to extract `HitInfo.BoneName` and apply precise zone multipliers (Head, Spine, Pelvis, Limbs).
  - Broadcasts clean gameplay events: `OnHealthChanged`, `OnDamaged`, `OnDeath`.
  - Handles ragdoll physics initiation via character skeletal mesh on lethal damage.

### 2.5 Round & Match Lifecycle
- **Game Mode:** `ATacticalGameMode : public AGameModeBase`
  - State Machine: `WaitingToStart -> BuyPhase -> InProgress -> PostRound -> MatchComplete`.
  - Timers driving round phase transitions.
  - Spawning logic: Allocates team spawn points, prevents spawn collisions.
- **Game State:** `ATacticalGameState : public AGameStateBase`
  - Replicated match state: Current round number, team scores (Attackers vs Defenders), round time remaining, objective status (Planted / Defused / Neutral).

### 2.6 AI & Bot Framework
- **Controller:** `ATacticalAIController : public AAIController`
  - Uses UE5 `UAIPerceptionComponent` with `UAISenseConfig_Sight` and `UAISenseConfig_Hearing`.
  - Driven by **Behavior Trees** (`BT_TacticalBot`) and **Blackboards** (`BB_TacticalBot`).
  - Tasks: Patrol, Hold Angle, Peek Corner, Engage Target, Plant/Defuse Objective, Fall Back.
  - Uses `UNavigationSystemV1` and Navigation Mesh Bounds for path generation and tactical positioning.

---

## 3. Directory & Module Structure

When the Unreal project is created, the repository structure will follow standard UE5 conventions:

```
Counter_Strike/
├── Docs/                     <- Architecture, design, milestones, test plans
│   ├── GAME_DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── MILESTONES.md
│   └── TEST_PLAN.md
├── Source/                   <- C++ Source code
│   ├── TacticalFPS/          <- Primary gameplay module
│   │   ├── Public/
│   │   │   ├── Character/    <- TacticalCharacter, Movement
│   │   │   ├── Weapons/      <- WeaponBase, WeaponDataAsset, InventoryComponent
│   │   │   ├── Health/       <- HealthComponent, DamageTypes
│   │   │   ├── Game/         <- GameMode, GameState, PlayerController, PlayerState
│   │   │   └── AI/           <- AIController, BTTasks
│   │   └── Private/
│   │       ├── Character/
│   │       ├── Weapons/
│   │       ├── Health/
│   │       ├── Game/
│   │       └── AI/
│   └── TacticalFPSEditor/    <- Optional editor extensions/tools
├── Content/                  <- Unreal Editor Content (Maps, Blueprints, Materials, Audio)
│   ├── Core/                 <- Base GameModes, Input mappings, PlayerController BP
│   ├── Characters/           <- Skeletal meshes, animations, character BP
│   ├── Weapons/              <- Weapon Blueprints, Data Assets, meshes, audio
│   ├── Maps/                 <- Test ranges, greybox arenas
│   └── UI/                   <- HUD widgets, Crosshairs, Scoreboard
├── Config/                   <- Engine, Game, Input ini configuration
├── TacticalFPS.uproject      <- Unreal Project descriptor file
└── .gitignore                <- Engine-standard git ignore (Intermediate, Saved, Binaries)
```
