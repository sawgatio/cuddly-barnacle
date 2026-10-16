# Tactical Strike - 3D Tactical Multiplayer FPS

An original, closed-source 3D tactical first-person shooter with full cross-platform multiplayer support for **Windows PC** and **Android (APK)**.

Inspired by competitive tactical shooters (skill-based gunplay, positional awareness, tactical walking, crouch-strafing, and round pacing), this game is engineered to be **lightweight (< 5 MB)**, with zero heavy IDE requirements, and automated cloud APK compilation.

---

## 📲 Download & Play the Android APK

1. Go to the **[GitHub Releases](https://github.com/sawgatio/cuddly-barnacle/releases)** page of this repository.
2. Download the latest **`TacticalStrike-v1.0.0.apk`**.
3. Tap to install on your Android device (enable *"Install unknown apps"* if prompted).
4. Tap **Multiplayer**, create or join a room code, and start playing!

---

## 🎮 How to Play Multiplayer (Host / Join)

The game uses **Peer-to-Peer WebRTC (PeerJS)** data channels for low-latency multiplayer without external server costs:

1. **Host a Match:**
   * Open the game on PC or Android.
   * Go to **Multiplayer > Create Room**.
   * You will receive a 6-character room code (e.g. `STRIKE-742`).
2. **Join a Match:**
   * Your friend opens the game on their phone or PC.
   * Goes to **Multiplayer > Join a Room**.
   * Enters your room code (`STRIKE-742`) and clicks **Join**.
3. Both players immediately spawn into the 3D tactical arena with synchronized positions, pitch/yaw rotations, shooting effects, and health bars!

---

## 🕹️ Controls

### PC (Keyboard & Mouse)
* **WASD / Arrow Keys:** Locomotion & Strafe
* **Mouse:** Aim & Look (Click canvas to lock cursor, `Esc` to unlock)
* **Left Click:** Fire Tactical Assault Rifle
* **R:** Reload 30-round Magazine
* **Space:** Jump
* **C / Left Ctrl:** Toggle Crouch
* **Left Shift:** Tactical Silent Walk (Mutes footsteps, boosts accuracy)

### Android / Touch Devices
* **Left On-Screen Joystick:** Move & Strafe
* **Right Screen Swipe:** Look & Aim
* **Dedicated Touch Buttons:** `FIRE`, `JUMP`, `CROUCH`, `RELOAD`

---

## 🛠️ Local Development & Web Testing

To run and test the game locally in your browser:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Open `http://localhost:5173/` in your browser. You can test multiplayer on the same machine by opening two browser windows side by side!

---

## 🤖 Automated Cloud APK Build (GitHub Actions)

Every push to `main` triggers `.github/workflows/build-apk.yml`, which:
1. Runs Ubuntu 22.04 cloud runner with Java 17 and Android SDK.
2. Compiles web bundle with Vite.
3. Syncs Capacitor Android bridge.
4. Builds release APK via Gradle (`./gradlew assembleDebug`).
5. Publishes `TacticalStrike-v1.0.0.apk` directly to GitHub Releases.
