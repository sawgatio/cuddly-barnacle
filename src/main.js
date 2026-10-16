// ============================================================================
// Tactical Strike V2 - 3D Tactical FPS Engine (Three.js & PeerJS Netcode)
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

  playRifleShot() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

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

  playPistolShot() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playExplosion() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
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

  playBeep(freq = 880) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
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
    this.grenades = [];
    this.bots = [];

    // Weapon Inventory & Slots
    this.currentSlot = 1; // 1: AR-556, 2: P-900, 3: Frag Grenade
    this.weapons = {
      1: { name: 'TACTICAL AR-556', clip: 30, maxClip: 30, reserve: 90, fireRate: 0.11, damage: 35, auto: true },
      2: { name: 'TACTICAL P-900', clip: 15, maxClip: 15, reserve: 45, fireRate: 0.18, damage: 28, auto: false }
    };
    this.grenadeCount = 2;
    this.isReloading = false;
    this.lastFireTime = 0;

    // Viewmodel Meshes
    this.gunMesh = null;
    this.rifleMesh = null;
    this.pistolMesh = null;
    this.muzzleLight = null;
    this.muzzleFlashMesh = null;

    // Player State
    this.health = 100;
    this.score = 0;
    this.enemyScore = 0;
    this.isDead = false;
    this.stance = 'stand';
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

    // Objective / Bomb Plant State
    this.bombPlanted = false;
    this.bombTimeRemaining = 45;
    this.bombPosition = new THREE.Vector3(0, 0.2, 0);
    this.isInteracting = false;
    this.interactionProgress = 0;

    // Mode Configuration
    this.gameMode = 'solo'; // 'solo' | 'bots'
    this.botCount = 2;
    this.botDifficulty = 'regular';

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
    this.setupWeaponModels();
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

    const hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 0.8);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(25, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    this.scene.add(sunLight);

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
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1c2331, roughness: 0.8, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

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

    addWall(new THREE.Mesh(wallGeoH, wallMat), 0, -30);
    addWall(new THREE.Mesh(wallGeoH, wallMat), 0, 30);
    addWall(new THREE.Mesh(wallGeoV, wallMat), -30, 0);
    addWall(new THREE.Mesh(wallGeoV, wallMat), 30, 0);

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

    createCrate(4, 2.5, 1.5, 0, 0, crateMatAccent);
    createCrate(3, 2.0, 3, -8, 5);
    createCrate(3, 2.0, 3, 8, -5);
    createCrate(6, 1.8, 6, -18, -18);
    createCrate(6, 1.8, 6, 18, 18);
    createCrate(2, 6, 2, -15, 0);
    createCrate(2, 6, 2, 15, 0);

    // Site A Bomb Planting Zone (Golden marker circle on floor)
    const siteGeo = new THREE.RingGeometry(2.5, 2.8, 32);
    const siteMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const siteMarker = new THREE.Mesh(siteGeo, siteMat);
    siteMarker.rotation.x = Math.PI / 2;
    siteMarker.position.set(0, 0.05, 0);
    this.scene.add(siteMarker);

    // Practice target dummies
    this.targetDummies = [];
    this.createTargetDummy(5, 0, -12);
    this.createTargetDummy(-10, 0, -8);
    this.createTargetDummy(12, 1.8, 18);
  }

  createTargetDummy(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 12), bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    const headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), headMat);
    head.position.y = 1.7;
    head.castShadow = true;
    group.add(head);

    group.userData = { isDummy: true, health: 100, originalPos: new THREE.Vector3(x, y, z) };
    this.scene.add(group);
    this.targetDummies.push(group);
  }

  setupWeaponModels() {
    this.gunMesh = new THREE.Group();

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });

    // 1. Rifle Model (Slot 1)
    this.rifleMesh = new THREE.Group();
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.45), metalMat);
    this.rifleMesh.add(receiver);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8), metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.01, -0.35);
    this.rifleMesh.add(barrel);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.08), darkMat);
    mag.position.set(0, -0.1, -0.05);
    mag.rotation.x = -0.2;
    this.rifleMesh.add(mag);
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.08), glowMat);
    sight.position.set(0, 0.06, 0.05);
    this.rifleMesh.add(sight);

    // 2. Pistol Model (Slot 2)
    this.pistolMesh = new THREE.Group();
    const pSlide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.22), metalMat);
    this.pistolMesh.add(pSlide);
    const pGrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.06), darkMat);
    pGrip.position.set(0, -0.08, 0.04);
    pGrip.rotation.x = -0.2;
    this.pistolMesh.add(pGrip);
    this.pistolMesh.visible = false;

    this.gunMesh.add(this.rifleMesh);
    this.gunMesh.add(this.pistolMesh);

    // Muzzle Flash
    const flashGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlashMesh.position.set(0, 0.01, -0.52);
    this.muzzleFlashMesh.visible = false;
    this.gunMesh.add(this.muzzleFlashMesh);

    this.muzzleLight = new THREE.PointLight(0xffea00, 0, 5);
    this.muzzleLight.position.set(0, 0.01, -0.52);
    this.gunMesh.add(this.muzzleLight);

    this.gunDefaultPos = new THREE.Vector3(0.25, -0.22, -0.45);
    this.gunMesh.position.copy(this.gunDefaultPos);
    this.camera.add(this.gunMesh);
    this.scene.add(this.camera);
  }

  setupInputListeners() {
    const keys = {};
    window.addEventListener('keydown', (e) => {
      audio.init();
      keys[e.code] = true;

      if (e.code === 'KeyR') this.reload();
      if (e.code === 'Digit1') this.switchWeapon(1);
      if (e.code === 'Digit2') this.switchWeapon(2);
      if (e.code === 'Digit3' || e.code === 'KeyG') this.throwGrenade();
      if (e.code === 'KeyC' || e.code === 'ControlLeft') this.toggleCrouch();
      if (e.code === 'Space' && this.isOnGround) this.jump();
      if (e.code === 'KeyE') this.startInteraction();

      this.updateMovementKeys(keys);
    });

    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
      if (e.code === 'KeyE') this.stopInteraction();
      this.updateMovementKeys(keys);
    });

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

    this.setupMobileTouch();
  }

  updateMovementKeys(keys) {
    this.moveInput.forward = 0;
    this.moveInput.right = 0;

    if (keys['KeyW'] || keys['ArrowUp']) this.moveInput.forward += 1;
    if (keys['KeyS'] || keys['ArrowDown']) this.moveInput.forward -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) this.moveInput.right -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) this.moveInput.right += 1;

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
    const joystickZone = document.getElementById('joystick-zone');
    const joystickThumb = document.getElementById('joystick-thumb');
    let joystickOrigin = null;

    joystickZone.addEventListener('touchstart', (e) => {
      audio.init();
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

    // Aim zone
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

    aimZone.addEventListener('touchend', () => { this.touchAimActive = false; });

    // Buttons
    document.getElementById('btn-fire').addEventListener('touchstart', (e) => { e.preventDefault(); this.fireWeapon(); });
    document.getElementById('btn-switch-weapon').addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.switchWeapon(this.currentSlot === 1 ? 2 : 1);
    });
    document.getElementById('btn-grenade').addEventListener('touchstart', (e) => { e.preventDefault(); this.throwGrenade(); });
    document.getElementById('btn-reload').addEventListener('touchstart', (e) => { e.preventDefault(); this.reload(); });
    document.getElementById('btn-jump').addEventListener('touchstart', (e) => { e.preventDefault(); this.jump(); });
    document.getElementById('btn-crouch').addEventListener('touchstart', (e) => { e.preventDefault(); this.toggleCrouch(); });
    document.getElementById('btn-interact').addEventListener('touchstart', (e) => { e.preventDefault(); this.startInteraction(); });
    document.getElementById('btn-interact').addEventListener('touchend', (e) => { e.preventDefault(); this.stopInteraction(); });
  }

  setupUIListeners() {
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

    // Mode Toggle (Solo vs Bots)
    document.getElementById('mode-solo').addEventListener('click', () => {
      this.gameMode = 'solo';
      document.getElementById('mode-solo').classList.add('active');
      document.getElementById('mode-bots').classList.remove('active');
      document.getElementById('bot-config-section').classList.add('hidden');
    });

    document.getElementById('mode-bots').addEventListener('click', () => {
      this.gameMode = 'bots';
      document.getElementById('mode-bots').classList.add('active');
      document.getElementById('mode-solo').classList.remove('active');
      document.getElementById('bot-config-section').classList.remove('hidden');
    });

    // Deploy Button
    document.getElementById('btn-start-solo').addEventListener('click', () => {
      audio.init();
      this.botCount = parseInt(document.getElementById('select-bot-count').value, 10);
      this.botDifficulty = document.getElementById('select-difficulty').value;

      this.menuOverlay.classList.add('hidden');
      this.hud.classList.remove('hidden');
      this.container.requestPointerLock();

      if (this.gameMode === 'bots') {
        this.spawnTacticalBots();
        document.getElementById('room-badge').innerText = `BOTS: ${this.botDifficulty.toUpperCase()}`;
      } else {
        document.getElementById('room-badge').innerText = 'SOLO PRACTICE';
      }
    });
  }

  switchWeapon(slot) {
    if (this.isReloading || slot === this.currentSlot) return;
    this.currentSlot = slot;

    // Toggle ViewModels
    if (slot === 1) {
      this.rifleMesh.visible = true;
      this.pistolMesh.visible = false;
      document.getElementById('slot-primary').classList.add('active');
      document.getElementById('slot-secondary').classList.remove('active');
      document.getElementById('weapon-name-display').innerText = 'TACTICAL AR-556';
    } else if (slot === 2) {
      this.rifleMesh.visible = false;
      this.pistolMesh.visible = true;
      document.getElementById('slot-primary').classList.remove('active');
      document.getElementById('slot-secondary').classList.add('active');
      document.getElementById('weapon-name-display').innerText = 'TACTICAL P-900';
    }

    const cur = this.weapons[this.currentSlot];
    document.getElementById('ammo-clip').innerText = cur.clip;
    document.getElementById('ammo-reserve').innerText = cur.reserve;
    audio.playReload();
  }

  throwGrenade() {
    if (this.grenadeCount <= 0) return;
    this.grenadeCount--;
    document.getElementById('grenade-count').innerText = `x${this.grenadeCount}`;

    // Physical Grenade Mesh
    const gGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const gMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const grenade = new THREE.Mesh(gGeo, gMat);
    grenade.position.copy(this.camera.position);

    // Initial Velocity along camera vector
    const throwDir = new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation);
    const throwVel = throwDir.multiplyScalar(22);
    throwVel.y += 4; // slight upward arc

    this.scene.add(grenade);
    this.grenades.push({
      mesh: grenade,
      velocity: throwVel,
      fuse: 2.2,
      exploded: false
    });

    this.addKillFeedMessage('Threw Frag Grenade!');
  }

  spawnTacticalBots() {
    // Clear old bots
    this.bots.forEach(b => this.scene.remove(b.mesh));
    this.bots = [];

    const spawns = [
      new THREE.Vector3(-15, 0, -15),
      new THREE.Vector3(15, 0, -15),
      new THREE.Vector3(0, 0, -22)
    ];

    for (let i = 0; i < this.botCount; i++) {
      const pos = spawns[i % spawns.length];
      const botMesh = new THREE.Group();
      botMesh.position.copy(pos);

      // Red operative body
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 1.3, 12),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 })
      );
      body.position.y = 0.9;
      body.castShadow = true;
      botMesh.add(body);

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
      );
      head.position.y = 1.7;
      head.castShadow = true;
      botMesh.add(head);

      // Gun
      const gun = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      gun.position.set(0.3, 1.1, -0.3);
      botMesh.add(gun);

      this.scene.add(botMesh);
      this.bots.push({
        id: `Bot_${i + 1}`,
        mesh: botMesh,
        health: 100,
        state: 'patrol',
        targetPoint: new THREE.Vector3(pos.x + 5, 0, pos.y),
        lastShotTime: 0,
        burstCount: 0
      });
    }
  }

  updateBots(delta) {
    if (this.isDead) return;

    this.bots.forEach(bot => {
      if (bot.health <= 0) return;

      const distToPlayer = bot.mesh.position.distanceTo(this.camera.position);

      // Perception check: Line of sight raycast
      const botEye = bot.mesh.position.clone();
      botEye.y += 1.6;
      const toPlayer = this.camera.position.clone().sub(botEye).normalize();

      // Bot rotates to face player when within 35m
      if (distToPlayer < 35) {
        bot.mesh.lookAt(this.camera.position.x, bot.mesh.position.y, this.camera.position.z);

        // Engagement firing
        const now = this.clock.getElapsedTime();
        if (now - bot.lastShotTime > 0.8) {
          bot.lastShotTime = now;

          // Controlled burst
          audio.playRifleShot();

          // Bot accuracy based on difficulty
          let hitChance = 0.35;
          if (this.botDifficulty === 'regular') hitChance = 0.55;
          if (this.botDifficulty === 'veteran') hitChance = 0.75;
          if (this.botDifficulty === 'elite') hitChance = 0.90;

          if (Math.random() < hitChance) {
            this.takeDamage(18);
          }
        }
      } else {
        // Patrol sway
        bot.mesh.position.x += Math.sin(this.clock.getElapsedTime()) * 0.02;
      }
    });
  }

  updateGrenades(delta) {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.fuse -= delta;

      // Apply physics
      g.velocity.y -= 25 * delta;
      g.mesh.position.addScaledVector(g.velocity, delta);

      // Bounce on floor
      if (g.mesh.position.y <= 0.15) {
        g.mesh.position.y = 0.15;
        g.velocity.y *= -0.4;
        g.velocity.x *= 0.6;
        g.velocity.z *= 0.6;
      }

      // Detonate
      if (g.fuse <= 0 && !g.exploded) {
        g.exploded = true;
        this.detonateGrenade(g.mesh.position);
        this.scene.remove(g.mesh);
        this.grenades.splice(i, 1);
      }
    }
  }

  detonateGrenade(pos) {
    audio.playExplosion();

    // Shockwave expansion light
    const shock = new THREE.PointLight(0xff6600, 8, 18);
    shock.position.copy(pos);
    this.scene.add(shock);
    setTimeout(() => this.scene.remove(shock), 150);

    // Damage checks within 8m blast radius
    const distToPlayer = this.camera.position.distanceTo(pos);
    if (distToPlayer < 8.0) {
      const falloff = 1.0 - (distToPlayer / 8.0);
      this.takeDamage(Math.floor(90 * falloff));
    }

    // Damage bots
    this.bots.forEach(bot => {
      const d = bot.mesh.position.distanceTo(pos);
      if (d < 8.0) {
        bot.health -= Math.floor(95 * (1.0 - d / 8.0));
        if (bot.health <= 0) {
          this.scene.remove(bot.mesh);
          this.score++;
          document.getElementById('player-score').innerText = this.score;
          this.addKillFeedMessage(`Eliminated ${bot.id} with Frag Grenade!`);
        }
      }
    });
  }

  startInteraction() {
    this.isInteracting = true;
  }

  stopInteraction() {
    this.isInteracting = false;
    this.interactionProgress = 0;
    document.getElementById('interaction-progress').style.width = '0%';
  }

  updateObjective(delta) {
    const distToSite = this.camera.position.distanceTo(this.bombPosition);

    // Show prompt when within 3.5m of Site A
    const prompt = document.getElementById('interaction-prompt');
    const promptText = document.getElementById('prompt-text');

    if (distToSite < 3.5) {
      prompt.classList.remove('hidden');
      promptText.innerText = this.bombPlanted ? 'HOLD [E] TO DEFUSE DEVICE' : 'HOLD [E] TO PLANT DEVICE';

      if (this.isInteracting) {
        this.interactionProgress += delta * 25; // 4 seconds to complete
        document.getElementById('interaction-progress').style.width = `${this.interactionProgress}%`;

        if (this.interactionProgress >= 100) {
          this.isInteracting = false;
          this.interactionProgress = 0;

          if (!this.bombPlanted) {
            this.bombPlanted = true;
            this.bombTimeRemaining = 45;
            document.getElementById('objective-banner').classList.remove('hidden');
            this.addKillFeedMessage('Tactical Device Planted at Site A!');
            audio.playBeep(1200);
          } else {
            this.bombPlanted = false;
            document.getElementById('objective-banner').classList.add('hidden');
            this.addKillFeedMessage('Tactical Device Defused! Round Won!');
            this.score += 2;
            document.getElementById('player-score').innerText = this.score;
          }
        }
      }
    } else {
      prompt.classList.add('hidden');
    }

    // Bomb countdown
    if (this.bombPlanted) {
      this.bombTimeRemaining -= delta;
      document.getElementById('bomb-timer').innerText = `DETONATION IN ${Math.max(0, Math.ceil(this.bombTimeRemaining))}s`;

      if (Math.floor(this.bombTimeRemaining * 2) % 2 === 0) {
        audio.playBeep(880);
      }

      if (this.bombTimeRemaining <= 0) {
        this.bombPlanted = false;
        document.getElementById('objective-banner').classList.add('hidden');
        this.detonateGrenade(this.bombPosition);
        this.addKillFeedMessage('Device Detonated! Site Destroyed!');
        this.enemyScore++;
        document.getElementById('enemy-score').innerText = this.enemyScore;
      }
    }
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
    const cur = this.weapons[this.currentSlot];
    const now = this.clock.getElapsedTime();
    if (now - this.lastFireTime < cur.fireRate) return;
    if (this.isReloading) return;
    if (cur.clip <= 0) {
      audio.playReload();
      return;
    }

    this.lastFireTime = now;
    cur.clip--;
    document.getElementById('ammo-clip').innerText = cur.clip;

    if (this.currentSlot === 1) audio.playRifleShot();
    else audio.playPistolShot();

    // Muzzle flash
    this.muzzleFlashMesh.visible = true;
    this.muzzleLight.intensity = 4;
    setTimeout(() => {
      this.muzzleFlashMesh.visible = false;
      this.muzzleLight.intensity = 0;
    }, 45);

    // Recoil kick
    this.gunMesh.position.z += 0.05;

    // Raycast hitscan trace
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    // Dummies
    const dummyHits = raycaster.intersectObjects(this.targetDummies, true);
    if (dummyHits.length > 0) {
      this.showHitmarker();
      audio.playHitSound();
    }

    // Bots
    this.bots.forEach(bot => {
      const hits = raycaster.intersectObject(bot.mesh, true);
      if (hits.length > 0) {
        this.showHitmarker();
        audio.playHitSound();
        bot.health -= cur.damage;
        if (bot.health <= 0) {
          this.scene.remove(bot.mesh);
          this.score++;
          document.getElementById('player-score').innerText = this.score;
          this.addKillFeedMessage(`Eliminated ${bot.id}!`);
        }
      }
    });

    // Remote Players
    this.remotePlayers.forEach((player) => {
      const hits = raycaster.intersectObject(player.mesh, true);
      if (hits.length > 0) {
        this.showHitmarker();
        audio.playHitSound();
        if (this.conn && this.conn.open) {
          this.conn.send({ type: 'damage', amount: cur.damage });
        }
      }
    });

    if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'shoot',
        origin: this.camera.position.toArray(),
        dir: raycaster.ray.direction.toArray()
      });
    }
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

    const vignette = document.getElementById('damage-vignette');
    vignette.classList.add('active');
    setTimeout(() => vignette.classList.remove('active'), 180);

    if (this.health <= 0) this.die();
  }

  die() {
    this.isDead = true;
    this.addKillFeedMessage('You were eliminated!');
    this.enemyScore++;
    document.getElementById('enemy-score').innerText = this.enemyScore;
    setTimeout(() => this.respawn(), 2500);
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
    const cur = this.weapons[this.currentSlot];
    if (this.isReloading || cur.clip >= cur.maxClip || cur.reserve <= 0) return;
    this.isReloading = true;
    audio.playReload();

    this.gunMesh.position.y -= 0.15;
    setTimeout(() => {
      const needed = cur.maxClip - cur.clip;
      const load = Math.min(needed, cur.reserve);
      cur.clip += load;
      cur.reserve -= load;
      document.getElementById('ammo-clip').innerText = cur.clip;
      document.getElementById('ammo-reserve').innerText = cur.reserve;

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
    setTimeout(() => { if (feed.contains(div)) feed.removeChild(div); }, 3500);
  }

  // --- Multiplayer Netcode ---
  setupMultiplayer() {
    const btnHost = document.getElementById('btn-host-room');
    const btnJoin = document.getElementById('btn-join-room');
    const statusMsg = document.getElementById('connection-status');

    btnHost.addEventListener('click', () => {
      audio.init();
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const hostRoomId = `tactical-strike-${randomSuffix}`;

      statusMsg.innerText = 'Initializing P2P network host...';
      this.peer = new Peer(hostRoomId);

      this.peer.on('open', () => {
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
    });

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
      this.createRemotePlayer('opponent');
    });

    this.conn.on('data', (data) => {
      if (data.type === 'state') {
        const player = this.remotePlayers.get('opponent');
        if (player) {
          player.targetPos.set(data.pos[0], data.pos[1], data.pos[2]);
          player.mesh.position.lerp(player.targetPos, 0.4);
          player.mesh.rotation.y = data.yaw;
        }
      } else if (data.type === 'shoot') {
        audio.playRifleShot();
      } else if (data.type === 'damage') {
        this.takeDamage(data.amount);
      }
    });
  }

  createRemotePlayer(id) {
    const group = new THREE.Group();
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

    this.scene.add(group);
    this.remotePlayers.set(id, { mesh: group, targetPos: new THREE.Vector3() });
  }

  updatePlayerLocomotion(delta) {
    if (this.isDead) return;

    let targetSpeed = 12.0;
    if (this.stance === 'walk') targetSpeed = 6.0;
    if (this.stance === 'crouch') targetSpeed = 4.0;

    this.cameraHeight += (this.targetCameraHeight - this.cameraHeight) * 0.15;
    this.camera.position.y = this.cameraHeight;

    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    this.direction.set(0, 0, 0);
    this.direction.addScaledVector(forward, this.moveInput.forward);
    this.direction.addScaledVector(right, this.moveInput.right);
    if (this.direction.lengthSq() > 0) this.direction.normalize();

    const accel = 45.0;
    const friction = 12.0;

    this.velocity.x += this.direction.x * targetSpeed * accel * delta;
    this.velocity.z += this.direction.z * targetSpeed * accel * delta;
    this.velocity.x -= this.velocity.x * friction * delta;
    this.velocity.z -= this.velocity.z * friction * delta;

    if (!this.isOnGround) this.velocity.y -= 25.0 * delta;

    const moveX = this.velocity.x * delta;
    const moveZ = this.velocity.z * delta;

    const nextPos = this.camera.position.clone();
    nextPos.x += moveX;
    nextPos.z += moveZ;

    const playerBox = new THREE.Box3().setFromCenterAndSize(nextPos, new THREE.Vector3(0.7, 1.8, 0.7));
    let canMoveX = true;
    let canMoveZ = true;

    for (const collider of this.colliders) {
      if (collider.intersectsBox(playerBox)) {
        canMoveX = false;
        canMoveZ = false;
        break;
      }
    }

    if (canMoveX) this.camera.position.x += moveX;
    if (canMoveZ) this.camera.position.z += moveZ;

    if (this.camera.position.y + this.velocity.y * delta <= this.cameraHeight) {
      this.velocity.y = 0;
      this.isOnGround = true;
      this.camera.position.y = this.cameraHeight;
    } else {
      this.camera.position.y += this.velocity.y * delta;
      this.isOnGround = false;
    }

    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // Viewmodel sway
    const moveSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (moveSpeed > 0.5 && this.isOnGround) {
      const bobTime = this.clock.getElapsedTime() * 10;
      this.gunMesh.position.x = this.gunDefaultPos.x + Math.sin(bobTime) * 0.008;
      this.gunMesh.position.y = this.gunDefaultPos.y + Math.cos(bobTime * 2) * 0.008;
    } else {
      this.gunMesh.position.lerp(this.gunDefaultPos, 0.1);
      this.gunMesh.rotation.set(0, 0, 0);
    }

    if (this.conn && this.conn.open && Math.random() < 0.5) {
      this.conn.send({
        type: 'state',
        pos: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
        yaw: this.yaw
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
    this.updateBots(delta);
    this.updateGrenades(delta);
    this.updateObjective(delta);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new TacticalGame();
});
