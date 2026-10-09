import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { en } from "@/i18n/en";

export const alt = en.meta.titleDefault;
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
          justifyContent: "center",
          padding: 80,
          background: "#004575",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>
          <span style={{ color: "#009ffb" }}>{site.brand.first}</span>
          <span style={{ color: "#00ee81" }}>{site.brand.second}</span>
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 40, color: "#d9d9d9" }}>{en.tagline}</div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            width: 240,
            height: 8,
            borderRadius: 999,
            background: "linear-gradient(90deg, #009ffb, #00ee81)",
          }}
        />
        <div style={{ display: "flex", marginTop: 48, fontSize: 30, color: "#d9d9d9" }}>
          {en.og.sub} · {site.phone}
        </div>
      </div>
    ),
    size,
  );
}
