# Map Design Specification: Project V2

## 1. Map Architecture & Design Philosophy

Maps in Project V2 are designed around the standard tactical competitive philosophy:
* **The "Three-Lane" & Figure-Eight Principles:** Clear arterial routes with connecting transition paths and tactical chokepoints.
* **Readable Sightlines & Cover Distances:** Deliberate balance between long-range rifle lanes (>30m), medium-range transition zones (15-25m), and close-quarters entry rooms (<10m).
* **Sound-Informed Navigation:** Dedicated acoustic zones (metal catwalks, concrete corridors, dirt paths, water puddles) to give auditory intel on enemy positions.
* **Verticality with Restraint:** Elevated perches and catwalks always have at least two vulnerability angles to prevent uncounterable "camping".

---

## 2. Original Map Library

### Map 0: Combat Training Facility (Gym / Killhouse) — Milestone 1 Target
* **Theme:** Indoor tactical shoot-house / CQB training facility.
* **Footprint:** 60m x 60m (Compact, high framerate).
* **Key Zones:**
  * **Firing Range:** Static and moving target dummies at 10m, 20m, 30m, and 45m.
  * **Obstacle & Parkour Lane:** Low walls for vault/jump, narrow doorway frames (100cm) for collision testing.
  * **CQB Killhouse:** Central interlocking rooms with corner-peeking angles, breakable glass, and doorway breach points.
* **Lighting:** High-contrast neutral arena lighting with soft ambient occlusion.

### Map 1: Industrial Yard
* **Theme:** Shipping container terminal and rail yard depot.
* **Layout:** Asymmetric dual-site defusal arena.
* **Key Features:** Stacked cargo containers, crane catwalks, train cars offering narrow flanking tunnels.
* **Combat Distance:** Medium to Long.

### Map 2: Desert Outpost
* **Theme:** Arid military checkpoint and communications depot.
* **Layout:** Open central courtyard surrounded by tight interior adobe barracks.
* **Key Features:** Courtyard crossfires requiring smoke grenades to cross; subterranean drainage flank.

### Map 3: Urban District
* **Theme:** Dense city square with storefronts, alleys, and a multi-level bank lobby.
* **Combat Distance:** Close to Medium. Highly lethal corner-clearing gameplay.

### Map 4: Research Complex
* **Theme:** High-tech subterranean laboratory with clean-room partitions and server corridors.
* **Key Features:** Sliding automatic doors, glass partitions, and long sterile sightlines.

---

## 3. Technical Requirements & Verification Checklist

Every map must validate the following before release:
1. **Zero Collision Traps:** No seams or micro-ledges that catch the player capsule during strafing.
2. **NavMesh Coverage:** Continuous, hole-free navigation mesh connecting all player and bot spawns.
3. **Spawn Separation:** Minimum 40m distance between opposing team spawns; zero direct line-of-sight from spawn points.
4. **Lighting & Occlusion:** No pitch-black unreadable shadows; draw calls budgeted under 1,500 per frame.
