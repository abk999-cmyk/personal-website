import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — AI Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "#0a0a0b",
          color: "#f2f1ec",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 14, height: "100%", background: "#d4ff3a" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, letterSpacing: 4, color: "#8b8b90" }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#d4ff3a" }} />
          AI ENGINEER · BOSTON, MA
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 132, fontWeight: 800, letterSpacing: -6, lineHeight: 0.95, marginTop: 20 }}>
          <div>Abhinav</div>
          <div>Karthik</div>
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#8b8b90", maxWidth: 900, lineHeight: 1.3 }}>
          Agents, optimisation and evolutionary systems that actually ship.
        </div>
        <div style={{ position: "absolute", right: 72, bottom: 72, fontSize: 22, letterSpacing: 3, color: "#5c5c62" }}>
          ABHINAV.APP
        </div>
      </div>
    ),
    { ...size },
  );
}
