#!/usr/bin/env node
/**
 * generate-pikachu-glb.mjs
 * ========================
 * Tạo mô hình 3D Dược Sĩ Pikachu mặc áo blouse với 2 animation:
 *   1. Idle  (4s loop): Nhịp thở, lắc tai, vẫy đuôi, gật đầu nhẹ
 *   2. Wave  (3s):      Vẫy tay chào, nhún nhảy vui vẻ
 *
 * Output: public/pikachu.glb
 *
 * Chạy: node scripts/generate-pikachu-glb.mjs
 */

// ======================================================================
// STEP 1: Polyfills cho Node.js (Three.js cần một số browser API)
// Phải đặt TRƯỚC khi import three.js
// ======================================================================
const mockCtx = {
  fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: '',
  fillRect() {}, clearRect() {}, strokeRect() {},
  beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, arc() {},
  fill() {}, stroke() {}, clip() {},
  drawImage() {}, putImageData() {},
  getImageData() { return { data: new Uint8Array(4) }; },
  createImageData() { return { data: new Uint8Array(4) }; },
  setTransform() {}, translate() {}, rotate() {}, scale() {},
  save() {}, restore() {},
  measureText() { return { width: 0 }; },
  font: '', textAlign: '', textBaseline: '',
  canvas: { width: 1, height: 1 },
};
const mockCanvas = {
  width: 1, height: 1, style: {},
  getContext() { return mockCtx; },
  toDataURL() { return ''; },
  addEventListener() {},
  removeEventListener() {},
};

if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement(tag) {
      if (tag === 'canvas') return { ...mockCanvas };
      return { style: {} };
    },
    createElementNS() { return { style: {}, setAttributeNS() {} }; },
    body: { appendChild() {}, removeChild() {} },
  };
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
if (typeof globalThis.self === 'undefined') globalThis.self = globalThis;
if (typeof globalThis.navigator === 'undefined') globalThis.navigator = { userAgent: 'node', language: 'en' };
if (typeof globalThis.HTMLCanvasElement === 'undefined') globalThis.HTMLCanvasElement = class {};
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = class {
    constructor(w, h) { this.width = w; this.height = h; }
    getContext() { return mockCtx; }
  };
}
if (typeof globalThis.DOMParser === 'undefined') {
  globalThis.DOMParser = class { parseFromString() { return {}; } };
}
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class {
    constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); }
  };
}
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 16);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}
// FileReader polyfill (GLTFExporter dùng FileReader.onloadend để đọc Blob thành ArrayBuffer)
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onload = null;
      this.onerror = null;
      this.onloadend = null;
      this.readyState = 0;
    }
    _finish() {
      this.readyState = 2;
      const evt = { target: this };
      if (this.onload) this.onload(evt);
      if (this.onloadend) this.onloadend(evt);
    }
    _fail(err) {
      const evt = { target: this, error: err };
      if (this.onerror) this.onerror(evt);
      if (this.onloadend) this.onloadend(evt);
    }
    readAsArrayBuffer(blob) {
      this.readyState = 1;
      blob.arrayBuffer().then((ab) => {
        this.result = ab;
        this._finish();
      }).catch((err) => this._fail(err));
    }
    readAsDataURL(blob) {
      this.readyState = 1;
      blob.arrayBuffer().then((ab) => {
        const b64 = Buffer.from(ab).toString('base64');
        this.result = `data:application/octet-stream;base64,${b64}`;
        this._finish();
      }).catch((err) => this._fail(err));
    }
    readAsText(blob) {
      this.readyState = 1;
      blob.text().then((txt) => {
        this.result = txt;
        this._finish();
      }).catch((err) => this._fail(err));
    }
    addEventListener(evt, fn) {
      if (evt === 'load') this.onload = fn;
      if (evt === 'loadend') this.onloadend = fn;
      if (evt === 'error') this.onerror = fn;
    }
    removeEventListener() {}
  };
}

// ======================================================================
// STEP 2: Dynamic imports (SAU polyfills)
// ======================================================================
const THREE = await import('three');
const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
const fs = await import('fs');
const path = await import('path');
const { fileURLToPath } = await import('url');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================================
// BẢNG MÀU PIKACHU
// ======================================================================
const COL = {
  yellow:     0xFFD93D,
  lightYellow:0xFFF4B0,
  earTipBlack:0x1A1A1A,
  eyeBlack:   0x1A1A1A,
  eyeWhite:   0xFFFFFF,
  cheekRed:   0xFF4444,
  coatWhite:  0xF8F8F8,
  coatGray:   0xE0E0E0,
  stethoGray: 0x666666,
  stethoDisk: 0xC0C0C0,
  noseBlack:  0x222222,
  mouthBrown: 0x8B4513,
  tailBrown:  0x8B6914,
  footPad:    0xCC9933,
};

