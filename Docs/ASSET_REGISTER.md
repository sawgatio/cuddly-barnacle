# Asset Register & Pipeline Tracking: Project V2

## 1. Asset Accounting & Verification Standards

In compliance with Rule 5 of the Master Development Specification:
* Every 3D mesh, texture, skeleton, animation, audio file, and material must be cataloged.
* **No synthetic claims:** Placeholder or procedurally generated assets are explicitly marked as such.
* All assets must be 100% original or verified under open-source / permissive commercial licenses.

---

## 2. Complete Asset Ledger

| Asset Identifier | Category | Source / Implementation | Status | Visual / Acoustic Description |
| :--- | :--- | :--- | :--- | :--- |
| **`SM_Floor_Concrete`** | Environment | Procedural WebGL BufferGeometry | **Active** | 60x60m dark concrete tile with grid lines |
| **`SM_Perimeter_Wall`** | Environment | Procedural BoxGeometry | **Active** | 8m high perimeter barrier with collision |
| **`SM_Tactical_Crate`** | Environment | Procedural BoxGeometry | **Active** | 4x2.5m reinforced steel/composite cover box |
| **`SM_Target_Dummy`** | Character | Procedural Cylinder + Sphere | **Active** | Red torso & amber critical head target dummy |
| **`SK_Player_FirstPerson`**| Character | Camera Rig + Gun Attachment | **Active** | First-person viewmodel with procedural sway |
| **`SK_Remote_Soldier`** | Character | Procedural Multi-Mesh Group | **Active** | Blue tactical operative with torso, head, weapon |
| **`WP_AR556_ViewModel`** | Weapon | Procedural 3D Mesh Composite | **Active** | Dark metallic receiver, barrel, optical sight, mag |
| **`VFX_MuzzleFlash`** | VFX | Dynamic PointLight + Sphere | **Active** | 45ms amber flash with dynamic scene illumination |
| **`VFX_SparkImpact`** | VFX | THREE.Points buffer | **Active** | 8-particle yellow spark spray on bullet contact |
| **`SFX_Gunshot_AR`** | Audio | WebAudioAPI Synthesizer | **Active** | Multi-layer filtered noise + 150Hz punch |
| **`SFX_Hit_Dink`** | Audio | WebAudioAPI Synthesizer | **Active** | 1,200–1,600 Hz sine chirp |
| **`SFX_Reload_Mech`** | Audio | WebAudioAPI Synthesizer | **Active** | Dual sawtooth mechanical clicks |
| **`SFX_Hurt_Thud`** | Audio | WebAudioAPI Synthesizer | **Active** | 90–40 Hz sawtooth impact frequency sweep |
| **`UI_Crosshair`** | Interface | CSS Vector Shapes | **Active** | Dynamic 4-line reticle with center dot |
| **`UI_Hitmarker`** | Interface | CSS Vector Shapes | **Active** | Red diagonal X with 80ms fade animation |
| **`UI_HUD_Panels`** | Interface | CSS Glassmorphism | **Active** | Health, ammo, timer, and kill feed panels |
| **`UI_VirtualJoysticks`** | Interface | HTML5 Canvas / CSS | **Active** | Left movement thumbstick + right swipe zone |

---

## 3. External Binary Assets (Future Milestones)

The following assets are tracked as future milestones when high-fidelity production art is integrated:
* High-poly rigged operative skeletal meshes (`SK_Operative_A`, `SK_Operative_B`).
* Skeletal animation sets (idle, run, crouch, jump, reload montages).
* PBR texture maps (Albedo, Normal, Roughness, Ambient Occlusion).
* Recorded Foley audio packs (footsteps across wood, metal, gravel).
