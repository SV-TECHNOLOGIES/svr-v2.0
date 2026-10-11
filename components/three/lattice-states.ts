/**
 * THE BUILD LATTICE — data model.
 *
 * One set of N nodes is reused by every section. Each stage ("state") gives
 * every node a local position, a size, and a group. A group is pinned to a DOM
 * element (`data-lattice-anchor="…"`), so layouts follow the responsive page
 * layout automatically. Edges are fixed node pairs; each state decides how
 * visible each edge is. The scene blends between two adjacent states based on
 * scroll, which produces the continuous "idea → shipped software" morph.
 *
 * Stage map (see lib/constants.ts → STAGE):
 *  0 hero          scattered idea nodes drifting, reacting to the cursor
 *  1 discover      nodes gather into a cloud
 *  2 design        nodes snap to a grid; connections draw like a blueprint
 *  3 build         full 3D lattice; particles flow along every line
 *  4 qa            a scan light sweeps; nodes confirm with a pulse
 *  5 launch        locks tight, glows, and lifts
 *  6 impact        the system expands; four nodes anchor to stat panels
 *  7 services      splits into four icon clusters behind the service cards
 *  8 testimonials  dims into a calm background constellation
 *  9 contact       one small structure beside the form (assembles on success)
 * 10 footer        faint glowing points on navy
 */

import { mulberry32 } from "@/lib/random";

export type Vec3 = [number, number, number];

export interface GroupSpec {
  /** `data-lattice-anchor` id of the DOM element this group sits on. */
  anchor: string;
  /** contain: uniform scale by the anchor's shorter side. stretch: fill both axes. */
  fit: "contain" | "stretch";
  /** Multiplier on the anchor's half-extent. */
  size: number;
  /** World-space depth offset (negative = further away). */
  z: number;
  /** Base rotation (radians). */
  rot: Vec3;
  /** Continuous spin around Y (radians / second). */
  spin: number;
  /** Gentle Y sway amplitude (radians). */
  wobble: number;
  /** Upward offset as a fraction of the anchor half-height. */
  lift: number;
  /** 1 = moves with the page; <1 lags behind scroll (mid-layer parallax). */
  parallax: number;
}

export interface StateParams {
  /** Global glass node size multiplier. */
  nodeScale: number;
  /** Idle drift amplitude. */
  drift: number;
  /** Strength of cursor repulsion. */
  pointer: number;
  /** Particle flow along connection lines. */
  flow: number;
  /** QA scanning light. */
  scan: number;
  /** Soft glow halo behind nodes. */
  halo: number;
  /** Connection line intensity. */
  line: number;
  /** 0 = day palette (on white), 1 = night palette (on navy). */
  night: number;
}

export interface LatticeState {
  name: string;
  local: Float32Array;
  scale: Float32Array;
  group: Uint8Array;
  groups: GroupSpec[];
  edgeAlpha: Float32Array;
  params: StateParams;
}

export const EDGE_SET = { grid: 0, loose: 1 } as const;

export interface LatticeModel {
  count: number;
  /** Flat [a0, b0, a1, b1, …] node index pairs. */
  edges: Uint16Array;
  edgeCount: number;
  /** Which set each edge belongs to (grid edges get the blueprint draw-in). */
  edgeSet: Uint8Array;
  /** 0…1 order used for staggered blueprint drawing. */
  edgeOrder: Float32Array;
  edgeSeed: Float32Array;
  states: LatticeState[];
  /** Contact stage, fully assembled (blended in on form success). */
  contactAssembled: { local: Float32Array; scale: Float32Array; edgeAlpha: Float32Array };
  /** Per-node morph delay (0…1) so nodes travel in a staggered wave. */
  delay: Float32Array;
  /** Per-node drift phases. */
  phase: Float32Array;
  /** Per-node tint index 0…3. */
  tint: Uint8Array;
}

const DEFAULT_GROUP: GroupSpec = {
  anchor: "hero-stage",
  fit: "contain",
  size: 1,
  z: 0,
  rot: [0, 0, 0],
  spin: 0,
  wobble: 0,
  lift: 0,
  parallax: 0.82,
};
const group = (g: Partial<GroupSpec>): GroupSpec => ({ ...DEFAULT_GROUP, ...g });

/** Isometric-ish view used by the assembled structure. */
const ISO: Vec3 = [-0.42, 0.72, 0];