/** Helper: tạo MeshStandardMaterial */
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.55,
    metalness: opts.metalness ?? 0.0,
    side: opts.side ?? THREE.FrontSide,
  });
}

/** Helper: Euler → Quaternion array [x, y, z, w] */
function quat(x = 0, y = 0, z = 0) {
  const q = new THREE.Quaternion();
  q.setFromEuler(new THREE.Euler(x, y, z));
  return [q.x, q.y, q.z, q.w];
}

// ======================================================================
// XÂY DỰNG MÔ HÌNH PIKACHU DOCTOR
// ======================================================================
function buildPikachuDoctor() {
  const root = new THREE.Group();
  root.name = 'PikachuDoctor';

  // ==================== BODY GROUP (thở, nhún) ====================
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'BodyGroup';
  bodyGroup.position.set(0, 0.6, 0);
  root.add(bodyGroup);

  // Thân Pikachu (hình oval vàng)
  const bodyGeo = new THREE.SphereGeometry(0.38, 32, 24);
  bodyGeo.scale(1.0, 0.88, 0.82);
  const bodyMesh = new THREE.Mesh(bodyGeo, mat(COL.yellow));
  bodyMesh.name = 'BodyMesh';
  bodyGroup.add(bodyMesh);

  // Bụng (sáng hơn, phía trước)
  const bellyGeo = new THREE.SphereGeometry(0.26, 24, 16);
  bellyGeo.scale(0.8, 0.82, 0.35);
  const bellyMesh = new THREE.Mesh(bellyGeo, mat(COL.lightYellow));
  bellyMesh.position.set(0, -0.04, 0.22);
  bodyGroup.add(bellyMesh);

  // ==================== ÁO BLOUSE / LAB COAT ====================
  // Thân áo (hình nón cụt, trắng, hở phía trước)
  const coatGeo = new THREE.CylinderGeometry(0.37, 0.50, 0.72, 24, 1, true, 0.4, Math.PI * 2 - 0.8);
  const coatMesh = new THREE.Mesh(coatGeo, mat(COL.coatWhite, { side: THREE.DoubleSide }));
  coatMesh.name = 'CoatBody';
  coatMesh.position.set(0, -0.15, 0);
  bodyGroup.add(coatMesh);

  // Viền áo phía trước (đường gấp)
  const lapelGeo = new THREE.BoxGeometry(0.04, 0.55, 0.015);

  const lapelLeft = new THREE.Mesh(lapelGeo, mat(COL.coatGray));
  lapelLeft.position.set(-0.22, -0.05, 0.29);
  lapelLeft.rotation.set(0, 0.25, 0);
  bodyGroup.add(lapelLeft);

  const lapelRight = new THREE.Mesh(lapelGeo.clone(), mat(COL.coatGray));
  lapelRight.position.set(0.22, -0.05, 0.29);
  lapelRight.rotation.set(0, -0.25, 0);
  bodyGroup.add(lapelRight);

  // Cổ áo (collar)
  const collarGeo = new THREE.BoxGeometry(0.13, 0.11, 0.025);

  const collarLeft = new THREE.Mesh(collarGeo, mat(COL.coatWhite));
  collarLeft.position.set(-0.13, 0.28, 0.31);
  collarLeft.rotation.set(-0.35, 0.4, -0.18);
  bodyGroup.add(collarLeft);

  const collarRight = new THREE.Mesh(collarGeo.clone(), mat(COL.coatWhite));
  collarRight.position.set(0.13, 0.28, 0.31);
  collarRight.rotation.set(-0.35, -0.4, 0.18);
  bodyGroup.add(collarRight);

  // Túi áo (breast pocket)
  const pocketGeo = new THREE.BoxGeometry(0.1, 0.07, 0.015);
  const pocketMesh = new THREE.Mesh(pocketGeo, mat(COL.coatGray));
  pocketMesh.position.set(0.17, 0.06, 0.35);
  bodyGroup.add(pocketMesh);

  // Nút áo
  for (let i = 0; i < 3; i++) {
    const btnGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const btn = new THREE.Mesh(btnGeo, mat(COL.coatGray));
    btn.position.set(0, 0.12 - i * 0.14, 0.37);
    bodyGroup.add(btn);
  }

  // ==================== HEAD GROUP (gật, lắc) ====================
  const headGroup = new THREE.Group();
  headGroup.name = 'HeadGroup';
  headGroup.position.set(0, 0.55, 0);
  bodyGroup.add(headGroup);

  // Đầu Pikachu
  const headGeo = new THREE.SphereGeometry(0.44, 32, 24);
  headGeo.scale(1.0, 0.93, 0.88);
  const headMesh = new THREE.Mesh(headGeo, mat(COL.yellow));
  headMesh.name = 'HeadMesh';
  headGroup.add(headMesh);

  // Mắt trái
  const eyeGeo = new THREE.SphereGeometry(0.085, 16, 16);
  const leftEye = new THREE.Mesh(eyeGeo, mat(COL.eyeBlack));
  leftEye.position.set(-0.16, 0.06, 0.36);
  leftEye.scale.set(0.75, 1.0, 0.55);
  headGroup.add(leftEye);

  // Mắt trái - lóe sáng
  const hlGeo = new THREE.SphereGeometry(0.028, 8, 8);
  const leftHL = new THREE.Mesh(hlGeo, mat(COL.eyeWhite));
  leftHL.position.set(-0.14, 0.1, 0.41);
  headGroup.add(leftHL);

  // Mắt phải
  const rightEye = new THREE.Mesh(eyeGeo.clone(), mat(COL.eyeBlack));
  rightEye.position.set(0.16, 0.06, 0.36);
  rightEye.scale.set(0.75, 1.0, 0.55);
  headGroup.add(rightEye);

  const rightHL = new THREE.Mesh(hlGeo.clone(), mat(COL.eyeWhite));
  rightHL.position.set(0.18, 0.1, 0.41);
  headGroup.add(rightHL);

  // Mũi
  const noseGeo = new THREE.SphereGeometry(0.022, 8, 8);
  const nose = new THREE.Mesh(noseGeo, mat(COL.noseBlack));
  nose.position.set(0, -0.025, 0.42);
  headGroup.add(nose);

  // Miệng (nụ cười nhỏ)
  const mouthGeo = new THREE.TorusGeometry(0.045, 0.007, 8, 16, Math.PI);
  const mouth = new THREE.Mesh(mouthGeo, mat(COL.mouthBrown));
  mouth.position.set(0, -0.075, 0.39);
  mouth.rotation.set(0, 0, Math.PI);
  headGroup.add(mouth);

  // Má đỏ trái
  const cheekGeo = new THREE.SphereGeometry(0.085, 16, 12);
  const leftCheek = new THREE.Mesh(cheekGeo, mat(COL.cheekRed, { roughness: 0.35 }));
  leftCheek.position.set(-0.34, -0.06, 0.2);
  leftCheek.scale.set(1.0, 0.75, 0.38);
  headGroup.add(leftCheek);

  // Má đỏ phải
  const rightCheek = new THREE.Mesh(cheekGeo.clone(), mat(COL.cheekRed, { roughness: 0.35 }));
  rightCheek.position.set(0.34, -0.06, 0.2);
  rightCheek.scale.set(1.0, 0.75, 0.38);
  headGroup.add(rightCheek);

  // ==================== TAI (2 groups, lắc lắc) ====================
  const earGeo = new THREE.CapsuleGeometry(0.075, 0.32, 8, 16);
  earGeo.scale(0.7, 1.0, 0.48);

  const earTipGeo = new THREE.CapsuleGeometry(0.065, 0.1, 8, 16);
  earTipGeo.scale(0.65, 1.0, 0.42);

  // Tai trái
  const leftEarGroup = new THREE.Group();
  leftEarGroup.name = 'LeftEar';
  leftEarGroup.position.set(-0.22, 0.42, -0.02);
  leftEarGroup.rotation.set(0.1, 0, -0.35);
  headGroup.add(leftEarGroup);

  const leftEarMesh = new THREE.Mesh(earGeo, mat(COL.yellow));
  leftEarMesh.position.set(0, 0.18, 0);
  leftEarGroup.add(leftEarMesh);

  const leftEarTip = new THREE.Mesh(earTipGeo, mat(COL.earTipBlack));
  leftEarTip.position.set(0, 0.4, 0);
  leftEarGroup.add(leftEarTip);

  // Tai phải
  const rightEarGroup = new THREE.Group();
  rightEarGroup.name = 'RightEar';
  rightEarGroup.position.set(0.22, 0.42, -0.02);
  rightEarGroup.rotation.set(0.1, 0, 0.35);
  headGroup.add(rightEarGroup);

  const rightEarMesh = new THREE.Mesh(earGeo.clone(), mat(COL.yellow));
  rightEarMesh.position.set(0, 0.18, 0);
  rightEarGroup.add(rightEarMesh);

  const rightEarTip = new THREE.Mesh(earTipGeo.clone(), mat(COL.earTipBlack));
  rightEarTip.position.set(0, 0.4, 0);
  rightEarGroup.add(rightEarTip);

  // ==================== ỐNG NGHE (Stethoscope) ====================
  const stethoTubeGeo = new THREE.TorusGeometry(0.24, 0.012, 8, 24, Math.PI * 1.1);
  const stethoTube = new THREE.Mesh(stethoTubeGeo, mat(COL.stethoGray, { metalness: 0.3 }));
  stethoTube.position.set(0, -0.18, 0.12);
  stethoTube.rotation.set(Math.PI / 2 + 0.35, 0, Math.PI * 0.05);
  headGroup.add(stethoTube);

  // Đĩa nghe
  const stethoDiskGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.012, 16);
  const stethoDisk = new THREE.Mesh(stethoDiskGeo, mat(COL.stethoDisk, { metalness: 0.5 }));
  stethoDisk.position.set(0.06, -0.42, 0.22);
  stethoDisk.rotation.set(Math.PI / 2, 0, 0);
  headGroup.add(stethoDisk);

  // Dây ống nghe thòng lòng
  const stethoStringGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.25, 6);
  const stethoString = new THREE.Mesh(stethoStringGeo, mat(COL.stethoGray));
  stethoString.position.set(0.06, -0.3, 0.2);
  stethoString.rotation.set(0.15, 0, 0);
  headGroup.add(stethoString);

  // ==================== TAY (2 groups, vẫy) ====================
  const armGeo = new THREE.CapsuleGeometry(0.09, 0.18, 8, 16);

  // Tay trái
  const leftArmGroup = new THREE.Group();
  leftArmGroup.name = 'LeftArm';
  leftArmGroup.position.set(-0.42, 0.05, 0.02);
  bodyGroup.add(leftArmGroup);

  const leftArm = new THREE.Mesh(armGeo, mat(COL.yellow));
  leftArm.rotation.set(0, 0, 0.35);
  leftArmGroup.add(leftArm);

  // Tay áo trái (sleeve)
  const sleeveGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.11, 12, 1, true);
  const leftSleeve = new THREE.Mesh(sleeveGeo, mat(COL.coatWhite, { side: THREE.DoubleSide }));
  leftSleeve.position.set(0.03, 0.07, 0);
  leftSleeve.rotation.set(0, 0, 0.35);
  leftArmGroup.add(leftSleeve);

  // Tay phải
  const rightArmGroup = new THREE.Group();
  rightArmGroup.name = 'RightArm';
  rightArmGroup.position.set(0.42, 0.05, 0.02);
  bodyGroup.add(rightArmGroup);

  const rightArm = new THREE.Mesh(armGeo.clone(), mat(COL.yellow));
  rightArm.rotation.set(0, 0, -0.35);
  rightArmGroup.add(rightArm);

  const rightSleeve = new THREE.Mesh(sleeveGeo.clone(), mat(COL.coatWhite, { side: THREE.DoubleSide }));
  rightSleeve.position.set(-0.03, 0.07, 0);
  rightSleeve.rotation.set(0, 0, -0.35);
  rightArmGroup.add(rightSleeve);

  // ==================== CHÂN ====================
  const legGeo = new THREE.CapsuleGeometry(0.09, 0.08, 8, 12);

  const leftLeg = new THREE.Mesh(legGeo, mat(COL.yellow));
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(-0.16, -0.42, 0.04);
  bodyGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo.clone(), mat(COL.yellow));
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0.16, -0.42, 0.04);
  bodyGroup.add(rightLeg);

  // Bàn chân
  const footGeo = new THREE.SphereGeometry(0.11, 16, 12);
  footGeo.scale(1.15, 0.45, 1.25);

  const leftFoot = new THREE.Mesh(footGeo, mat(COL.yellow));
  leftFoot.position.set(-0.16, -0.55, 0.06);
  bodyGroup.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo.clone(), mat(COL.yellow));
  rightFoot.position.set(0.16, -0.55, 0.06);
  bodyGroup.add(rightFoot);

  // Đệm chân
  const padGeo = new THREE.SphereGeometry(0.06, 12, 8);
  padGeo.scale(1.1, 0.3, 1.2);

  const leftPad = new THREE.Mesh(padGeo, mat(COL.footPad));
  leftPad.position.set(-0.16, -0.57, 0.08);
  bodyGroup.add(leftPad);

  const rightPad = new THREE.Mesh(padGeo.clone(), mat(COL.footPad));
  rightPad.position.set(0.16, -0.57, 0.08);
  bodyGroup.add(rightPad);

  // ==================== ĐUÔI (lightning bolt) ====================
  const tailGroup = new THREE.Group();
  tailGroup.name = 'TailGroup';
  tailGroup.position.set(0, 0.08, -0.35);
  tailGroup.rotation.set(-0.3, 0, 0);
  bodyGroup.add(tailGroup);

  // Gốc đuôi (nâu)
  const tailBaseGeo = new THREE.BoxGeometry(0.055, 0.14, 0.055);
  const tailBase = new THREE.Mesh(tailBaseGeo, mat(COL.tailBrown));
  tailBase.position.set(0, 0.02, 0);
  tailBase.rotation.set(0.45, 0, 0);
  tailGroup.add(tailBase);

  // Tia sét đuôi (hình dạng chữ Z)
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.lineTo(0.09, 0.14);
  tailShape.lineTo(0.02, 0.14);
  tailShape.lineTo(0.11, 0.32);
  tailShape.lineTo(0.04, 0.32);
  tailShape.lineTo(0.15, 0.52);
  tailShape.lineTo(-0.02, 0.28);
  tailShape.lineTo(0.06, 0.28);
  tailShape.lineTo(-0.03, 0.1);
  tailShape.lineTo(0.04, 0.1);
  tailShape.lineTo(0, 0);

  const tailBoltGeo = new THREE.ExtrudeGeometry(tailShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.018,
    bevelSegments: 3,
  });
  const tailBolt = new THREE.Mesh(tailBoltGeo, mat(COL.yellow));
  tailBolt.position.set(-0.065, 0.06, -0.02);
  tailBolt.rotation.set(-0.6, 0, 0.08);
  tailGroup.add(tailBolt);

  // ==================== BẢNG TÊN / NAME TAG ====================
  const tagGeo = new THREE.BoxGeometry(0.14, 0.08, 0.008);
  const tagMesh = new THREE.Mesh(tagGeo, mat(0xE0F0E8));
  tagMesh.position.set(-0.14, 0.12, 0.37);
  bodyGroup.add(tagMesh);

  // Kẹp bảng tên
  const clipGeo = new THREE.BoxGeometry(0.03, 0.015, 0.012);
  const clipMesh = new THREE.Mesh(clipGeo, mat(COL.stethoDisk, { metalness: 0.4 }));
  clipMesh.position.set(-0.14, 0.165, 0.37);
  bodyGroup.add(clipMesh);

  return {
    root,
    bodyGroup,
    headGroup,
    leftEarGroup,
    rightEarGroup,
    leftArmGroup,
    rightArmGroup,
    tailGroup,
  };
}

