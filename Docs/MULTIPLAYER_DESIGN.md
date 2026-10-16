# Multiplayer Network Architecture: Project V2

## 1. Network Philosophy & Authority Model

Project V2 prioritizes **anti-cheat integrity, zero client trust, and responsive low-latency feedback**:
* **Client Side:** Autonomous movement prediction, local weapon animations, audio playback, and immediate cosmetic hit feedback.
* **Server / Host Authority:** Definitive player positions, health states, damage calculation, round timers, and match victory conditions. Clients never dictate their own health or claim unverified kills.

---

## 2. Multi-Tier Networking Implementation

To accommodate both local resource-constrained development and production online play:

### Tier 1: Real-Time Peer-to-Peer (WebRTC / PeerJS) — Active Prototype
* **Transport:** Direct WebRTC UDP DataChannels with stun/turn fallback.
* **Hosting Model:** Player 1 initializes a Host Session and receives a short room code (e.g. `STRIKE-742`). Player 2 joins with the code.
* **Packet Architecture (30Hz Tickrate):**
  * **Continuous State Stream:** Position `(x, y, z)`, Rotation `(pitch, yaw)`, Stance `(standing/crouched)`, Health.
  * **Reliable Event Packets:** `shoot` (origin, direction), `damage` (amount, hit bone), `respawn`, `kill_feed`.
* **Zero Cost & Zero Overhead:** Operates with no dedicated server hosting bills or complex port forwarding.

### Tier 2: Unreal Engine Native Dedicated / Listen Server
* **Engine Framework:** `AGameSession`, `AGameModeBase`, `APlayerState`, `AGameStateBase`.
* **Replication:** `DOREPLIFETIME` on stance, weapon slots, and health. Autonomous movement handled via `UCharacterMovementComponent` client-side prediction and server reconciliation.
* **Connection Protocol:** Command line or in-game console `open <IP>:7777`.

---

## 3. Hit Registration & Lag Compensation

1. **Raycast Verification:**
   * When a client fires, the packet includes the timestamp and camera aim vector.
   * The host verifies that the distance between the weapon muzzle and the target is within weapon effective range.
   * The host verifies no solid world geometry (`WorldStatic`) blocked the line of trace.
2. **Health Deduction Authority:**
   * Damage is calculated on the host/server based on hit bone multipliers.
   * The victim's health is decremented on the authoritative state and broadcast back to all connected players.
