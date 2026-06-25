/**
 * ShoeViewer3D — Three.js background scene + CSS 3D shoe overlay.
 * Handles: drag-to-rotate, auto-rotate, particles, glow rings, colour-reactive lights.
 */

class ShoeViewer3D {
  constructor(containerId, shoeOverlayId) {
    this.container   = document.getElementById(containerId);
    this.shoeOverlay = document.getElementById(shoeOverlayId);
    if (!this.container) return;

    this.W = this.container.clientWidth;
    this.H = this.container.clientHeight;

    // Rotation state
    this.rotY       = 0;
    this.rotX       = 0;
    this.targetRotY = 0;
    this.targetRotX = 0;
    this.isDragging = false;
    this.lastX      = 0;
    this.lastY      = 0;
    this.autoRotate = true;
    this.autoRotateSpeed = 0.004;

    // Colour state
    this.primaryColor = 0xFF3D00;
    this.accentColor  = 0x00E5FF;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      this.initFallback();
      return;
    }

    // ── Scene ──────────────────────────────────────────────────────────────
    this.scene    = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.08);

    // ── Camera ─────────────────────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(50, this.W / this.H, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    // ── Renderer ───────────────────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: document.getElementById('viewer-canvas'),
    });
    this.renderer.setSize(this.W, this.H);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    // ── Lights ─────────────────────────────────────────────────────────────
    this.setupLights();

    // ── Objects ────────────────────────────────────────────────────────────
    this.createRings();
    this.createParticles();
    this.createPlatform();
    this.createLensFlares();

    // ── Events ─────────────────────────────────────────────────────────────
    this.bindDrag();
    window.addEventListener('resize', () => this.onResize());

    // ── Loop ───────────────────────────────────────────────────────────────
    this.clock = new THREE.Clock();
    this.animate();
  }

  // Fallback when THREE not loaded yet — retry
  initFallback() {
    if (this._retries > 20) return;
    this._retries = (this._retries || 0) + 1;
    setTimeout(() => this.init(), 200);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambient);

    this.orangeLight = new THREE.PointLight(this.primaryColor, 6, 10);
    this.orangeLight.position.set(-3, 2, 3);
    this.scene.add(this.orangeLight);

    this.cyanLight = new THREE.PointLight(this.accentColor, 3, 10);
    this.cyanLight.position.set(3, -1, 2);
    this.scene.add(this.cyanLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topLight.position.set(0, 6, 4);
    this.scene.add(topLight);
  }

  createRings() {
    this.rings = [];

    const ringConfigs = [
      { r: 2.4, tube: 0.025, color: this.primaryColor, opacity: 0.5, speed: 0.3  },
      { r: 1.8, tube: 0.018, color: this.accentColor,  opacity: 0.3, speed: -0.2 },
      { r: 3.0, tube: 0.012, color: 0xffffff,          opacity: 0.1, speed: 0.15 },
    ];

    ringConfigs.forEach(cfg => {
      const geo = new THREE.TorusGeometry(cfg.r, cfg.tube, 16, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color, transparent: true, opacity: cfg.opacity
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2;
      ring._speed = cfg.speed;
      this.scene.add(ring);
      this.rings.push(ring);
    });

    // Orbiting dot on first ring
    const dotGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: this.primaryColor });
    this.orbitDot = new THREE.Mesh(dotGeo, dotMat);
    this.orbitDot.position.set(2.4, 0, 0);
    this.scene.add(this.orbitDot);
  }

  createParticles() {
    const count = 220;
    const positions = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r     = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  createPlatform() {
    // Circular base platform
    const geo = new THREE.CylinderGeometry(1.8, 1.8, 0.06, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.6,
      transparent: true,
      opacity: 0.7,
    });
    this.platform = new THREE.Mesh(geo, mat);
    this.platform.position.y = -1.6;
    this.scene.add(this.platform);

    // Platform glow ring
    const glowGeo = new THREE.TorusGeometry(1.8, 0.04, 8, 80);
    const glowMat = new THREE.MeshBasicMaterial({
      color: this.primaryColor, transparent: true, opacity: 0.6
    });
    this.platformGlow = new THREE.Mesh(glowGeo, glowMat);
    this.platformGlow.rotation.x = Math.PI / 2;
    this.platformGlow.position.y = -1.57;
    this.scene.add(this.platformGlow);
  }

  createLensFlares() {
    // Simple sprite-based glow blobs
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0,   'rgba(255,255,255,0.9)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const tex = new THREE.CanvasTexture(canvas);

    const positions = [
      { x: -2.8, y: 1.5, z: -1, scale: 0.6, color: this.primaryColor, opacity: 0.3 },
      { x:  2.5, y: -0.8, z: -1, scale: 0.4, color: this.accentColor,  opacity: 0.25 },
    ];

    this.lensFlares = [];
    positions.forEach(p => {
      const mat = new THREE.SpriteMaterial({ map: tex, color: p.color, transparent: true, opacity: p.opacity });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(p.scale * 2, p.scale * 2, 1);
      sprite.position.set(p.x, p.y, p.z);
      this.scene.add(sprite);
      this.lensFlares.push(sprite);
    });
  }

  // ── Drag / Touch controls ─────────────────────────────────────────────────
  bindDrag() {
    const el = this.container;

    const onStart = (x, y) => {
      this.isDragging  = true;
      this.autoRotate  = false;
      this.lastX = x; this.lastY = y;
      // Hide hint
      const hint = this.container.querySelector('.viewer-hint');
      if (hint) hint.classList.add('hidden');
    };

    const onMove = (x, y) => {
      if (!this.isDragging) return;
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      this.targetRotY += dx * 0.012;
      this.targetRotX += dy * 0.008;
      this.targetRotX  = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.targetRotX));
      this.lastX = x; this.lastY = y;
    };

    const onEnd = () => {
      this.isDragging = false;
      // Resume auto-rotate after 3s idle
      clearTimeout(this._autoResumeTimer);
      this._autoResumeTimer = setTimeout(() => { this.autoRotate = true; }, 3000);
    };

    el.addEventListener('mousedown',  e => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    el.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener('touchmove',  e => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener('touchend', onEnd);
  }

  // ── Update shoe overlay rotation (CSS 3D) ─────────────────────────────────
  updateShoeTransform() {
    if (!this.shoeOverlay) return;
    const rx = this.rotX * (180 / Math.PI);
    const ry = this.rotY * (180 / Math.PI);
    this.shoeOverlay.style.transform = `
      perspective(1200px)
      rotateY(${ry}deg)
      rotateX(${-rx * 0.5}deg)
    `;
  }

  // ── Update glow/light color when variant changes ──────────────────────────
  updateColor(hexColor) {
    const col = parseInt(hexColor.replace('#', ''), 16);
    if (this.orangeLight)   this.orangeLight.color.setHex(col);
    if (this.platformGlow)  this.platformGlow.material.color.setHex(col);
    if (this.orbitDot)      this.orbitDot.material.color.setHex(col);
    if (this.rings && this.rings[0]) this.rings[0].material.color.setHex(col);
    if (this.lensFlares && this.lensFlares[0]) this.lensFlares[0].material.color.setHex(col);
  }

  // ── Animation loop ────────────────────────────────────────────────────────
  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.renderer) return;

    const t = this.clock ? this.clock.getElapsedTime() : 0;

    // Auto-rotate
    if (this.autoRotate) {
      this.targetRotY += this.autoRotateSpeed;
    }

    // Lerp rotation
    this.rotY += (this.targetRotY - this.rotY) * 0.08;
    this.rotX += (this.targetRotX - this.rotX) * 0.08;

    // Update shoe CSS transform
    this.updateShoeTransform();

    // Rings
    if (this.rings) {
      this.rings.forEach(r => { r.rotation.z += r._speed * 0.01; });
    }

    // Orbiting dot
    if (this.orbitDot) {
      this.orbitDot.position.x = Math.cos(t * 0.5) * 2.4;
      this.orbitDot.position.z = Math.sin(t * 0.5) * 2.4;
    }

    // Particles slow spin
    if (this.particles) {
      this.particles.rotation.y = t * 0.04;
      this.particles.rotation.x = t * 0.02;
    }

    // Light pulse
    if (this.orangeLight) {
      this.orangeLight.intensity = 5 + Math.sin(t * 1.5) * 1.5;
    }
    if (this.cyanLight) {
      this.cyanLight.intensity = 2.5 + Math.sin(t * 2.0 + 1) * 0.8;
    }

    // Platform glow pulse
    if (this.platformGlow) {
      this.platformGlow.material.opacity = 0.4 + Math.sin(t * 2) * 0.2;
    }

    // Lens flare pulse
    if (this.lensFlares) {
      this.lensFlares.forEach((f, i) => {
        f.material.opacity = 0.2 + Math.sin(t * 1.2 + i) * 0.1;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.container || !this.renderer) return;
    this.W = this.container.clientWidth;
    this.H = this.container.clientHeight;
    this.camera.aspect = this.W / this.H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.W, this.H);
  }
}

export { ShoeViewer3D };