// ======================================================================
// TẠO ANIMATION CLIPS
// ======================================================================
function createAnimations(parts) {
  const clips = [];

  // ============================
  // IDLE (4 giây, loop tự nhiên)
  // ============================
  const idleTracks = [];

  // Nhịp thở - body nhún nhẹ Y
  idleTracks.push(new THREE.VectorKeyframeTrack(
    'BodyGroup.position',
    [0, 1.0, 2.0, 3.0, 4.0],
    [
      0, 0.60, 0,
      0, 0.625, 0,
      0, 0.60, 0,
      0, 0.59, 0,
      0, 0.60, 0,
    ]
  ));

  // Nhịp thở - scale nhẹ
  idleTracks.push(new THREE.VectorKeyframeTrack(
    'BodyGroup.scale',
    [0, 1.0, 2.0, 3.0, 4.0],
    [
      1, 1, 1,
      1, 1.018, 1,
      1, 1, 1,
      1, 0.99, 1,
      1, 1, 1,
    ]
  ));

  // Đầu gật nhẹ sang trái phải
  idleTracks.push(new THREE.QuaternionKeyframeTrack(
    'HeadGroup.quaternion',
    [0, 1.3, 2.7, 4.0],
    [
      ...quat(0, 0, 0),
      ...quat(0.02, 0, -0.04),
      ...quat(-0.01, 0, 0.035),
      ...quat(0, 0, 0),
    ]
  ));

  // Tai trái lắc nhẹ (twitch)
  idleTracks.push(new THREE.QuaternionKeyframeTrack(
    'LeftEar.quaternion',
    [0, 0.35, 0.7, 2.8, 3.15, 4.0],
    [
      ...quat(0.1, 0, -0.35),
      ...quat(0.1, 0, -0.18),   // lắc lên
      ...quat(0.1, 0, -0.35),   // về
      ...quat(0.1, 0, -0.35),   // yên
      ...quat(0.1, 0, -0.22),   // lắc nhẹ
      ...quat(0.1, 0, -0.35),   // về
    ]
  ));

  // Tai phải lắc nhẹ (twitch lệch nhịp)
  idleTracks.push(new THREE.QuaternionKeyframeTrack(
    'RightEar.quaternion',
    [0, 1.4, 1.7, 2.1, 4.0],
    [
      ...quat(0.1, 0, 0.35),
      ...quat(0.1, 0, 0.35),
      ...quat(0.1, 0, 0.18),    // lắc
      ...quat(0.1, 0, 0.35),
      ...quat(0.1, 0, 0.35),
    ]
  ));

  // Đuôi vẫy qua lại
  idleTracks.push(new THREE.QuaternionKeyframeTrack(
    'TailGroup.quaternion',
    [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0],
    [
      ...quat(-0.3, 0, -0.1),
      ...quat(-0.3, 0, 0.15),
      ...quat(-0.3, 0, -0.12),
      ...quat(-0.3, 0, 0.13),
      ...quat(-0.3, 0, -0.1),
      ...quat(-0.3, 0, 0.12),
      ...quat(-0.3, 0, -0.08),
      ...quat(-0.3, 0, 0.1),
      ...quat(-0.3, 0, -0.1),
    ]
  ));

  // Tay phải đung đưa nhẹ
  idleTracks.push(new THREE.QuaternionKeyframeTrack(
    'RightArm.quaternion',
    [0, 2.0, 4.0],
    [
      ...quat(0, 0, 0),
      ...quat(0.06, 0, 0.05),
      ...quat(0, 0, 0),
    ]
  ));

  // Tay trái đung đưa nhẹ
  idleTracks.push(new THREE.QuaternionKeyframeTrack(
    'LeftArm.quaternion',
    [0, 2.0, 4.0],
    [
      ...quat(0, 0, 0),
      ...quat(-0.06, 0, -0.05),
      ...quat(0, 0, 0),
    ]
  ));

  clips.push(new THREE.AnimationClip('Idle', 4, idleTracks));

  // ============================
  // WAVE (3 giây, vẫy tay chào)
  // ============================
  const waveTracks = [];

  // Tay phải giơ lên + vẫy
  waveTracks.push(new THREE.QuaternionKeyframeTrack(
    'RightArm.quaternion',
    [0, 0.35, 0.65, 1.0, 1.35, 1.7, 2.05, 2.5, 3.0],
    [
      ...quat(0, 0, 0),          // nghỉ
      ...quat(0, 0, -1.5),       // giơ lên
      ...quat(0, 0.3, -1.2),     // vẫy phải
      ...quat(0, -0.3, -1.5),    // vẫy trái
      ...quat(0, 0.3, -1.2),     // vẫy phải
      ...quat(0, -0.3, -1.5),    // vẫy trái
      ...quat(0, 0.15, -1.2),    // vẫy phải nhẹ
      ...quat(0, 0, -0.7),       // hạ dần
      ...quat(0, 0, 0),          // nghỉ
    ]
  ));

  // Đầu nghiêng theo vẫy tay
  waveTracks.push(new THREE.QuaternionKeyframeTrack(
    'HeadGroup.quaternion',
    [0, 0.35, 1.0, 1.7, 2.3, 3.0],
    [
      ...quat(0, 0, 0),
      ...quat(0.03, 0, 0.08),
      ...quat(0, 0, -0.06),
      ...quat(0.02, 0, 0.06),
      ...quat(0, 0, -0.03),
      ...quat(0, 0, 0),
    ]
  ));

  // Body nhún vui vẻ khi vẫy
  waveTracks.push(new THREE.VectorKeyframeTrack(
    'BodyGroup.position',
    [0, 0.3, 0.55, 0.85, 1.15, 1.45, 1.75, 2.2, 3.0],
    [
      0, 0.60, 0,
      0, 0.66, 0,   // nhún lên
      0, 0.60, 0,
      0, 0.64, 0,
      0, 0.60, 0,
      0, 0.63, 0,
      0, 0.60, 0,
      0, 0.61, 0,
      0, 0.60, 0,
    ]
  ));

  // Đuôi vẫy nhanh hơn khi vui
  waveTracks.push(new THREE.QuaternionKeyframeTrack(
    'TailGroup.quaternion',
    [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.2, 2.8, 3.0],
    [
      ...quat(-0.3, 0, -0.15),
      ...quat(-0.3, 0, 0.22),
      ...quat(-0.3, 0, -0.22),
      ...quat(-0.3, 0, 0.22),
      ...quat(-0.3, 0, -0.22),
      ...quat(-0.3, 0, 0.22),
      ...quat(-0.3, 0, -0.22),
      ...quat(-0.3, 0, 0.22),
      ...quat(-0.3, 0, -0.22),
      ...quat(-0.3, 0, 0.18),
      ...quat(-0.3, 0, -0.12),
      ...quat(-0.3, 0, 0.08),
      ...quat(-0.3, 0, -0.1),
    ]
  ));

  // Tai lắc hào hứng
  waveTracks.push(new THREE.QuaternionKeyframeTrack(
    'LeftEar.quaternion',
    [0, 0.3, 0.6, 0.9, 1.2, 1.5, 2.0, 3.0],
    [
      ...quat(0.1, 0, -0.35),
      ...quat(0.1, 0, -0.15),
      ...quat(0.1, 0, -0.35),
      ...quat(0.1, 0, -0.15),
      ...quat(0.1, 0, -0.35),
      ...quat(0.1, 0, -0.18),
      ...quat(0.1, 0, -0.35),
      ...quat(0.1, 0, -0.35),
    ]
  ));

  waveTracks.push(new THREE.QuaternionKeyframeTrack(
    'RightEar.quaternion',
    [0, 0.4, 0.7, 1.0, 1.3, 1.6, 2.1, 3.0],
    [
      ...quat(0.1, 0, 0.35),
      ...quat(0.1, 0, 0.15),
      ...quat(0.1, 0, 0.35),
      ...quat(0.1, 0, 0.15),
      ...quat(0.1, 0, 0.35),
      ...quat(0.1, 0, 0.18),
      ...quat(0.1, 0, 0.35),
      ...quat(0.1, 0, 0.35),
    ]
  ));

  clips.push(new THREE.AnimationClip('Wave', 3, waveTracks));

  // ============================
  // JUMP (2.5 giây, nhảy ăn mừng)
  // ============================
  const jumpTracks = [];

  // Body nhảy lên cao rồi rơi xuống
  jumpTracks.push(new THREE.VectorKeyframeTrack(
    'BodyGroup.position',
    [0, 0.2, 0.5, 0.9, 1.1, 1.3, 1.7, 2.5],
    [
      0, 0.60, 0,    // chuẩn bị
      0, 0.52, 0,    // nhún xuống (wind up)
      0, 1.05, 0,    // nhảy lên cao!
      0, 1.10, 0,    // đỉnh
      0, 0.58, 0,    // rơi xuống
      0, 0.55, 0,    // impact - nén
      0, 0.60, 0,    // bounce nhẹ
      0, 0.60, 0,    // nghỉ
    ]
  ));

  // Body scale squash & stretch khi nhảy
  jumpTracks.push(new THREE.VectorKeyframeTrack(
    'BodyGroup.scale',
    [0, 0.2, 0.5, 0.9, 1.1, 1.3, 1.7, 2.5],
    [
      1, 1, 1,           // bình thường
      1.08, 0.88, 1.08,  // squash (nhún)
      0.88, 1.15, 0.88,  // stretch (bay lên)
      0.92, 1.1, 0.92,   // trên cao
      1.12, 0.85, 1.12,  // squash (đáp)
      1.06, 0.92, 1.06,  // bounce
      1, 1, 1,           // trở lại
      1, 1, 1,
    ]
  ));

  // Tay giơ lên khi nhảy
  jumpTracks.push(new THREE.QuaternionKeyframeTrack(
    'RightArm.quaternion',
    [0, 0.3, 0.6, 1.1, 1.7, 2.5],
    [
      ...quat(0, 0, 0),
      ...quat(0, 0, -2.0),      // giơ cao
      ...quat(-0.2, 0, -2.2),   // trên không
      ...quat(0, 0, -1.5),      // hạ
      ...quat(0, 0, -0.5),      // gần về
      ...quat(0, 0, 0),         // nghỉ
    ]
  ));

  jumpTracks.push(new THREE.QuaternionKeyframeTrack(
    'LeftArm.quaternion',
    [0, 0.3, 0.6, 1.1, 1.7, 2.5],
    [
      ...quat(0, 0, 0),
      ...quat(0, 0, 2.0),
      ...quat(0.2, 0, 2.2),
      ...quat(0, 0, 1.5),
      ...quat(0, 0, 0.5),
      ...quat(0, 0, 0),
    ]
  ));

  // Đuôi vung mạnh khi nhảy
  jumpTracks.push(new THREE.QuaternionKeyframeTrack(
    'TailGroup.quaternion',
    [0, 0.3, 0.6, 0.9, 1.2, 1.5, 2.0, 2.5],
    [
      ...quat(-0.3, 0, -0.1),
      ...quat(-0.5, 0, 0.3),
      ...quat(-0.2, 0, -0.35),
      ...quat(-0.15, 0, 0.3),
      ...quat(-0.4, 0, -0.25),
      ...quat(-0.3, 0, 0.2),
      ...quat(-0.3, 0, -0.12),
      ...quat(-0.3, 0, -0.1),
    ]
  ));

  // Tai vung khi nhảy
  jumpTracks.push(new THREE.QuaternionKeyframeTrack(
    'LeftEar.quaternion',
    [0, 0.3, 0.6, 1.1, 1.7, 2.5],
    [
      ...quat(0.1, 0, -0.35),
      ...quat(0.3, 0, -0.1),   // tai dựng lên
      ...quat(0.4, 0, -0.05),  // trên không
      ...quat(0.1, 0, -0.5),   // đáp - tai rũ
      ...quat(0.1, 0, -0.35),
      ...quat(0.1, 0, -0.35),
    ]
  ));

  jumpTracks.push(new THREE.QuaternionKeyframeTrack(
    'RightEar.quaternion',
    [0, 0.3, 0.6, 1.1, 1.7, 2.5],
    [
      ...quat(0.1, 0, 0.35),
      ...quat(0.3, 0, 0.1),
      ...quat(0.4, 0, 0.05),
      ...quat(0.1, 0, 0.5),
      ...quat(0.1, 0, 0.35),
      ...quat(0.1, 0, 0.35),
    ]
  ));

  clips.push(new THREE.AnimationClip('Jump', 2.5, jumpTracks));

  return clips;
}

