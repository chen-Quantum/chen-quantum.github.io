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
  const rank = p === 2 ? 1 : 2;
  const points = [];
  if (p)
    for (let x = 0; x < p; x++)
      for (let y = 0; y < p; y++) {
        if (mod(x + y, p) === 0 && mod(x - y, p) === 0) points.push([x, y]);
      }
  return { rank, nullity: 2 - rank, determinant: p ? mod(-2, p) : -2, points };
}
export function systemModel(t, b) {
  if (t === 0)
    return {
      kind: b === 6 ? "infinite" : "none",
      rank: 1,
      augmentedRank: b === 6 ? 1 : 2,
      solution: null,
    };
  return {
    kind: "unique",
    rank: 2,
    augmentedRank: 2,
    solution: [3 - (b - 6) / t, (b - 6) / t],
    exact: [fraction(3 * t - b + 6, t), fraction(b - 6, t)],
  };
}
export function spanModel(delta, a, b) {
  const u = [1, 1],
    v = [2, 2 + delta];
  return {
    u,
    v,
    combination: add(scale(a, u), scale(b, v)),
    rank: delta === 0 ? 1 : 2,
    determinant: delta,
  };
}
export function matrixOrderModel(s, r) {
  return {
    A: [
      [1, s],
      [0, 1],
    ],
    B: [
      [r, 0],
      [0, 1],
    ],
    ABx: [r + s, 1],
    BAx: [r * (1 + s), 1],
    commute: s === 0 || r === 1,
    determinant: r,
  };
}
export function basisModel(s, a, b) {
  return {
    P: [
      [1, s],
      [0, 1],
    ],
    inverse: [
      [1, -s],
      [0, 1],
    ],
    x: [a + s * b, b],
    coordinates: [a, b],
    basis: [
      [1, 0],
      [s, 1],
    ],
  };
}
export function rankModel(t) {
  return {
    A: [
      [1, 2, 3],
      [0, t, t],
    ],
    rank: t === 0 ? 1 : 2,
    nullity: t === 0 ? 2 : 1,
    kernel:
      t === 0
        ? [
            [-2, 1, 0],
            [-3, 0, 1],
          ]
        : [[-1, -1, 1]],
    targetInImage: t !== 0,
  };
}
export function mapModel(c) {
  const T = ([x, y]) => [x + y, y + c];
  return {
    origin: T([0, 0]),
    Tu: T([1, 0]),
    Tv: T([0, 1]),
    Tsum: T([1, 1]),
    sumT: add(T([1, 0]), T([0, 1])),
    linear: c === 0,
  };
}
export function similarityModel(s) {
  const P = [
      [1, s],
      [0, 1],
    ],
    D = [
      [2, 0],
      [0, 3],
    ],
    A = [
      [2, s],
      [0, 3],
    ];
  const c = [1, 1],
    x = mv(P, c);
  return {
    P,
    D,
    A,
    x,
    Ax: mv(A, x),
    PDc: mv(P, mv(D, c)),
    trace: 5,
    determinant: 6,
    eigenvectors: [
      [1, 0],
      [s, 1],
    ],
  };
}
export function eigenModel(s, theta) {
  const angle = (theta * Math.PI) / 180,
    v = [Math.cos(angle), Math.sin(angle)];
  const A = [
      [2, s],
      [0, 2],
    ],
    Av = mv(A, v);
  return {
    A,
    v,
    Av,
    eigenspaceDimension: s === 0 ? 2 : 1,
    diagonalizable: s === 0,
    cross: v[0] * Av[1] - v[1] * Av[0],
  };
}
export function projectionModel(w) {
  if (w <= 0) throw new Error("A positive weight is required");
  const coefficient = (3 * w + 1) / (w + 1),
    p = [coefficient, coefficient],
    residual = [3 - coefficient, 1 - coefficient];
  return {
    u: [1, 1],
    v: [3, 1],
    p,
    residual,
    coefficient,
    exact: fraction(3 * w + 1, w + 1),
    weightedDot: w * residual[0] + residual[1],
    euclideanDot: residual[0] + residual[1],
  };
}
export function gramSchmidtModel(k, delta) {
  const v1 = [1, 1],
    v2 = [k, k + delta],
    w2 = [-delta / 2, delta / 2];
  return {
    v1,
    v2,
    w2,
    independent: delta !== 0,
    coefficient: k + delta / 2,
    e1: scale(1 / Math.sqrt(2), v1),
    e2: delta === 0 ? null : scale(Math.sign(delta) / Math.sqrt(2), [-1, 1]),
  };
}
