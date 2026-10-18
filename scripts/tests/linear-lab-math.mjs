import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import * as M from "../../src/lib/linearLabMath.mjs";
import { renderActivity } from "../../src/lib/linearLabPlot.mjs";
import { linearActivities } from "../../src/data/linearActivities.ts";
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const mm = (A, B) =>
  A.map((row) =>
    B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)),
  );
test("all thirteen guided activities have valid quizzes, controls, and links", () => {
  assert.deepEqual(
    linearActivities.map((a) => a.number),
    Array.from({ length: 13 }, (_, i) => i + 1),
  );
  assert.equal(new Set(linearActivities.map((a) => a.id)).size, 13);
  for (const a of linearActivities) {
    assert.ok(a.choices[a.answer]);
    assert.ok(a.extensionChoices[a.extensionAnswer]);
    assert.equal(a.observations.length, 2);
    assert.ok(a.explanation.length > 100);
    const p = Object.fromEntries(a.controls.map((c) => [c.id, c.value]));
    const graph = renderActivity(a.id, p);
    assert.ok(graph.svg.includes("<desc"));
    assert.ok(!/NaN|Infinity|undefined/.test(graph.svg));
    assert.ok(graph.readouts.length >= 3);
  }
});
test("roots: every plotted point has modulus one, correct power, and no duplicate", () => {
  for (let theta = 0; theta < 360; theta += 30)
    for (let n = 2; n <= 6; n++) {
      const roots = M.roots(theta, n),
        expected = [
          Math.cos((theta * Math.PI) / 180),
          Math.sin((theta * Math.PI) / 180),
        ];
      for (let i = 0; i < n; i++) {
        const w = roots[i];
        near(Math.hypot(...w), 1);
        let z = [1, 0];
        for (let k = 0; k < n; k++)
          z = [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]];
        near(z[0], expected[0]);
        near(z[1], expected[1]);
        for (let j = 0; j < i; j++)
          assert.ok(Math.hypot(w[0] - roots[j][0], w[1] - roots[j][1]) > 0.1);
      }
    }
});
test("field: brute-force solutions agree with the stated nullity", () => {
  for (const p of [2, 3, 5]) {
    const m = M.fieldModel(p);
    const all = [];
    for (let x = 0; x < p; x++)
      for (let y = 0; y < p; y++)
        if (
          M.mv(
            [
              [1, 1],
              [1, -1],
            ],
            [x, y],
          ).every((a) => M.mod(a, p) === 0)
        )
          all.push([x, y]);
    assert.deepEqual(m.points, all);
    assert.equal(all.length, p ** m.nullity);
    assert.equal(m.rank + m.nullity, 2);
  }
  assert.throws(() => M.fieldModel(4));
});
test("systems: unique solutions satisfy both equations; t=0 handles consistency", () => {
  for (let t = -2; t <= 2; t++)
    for (let b = 4; b <= 8; b++) {
      const m = M.systemModel(t, b);
      if (m.solution) {
        const [x, y] = m.solution;
        near(x + y, 3);
        near(2 * x + (2 + t) * y, b);
        assert.notEqual(t, 0);
      } else {
        assert.equal(t, 0);
        assert.equal(m.kind, b === 6 ? "infinite" : "none");
        assert.equal(m.augmentedRank, b === 6 ? 1 : 2);
      }
    }
});
test("span: determinant, linear combination, and singular case agree", () => {
  for (let d = -2; d <= 2; d++)
    for (let a = -2; a <= 2; a++)
      for (let b = -2; b <= 2; b++) {
        const m = M.spanModel(d, a, b);
        assert.equal(M.det2([[...m.u], [...m.v]]), m.determinant);
        assert.deepEqual(
          m.combination,
          M.add(M.scale(a, m.u), M.scale(b, m.v)),
        );
        if (!d) assert.equal(m.combination[0], m.combination[1]);
      }
});
test("composition order is computed from matrix products", () => {
  for (let s = -2; s <= 2; s++)
    for (let r = 1; r <= 3; r++) {
      const m = M.matrixOrderModel(s, r);
      assert.deepEqual(m.ABx, M.mv(mm(m.A, m.B), [1, 1]));
      assert.deepEqual(m.BAx, M.mv(mm(m.B, m.A), [1, 1]));
      assert.equal(
        m.commute,
        JSON.stringify(mm(m.A, m.B)) === JSON.stringify(mm(m.B, m.A)),
      );
    }
});
test("basis matrices are inverses and preserve the round trip", () => {
  for (let s = -2; s <= 2; s++)
    for (let a = -2; a <= 2; a++)
      for (let b = -2; b <= 2; b++) {
        const m = M.basisModel(s, a, b);
        assert.deepEqual(mm(m.P, m.inverse), [
          [1, 0],
          [0, 1],
        ]);
        assert.deepEqual(M.mv(m.inverse, m.x), m.coordinates);
      }
});
test("rank-nullity and supplied kernel bases, including rank drop", () => {
  for (let t = -2; t <= 2; t++) {
    const m = M.rankModel(t);
    assert.equal(m.rank + m.nullity, 3);
    assert.equal(m.kernel.length, m.nullity);
    for (const v of m.kernel) assert.deepEqual(M.mv(m.A, v), [0, 0]);
    const minors = [
      M.det2([
        [1, 2],
        [0, t],
      ]),
      M.det2([
        [2, 3],
        [t, t],
      ]),
    ];
    assert.equal(
      minors.some((x) => x !== 0),
      m.rank === 2,
    );
  }
});
test("affine map: direct additivity discrepancy and image of zero", () => {
  for (let c = -2; c <= 2; c++) {
    const m = M.mapModel(c);
    assert.equal(m.linear, c === 0);
    const discrepancy = m.Tsum.map((x, i) => x - m.sumT[i]);
    near(discrepancy[0], 0);
    near(discrepancy[1], -c);
    assert.deepEqual(m.origin, [0, c]);
  }
});
test("similarity: AP=PD and both vector paths agree", () => {
  for (let s = -2; s <= 2; s++) {
    const m = M.similarityModel(s);
    assert.deepEqual(mm(m.A, m.P), mm(m.P, m.D));
    assert.deepEqual(m.Ax, m.PDc);
    assert.equal(M.det2(m.A), m.determinant);
  }
});
test("defective family: characteristic data do not imply diagonalizability", () => {
  for (let s = 0; s <= 3; s++)
    for (let theta = 0; theta <= 180; theta += 15) {
      const m = M.eigenModel(s, theta);
      near(M.det2(m.A), 4);
      assert.equal(m.eigenspaceDimension, s ? 1 : 2);
      near(m.cross, -s * Math.sin((theta * Math.PI) / 180) ** 2);
    }
});
test("weighted projection belongs to W and has weighted-orthogonal residual", () => {
  for (let w = 1; w <= 4; w++) {
    const m = M.projectionModel(w);
    near(m.p[0], m.p[1]);
    near(w * m.residual[0] + m.residual[1], 0);
    assert.deepEqual(M.add(m.p, m.residual), m.v);
    if (w === 1) near(m.euclideanDot, 0);
    else assert.ok(Math.abs(m.euclideanDot) > 0.1);
  }
  assert.throws(() => M.projectionModel(0));
  assert.equal(M.projectionModel(3).exact, "5/2");
});
test("Gram-Schmidt: normalized vectors are orthogonal; dependent input is explicit", () => {
  for (let k = 1; k <= 3; k++)
    for (let d = -2; d <= 2; d++) {
      const m = M.gramSchmidtModel(k, d);
      near(M.dot(m.w2, m.v1), 0);
      assert.deepEqual(M.add(m.w2, M.scale(m.coefficient, m.v1)), m.v2);
      near(M.dot(m.e1, m.e1), 1);
      if (d) {
        near(M.dot(m.e2, m.e2), 1);
        near(M.dot(m.e1, m.e2), 0);
      } else {
        assert.equal(m.e2, null);
        assert.equal(m.independent, false);
      }
    }
});
test("all control endpoint combinations produce finite, described SVGs", () => {
  for (const a of linearActivities) {
    let combinations = [{}];
    for (const c of a.controls) {
      const values = c.options
        ? c.options.map((o) => o.value)
        : [c.min, c.value, c.max];
      combinations = combinations.flatMap((p) =>
        values.map((v) => ({ ...p, [c.id]: v })),
      );
    }
    for (const p of combinations) {
      const r = renderActivity(a.id, p);
      assert.ok(!/NaN|Infinity|undefined/.test(r.svg));
      assert.ok(r.caption);
    }
  }
});
test("LLM activities are mapped to taught topics and clearly label synthetic errors", () => {
  const data = JSON.parse(
    readFileSync(
      new URL(
        "../../public/files/linear-algebra-lab/llm-activities.json",
        import.meta.url,
      ),
    ),
  );
  assert.equal(data.activities.length, 8);
  assert.deepEqual(
    [...new Set(data.activities.map((a) => a.homework))],
    [1, 2, 3, 6, 9, 11],
  );
  for (const a of data.activities) {
    assert.ok(
      a.flawedExample.includes("שנכתבה לפעילות") ||
        a.flawedExample.includes("שנכתבה לפעילות,"),
    );
    assert.ok(a.solution.length >= 3);
    assert.ok(a.tasks.length >= 4);
    assert.ok(a.prompt && a.repairedPrompt);
  }
});
