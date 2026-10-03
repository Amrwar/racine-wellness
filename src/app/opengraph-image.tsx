import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} · Personal Trainer & Naturopath in Montréal`;
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
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #142a1f 0%, #1e3a2c 60%, #3e6b50 100%)",
          color: "#f7f3ec",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: "#a9c0b0",
              display: "flex",
            }}
          />
          <span style={{ letterSpacing: 2, textTransform: "uppercase", fontSize: 22, color: "#a9c0b0" }}>
            {site.name}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, lineHeight: 1.02, letterSpacing: -2 }}>
            Train the body.
            <br />
            <span style={{ color: "#a9c0b0", fontStyle: "italic" }}>Nourish the roots.</span>
          </div>
          <div style={{ fontSize: 30, color: "#d8c9b2" }}>
            Personal trainer & naturopath · Montréal
          </div>
        </div>
      </div>
    ),
    size,
  );
}
