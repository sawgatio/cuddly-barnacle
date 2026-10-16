// ============================================================================
// Tactical Strike - 3D Tactical FPS Engine (Three.js & PeerJS Netcode)
// ============================================================================

import * as THREE from 'three';
import Peer from 'peerjs';

// --- Global Audio Synthesizer (Zero External File Dependencies) ---
class TacticalAudioEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playGunshot() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Noise blast for explosion
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    // 2. Low punch
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playHitSound() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.setValueAtTime(1600, now + 0.03);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playReload() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playDamageHurt() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.18);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }
}

const audio = new TacticalAudioEngine();

// --- Game Engine Core ---
class TacticalGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.hud = document.getElementById('hud');
    this.menuOverlay = document.getElementById('menu-overlay');

    // 3D Scene Elements
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Map collision colliders
    this.colliders = [];

    // Weapon & Gun ViewModel
    this.gunMesh = null;
    this.muzzleLight = null;
    this.muzzleFlashMesh = null;
    this.ammoClip = 30;
    this.ammoReserve = 90;
    this.isReloading = false;
    this.lastFireTime = 0;
    this.fireRate = 0.11; // 550 RPM

    // Player State
    this.health = 100;
    this.score = 0;
    this.enemyScore = 0;
    this.isDead = false;
    this.stance = 'stand'; // 'stand' | 'crouch' | 'walk'
    this.cameraHeight = 1.7;
    this.targetCameraHeight = 1.7;

    // Locomotion & Physics
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.moveInput = { forward: 0, right: 0 };
    this.isOnGround = true;
    this.isJumping = false;
    this.yaw = 0;
    this.pitch = 0;
    this.isPointerLocked = false;

    // Virtual Touch Joystick State (Mobile)
    this.touchAimActive = false;
    this.lastTouchAimPos = { x: 0, y: 0 };

    // Multiplayer State (PeerJS)
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.remotePlayers = new Map();

    this.init();
  }

  init() {
    this.setupThreeScene();
    this.setupArenaMap();
    this.setupWeaponModel();
    this.setupInputListeners();
    this.setupUIListeners();
    this.setupMultiplayer();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  setupThreeScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.015);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, this.cameraHeight, 15);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Ambient & Tactical Directional Lighting
    const hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 0.8);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(25, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    this.scene.add(sunLight);

    // Blue/Orange accent spotlights
    const accentBlue = new THREE.PointLight(0x3b82f6, 2, 25);
    accentBlue.position.set(-15, 6, -15);
    this.scene.add(accentBlue);

    const accentOrange = new THREE.PointLight(0xf59e0b, 2, 25);
    accentOrange.position.set(15, 6, 15);
    this.scene.add(accentOrange);
  }

  setupArenaMap() {
    // 1. Concrete Ground Floor
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1c2331,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Grid lines pattern on ground
    const grid = new THREE.GridHelper(60, 30, 0x3b82f6, 0x1e293b);
    grid.position.y = 0.01;
    this.scene.add(grid);

    // 2. Perimeter Boundary Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const wallGeoH = new THREE.BoxGeometry(60, 8, 1);
    const wallGeoV = new THREE.BoxGeometry(1, 8, 60);

    const addWall = (mesh, x, z) => {
      mesh.position.set(x, 4, z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      this.scene.add(mesh);
      this.colliders.push(new THREE.Box3().setFromObject(mesh));
    };

    addWall(new THREE.Mesh(wallGeoH, wallMat), 0, -30); // North
    addWall(new THREE.Mesh(wallGeoH, wallMat), 0, 30);  // South
    addWall(new THREE.Mesh(wallGeoV, wallMat), -30, 0); // West
    addWall(new THREE.Mesh(wallGeoV, wallMat), 30, 0);  // East

    // 3. Tactical Obstacles & Crates
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.3 });
    const crateMatAccent = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 });

    const createCrate = (w, h, d, x, z, mat = crateMat) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.colliders.push(new THREE.Box3().setFromObject(mesh));
    };

    // Central Choke Point Cover
    createCrate(4, 2.5, 1.5, 0, 0, crateMatAccent);
    createCrate(3, 2.0, 3, -8, 5);
    createCrate(3, 2.0, 3, 8, -5);

    // Elevated Sniper Ramps / Platforms
    createCrate(6, 1.8, 6, -18, -18);
    createCrate(6, 1.8, 6, 18, 18);

    // Perimeter cover pillars
    createCrate(2, 6, 2, -15, 0);
    createCrate(2, 6, 2, 15, 0);
    createCrate(2, 6, 2, 0, -15);
    createCrate(2, 6, 2, 0, 15);

    // Target Dummies for Solo Practice
    this.targetDummies = [];
    this.createTargetDummy(5, 0, -12);
    this.createTargetDummy(-10, 0, -8);
    this.createTargetDummy(12, 1.8, 18);
  }

  createTargetDummy(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 12), bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    // Head (Critical hit zone)
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), headMat);
    head.position.y = 1.7;
    head.castShadow = true;
    group.add(head);

    group.userData = { isDummy: true, health: 100, originalPos: new THREE.Vector3(x, y, z) };
    this.scene.add(group);
    this.targetDummies.push(group);
  }

  setupWeaponModel() {
    // 3D First-Person Assault Rifle attached directly to Camera
    this.gunMesh = new THREE.Group();

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });

    // Main Rifle Receiver
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.45), metalMat);
    receiver.position.set(0, 0, 0);
    this.gunMesh.add(receiver);

    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8), metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.01, -0.35);
    this.gunMesh.add(barrel);

    // Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.08), darkMat);
    mag.position.set(0, -0.1, -0.05);
    mag.rotation.x = -0.2;
    this.gunMesh.add(mag);

    // Optical Holo Sight
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.08), glowMat);
    sight.position.set(0, 0.06, 0.05);
    this.gunMesh.add(sight);

    // Position gun in lower right of viewport
    this.gunDefaultPos = new THREE.Vector3(0.25, -0.22, -0.45);
    this.gunMesh.position.copy(this.gunDefaultPos);
    this.camera.add(this.gunMesh);
    this.scene.add(this.camera);

    // Muzzle Flash Effect
    const flashGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlashMesh.position.set(0, 0.01, -0.52);
    this.muzzleFlashMesh.visible = false;
    this.gunMesh.add(this.muzzleFlashMesh);

    this.muzzleLight = new THREE.PointLight(0xffea00, 0, 5);
    this.muzzleLight.position.set(0, 0.01, -0.52);
    this.gunMesh.add(this.muzzleLight);
  }

  setupInputListeners() {
    // --- Desktop Keyboard (WASD, Shift, Ctrl, Space, R) ---
    const keys = {};
    window.addEventListener('keydown', (e) => {
      audio.init();
      keys[e.code] = true;

      if (e.code === 'KeyR' && !this.isReloading && this.ammoClip < 30) {
        this.reload();
      }
      if (e.code === 'KeyC' || e.code === 'ControlLeft') {
        this.toggleCrouch();
      }
      if (e.code === 'Space' && this.isOnGround) {
        this.jump();
      }
      this.updateMovementKeys(keys);
    });

    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
      this.updateMovementKeys(keys);
    });

    // --- Desktop Mouse Pointer Lock & Aim ---
    this.container.addEventListener('click', () => {
      audio.init();
      if (!this.isPointerLocked && this.menuOverlay.classList.contains('hidden')) {
        this.container.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.container;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked) return;
      const sensitivity = 0.0022;
      this.yaw -= e.movementX * sensitivity;
      this.pitch -= e.movementY * sensitivity;
      this.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch));
    });

    window.addEventListener('mousedown', (e) => {
      if (this.isPointerLocked && e.button === 0) {
        this.fireWeapon();
      }
    });

    // --- Mobile Virtual Touch Controls ---
    this.setupMobileTouch();
  }

  updateMovementKeys(keys) {
    this.moveInput.forward = 0;
    this.moveInput.right = 0;

    if (keys['KeyW'] || keys['ArrowUp']) this.moveInput.forward += 1;
    if (keys['KeyS'] || keys['ArrowDown']) this.moveInput.forward -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) this.moveInput.right -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) this.moveInput.right += 1;

    // Tactical Walk (Shift)
    if (keys['ShiftLeft'] || keys['ShiftRight']) {
      if (this.stance !== 'crouch') {
        this.stance = 'walk';
        document.getElementById('stance-indicator').innerText = 'WALK';
      }
    } else if (this.stance === 'walk') {
      this.stance = 'stand';
      document.getElementById('stance-indicator').innerText = 'STAND';
    }
  }

  setupMobileTouch() {
    // Left Virtual Joystick
    const joystickZone = document.getElementById('joystick-zone');
    const joystickThumb = document.getElementById('joystick-thumb');
    let joystickOrigin = null;

    joystickZone.addEventListener('touchstart', (e) => {
      audio.init();
      const touch = e.touches[0];
      const rect = joystickZone.getBoundingClientRect();
      joystickOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, { passive: false });

    joystickZone.addEventListener('touchmove', (e) => {
      if (!joystickOrigin) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - joystickOrigin.x;
      const dy = touch.clientY - joystickOrigin.y;
      const dist = Math.hypot(dx, dy);
      const maxRadius = 40;
      const angle = Math.atan2(dy, dx);

      const clampedDist = Math.min(dist, maxRadius);
      const thumbX = Math.cos(angle) * clampedDist;
      const thumbY = Math.sin(angle) * clampedDist;

      joystickThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;

      // Map joystick X/Y to moveInput
      this.moveInput.right = thumbX / maxRadius;
      this.moveInput.forward = -thumbY / maxRadius;
    }, { passive: false });

    const resetJoystick = () => {
      joystickOrigin = null;
      joystickThumb.style.transform = `translate(-50%, -50%)`;
      this.moveInput.forward = 0;
      this.moveInput.right = 0;
    };

    joystickZone.addEventListener('touchend', resetJoystick);
    joystickZone.addEventListener('touchcancel', resetJoystick);

    // Right Touch Aim Zone
    const aimZone = document.getElementById('touch-aim-zone');
    aimZone.addEventListener('touchstart', (e) => {
      audio.init();
      const touch = e.touches[0];
      this.touchAimActive = true;
      this.lastTouchAimPos = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });

    aimZone.addEventListener('touchmove', (e) => {
      if (!this.touchAimActive) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - this.lastTouchAimPos.x;
      const dy = touch.clientY - this.lastTouchAimPos.y;
      this.lastTouchAimPos = { x: touch.clientX, y: touch.clientY };

      const sensitivity = 0.005;
      this.yaw -= dx * sensitivity;
      this.pitch -= dy * sensitivity;
      this.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch));
    }, { passive: false });

    const endAim = () => { this.touchAimActive = false; };
    aimZone.addEventListener('touchend', endAim);
    aimZone.addEventListener('touchcancel', endAim);

    // Mobile Action Buttons
    document.getElementById('btn-fire').addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.fireWeapon();
    });
    document.getElementById('btn-reload').addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.reload();
    });
    document.getElementById('btn-jump').addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.jump();
    });
    document.getElementById('btn-crouch').addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.toggleCrouch();
    });
  }

  setupUIListeners() {
    // Menu Tab Switching
    const tabs = ['play', 'multiplayer', 'controls'];
    tabs.forEach(tab => {
      document.getElementById(`tab-${tab}`).addEventListener('click', () => {
        tabs.forEach(t => {
          document.getElementById(`tab-${t}`).classList.remove('active');
          document.getElementById(`tab-content-${t}`).classList.remove('active');
        });
        document.getElementById(`tab-${tab}`).classList.add('active');
        document.getElementById(`tab-content-${tab}`).classList.add('active');
      });
    });

    // Start Solo Button
    document.getElementById('btn-start-solo').addEventListener('click', () => {
      audio.init();
      this.menuOverlay.classList.add('hidden');
      this.hud.classList.remove('hidden');
      this.container.requestPointerLock();
    });
  }

  toggleCrouch() {
    if (this.stance === 'crouch') {
      this.stance = 'stand';
      this.targetCameraHeight = 1.7;
      document.getElementById('stance-indicator').innerText = 'STAND';
    } else {
      this.stance = 'crouch';
      this.targetCameraHeight = 1.0;
      document.getElementById('stance-indicator').innerText = 'CROUCH';
    }
  }

  jump() {
    if (this.isOnGround && this.stance !== 'crouch') {
      this.velocity.y = 8.5;
      this.isOnGround = false;
    }
  }

  fireWeapon() {
    const now = this.clock.getElapsedTime();
    if (now - this.lastFireTime < this.fireRate) return;
    if (this.isReloading) return;
    if (this.ammoClip <= 0) {
      audio.playReload();
      return;
    }

    this.lastFireTime = now;
    this.ammoClip--;
    document.getElementById('ammo-clip').innerText = this.ammoClip;

    // Play gunshot audio
    audio.playGunshot();

    // Muzzle flash animation
    this.muzzleFlashMesh.visible = true;
    this.muzzleLight.intensity = 4;
    setTimeout(() => {
      this.muzzleFlashMesh.visible = false;
      this.muzzleLight.intensity = 0;
    }, 45);

    // Gun viewmodel recoil kick
    this.gunMesh.position.z += 0.06;
    this.gunMesh.rotation.x += 0.08;

    // Raycast hitscan trace from camera
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    // Send shooting event to remote multiplayer peer
    if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'shoot',
        origin: this.camera.position.toArray(),
        dir: raycaster.ray.direction.toArray()
      });
    }

    // Check target dummies
    const dummyIntersects = raycaster.intersectObjects(this.targetDummies, true);
    if (dummyIntersects.length > 0) {
      const hitObj = dummyIntersects[0].object;
      const rootDummy = hitObj.parent.userData.isDummy ? hitObj.parent : null;
      if (rootDummy) {
        this.showHitmarker();
        audio.playHitSound();
        rootDummy.position.y += 0.1;
        setTimeout(() => { rootDummy.position.y = rootDummy.userData.originalPos.y; }, 100);
      }
    }

    // Check remote player meshes
    this.remotePlayers.forEach((player, peerId) => {
      const intersects = raycaster.intersectObject(player.mesh, true);
      if (intersects.length > 0) {
        this.showHitmarker();
        audio.playHitSound();

        // Send damage packet to peer
        const damage = 25;
        if (this.conn && this.conn.open) {
          this.conn.send({ type: 'damage', amount: damage });
        }
      }
    });

    // Spawn bullet impact spark particle
    const worldIntersects = raycaster.intersectObjects(this.scene.children, false);
    if (worldIntersects.length > 0) {
      this.spawnImpactParticles(worldIntersects[0].point, worldIntersects[0].face.normal);
    }
  }

  spawnImpactParticles(point, normal) {
    const sparkGeo = new THREE.BufferGeometry();
    const count = 8;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = point.x + (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.1;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const sparkMat = new THREE.PointsMaterial({ color: 0xffea00, size: 0.08 });
    const p = new THREE.Points(sparkGeo, sparkMat);
    this.scene.add(p);
    setTimeout(() => { this.scene.remove(p); }, 120);
  }

  showHitmarker() {
    const hm = document.getElementById('hitmarker');
    hm.classList.remove('hidden');
    hm.style.opacity = '1';
    setTimeout(() => {
      hm.style.opacity = '0';
      setTimeout(() => hm.classList.add('hidden'), 150);
    }, 80);
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    document.getElementById('health-text').innerText = this.health;
    document.getElementById('health-bar').style.width = `${this.health}%`;

    audio.playDamageHurt();

    // Red screen flash
    const vignette = document.getElementById('damage-vignette');
    vignette.classList.add('active');
    setTimeout(() => vignette.classList.remove('active'), 180);

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.addKillFeedMessage('You were eliminated!');
    this.enemyScore++;
    document.getElementById('enemy-score').innerText = this.enemyScore;

    setTimeout(() => {
      this.respawn();
    }, 2500);
  }

  respawn() {
    this.health = 100;
    this.isDead = false;
    document.getElementById('health-text').innerText = '100';
    document.getElementById('health-bar').style.width = '100%';
    this.camera.position.set((Math.random() - 0.5) * 20, this.cameraHeight, 20);
    this.velocity.set(0, 0, 0);
  }

  reload() {
    if (this.isReloading || this.ammoClip >= 30 || this.ammoReserve <= 0) return;
    this.isReloading = true;
    audio.playReload();

    // Animate gun lowered during reload
    this.gunMesh.position.y -= 0.15;
    setTimeout(() => {
      const needed = 30 - this.ammoClip;
      const load = Math.min(needed, this.ammoReserve);
      this.ammoClip += load;
      this.ammoReserve -= load;
      document.getElementById('ammo-clip').innerText = this.ammoClip;
      document.getElementById('ammo-reserve').innerText = this.ammoReserve;

      this.gunMesh.position.y += 0.15;
      this.isReloading = false;
    }, 1200);
  }

  addKillFeedMessage(msg) {
    const feed = document.getElementById('kill-feed');
    const div = document.createElement('div');
    div.className = 'kill-msg';
    div.innerText = msg;
    feed.appendChild(div);
    setTimeout(() => { feed.removeChild(div); }, 3500);
  }

  // --- PeerJS P2P Multiplayer Subsystem ---
  setupMultiplayer() {
    const btnHost = document.getElementById('btn-host-room');
    const btnJoin = document.getElementById('btn-join-room');
    const statusMsg = document.getElementById('connection-status');

    // Host Room
    btnHost.addEventListener('click', () => {
      audio.init();
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const hostRoomId = `tactical-strike-${randomSuffix}`;

      statusMsg.innerText = 'Initializing P2P network host...';
      this.peer = new Peer(hostRoomId);

      this.peer.on('open', (id) => {
        this.isHost = true;
        const shortCode = `STRIKE-${randomSuffix}`;
        document.getElementById('generated-room-code').innerText = shortCode;
        document.getElementById('host-code-display').classList.remove('hidden');
        document.getElementById('room-badge').innerText = `HOST: ${shortCode}`;
        statusMsg.innerText = 'Room ready! Waiting for your friend to connect...';

        document.getElementById('btn-copy-code').onclick = () => {
          navigator.clipboard.writeText(shortCode);
          statusMsg.innerText = 'Copied to clipboard!';
        };
      });

      this.peer.on('connection', (connection) => {
        this.conn = connection;
        this.handlePeerConnection();
      });

      this.peer.on('error', (err) => {
        statusMsg.innerText = `Network error: ${err.message}`;
      });
    });

    // Join Room
    btnJoin.addEventListener('click', () => {
      audio.init();
      const codeInput = document.getElementById('join-room-input').value.trim().toUpperCase();
      if (!codeInput.startsWith('STRIKE-')) {
        statusMsg.innerText = 'Invalid format! Code must look like STRIKE-742';
        return;
      }

      const roomNum = codeInput.replace('STRIKE-', '');
      const targetPeerId = `tactical-strike-${roomNum}`;

      statusMsg.innerText = `Connecting to peer ${codeInput}...`;
      this.peer = new Peer();

      this.peer.on('open', () => {
        this.conn = this.peer.connect(targetPeerId);
        this.handlePeerConnection();
      });

      this.peer.on('error', (err) => {
        statusMsg.innerText = `Connection failed: ${err.message}`;
      });
    });
  }

  handlePeerConnection() {
    const statusMsg = document.getElementById('connection-status');

    this.conn.on('open', () => {
      statusMsg.innerText = 'Connected! Entering match arena...';
      setTimeout(() => {
        this.menuOverlay.classList.add('hidden');
        this.hud.classList.remove('hidden');
        document.getElementById('room-badge').innerText = 'MULTIPLAYER ACTIVE';
        this.container.requestPointerLock();
      }, 800);

      // Create Remote Player Mesh
      this.createRemotePlayer('opponent');
    });

    this.conn.on('data', (data) => {
      if (data.type === 'state') {
        const player = this.remotePlayers.get('opponent');
        if (player) {
          player.targetPos.set(data.pos[0], data.pos[1], data.pos[2]);
          player.targetYaw = data.yaw;
          player.mesh.position.lerp(player.targetPos, 0.4);
          player.mesh.rotation.y = data.yaw;
        }
      } else if (data.type === 'shoot') {
        audio.playGunshot();
      } else if (data.type === 'damage') {
        this.takeDamage(data.amount);
      }
    });

    this.conn.on('close', () => {
      this.addKillFeedMessage('Peer disconnected.');
      const player = this.remotePlayers.get('opponent');
      if (player) {
        this.scene.remove(player.mesh);
        this.remotePlayers.delete('opponent');
      }
    });
  }

  createRemotePlayer(id) {
    const group = new THREE.Group();

    // Tactical Soldier Body Mesh
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.3, 12), bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    const headMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), headMat);
    head.position.y = 1.7;
    head.castShadow = true;
    group.add(head);

    // Weapon on remote character
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    gun.position.set(0.3, 1.1, -0.3);
    group.add(gun);

    this.scene.add(group);
    this.remotePlayers.set(id, {
      mesh: group,
      targetPos: new THREE.Vector3(),
      targetYaw: 0
    });
  }

  updatePlayerLocomotion(delta) {
    if (this.isDead) return;

    // Determine target speed based on stance
    let targetSpeed = 12.0; // Standing speed
    if (this.stance === 'walk') targetSpeed = 6.0;
    if (this.stance === 'crouch') targetSpeed = 4.0;

    // Apply Camera Height interpolation (smooth crouch)
    this.cameraHeight += (this.targetCameraHeight - this.cameraHeight) * 0.15;
    this.camera.position.y = this.cameraHeight;

    // Compute forward & right direction based on camera yaw
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    this.direction.set(0, 0, 0);
    this.direction.addScaledVector(forward, this.moveInput.forward);
    this.direction.addScaledVector(right, this.moveInput.right);

    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
    }

    // Accelerate smoothly
    const accel = 45.0;
    const friction = 12.0;

    this.velocity.x += this.direction.x * targetSpeed * accel * delta;
    this.velocity.z += this.direction.z * targetSpeed * accel * delta;

    // Apply Ground Friction
    this.velocity.x -= this.velocity.x * friction * delta;
    this.velocity.z -= this.velocity.z * friction * delta;

    // Gravity
    if (!this.isOnGround) {
      this.velocity.y -= 25.0 * delta;
    }

    // Apply Move delta
    const moveX = this.velocity.x * delta;
    const moveZ = this.velocity.z * delta;

    // Wall collision checking
    const nextPos = this.camera.position.clone();
    nextPos.x += moveX;
    nextPos.z += moveZ;

    const playerBox = new THREE.Box3().setFromCenterAndSize(
      nextPos,
      new THREE.Vector3(0.7, 1.8, 0.7)
    );

    let canMoveX = true;
    let canMoveZ = true;

    for (const collider of this.colliders) {
      if (collider.intersectsBox(playerBox)) {
        // Simple slide response
        canMoveX = false;
        canMoveZ = false;
        break;
      }
    }

    if (canMoveX) this.camera.position.x += moveX;
    if (canMoveZ) this.camera.position.z += moveZ;

    // Floor contact
    if (this.camera.position.y + this.velocity.y * delta <= this.cameraHeight) {
      this.velocity.y = 0;
      this.isOnGround = true;
      this.camera.position.y = this.cameraHeight;
    } else {
      this.camera.position.y += this.velocity.y * delta;
      this.isOnGround = false;
    }

    // Apply View Rotation to Camera
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // Gun Bobbing & Sway
    const moveSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (moveSpeed > 0.5 && this.isOnGround) {
      const bobTime = this.clock.getElapsedTime() * 10;
      this.gunMesh.position.x = this.gunDefaultPos.x + Math.sin(bobTime) * 0.008;
      this.gunMesh.position.y = this.gunDefaultPos.y + Math.cos(bobTime * 2) * 0.008;
    } else {
      this.gunMesh.position.lerp(this.gunDefaultPos, 0.1);
      this.gunMesh.rotation.set(0, 0, 0);
    }

    // Send Netcode State to peer at 30Hz
    if (this.conn && this.conn.open && Math.random() < 0.5) {
      this.conn.send({
        type: 'state',
        pos: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
        yaw: this.yaw,
        pitch: this.pitch,
        health: this.health
      });
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = Math.min(this.clock.getDelta(), 0.1);

    this.updatePlayerLocomotion(delta);
    this.renderer.render(this.scene, this.camera);
  }
}

// Start Game instance on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new TacticalGame();
});