// ======================================================================
// EXPORT & MAIN
// ======================================================================
async function main() {
  console.log('🔨 Đang xây dựng mô hình 3D Dược Sĩ Pikachu...');
  const { root, ...parts } = buildPikachuDoctor();

  const scene = new THREE.Scene();
  scene.add(root);

  console.log('🎬 Đang tạo 3 Animation clips (Idle / Wave / Jump)...');
  const clips = createAnimations(parts);

  console.log('📦 Đang xuất file GLB...');
  const exporter = new GLTFExporter();

  const glbArrayBuffer = await exporter.parseAsync(scene, { binary: true, animations: clips });

  const outputPath = path.resolve(__dirname, '..', 'public', 'pikachu.glb');
  fs.writeFileSync(outputPath, Buffer.from(glbArrayBuffer));

  const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  ✅ THÀNH CÔNG!                              ║');
  console.log(`║  📁 File: public/pikachu.glb (${sizeKB} KB)       ║`);
  console.log('║  🎮 Animations: Idle (4s) + Wave (3s) + Jump ║');
  console.log('║  🩺 Model: Pikachu Dược Sĩ mặc Blouse       ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log('👉 Pikachu3D.jsx sẽ tự động load file này khi chạy dev server!');
}

main().catch((err) => {
  console.error('');
  console.error('❌ Lỗi khi tạo GLB:', err.message || err);
  console.error('');
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
