import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import strings from "@/strings.json";

export const alt = site.seo.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated social card: navy field, lattice nodes, positioning line. */
export default function OpengraphImage() {
  const nodes = [
    [860, 140, 26],
    [980, 230, 18],
    [900, 330, 34],
    [1040, 380, 22],
    [800, 420, 16],
    [960, 500, 28],
    [1090, 170, 14],
    [760, 260, 20],
  ];
  const links = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [2, 4],
    [3, 5],
    [4, 5],
    [1, 6],
    [0, 7],
    [7, 2],
  ];
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "linear-gradient(135deg, #0B1F4B 0%, #102a63 60%, #1D4ED8 140%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <svg width="1200" height="630" style={{ position: "absolute", inset: 0 }}>
        {links.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            stroke="#93C5FD"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
        ))}
        {nodes.map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="#3B82F6"
            fillOpacity="0.85"
            stroke="#BFDBFE"
            strokeOpacity="0.8"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          width: 720,
        }}
      >
        <div
          style={{ fontSize: 26, letterSpacing: 6, color: "#93C5FD", textTransform: "uppercase" }}
        >
          {site.name}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            marginTop: 24,
            letterSpacing: -2,
          }}
        >
          {strings.hero.headline.full}
        </div>
        <div style={{ fontSize: 30, marginTop: 28, color: "#DBEAFE" }}>{site.positioning}</div>
      </div>
    </div>,
    size,
  );
}
