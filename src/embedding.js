/**
 * A cloud that looks like an embedding.
 *
 * Projects are placed by classical MDS on the cosine distance between their
 * hand-set tag vectors, so related work lands near related work. Every image
 * and every passage of text becomes one item, scattered around its project.
 *
 * Search is keyword matching, widened by a small table of related words and
 * reported as a similarity score. It is not a language model.
 */

import { AXES, PROJECTS } from './projects.js';
import IMAGES from './images.json';
import { umap } from './umap.js';

/** Seeded random numbers, so the cloud is the same on every visit. */
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(7);
const gauss = () => {
  const u = 1 - rand(), v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const vec = (p) => AXES.map((a) => p.tags[a] || 0);
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const norm = (a) => Math.sqrt(dot(a, a)) || 1;
export const cosine = (a, b) => dot(a, b) / (norm(a) * norm(b));

/** Top three axes of classical MDS, by power iteration with deflation. */
function mds3(dist) {
  const n = dist.length;
  const d2 = dist.map((r) => r.map((d) => d * d));
  const rowMean = d2.map((r) => r.reduce((s, x) => s + x, 0) / n);
  const all = rowMean.reduce((s, x) => s + x, 0) / n;
  const B = d2.map((r, i) => r.map((x, j) => -0.5 * (x - rowMean[i] - rowMean[j] + all)));
  const coords = Array.from({ length: n }, () => [0, 0, 0]);
  for (let k = 0; k < 3; k++) {
    let v = Array.from({ length: n }, () => rand() - 0.5);
    let lambda = 0;
    for (let it = 0; it < 200; it++) {
      const w = B.map((r) => dot(r, v));
      lambda = norm(w);
      v = w.map((x) => x / lambda);
    }
    for (let i = 0; i < n; i++) {
      coords[i][k] = v[i] * Math.sqrt(Math.max(lambda, 0));
      for (let j = 0; j < n; j++) B[i][j] -= lambda * v[i] * v[j];
    }
  }
  return coords;
}

const SPREAD = 58;     // radius of the project layout, in scene units

function layoutProjects() {
  const vs = PROJECTS.map(vec);
  const dist = vs.map((a) => vs.map((b) => 1 - cosine(a, b)));
  const xyz = mds3(dist);
  const r = Math.max(...xyz.map((p) => Math.hypot(...p)));
  PROJECTS.forEach((p, i) => {
    p.vector = vs[i];
    // A little noise so no two projects stack, and the shape is less tidy.
    p.position = xyz[i].map((c) => (c / r) * SPREAD + gauss() * 2.5);
  });
}

function sentences(text) {
  return text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g).map((s) => s.trim()).filter((s) => s.length > 24);
}

/** Long sentences become clauses, so the cloud has more, finer points. */
function clauses(sentence) {
  if (sentence.length < 90) return [sentence];
  const parts = sentence.split(/(?<=[,;:])\s+|\s+(?=(?:and|while|which|using|to)\s)/);
  const out = [];
  let cur = '';
  for (const part of parts) {
    cur = cur ? `${cur} ${part}` : part;
    if (cur.length >= 45) { out.push(cur); cur = ''; }
  }
  if (cur) { if (out.length && cur.length < 30) out[out.length - 1] += ` ${cur}`; else out.push(cur); }
  return out;
}

/** Word stems that tie a passage to each axis, whatever project it is in. */
const AXIS_WORDS = {
  building: ['building', 'apartment', 'residential', 'office', 'floor', 'wall', 'construct', 'complex', 'facade', 'room'],
  urban: ['urban', 'city', 'cities', 'street', 'quarter', 'district', 'mobility', 'transport', 'neighbourhood', 'rail', 'tram', 'plan'],
  computation: ['computation', 'parametric', 'grasshopper', 'algorithm', 'generative', 'simulat', 'python', 'code', 'script', 'unity', 'c#', 'software'],
  fabrication: ['fabricat', 'cnc', 'laser', 'aluminium', 'prototype', 'printer', 'plywood', 'bamboo', 'assembl', 'making', 'maker', 'wood'],
  ai: ['ai', 'llm', 'gan', 'diffusion', 'model', 'neural', 'bert', 'yolo', 'latent', 'hallucinat', 'machine learning', 'token', 'prompt'],
  data: ['data', 'dataset', 'sentiment', 'scrap', 'sensor', 'eeg', 'mapping', 'heatmap', 'map', 'trace', 'information'],
  installation: ['installation', 'sculpture', 'exhibition', 'festival', 'biennale', 'atm', 'object'],
  performance: ['performance', 'live', 'performer', 'audiovisual', 'coding', 'stage'],
  interaction: ['interact', 'audience', 'participant', 'tactile', 'gesture', 'user', 'visitor', 'agent'],
  teaching: ['teach', 'student', 'class', 'workshop', 'lecture', 'education', 'school', 'learn', 'children'],
  research: ['research', 'framework', 'paper', 'conference', 'study', 'studies', 'approach'],
  climate: ['climate', 'shading', 'shade', 'energy', 'carbon', 'sun', 'temperature', 'desert', 'sustainab', 'soil', 'earth', 'vegetation'],
  public: ['public', 'community', 'pedestrian', 'municipality', 'civic', 'social', 'local'],
};

