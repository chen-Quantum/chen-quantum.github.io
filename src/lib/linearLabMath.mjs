// Small deterministic models, shared by the browser activities and Node checks.
// The controls use bounded integers; exact algebra determines singular cases.
export const det2 = ([[a, b], [c, d]]) => a * d - b * c;
export const mv = (A, v) =>
  A.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
export const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
export const add = (u, v) => u.map((x, i) => x + v[i]);
export const scale = (a, v) => v.map((x) => a * x);
export const mod = (a, p) => ((a % p) + p) % p;
export function fraction(a, b = 1) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0)
    throw new Error("Invalid fraction");
  if (!Number.isInteger(a) || !Number.isInteger(b))
    return String(Number((a / b).toFixed(3)));
  const gcd = (x, y) => (y ? gcd(y, x % y) : Math.abs(x));
  const g = gcd(a, b),
    sign = b < 0 ? -1 : 1;
  a = (sign * a) / g;
  b = (sign * b) / g;
  return b === 1 ? String(a) : `${a}/${b}`;
}
export const vectorText = (v) =>
  `(${v.map((x) => (Number.isInteger(x) ? x : Number(x.toFixed(3)))).join(", ")})`;
export function roots(theta, n) {
  return Array.from({ length: n }, (_, k) => {
    const phi = ((theta * Math.PI) / 180 + 2 * Math.PI * k) / n;
    return [Math.cos(phi), Math.sin(phi)];
  });
}
export function fieldModel(p) {
  if (![0, 2, 3, 5].includes(p))
    throw new Error("Use R or one of the supported prime fields");
  const A = [[3, 5], [5, 3]], rank = p === 2 ? 1 : 2, points = [];
  if (p)
    for (let x = 0; x < p; x++)
      for (let y = 0; y < p; y++)
        if (mv(A, [x, y]).every((v) => mod(v, p) === 0)) points.push([x, y]);
  return { A, rank, nullity: 2 - rank, determinant: p ? mod(det2(A), p) : det2(A), points };
}
export function systemModel(t, b) {
  if (t === 0)
    return { kind: b === 6 ? "infinite" : "none", rank: 1,
      augmentedRank: b === 6 ? 1 : 2, solution: null };
  return { kind: "unique", rank: 2, augmentedRank: 2,
    solution: [2 - 2 * (b - 6) / t, (b - 6) / t],
    exact: [fraction(2 * t - 2 * b + 12, t), fraction(b - 6, t)] };
}
export function spanModel(delta, a, b) {
  const u = [2, 1], v = [6, 3 + delta];
  return { u, v, combination: add(scale(a, u), scale(b, v)),
    rank: delta === 0 ? 1 : 2, determinant: 2 * delta };
}
export function matrixOrderModel(s, r) {
  const A = [[1, s], [0, 1]], B = [[r, 0], [0, 1]], x = [2, 2],
    AB = [[r, s], [0, 1]], BA = [[r, r * s], [0, 1]];
  return { A, B, AB, BA, x, ABx: mv(AB, x), BAx: mv(BA, x),
    commute: s === 0 || r === 1, determinant: r };
}
export function basisModel(s, a, b) {
  const P = [[1, s], [2, 2 * s + 1]], inverse = [[2 * s + 1, -s], [-2, 1]];
  return { P, inverse, x: mv(P, [a, b]), coordinates: [a, b], basis: [[1, 2], [s, 2 * s + 1]] };
}
export function rankModel(t) {
  return { A: [[1, 3, 2], [0, t, 2 * t]], target: [1, 2],
    rank: t === 0 ? 1 : 2, nullity: t === 0 ? 2 : 1,
    kernel: t === 0 ? [[-3, 1, 0], [-2, 0, 1]] : [[4, -2, 1]],
    targetInImage: t !== 0 };
}
export function mapModel(c) {
  const T = ([x, y]) => [2 * x - y, 3 * y + 2 * c], u = [1, 1], v = [-1, 2];
  return { u, v, origin: T([0, 0]), Tu: T(u), Tv: T(v),
    Tsum: T(add(u, v)), sumT: add(T(u), T(v)), linear: c === 0 };
}
export function similarityModel(s) {
  const P = [[1, s], [0, 1]], D = [[3, 0], [0, 4]], A = [[3, s], [0, 4]], c = [2, -1], x = mv(P, c);
  return { P, D, A, c, x, Ax: mv(A, x), PDc: mv(P, mv(D, c)),
    trace: 7, determinant: 12, eigenvectors: [[1, 0], [s, 1]] };
}
export function eigenModel(s, theta) {
  const angle = theta * Math.PI / 180, v = [Math.cos(angle), Math.sin(angle)],
    A = [[3, 2 * s], [0, 3]], Av = mv(A, v);
  return { A, v, Av, eigenspaceDimension: s === 0 ? 2 : 1,
    diagonalizable: s === 0, cross: v[0] * Av[1] - v[1] * Av[0] };
}
export function projectionModel(w) {
  if (w <= 0) throw new Error("A positive weight is required");
  const u = [2, 2], v = [4, 2], coefficient = (2 * w + 1) / (w + 1),
    p = scale(coefficient, u), residual = add(v, scale(-1, p));
  return { u, v, p, residual, coefficient, exact: fraction(2 * w + 1, w + 1),
    exactProjection: fraction(4 * w + 2, w + 1),
    weightedDot: w * residual[0] * u[0] + residual[1] * u[1], euclideanDot: dot(residual, u) };
}
export function gramSchmidtModel(k, delta) {
  const v1 = [2, 2], v2 = [k, k + 2 * delta], w2 = [-delta, delta];
  return { v1, v2, w2, independent: delta !== 0, coefficient: (k + delta) / 2,
    e1: [1 / Math.sqrt(2), 1 / Math.sqrt(2)],
    e2: delta === 0 ? null : scale(Math.sign(delta) / Math.sqrt(2), [-1, 1]) };
}

export function determinantModel(s, t) {
  const u = [4, 2], v = [s, t], determinant = det2([[u[0], v[0]], [u[1], v[1]]]);
  return { u, v, determinant, area: Math.abs(determinant), invertible: determinant !== 0 };
}