// ─── geometry helpers ─────────────────────────────────────────────────────────

type Rand = () => number;

/** Poisson-ish scatter inside a box: keeps nodes from clumping. */
function scatter(
  n: number,
  rand: Rand,
  ext: Vec3,
  minDist: number,
  ellipsoid = false,
): Float32Array {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let best: Vec3 = [0, 0, 0];
    let bestD = -1;
    for (let tries = 0; tries < 24; tries++) {
      const c: Vec3 = [
        (rand() * 2 - 1) * ext[0],
        (rand() * 2 - 1) * ext[1],
        (rand() * 2 - 1) * ext[2],
      ];
      if (ellipsoid) {
        const r = (c[0] / ext[0]) ** 2 + (c[1] / ext[1]) ** 2 + (c[2] / ext[2]) ** 2;
        if (r > 1) continue;
      }
      let nearest = Infinity;
      for (let j = 0; j < i; j++) {
        const d = Math.hypot(c[0] - out[j * 3], c[1] - out[j * 3 + 1], c[2] - out[j * 3 + 2]);
        if (d < nearest) nearest = d;
      }
      if (nearest > bestD) {
        bestD = nearest;
        best = c;
      }
      if (nearest >= minDist) break;
    }
    out.set(best, i * 3);
  }
  return out;
}

/** Pairs each node with its k nearest neighbours (within maxDist), deduplicated. */
function nearestPairs(
  pos: Float32Array,
  idx: number[],
  k: number,
  maxDist: number,
): [number, number][] {
  const seen = new Set<number>();
  const pairs: [number, number][] = [];
  for (const i of idx) {
    const cand: { j: number; d: number }[] = [];
    for (const j of idx) {
      if (j === i) continue;
      const d = Math.hypot(
        pos[i * 3] - pos[j * 3],
        pos[i * 3 + 1] - pos[j * 3 + 1],
        pos[i * 3 + 2] - pos[j * 3 + 2],
      );
      if (d <= maxDist) cand.push({ j, d });
    }
    cand.sort((a, b) => a.d - b.d);
    for (const { j } of cand.slice(0, k)) {
      const key = Math.min(i, j) * 4096 + Math.max(i, j);
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([i, j]);
    }
  }
  return pairs;
}

type IconShape = { pts: Vec3[]; edges: [number, number][]; scale: number[] };

/** Rectangle outline sampled with n points; corners are always included. */
function rectLoop(w: number, h: number, n: number, cy = 0): Vec3[] {
  const corners: [number, number][] = [
    [-w / 2, h / 2 + cy],
    [w / 2, h / 2 + cy],
    [w / 2, -h / 2 + cy],
    [-w / 2, -h / 2 + cy],
  ];
  const sides = [w, h, w, h];
  const extra = Math.max(0, n - 4);
  const per = sides.map((s) => Math.floor((extra * s) / (2 * (w + h))));
  let rem = extra - per.reduce((a, b) => a + b, 0);
  for (let s = 0; rem > 0; s = (s + 1) % 4, rem--) per[s]++;
  const pts: Vec3[] = [];
  for (let s = 0; s < 4; s++) {
    const [ax, ay] = corners[s];
    const [bx, by] = corners[(s + 1) % 4];
    pts.push([ax, ay, 0]);
    for (let i = 1; i <= per[s]; i++) {
      const t = i / (per[s] + 1);
      pts.push([ax + (bx - ax) * t, ay + (by - ay) * t, 0]);
    }
  }
  return pts.slice(0, Math.max(n, 4));
}

function loopEdges(start: number, n: number): [number, number][] {
  const e: [number, number][] = [];
  for (let i = 0; i < n; i++) e.push([start + i, start + ((i + 1) % n)]);
  return e;
}

function chainEdges(start: number, n: number): [number, number][] {
  const e: [number, number][] = [];
  for (let i = 0; i < n - 1; i++) e.push([start + i, start + i + 1]);
  return e;
}

