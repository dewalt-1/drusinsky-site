/**
 * The scene: images as camera-facing thumbnails, passages as dots, project
 * names as labels. Owns the camera, picking, highlighting and fly-to.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ITEMS } from './embedding.js';
import { PROJECTS } from './projects.js';

const INK = new THREE.Color('#000000');
const FAINT = new THREE.Color('#d4d4d4');
const DIM = new THREE.Color('#5e5e5e');

const PANEL = 232;            // matches --panel-width
const DETAIL = 412;           // detail card width plus its margin
const HOME = [0, 22, 150];    // where the camera rests

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createCloud({ canvas, labelLayer, onPick, onHover }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor('#ffffff');
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 2000);
  camera.position.set(...HOME);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 8;
  controls.maxDistance = 600;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.zoomSpeed = 0.8;

  /* ------------------------------------------------------------ items */

  // Every item eases from `pos` towards `target`; search changes targets.
  ITEMS.forEach((it) => {
    it.pos = new THREE.Vector3(0, 0, 0);
    it.target = new THREE.Vector3(...it.home);
    it.emph = 1;          // 1 normal, >1 highlighted, <1 faded
    it.emphTarget = 1;
  });

  const images = ITEMS.filter((it) => it.type === 'image');
  const texts = ITEMS.filter((it) => it.type === 'text');

  let thumbScale = 1;
  const loader = new THREE.TextureLoader();
  const sprites = new THREE.Group();
  scene.add(sprites);
  for (const it of images) {
    const mat = new THREE.SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true });
    const sprite = new THREE.Sprite(mat);
    sprite.userData.item = it;
    sprite.renderOrder = 1;
    it.sprite = sprite;
    it.aspect = it.image.w / it.image.h;
    it.loaded = false;
    sprites.add(sprite);
    loader.load(it.image.thumb, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      mat.map = tex;
      mat.needsUpdate = true;
      it.loaded = true;
    });
  }

  // Passages: one round dot each, sized and shaded per item.
  const dotGeo = new THREE.BufferGeometry();
  const dotPos = new Float32Array(texts.length * 3);
  const dotCol = new Float32Array(texts.length * 3);
  const dotSize = new Float32Array(texts.length);
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
  dotGeo.setAttribute('color', new THREE.BufferAttribute(dotCol, 3));
  dotGeo.setAttribute('size', new THREE.BufferAttribute(dotSize, 1));
  const dotMat = new THREE.ShaderMaterial({
    uniforms: { scale: { value: 1 } },
    vertexShader: `
      attribute float size; attribute vec3 color; varying vec3 vColor;
      uniform float scale;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = min(size * scale * (300.0 / -mv.z), 9.0 * scale);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.42, d);
        gl_FragColor = vec4(vColor, a);
      }`,
    transparent: true,
    depthWrite: false,
  });
  const dots = new THREE.Points(dotGeo, dotMat);
  scene.add(dots);
  texts.forEach((it, i) => { it.dotIndex = i; });

  /* ------------------------------------------------------------ labels */

  const labels = PROJECTS.map((p) => {
    const el = document.createElement('button');
    el.className = 'label';
    el.textContent = p.title;
    el.addEventListener('click', () => onPick(p.items.find((i) => i.type === 'image') || p.items[0]));
    labelLayer.appendChild(el);
    return { p, el, centre: new THREE.Vector3() };
  });

  /* ------------------------------------------------------------ state */

  let focus = null;        // the item whose detail is open
  let hovered = null;
  let flight = null;       // { from, to, fromTarget, toTarget, t0, dur }
  let introStart = performance.now();

  function setEmphasis(fn) {
    ITEMS.forEach((it) => { it.emphTarget = fn(it); });
  }

  /**
   * Highlight by a score function. With `query`, the matches are drawn in
   * towards each other and the camera flies to frame them; everything else
   * fades back.
   */
  function highlight(scoreOf, { query = '' } = {}) {
    if (!scoreOf) {
      ITEMS.forEach((it) => { it.target.set(...it.home); it.emphTarget = 1; });
      return;
    }
    const on = ITEMS.filter((it) => scoreOf(it) > 0);
    const c = new THREE.Vector3();
    on.forEach((it) => c.add(new THREE.Vector3(...it.home)));
    if (on.length) c.divideScalar(on.length);
    ITEMS.forEach((it) => {
      const s = scoreOf(it);
      const home = new THREE.Vector3(...it.home);
      if (s > 0) {
        // Stronger matches end up closer to the query point.
        it.target.copy(query ? c.clone().add(home.sub(c).multiplyScalar(1 - 0.45 * s)) : home);
        it.emphTarget = 1 + 0.25 * s;
      } else {
        it.target.copy(home);
        it.emphTarget = 0.12;
      }
    });
    if (query && on.length) {
      // Frame most of the matches; a few outliers may sit at the edge.
      const ds = on.map((it) => it.target.distanceTo(c)).sort((x, y) => x - y);
      const r = Math.max(22, ds[Math.floor(ds.length * 0.85)] || 0);
      const fit = r / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      flyTo(c, Math.min(300, fit * 1.3 * Math.sqrt(homeDistance())));
    }
  }

  function flyTo(point, distance = 26) {
    const toTarget = point.clone();
    const dir = camera.position.clone().sub(controls.target).normalize();
    const to = toTarget.clone().add(dir.multiplyScalar(distance));
    flight = { from: camera.position.clone(), to, fromTarget: controls.target.clone(), toTarget, t0: performance.now(), dur: 1100 };
    controls.autoRotate = false;
  }

  function flyHome() {
    flight = { from: camera.position.clone(), to: new THREE.Vector3(...HOME).multiplyScalar(homeDistance()), fromTarget: controls.target.clone(), toTarget: new THREE.Vector3(), t0: performance.now(), dur: 1200 };
  }

  function setFocus(item) {
    focus = item;
    if (!item) return;
    flyTo(item.target.clone(), (item.type === 'image' ? 30 : 42) * Math.sqrt(homeDistance()));
    // Up close the thumbnail is soft; swap in the full image once.
    if (item.type === 'image' && !item.sharp) {
      item.sharp = true;
      loader.load(item.image.src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        const old = item.sprite.material.map;
        item.sprite.material.map = tex;
        item.sprite.material.needsUpdate = true;
        item.loaded = true;
        if (old) old.dispose();
      });
    }
  }

  /* ------------------------------------------------------------ picking */

  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 1.4;
  const pointer = new THREE.Vector2();
  let downAt = null;

  function pick(ev) {
    const r = canvas.getBoundingClientRect();
    pointer.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const visible = (it) => it.emph > 0.4 && (it.type !== 'image' || it.sprite.material.opacity > 0.3);
    const s = raycaster.intersectObjects(sprites.children, false).find((h) => visible(h.object.userData.item));
    if (s) return s.object.userData.item;
    const d = raycaster.intersectObject(dots, false)
      .map((h) => texts[h.index]).find(visible);
    return d || null;
  }

  canvas.addEventListener('pointerdown', (ev) => {
    downAt = { x: ev.clientX, y: ev.clientY };
    controls.autoRotate = false;
    flight = null;
  });
  canvas.addEventListener('pointerup', (ev) => {
    if (!downAt) return;
    const moved = Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y);
    downAt = null;
    if (moved > 5) return;
    const it = pick(ev);
    onPick(it);
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (downAt) { canvas.classList.add('is-dragging'); return; }
    canvas.classList.remove('is-dragging');
    const it = pick(ev);
    if (it !== hovered) {
      hovered = it;
      canvas.style.cursor = it ? 'pointer' : '';
      onHover(it, ev);
    } else if (it) onHover(it, ev);
  });
  canvas.addEventListener('pointerleave', () => { hovered = null; onHover(null); });
  window.addEventListener('pointerup', () => canvas.classList.remove('is-dragging'));

  /* ------------------------------------------------------------ frame */

  // Centre the cloud in the free space: right of the panel and left of the
  // detail card on wide screens; below the panel, or above the detail sheet,
  // on narrow ones. Eased in the frame loop.
  const offset = { x: 0, y: 0 };
  const wantOffset = () => {
    const w = window.innerWidth, h = window.innerHeight;
    if (w > 700) return { x: -PANEL / 2 + (focus ? DETAIL / 2 : 0), y: 0 };
    return { x: 0, y: focus ? h * 0.3 : -h * 0.14 };
  };

  function applyOffset() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.setViewOffset(w, h, offset.x, offset.y, w, h);
    camera.updateProjectionMatrix();
  }

  // Narrow screens see less of the cloud sideways, so stand further back.
  const homeDistance = () => 1 / Math.min(1, camera.aspect / 1.15);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    Object.assign(offset, wantOffset());
    applyOffset();
  }
  window.addEventListener('resize', resize);
  resize();
  camera.position.multiplyScalar(homeDistance());

  const tmp = new THREE.Vector3();
  const BASE = 4.6;      // thumbnail height in scene units

  let last = performance.now();
  // Frame-rate independent easing: the share of the gap closed this frame.
  const approach = (rate, dt) => 1 - Math.exp(-rate * dt);

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;

    if (flight) {
      const t = Math.min(1, (now - flight.t0) / flight.dur);
      const e = ease(t);
      camera.position.lerpVectors(flight.from, flight.to, e);
      controls.target.lerpVectors(flight.fromTarget, flight.toTarget, e);
      if (t === 1) flight = null;
    }
    controls.update();

    const want = wantOffset();
    if (Math.abs(want.x - offset.x) + Math.abs(want.y - offset.y) > 0.5) {
      const a = approach(5, dt);
      offset.x += (want.x - offset.x) * a;
      offset.y += (want.y - offset.y) * a;
      applyOffset();
    }

    // Intro: the cloud unfolds from its centre.
    const intro = ease(Math.min(1, (now - introStart) / 2200));
    const k = approach(intro < 1 ? 4 + 8 * intro : 4.5, dt);
    const ke = approach(6, dt);

    for (const it of ITEMS) {
      it.pos.lerp(it.target, k);
      it.emph += (it.emphTarget - it.emph) * ke;
    }

    for (const it of images) {
      const s = BASE * thumbScale * Math.max(0.6, it.emph) * (it === hovered || it === focus ? 1.25 : 1);
      it.sprite.position.copy(it.pos);
      it.sprite.scale.set(s * it.aspect, s, 1);
      // Thumbnails that come between the camera and the subject fade away.
      const near = it === focus ? 1 : THREE.MathUtils.smoothstep(it.pos.distanceTo(camera.position), 20, 44);
      const target = it.loaded ? Math.min(1, Math.max(0.08, it.emph)) * near : 0;
      it.sprite.material.opacity += (target - it.sprite.material.opacity) * approach(9, dt);
    }

    for (const it of texts) {
      const i = it.dotIndex;
      dotPos[i * 3] = it.pos.x; dotPos[i * 3 + 1] = it.pos.y; dotPos[i * 3 + 2] = it.pos.z;
      const c = it.emph > 1.05 || it === hovered || it === focus ? INK : it.emph < 0.5 ? FAINT : DIM;
      dotCol[i * 3] = c.r; dotCol[i * 3 + 1] = c.g; dotCol[i * 3 + 2] = c.b;
      dotSize[i] = (it === hovered || it === focus ? 3.2 : 2.2) * Math.max(0.7, it.emph);
    }
    dotGeo.attributes.position.needsUpdate = true;
    dotGeo.attributes.color.needsUpdate = true;
    dotGeo.attributes.size.needsUpdate = true;
    dotMat.uniforms.scale.value = renderer.getPixelRatio() * Math.max(0.6, thumbScale);

    // Labels sit at the centre of each project's items. Nearer and
    // highlighted labels win; any label that would overlap one is hidden.
    const w = window.innerWidth, h = window.innerHeight;
    for (const l of labels) {
      // Label the project's most central item, so it sits on the strand.
      l.centre.set(0, 0, 0);
      l.p.items.forEach((it) => l.centre.add(it.pos));
      l.centre.divideScalar(l.p.items.length);
      let best = l.p.items[0], bd = Infinity;
      for (const it of l.p.items) { const d = it.pos.distanceToSquared(l.centre); if (d < bd) { bd = d; best = it; } }
      tmp.copy(best.pos).project(camera);
      l.x = (tmp.x * 0.5 + 0.5) * w;
      l.y = (-tmp.y * 0.5 + 0.5) * h;
      l.depth = tmp.z;
      l.emph = Math.max(...l.p.items.map((it) => it.emph));
      l.on = l.emph > 1.05 || (focus && focus.project === l.p);
      if (l.el.offsetWidth) l.w = l.el.offsetWidth;
      else if (!l.w) l.w = 7 * l.p.title.length;
    }
    const placed = [];
    [...labels].sort((a, b) => (b.on - a.on) || (a.depth - b.depth)).forEach((l) => {
      const box = { x0: l.x - l.w / 2 - 4, x1: l.x + l.w / 2 + 4, y0: l.y - 27, y1: l.y - 1 };
      const clash = placed.some((b) => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0);
      const show = !(l.depth > 1 || intro < 0.9 || clash || (l.emph < 0.5 && placed.length > 0 && !l.on));
      l.el.hidden = !show;
      if (show) placed.push(box);
      l.el.style.transform = `translate(${l.x}px, ${l.y}px) translate(-50%, -150%)`;
      l.el.classList.toggle('is-faded', l.emph < 0.5);
      l.el.classList.toggle('is-on', !!l.on);
    });

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  if (import.meta.env.DEV) window.__cloud = { camera, controls, ITEMS, get focus() { return focus; }, get offset() { return offset; } };

  return {
    highlight,
    setEmphasis,
    setFocus,
    flyHome() { flyHome(); },
    setThumbScale(v) { thumbScale = v; },
    resumeRotate() { controls.autoRotate = true; },
  };
}
