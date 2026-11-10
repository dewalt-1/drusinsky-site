/**
 * A small UMAP (McInnes, Healy & Melville 2018) for a few hundred points.
 *
 * 1. Fuzzy k-nearest-neighbour graph on cosine distance.
 * 2. Stochastic layout: edges attract, random negative samples repel, with
 *    the curve parameters UMAP uses for min_dist = 0.5.
 *
 * Deterministic given the random function passed in.
 */

const A = 0.583, B = 1.334;        // curve fitted for min_dist 0.5, spread 1

function cosineDistance(a, b) {
  let d = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return 1 - d / (Math.sqrt(na * nb) || 1);
}

/** Symmetric fuzzy graph as a list of [i, j, weight]. */
function fuzzyGraph(X, k) {
  const n = X.length;
  const target = Math.log2(k);
  const rows = new Map();
  for (let i = 0; i < n; i++) {
    const nn = [];
    for (let j = 0; j < n; j++) if (j !== i) nn.push([j, cosineDistance(X[i], X[j])]);
    nn.sort((p, q) => p[1] - q[1]);
    const knn = nn.slice(0, k);
    const rho = knn[0][1];
    // Find sigma so the neighbour weights sum to log2(k).
    let lo = 0, hi = Infinity, sigma = 1;
    for (let it = 0; it < 64; it++) {
      const s = knn.reduce((acc, [, d]) => acc + Math.exp(-Math.max(0, d - rho) / sigma), 0);
      if (Math.abs(s - target) < 1e-5) break;
      if (s > target) { hi = sigma; sigma = (lo + hi) / 2; }
      else { lo = sigma; sigma = hi === Infinity ? sigma * 2 : (lo + hi) / 2; }
    }
    for (const [j, d] of knn) rows.set(`${i},${j}`, Math.exp(-Math.max(0, d - rho) / sigma));
  }
  const edges = [];
  const seen = new Set();
  for (const key of rows.keys()) {
    const [i, j] = key.split(',').map(Number);
    const id = i < j ? `${i},${j}` : `${j},${i}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const a = rows.get(`${i},${j}`) || 0, b = rows.get(`${j},${i}`) || 0;
    edges.push([i, j, a + b - a * b]);
  }
  return edges;
}

const clip = (x) => (x > 4 ? 4 : x < -4 ? -4 : x);

/**
 * @param X       feature vectors
 * @param init    starting positions, n × dim (gives the global shape)
 * @param rand    seeded random in [0, 1)
 */
export function umap(X, init, { k = 10, epochs = 500, negatives = 5, rand = Math.random } = {}) {
  const n = X.length;
  const dim = init[0].length;
  const Y = init.map((p) => p.slice());
  const edges = fuzzyGraph(X, k);
  const wMax = Math.max(...edges.map((e) => e[2]));

  for (let ep = 0; ep < epochs; ep++) {
    const alpha = 1 - ep / epochs;
    for (const [i, j, w] of edges) {
      if (rand() > w / wMax) continue;      // sample edges by weight
      const yi = Y[i], yj = Y[j];
      let d2 = 0;
      for (let c = 0; c < dim; c++) d2 += (yi[c] - yj[c]) ** 2;
      if (d2 > 0) {
        const g = (-2 * A * B * Math.pow(d2, B - 1)) / (A * Math.pow(d2, B) + 1);
        for (let c = 0; c < dim; c++) {
          const step = clip(g * (yi[c] - yj[c])) * alpha;
          yi[c] += step; yj[c] -= step;
        }
      }
      for (let s = 0; s < negatives; s++) {
        const m = Math.floor(rand() * n);
        if (m === i) continue;
        const ym = Y[m];
        let e2 = 0;
        for (let c = 0; c < dim; c++) e2 += (yi[c] - ym[c]) ** 2;
        const g = (2 * B) / ((0.001 + e2) * (A * Math.pow(e2, B) + 1));
        for (let c = 0; c < dim; c++) yi[c] += (e2 > 0 ? clip(g * (yi[c] - ym[c])) : 4) * alpha;
      }
    }
  }
  return Y;
}