function axisVector(text) {
  const t = ` ${text.toLowerCase()} `;
  const v = AXES.map((a) => AXIS_WORDS[a].reduce((s, w) => s + (t.includes(` ${w}`) ? 1 : 0), 0));
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}

const unit = (v) => { const n = norm(v); return v.map((x) => x / n); };

/** Every image and passage, laid out together by UMAP. */
function buildItems() {
  const items = [];
  for (const p of PROJECTS) {
    p.images = (IMAGES[p.slug] || []).map((im, i) => ({ ...im, index: i }));
    p.items = [];
    p.images.forEach((im) => {
      const item = { type: 'image', project: p, image: im };
      p.items.push(item); items.push(item);
    });
    p.text.forEach((para) => sentences(para).forEach((sentence) => clauses(sentence).forEach((c) => {
      const item = { type: 'text', project: p, text: c, sentence };
      p.items.push(item); items.push(item);
    })));
  }
  items.forEach((it, i) => { it.id = i; });

  // Features: the project's tags, what the passage itself talks about, and
  // a weaker sense of which project it belongs to. Passages that mention
  // another theme reach towards it, and the layout grows strands.
  const features = items.map((it) => {
    const own = unit(it.project.vector);
    // Pictures have no words of their own: they borrow the project's tags,
    // unevenly, so each one leans a different way.
    const said = it.type === 'text' ? axisVector(it.text) : null;
    const words = said && said.some((x) => x > 0) ? said : unit(own.map((x) => Math.max(0, x + gauss() * 0.35)));
    const ident = PROJECTS.map((q) => (q === it.project ? 0.18 : 0));
    const noise = () => gauss() * 0.1;
    return [...own.map((x) => x * 0.55 + noise()), ...words.map((x) => x + noise()), ...ident.map((x) => x + noise() * 0.3)];
  });
  const init = items.map((it) => it.project.position.map((c) => c / SPREAD * 8 + gauss() * 0.6));
  const Y = umap(features, init, { k: 12, epochs: 400, rand });

  // Centre, and scale so most of the cloud sits within SPREAD.
  const mean = [0, 1, 2].map((c) => Y.reduce((s, y) => s + y[c], 0) / Y.length);
  const radii = Y.map((y) => Math.hypot(...y.map((v, c) => v - mean[c]))).sort((a, b) => a - b);
  const r95 = radii[Math.floor(radii.length * 0.95)] || 1;
  items.forEach((it, i) => { it.home = Y[i].map((v, c) => ((v - mean[c]) / r95) * SPREAD); });
  return items;
}

