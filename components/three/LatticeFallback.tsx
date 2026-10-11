"use client";

/**
 * No-WebGL fallback: the same Build Lattice drawn as three layered SVGs
 * (far / mid / near) with CSS scroll + mouse parallax. Static and calm,
 * but still clearly the lattice.
 */

import { useEffect, useRef } from "react";

const N = 4;
const S = 46;
/** Isometric projection of a grid point. */
function iso(x: number, y: number, z: number): [number, number] {
  return [(x - z) * S * 0.87, (x + z) * S * 0.5 - y * S];
}

function buildLattice() {
  const nodes: { x: number; y: number; d: number }[] = [];
  const lines: [number, number, number, number, number][] = [];
  for (let x = 0; x < N; x++)
    for (let y = 0; y < N; y++)
      for (let z = 0; z < N; z++) {
        const [px, py] = iso(x, y, z);
        nodes.push({ x: px, y: py, d: (x + z) / (2 * N) });
        const nb: [number, number, number][] = [
          [x + 1, y, z],
          [x, y + 1, z],
          [x, y, z + 1],
        ];
        for (const [a, b, c] of nb) {
          if (a >= N || b >= N || c >= N) continue;
          const [qx, qy] = iso(a, b, c);
          lines.push([px, py, qx, qy, (x + z) / (2 * N)]);
        }
      }
  return { nodes, lines };
}

const { nodes, lines } = buildLattice();

export function LatticeFallback({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight || 1;
        el.style.setProperty("--sp", (window.scrollY / max - 0.5).toFixed(4));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={ref} className="lattice-fallback absolute inset-0 overflow-hidden">
      {/* far: faint points */}
      <svg
        className="fallback-layer"
        data-depth="far"
        viewBox="-400 -300 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 40 }, (_, i) => (
          <circle
            key={i}
            cx={((i * 97) % 800) - 400}
            cy={((i * 61) % 600) - 300}
            r={1.6 + (i % 3)}
            fill="#93C5FD"
            opacity={0.35}
          />
        ))}
      </svg>
      {/* mid: the assembled lattice */}
      <svg className="fallback-layer" data-depth="mid" viewBox="-260 -260 520 520">
        <defs>
          <radialGradient id="fb-node" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </radialGradient>
        </defs>
        <g transform="translate(0 40)">
          {lines.map(([x1, y1, x2, y2, d], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#3B82F6"
              strokeWidth={1.2}
              opacity={0.25 + d * 0.5}
            />
          ))}
          {nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={6 + n.d * 5}
              fill="url(#fb-node)"
              opacity={0.55 + n.d * 0.45}
            />
          ))}
        </g>
      </svg>
      {/* near: a few large glass nodes */}
      <svg
        className="fallback-layer"
        data-depth="near"
        viewBox="-400 -300 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {[
          [-300, -180, 18],
          [320, 200, 24],
          [260, -230, 12],
          [-340, 220, 14],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="url(#fb-node)" opacity={0.5} />
        ))}
      </svg>
    </div>
  );
}