function nearestIndex(pts: Vec3[], range: [number, number], p: Vec3) {
  let best = range[0];
  let bestD = Infinity;
  for (let i = range[0]; i < range[1]; i++) {
    const d = Math.hypot(pts[i][0] - p[0], pts[i][1] - p[1]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** Browser window: outline, address bar line, three dots. */
function browserIcon(k: number): IconShape {
  const pts: Vec3[] = [];
  const scale: number[] = [];
  const edges: [number, number][] = [];
  const dots = 3;
  const rest = k - dots;
  const bar = Math.max(1, Math.round(rest * 0.18));
  const perim = rest - bar;
  const W = 2.5;
  const H = 1.6;
  pts.push(...rectLoop(W, H, perim));
  scale.push(...pts.map(() => 0.85));
  edges.push(...loopEdges(0, perim));
  const barY = H / 2 - 0.42;
  const barStart = pts.length;
  for (let i = 0; i < bar; i++) {
    pts.push([-W / 2 + ((i + 1) * W) / (bar + 1), barY, 0]);
    scale.push(0.6);
  }
  edges.push(...chainEdges(barStart, bar));
  edges.push([nearestIndex(pts, [0, perim], [-W / 2, barY, 0]), barStart]);
  edges.push([barStart + bar - 1, nearestIndex(pts, [0, perim], [W / 2, barY, 0])]);
  for (let i = 0; i < dots; i++) {
    pts.push([-W / 2 + 0.24 + i * 0.22, H / 2 - 0.2, 0.02]);
    scale.push(0.55);
  }
  return { pts, edges, scale };
}

/** Phone: tall outline, speaker slot, home dot. */
function phoneIcon(k: number): IconShape {
  const pts: Vec3[] = [];
  const scale: number[] = [];
  const edges: [number, number][] = [];
  const speaker = k >= 20 ? 3 : 2;
  const perim = k - speaker - 1;
  pts.push(...rectLoop(1.05, 1.85, perim));
  scale.push(...pts.map(() => 0.85));
  edges.push(...loopEdges(0, perim));
  const s0 = pts.length;
  for (let i = 0; i < speaker; i++) {
    pts.push([-0.14 + (0.28 * i) / (speaker - 1), 0.68, 0]);
    scale.push(0.5);
  }
  edges.push(...chainEdges(s0, speaker));
  pts.push([0, -0.68, 0.02]);
  scale.push(1.1);
  return { pts, edges, scale };
}

/** Agent: a hub with two rings — a thinking node connected to its tools. */
function agentIcon(k: number): IconShape {
  const pts: Vec3[] = [[0, 0, 0.05]];
  const scale: number[] = [1.9];
  const edges: [number, number][] = [];
  const inner = Math.max(3, Math.floor((k - 1) * 0.36));
  const outer = k - 1 - inner;
  for (let i = 0; i < inner; i++) {
    const a = (i / inner) * Math.PI * 2 + 0.3;
    pts.push([Math.cos(a) * 0.48, Math.sin(a) * 0.48, Math.sin(a * 2) * 0.08]);
    scale.push(0.95);
    edges.push([0, 1 + i]);
  }
  const o0 = pts.length;
  for (let i = 0; i < outer; i++) {
    const a = (i / outer) * Math.PI * 2;
    pts.push([Math.cos(a) * 0.95, Math.sin(a) * 0.95, Math.cos(a * 3) * 0.06]);
    scale.push(0.6);
  }
  edges.push(...loopEdges(o0, outer));
  for (let i = 0; i < outer; i += 2) {
    edges.push([nearestIndex(pts, [1, o0], pts[o0 + i]), o0 + i]);
  }
  return { pts, edges, scale };
}

/** Workflow: four step nodes in a zig-zag chain with flow points between. */
function workflowIcon(k: number): IconShape {
  const steps: Vec3[] = [
    [-1.3, -0.45, 0],
    [-0.45, 0.45, 0],
    [0.45, -0.45, 0],
    [1.3, 0.45, 0],
  ];
  const between = k - steps.length;
  const per = [0, 0, 0];
  for (let i = 0; i < between; i++) per[i % 3]++;
  const pts: Vec3[] = [];
  const scale: number[] = [];
  for (let s = 0; s < steps.length; s++) {
    pts.push(steps[s]);
    scale.push(1.7);
    if (s < 3) {
      const [ax, ay] = steps[s];
      const [bx, by] = steps[s + 1];
      for (let i = 1; i <= per[s]; i++) {
        const t = i / (per[s] + 1);
        pts.push([ax + (bx - ax) * t, ay + (by - ay) * t, 0]);
        scale.push(0.45);
      }
    }
  }
  return { pts, edges: chainEdges(0, pts.length), scale };
}

const ICONS = [browserIcon, phoneIcon, agentIcon, workflowIcon];

// ─── model builder ────────────────────────────────────────────────────────────

export function buildLattice(dims: [number, number, number]): LatticeModel {
  const [nx, ny, nz] = dims;
  const N = nx * ny * nz;
  const rand = mulberry32(20260517);
  const spacing = 2 / (Math.max(nx, ny, nz) - 1);

  // Grid coordinates (the "assembled software system").
  const grid = new Float32Array(N * 3);
  const gi: Vec3[] = [];
  for (let iz = 0; iz < nz; iz++)
    for (let iy = 0; iy < ny; iy++)
      for (let ix = 0; ix < nx; ix++) {
        const i = ix + iy * nx + iz * nx * ny;
        gi[i] = [ix, iy, iz];
        grid[i * 3] = (ix - (nx - 1) / 2) * spacing;
        grid[i * 3 + 1] = (iy - (ny - 1) / 2) * spacing;
        grid[i * 3 + 2] = (iz - (nz - 1) / 2) * spacing;
      }

  // ── edge registry (edges are deduplicated within a set, not across sets) ──
  const edgeList: number[] = [];
  const edgeSet: number[] = [];
  const edgeOrder: number[] = [];
  const setKeys = new Map<number, Map<number, number>>();
  const addEdge = (a: number, b: number, set: number, order = 0) => {
    if (a === b) return -1;
    const key = Math.min(a, b) * 4096 + Math.max(a, b);
    let m = setKeys.get(set);
    if (!m) setKeys.set(set, (m = new Map()));
    const hit = m.get(key);
    if (hit !== undefined) return hit;
    const idx = edgeSet.length;
    edgeList.push(a, b);
    edgeSet.push(set);
    edgeOrder.push(order);
    m.set(key, idx);
    return idx;
  };

  // Grid edges — axis neighbours. Draw order sweeps bottom→top, back→front.
  const gridEdges: number[] = [];
  for (let i = 0; i < N; i++) {
    const [ix, iy, iz] = gi[i];
    const nbrs: [number, number, number][] = [
      [ix + 1, iy, iz],
      [ix, iy + 1, iz],
      [ix, iy, iz + 1],
    ];
    for (const [x, y, z] of nbrs) {
      if (x >= nx || y >= ny || z >= nz) continue;
      const j = x + y * nx + z * nx * ny;
      const order =
        (iy / Math.max(1, ny - 1)) * 0.6 + (iz / Math.max(1, nz - 1)) * 0.25 + rand() * 0.15;
      gridEdges.push(addEdge(i, j, EDGE_SET.grid, order));
    }
  }

  const all = Array.from({ length: N }, (_, i) => i);
  const edgesFromPairs = (pairs: [number, number][], set: number) =>
    pairs.map(([a, b]) => addEdge(a, b, set));

  // We need the final edge count before allocating per-state alpha arrays,
  // so states are described first and their edge alphas filled afterwards.
  type Pending = { state: Omit<LatticeState, "edgeAlpha">; alpha: Map<number, number> };
  const pending: Pending[] = [];
  const alphaOf = (ids: number[], a: number, into = new Map<number, number>()) => {
    ids.forEach((e) => into.set(e, a));
    return into;
  };
  const filled = (v: number) => new Float32Array(N).fill(v);
  const jitterScale = (base: number, spread: number) =>
    Float32Array.from({ length: N }, () => base + (rand() * 2 - 1) * spread);
  const gridScaled = (s: number, sx = 1, sy = 1, sz = 1) =>
    Float32Array.from(grid, (v, i) => v * s * (i % 3 === 0 ? sx : i % 3 === 1 ? sy : sz));

  // 0 — HERO: scattered idea nodes, a few faint first connections.
  {
    const local = scatter(N, rand, [1, 1, 0.75], 0.28, true);
    const ids = edgesFromPairs(nearestPairs(local, all, 1, 0.5), EDGE_SET.loose);
    pending.push({
      state: {
        name: "hero",
        local,
        scale: Float32Array.from({ length: N }, () => 0.45 + rand() * 0.85),
        group: new Uint8Array(N),
        groups: [group({ anchor: "hero-stage", size: 0.95, spin: 0.03, parallax: 0.7 })],
        params: {
          nodeScale: 1,
          drift: 1,
          pointer: 1,
          flow: 0,
          scan: 0,
          halo: 0.75,
          line: 0.55,
          night: 0,
        },
      },
      alpha: alphaOf(ids, 0.45),
    });
  }

  // 1 — DISCOVER: the nodes gather into one cloud.
  {
    const local = scatter(N, rand, [0.62, 0.62, 0.62], 0.12, true);
    const ids = edgesFromPairs(nearestPairs(local, all, 2, 0.4), EDGE_SET.loose);
    pending.push({
      state: {
        name: "discover",
        local,
        scale: jitterScale(0.8, 0.2),
        group: new Uint8Array(N),
        groups: [group({ anchor: "process-stage", size: 0.9, spin: 0.08, parallax: 1 })],
        params: {
          nodeScale: 0.85,
          drift: 0.5,
          pointer: 0.5,
          flow: 0,
          scan: 0,
          halo: 0.6,
          line: 0.7,
          night: 0,
        },
      },
      alpha: alphaOf(ids, 0.35),
    });
  }

  // 2 — DESIGN: grid positions, front-on view, blueprint lines draw in.
  pending.push({
    state: {
      name: "design",
      local: gridScaled(0.85),
      scale: filled(0.55),
      group: new Uint8Array(N),
      groups: [group({ anchor: "process-stage", size: 0.56, rot: [-0.16, 0.38, 0], parallax: 1 })],
      params: {
        nodeScale: 0.6,
        drift: 0.1,
        pointer: 0.2,
        flow: 0,
        scan: 0,
        halo: 0.35,
        line: 0.85,
        night: 0,
      },
    },
    alpha: alphaOf(gridEdges, 0.9),
  });

  // 3 — BUILD: full 3D lattice, slow spin, particles flow along every line.
  pending.push({
    state: {
      name: "build",
      local: gridScaled(0.85),
      scale: jitterScale(1, 0.1),
      group: new Uint8Array(N),
      groups: [group({ anchor: "process-stage", size: 0.54, rot: ISO, spin: 0.14, parallax: 1 })],
      params: {
        nodeScale: 1,
        drift: 0.12,
        pointer: 0.2,
        flow: 1,
        scan: 0,
        halo: 0.6,
        line: 0.8,
        night: 0,
      },
    },
    alpha: alphaOf(gridEdges, 1),
  });

  // 4 — QA: same structure, scan light sweeps, nodes pulse as they're checked.
  pending.push({
    state: {
      name: "qa",
      local: gridScaled(0.85),
      scale: jitterScale(1, 0.05),
      group: new Uint8Array(N),
      groups: [group({ anchor: "process-stage", size: 0.54, rot: ISO, spin: 0.06, parallax: 1 })],
      params: {
        nodeScale: 1,
        drift: 0.06,
        pointer: 0.2,
        flow: 0.25,
        scan: 1,
        halo: 0.7,
        line: 0.8,
        night: 0,
      },
    },
    alpha: alphaOf(gridEdges, 1),
  });

  // 5 — LAUNCH: locks tight, glows, lifts.
  pending.push({
    state: {
      name: "launch",
      local: gridScaled(0.74),
      scale: filled(1.05),
      group: new Uint8Array(N),
      groups: [
        group({
          anchor: "process-stage",
          size: 0.6,
          rot: [-0.5, 0.785, 0],
          spin: 0.05,
          lift: 0.12,
          parallax: 1,
        }),
      ],
      params: {
        nodeScale: 1.05,
        drift: 0.03,
        pointer: 0.15,
        flow: 0.35,
        scan: 0,
        halo: 1,
        line: 1.05,
        night: 0,
      },
    },
    alpha: alphaOf(gridEdges, 1),
  });

  // 6 — IMPACT: the system expands across the section; four nodes anchor to stat panels.
  {
    const stretch = gridScaled(0.9, 1, 0.85, 0.55);
    const grp = new Uint8Array(N);
    const scale = jitterScale(0.75, 0.15);
    const front = nz - 1;
    const midY = Math.floor((ny - 1) / 2);
    const xs = nx >= 5 ? [0, 1, nx - 2, nx - 1] : [0, 1, 2, 3].map((v) => Math.min(v, nx - 1));
    xs.forEach((ix, k) => {
      const i = ix + midY * nx + front * nx * ny;
      grp[i] = 1 + k;
      scale[i] = 1.25;
    });
    pending.push({
      state: {
        name: "impact",
        local: stretch,
        scale,
        group: grp,
        groups: [
          group({
            anchor: "impact-stage",
            fit: "stretch",
            size: 0.95,
            z: -1.2,
            rot: [-0.22, 0.28, 0],
            wobble: 0.05,
          }),
          ...[0, 1, 2, 3].map((k) =>
            group({ anchor: `impact-stat-${k}`, size: 0, z: 0.4, parallax: 1 }),
          ),
        ],
        params: {
          nodeScale: 0.8,
          drift: 0.25,
          pointer: 0.35,
          flow: 0.2,
          scan: 0,
          halo: 0.6,
          line: 0.6,
          night: 0,
        },
      },
      alpha: alphaOf(gridEdges, 0.55),
    });
  }

  // 7 — SERVICES: four icon clusters (browser, phone, agent, workflow) + far dust.
  {
    const local = new Float32Array(N * 3);
    const scale = new Float32Array(N);
    const grp = new Uint8Array(N);
    const k = Math.floor(N / 4);
    // Assign nodes to clusters left→right so they travel without crossing much.
    const order = [...all].sort(
      (a, b) => grid[a * 3] - grid[b * 3] || grid[a * 3 + 1] - grid[b * 3 + 1],
    );
    const alpha = new Map<number, number>();
    for (let c = 0; c < 4; c++) {
      const ids = order.slice(c * k, c * k + k);
      const shape = ICONS[c](k);
      ids.forEach((node, j) => {
        local.set(shape.pts[j] ?? [0, 0, 0], node * 3);
        scale[node] = shape.scale[j] ?? 0.5;
        grp[node] = c;
      });
      for (const [a, b] of shape.edges) alpha.set(addEdge(ids[a], ids[b], EDGE_SET.loose), 0.9);
    }
    const dust = order.slice(4 * k);
    const dustPos = scatter(Math.max(1, dust.length), rand, [1, 1, 0.4], 0.3);
    dust.forEach((node, j) => {
      local.set(dustPos.subarray(j * 3, j * 3 + 3), node * 3);
      scale[node] = 0.35;
      grp[node] = 4;
    });
    pending.push({
      state: {
        name: "services",
        local,
        scale,
        group: grp,
        groups: [
          ...[0, 1, 2, 3].map((c) =>
            group({
              anchor: `service-${c}`,
              size: 0.78,
              wobble: 0.28,
              rot: [0.08, 0, 0],
              parallax: 0.94,
            }),
          ),
          group({ anchor: "services-stage", fit: "stretch", z: -3, parallax: 0.6 }),
        ],
        params: {
          nodeScale: 0.55,
          drift: 0.12,
          pointer: 0.2,
          flow: 0.4,
          scan: 0,
          halo: 0.55,
          line: 1,
          night: 0,
        },
      },
      alpha,
    });
  }

  // 8 — TESTIMONIALS: a calm, dim constellation behind the card deck.
  {
    const local = scatter(N, rand, [1, 1, 0.6], 0.2);
    const ids = edgesFromPairs(nearestPairs(local, all, 2, 0.55), EDGE_SET.loose);
    pending.push({
      state: {
        name: "testimonials",
        local,
        scale: Float32Array.from({ length: N }, () => 0.3 + rand() * 0.45),
        group: new Uint8Array(N),
        groups: [
          group({ anchor: "testimonials-stage", fit: "stretch", size: 1.05, z: -3.5, parallax: 1 }),
        ],
        params: {
          nodeScale: 0.5,
          drift: 0.35,
          pointer: 0.25,
          flow: 0,
          scan: 0,
          halo: 0.4,
          line: 0.4,
          night: 0,
        },
      },
      alpha: alphaOf(ids, 0.3),
    });
  }

  // 9 — CONTACT: a small 3×3×3 structure beside the form; the rest fades far back.
  let contactDone = { local: new Float32Array(0), scale: new Float32Array(0) };
  let contactCubeEdges: number[] = [];
  {
    const local = new Float32Array(N * 3);
    const assembled = new Float32Array(N * 3);
    const scale = new Float32Array(N);
    const scaleDone = new Float32Array(N);
    const grp = new Uint8Array(N);
    const inCube = (i: number) => gi[i][0] < 3 && gi[i][1] < 3 && gi[i][2] < 3;
    const far = scatter(N, rand, [1, 1, 0.5], 0.2);
    for (let i = 0; i < N; i++) {
      if (inCube(i)) {
        const p: Vec3 = [(gi[i][0] - 1) * 0.62, (gi[i][1] - 1) * 0.62, (gi[i][2] - 1) * 0.62];
        assembled.set(p, i * 3);
        // ~40% of nodes wait just outside the structure until the form is sent.
        const waiting = rand() < 0.4;
        const d = waiting ? 0.35 + rand() * 0.35 : 0;
        const len = Math.hypot(p[0], p[1], p[2]) || 1;
        local.set(
          [
            p[0] + (p[0] / len) * d + (waiting ? (rand() - 0.5) * 0.3 : 0),
            p[1] + (p[1] / len) * d,
            p[2] + (p[2] / len) * d,
          ],
          i * 3,
        );
        scale[i] = waiting ? 0.6 : 0.95;
        scaleDone[i] = 1;
      } else {
        grp[i] = 1;
        local.set(far.subarray(i * 3, i * 3 + 3), i * 3);
        assembled.set(far.subarray(i * 3, i * 3 + 3), i * 3);
        scale[i] = scaleDone[i] = 0.22;
      }
    }
    const cubeEdges = gridEdges.filter(
      (e) => inCube(edgeList[e * 2]) && inCube(edgeList[e * 2 + 1]),
    );
    const partial = new Map<number, number>();
    cubeEdges.forEach((e) => partial.set(e, rand() < 0.55 ? 0.7 : 0.08));
    pending.push({
      state: {
        name: "contact",
        local,
        scale,
        group: grp,
        groups: [
          group({ anchor: "contact-stage", size: 0.62, rot: ISO, spin: 0.1, parallax: 0.92 }),
          group({ anchor: "contact-section", fit: "stretch", z: -3.5, parallax: 0.6 }),
        ],
        params: {
          nodeScale: 0.8,
          drift: 0.12,
          pointer: 0.3,
          flow: 0.15,
          scan: 0,
          halo: 0.7,
          line: 1,
          night: 0,
        },
      },
      alpha: partial,
    });
    contactDone = { local: assembled, scale: scaleDone };
    contactCubeEdges = cubeEdges;
  }

  // 10 — FOOTER: the lattice dissolves into faint glowing points on navy.
  {
    const local = scatter(N, rand, [1, 1, 0.5], 0.18);
    const ids = edgesFromPairs(nearestPairs(local, all, 1, 0.45), EDGE_SET.loose);
    pending.push({
      state: {
        name: "footer",
        local,
        scale: Float32Array.from({ length: N }, () => 0.4 + rand() * 0.6),
        group: new Uint8Array(N),
        groups: [group({ anchor: "footer-stage", fit: "stretch", z: -1.5, parallax: 1 })],
        params: {
          nodeScale: 0,
          drift: 0.35,
          pointer: 0.3,
          flow: 0.15,
          scan: 0,
          halo: 1,
          line: 0.35,
          night: 1,
        },
      },
      alpha: alphaOf(ids, 0.3),
    });
  }

  // ── finalize: allocate per-state edge alpha now that E is known ──
  const E = edgeSet.length;
  const states: LatticeState[] = pending.map(({ state, alpha }) => {
    const edgeAlpha = new Float32Array(E);
    alpha.forEach((a, e) => (edgeAlpha[e] = a));
    return { ...state, edgeAlpha };
  });
  const doneAlpha = new Float32Array(E);
  contactCubeEdges.forEach((e) => (doneAlpha[e] = 1));

  const phase = new Float32Array(N * 3);
  for (let i = 0; i < phase.length; i++) phase[i] = rand() * Math.PI * 2;

  return {
    count: N,
    edges: Uint16Array.from(edgeList),
    edgeCount: E,
    edgeSet: Uint8Array.from(edgeSet),
    edgeOrder: Float32Array.from(edgeOrder),
    edgeSeed: Float32Array.from({ length: E }, () => rand()),
    states,
    contactAssembled: { ...contactDone, edgeAlpha: doneAlpha },
    delay: Float32Array.from({ length: N }, () => rand()),
    phase,
    tint: Uint8Array.from({ length: N }, () => Math.floor(rand() * 4)),
  };
}