export function nearestProjects(p, k = 3) {
  return PROJECTS.filter((q) => q !== p)
    .map((q) => ({ q, s: cosine(p.vector, q.vector) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map(({ q }) => q);
}

layoutProjects();
export const ITEMS = buildItems();

/* ------------------------------------------------------------------ search */

/** Words that should find each other. Keys and values are word stems. */
const RELATED = {
  ai: ['ai', 'llm', 'gan', 'stylegan', 'diffusion', 'generative', 'neural', 'bert', 'yolo', 'latent', 'comfy', 'runway'],
  machine: ['ai', 'learning', 'model', 'bert', 'yolo', 'gan'],
  wood: ['wood', 'bamboo', 'plywood', 'timber'],
  timber: ['wood', 'bamboo', 'plywood'],
  earth: ['earth', 'soil', 'rammed', 'sand', 'local'],
  soil: ['earth', 'rammed', 'sand'],
  climate: ['climate', 'shading', 'sun', 'energy', 'temperature', 'carbon', 'bio', 'desert', 'sustainable'],
  sustainab: ['sustainable', 'climate', 'carbon', 'local', 'energy', 'earth', 'bamboo'],
  ecolog: ['sustainable', 'climate', 'carbon', 'vegetation', 'earth', 'local'],
  green: ['vegetation', 'planting', 'sustainable', 'climate'],
  city: ['urban', 'city', 'street', 'quarter', 'master', 'public', 'district', 'map', 'mobility'],
  urban: ['urban', 'city', 'street', 'quarter', 'public', 'district', 'mobility', 'pedestrian'],
  street: ['street', 'pedestrian', 'public', 'right', 'urban'],
  map: ['map', 'mapping', 'nolli', 'heatmap', 'cognitive', 'mapbox'],
  data: ['data', 'dataset', 'sentiment', 'scraping', 'sensors', 'eeg', 'trace'],
  code: ['code', 'coding', 'coded', 'python', 'grasshopper', 'unity', 'javascript', 'processing', 'script', 'software', 'bash', 'linux'],
  program: ['code', 'python', 'grasshopper', 'programming', 'unity', 'software'],
  parametric: ['parametric', 'parametrically', 'grasshopper', 'generative', 'computational', 'algorithm'],
  computation: ['computational', 'parametric', 'algorithm', 'generative', 'simulation', 'grasshopper'],
  fabricat: ['fabrication', 'fabricated', 'cnc', 'laser', 'aluminium', 'prototype', 'printer', 'making', 'maker'],
  making: ['making', 'maker', 'workshop', 'fabrication', 'physical', 'cnc', 'laser', 'printer'],
  facade: ['facade', 'aluminium', 'shading', 'panel', 'skin'],
  housing: ['housing', 'apartments', 'residential', 'social'],
  perform: ['performance', 'live', 'audience', 'performers', 'audiovisual'],
  music: ['audiovisual', 'live', 'performance', 'recording', 'studio'],
  art: ['installation', 'exhibition', 'biennale', 'festival', 'sculpture', 'performance'],
  exhibit: ['exhibition', 'biennale', 'festival', 'installation'],
  install: ['installation', 'sculpture', 'exhibition', 'interactive'],
  interact: ['interaction', 'interactive', 'audience', 'participant', 'tactile', 'gesture'],
  robot: ['autonomous', 'robots', 'agents', 'vehicles'],
  teach: ['teaching', 'students', 'class', 'workshop', 'lecturer', 'learning', 'education', 'school'],
  student: ['students', 'class', 'workshop', 'teaching', 'erasmus'],
  school: ['schools', 'education', 'children', 'youth', 'students'],
  research: ['research', 'paper', 'conference', 'framework', 'doi', 'simulation', 'ecaade', 'caad'],
  vr: ['vr', 'virtual', 'ar', 'unity', 'augmented', 'realities'],
  virtual: ['virtual', 'vr', 'ar', 'augmented', 'unity'],
  money: ['money', 'bills', 'atm', 'printer', 'value'],
  brain: ['eeg', 'brainwaves', 'cognitive', 'feelings'],
  safety: ['unsafe', 'safety', 'sentiment', 'social'],
  rome: ['rome', 'nolli', 'piazza', 'church', '18th'],
  jerusalem: ['jerusalem', 'katamonim', 'huji', 'hebrew'],
  public: ['public', 'community', 'municipality', 'pedestrian', 'library', 'civic'],
  library: ['library', 'books', 'reading'],
  bim: ['bim', 'revit', 'dynamo', 'hvac'],
};

const words = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);

function expand(query) {
  const terms = new Map();   // stem -> weight
  for (const w of words(query)) {
    if (w.length < 2) continue;
    terms.set(w, 1);
    for (const [key, rel] of Object.entries(RELATED)) {
      if (w.startsWith(key) || key.startsWith(w) && w.length >= 3) {
        rel.forEach((r) => { if (!terms.has(r)) terms.set(r, 0.55); });
      }
    }
  }
  return terms;
}

const hits = (text, terms) => {
  let s = 0;
  const ws = words(text);
  for (const [t, weight] of terms) {
    if (ws.some((w) => w.startsWith(t) || (t.length > 4 && w.includes(t)))) s += weight;
  }
  return s;
};

/**
 * Rank every item against a query. Returns `{ scores, ranked, projects }`
 * where `scores[id]` is a cosine-looking number in [0, 1).
 */
export function search(query) {
  const terms = expand(query);
  if (!terms.size) return null;
  const projScore = new Map(PROJECTS.map((p) => [p, hits(`${p.title} ${p.kind} ${p.meta.join(' ')} ${AXES.filter((a) => p.tags[a] > .5).join(' ')}`, terms)]));
  const raw = ITEMS.map((it) => {
    const own = it.type === 'text' ? hits(it.text, terms) : hits(it.image.caption || '', terms);
    return own * 1.6 + projScore.get(it.project) * 0.8;
  });
  const max = Math.max(...raw);
  if (max === 0) return { scores: raw.map(() => 0), ranked: [], projects: [] };
  // A believable spread: matches land 0.55–0.92, the rest 0.08–0.30.
  const scores = raw.map((r, i) => (r > 0 ? 0.55 + 0.37 * (r / max) : 0.08 + 0.22 * ((i * 2654435761) % 1000) / 1000));
  const ranked = ITEMS.filter((_, i) => raw[i] > 0).sort((a, b) => scores[b.id] - scores[a.id]);
  const byProject = new Map();
  ranked.forEach((it) => byProject.set(it.project, Math.max(byProject.get(it.project) || 0, scores[it.id])));
  const projects = [...byProject].sort((a, b) => b[1] - a[1]).map(([p, s]) => ({ project: p, score: s }));
  return { scores, ranked, projects };
}
