# Artificial Intelligence Specification: Project V2

## 1. AI Architecture Overview

Project V2 employs a layered, perception-driven AI architecture. Rather than scripted pathing or simplistic "beeline" rush behavior, bots operate on tactical decision loops:

```
[ SENSES ] ---> [ BLACKBOARD (Memory) ] ---> [ BEHAVIOR TREE ] ---> [ ACTIONS ]
  Sight           Target Location               Hold Angle             Move / Peek
  Hearing         Alert Level                   Engage Burst           Take Cover
  Damage          Cover Waypoints               Flank Route            Reload Safe
```

---

## 2. Perception & Sensing Pipeline

### 2.1 Sight Perception
* **Field of View:** 110° horizontal cone.
* **Effective Range:**
  * Clear daylight / illuminated: 45 meters.
  * Shadows / long range: 25 meters.
  * Smoke obscured: 0 meters (Sight completely blocked).
* **Line of Sight Raycasts:** Traces from bot eye socket to player head, chest, and feet. Requires continuous visibility over reaction threshold to confirm identification.

### 2.2 Auditory Perception
* **Un-silenced Gunfire:** Detectable up to 60 meters (instantly triggers `CombatAlert`).
* **Running Footsteps:** Detectable up to 25 meters (triggers `InvestigateLocation`).
* **Tactical Walking / Crouching:** **0 meters** (completely inaudible).
* **Reloading / Pin-Pull Sounds:** Detectable up to 12 meters.

---

## 3. Tactical Behavior States

1. **Patrol & Angle Holding:** Bots advance to defensive chokepoints and pre-aim common entry corners.
2. **Engagement & Controlled Burst:**
   * Bots fire in 3–5 round bursts with pauses to allow recoil recovery.
   * Bots counter-strafe to stop before firing to maximize first-shot accuracy.
3. **Dynamic Cover Selection:**
   * When reloading or receiving heavy damage, bots pathfind to the nearest NavMesh cover node that breaks line-of-sight from the attacker.
4. **Flanking & Coordinated Pushing:** If two bots engage the same player, one provides suppressing fire while the second navigates a secondary flank lane.

---

## 4. Difficulty Profiles

| Dimension | Recruit | Regular | Veteran | Elite |
| :--- | :--- | :--- | :--- | :--- |
| **Reaction Delay** | 450 ms | 280 ms | 170 ms | 110 ms |
| **Burst Accuracy** | 35% | 60% | 82% | 94% |
| **First-Shot Aim** | Center Mass | Upper Torso | Neck / Head | Precise Head |
| **Cover Seeking** | Rare (stands in open)| After 50% HP loss | Immediately on fire | Proactive peeking |
| **Hearing Response**| Ignores distant sound| Investigates within 15m | Investigates within 30m | Calls team rotate |
