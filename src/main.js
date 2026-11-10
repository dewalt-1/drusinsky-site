import { PERSON, PROJECTS, KINDS } from './projects.js';
import { ITEMS, search, nearestProjects } from './embedding.js';
import { createCloud } from './cloud.js';

const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...children) => {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...children);
  return n;
};

/* ------------------------------------------------------------------ panel */

$('roles').textContent = PERSON.roles;
$('bio').textContent = PERSON.bio;
$('email').textContent = PERSON.email;
$('place').textContent = PERSON.place;
const images = ITEMS.filter((i) => i.type === 'image').length;
$('key-count').textContent = `${PROJECTS.length} projects · ${images} images · ${ITEMS.length - images} passages`;

function toggler(button, target) {
  button.addEventListener('click', () => {
    const open = target.hidden;
    target.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  });
}
toggler($('about-toggle'), $('about'));
toggler($('index-toggle'), $('index'));

const cloud = createCloud({
  canvas: $('stage'),
  labelLayer: $('labels'),
  onPick: (it) => (it ? open(it) : close()),
  onHover: showTip,
});

/* ------------------------------------------------------------------ filters */

let kind = null;
let query = '';
let searched = false;   // a search with results is showing

const kindButtons = ['All', ...KINDS].map((k) => {
  const b = el('button', { textContent: k, type: 'button' });
  b.setAttribute('aria-pressed', String(k === 'All'));
  b.addEventListener('click', () => {
    kind = k === 'All' ? null : k;
    kindButtons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  });
  $('kinds').append(b);
  return b;
});

PROJECTS.forEach((p) => {
  const li = el('li', {}, el('button', { type: 'button', textContent: p.title, onclick: () => openProject(p) }), el('span', { className: 'mono', textContent: ` ${p.year}` }));
  $('index').append(li);
});

['AI', 'public space', 'facade', 'installation', 'students', 'Jerusalem'].forEach((s) => {
  $('suggest').append(el('button', { type: 'button', textContent: s, onclick: () => { $('search').value = s; onSearch(); } }));
});

let searchTimer;
$('search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(onSearch, 140); });
$('search').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { $('search').value = ''; onSearch(); $('search').blur(); }
  if (e.key === 'Enter') { const first = $('results').querySelector('button'); if (first) first.click(); }
});

function onSearch() {
  query = $('search').value.trim();
  apply();
}

function apply() {
  const res = query ? search(query) : null;
  const inKind = (it) => !kind || it.project.kind === kind;
  $('results').replaceChildren();
  $('suggest').hidden = !!query;

  if (res) {
    const n = res.ranked.filter(inKind).length;
    $('search-note').textContent = n ? `${n} near · cosine ≥ 0.55` : 'nothing near';
    res.projects.filter(({ project }) => !kind || project.kind === kind).slice(0, 8).forEach(({ project, score }) => {
      $('results').append(el('li', {},
        el('span', { className: 'mono score', textContent: score.toFixed(2) }),
        el('button', { type: 'button', textContent: project.title, onclick: () => openProject(project, res) })));
    });
    cloud.highlight((it) => (inKind(it) && res.scores[it.id] >= 0.55 ? res.scores[it.id] : 0), { query });
    searched = n > 0;
  } else {
    $('search-note').textContent = '';
    cloud.highlight(kind ? (it) => (inKind(it) ? 0.7 : 0) : null);
    // Leaving a search: back out to the whole cloud.
    if (searched && detail.hidden) { cloud.flyHome(); cloud.resumeRotate(); }
    searched = false;
  }
}

/* ------------------------------------------------------------------ hover */

const tip = $('tip');
function showTip(it, ev) {
  if (!it || !ev) { tip.hidden = true; return; }
  tip.hidden = false;
  tip.replaceChildren(
    el('span', { className: 'tip-title', textContent: it.project.title }),
    el('span', { className: 'tip-text', textContent: it.type === 'text' ? clip(it.text, 120) : it.image.caption || '' }),
  );
  const x = Math.min(ev.clientX + 14, window.innerWidth - 260);
  tip.style.transform = `translate(${x}px, ${ev.clientY + 14}px)`;
}
const clip = (s, n) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, '')}…` : s);

/* ------------------------------------------------------------------ detail */

const detail = $('detail');
let current = null;

function openProject(p, res) {
  // Open on the item that best matches the search, else the first image.
  const best = res && res.ranked.find((it) => it.project === p && it.type === 'image');
  open(best || p.items.find((i) => i.type === 'image') || p.items[0]);
}

function open(it) {
  current = it;
  const p = it.project;
  const img = $('detail-image');
  if (it.type === 'image') {
    img.hidden = false;
    img.src = it.image.thumb;          // shows at once, then sharpens
    img.classList.add('is-placeholder');
    const full = new Image();
    full.onload = () => { if (current === it) { img.src = it.image.src; img.classList.remove('is-placeholder'); } };
    full.src = it.image.src;
    img.alt = it.image.caption || `${p.title}, image ${it.image.index + 1}`;
    $('detail-caption').textContent = it.image.caption || `${p.title} — ${it.image.index + 1} / ${p.images.length}`;
    $('detail-caption').hidden = false;
    $('detail-quote').hidden = true;
  } else {
    img.hidden = true;
    $('detail-caption').hidden = true;
    $('detail-quote').hidden = false;
    $('detail-quote').textContent = it.sentence || it.text;
  }
  $('detail-kind').textContent = p.kind;
  $('detail-title').textContent = p.title;
  $('detail-meta').replaceChildren(...p.meta.map((m) => el('li', { textContent: m })));
  $('detail-body').replaceChildren(...p.text.map((t) => el('p', { textContent: t })));

  $('detail-related-list').replaceChildren(...p.images.map((im) => {
    const t = el('img', { src: im.thumb, alt: im.caption || `${p.title}, image ${im.index + 1}`, tabIndex: 0 });
    if (it.type === 'image' && im === it.image) t.classList.add('is-current');
    const go = () => open(p.items.find((x) => x.type === 'image' && x.image === im));
    t.addEventListener('click', go);
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    return t;
  }));
  $('detail-near-list').replaceChildren(...nearestProjects(p, 3).map((q) => el('li', {}, el('button', { type: 'button', textContent: q.title, onclick: () => openProject(q) }))));

  detail.hidden = false;
  detail.scrollTop = 0;
  cloud.setFocus(it);
  history.replaceState(null, '', `#${p.slug}`);
}

function close() {
  if (detail.hidden) return;
  detail.hidden = true;
  current = null;
  cloud.setFocus(null);
  history.replaceState(null, '', location.pathname + location.search);
}

$('detail-close').addEventListener('click', () => { close(); cloud.flyHome(); cloud.resumeRotate(); });

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.activeElement !== $('search')) { close(); cloud.flyHome(); cloud.resumeRotate(); }
  if (e.key === '/' && document.activeElement !== $('search')) { e.preventDefault(); $('search').focus(); }
});

$('thumbs').addEventListener('input', (e) => cloud.setThumbScale(e.target.value / 100));

// A shared link opens its project once the cloud has unfolded.
const fromHash = () => PROJECTS.find((p) => `#${p.slug}` === location.hash);
if (fromHash()) setTimeout(() => openProject(fromHash()), 1800);
window.addEventListener('hashchange', () => {
  const p = fromHash();
  if (p && (!current || current.project !== p)) openProject(p);
});
