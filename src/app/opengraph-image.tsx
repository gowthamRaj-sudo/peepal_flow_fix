import { ImageResponse } from "next/og";
import { BUSINESS } from "@/config/business";

export const alt = "Peepal Flow Fix Solutions — Reliable home services in Chennai";
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
          alignItems: "center",
          background: "linear-gradient(135deg, #142c53 0%, #1d76eb 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 600, letterSpacing: 4, color: "#93edda" }}>
          {BUSINESS.yearsExperience}+ YEARS OF EXPERIENCE
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, marginTop: 24 }}>
          Peepal Flow Fix Solutions
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 20, opacity: 0.9 }}>
          Plumbing · Electrical · Bathroom Renovation — Chennai &amp; OMR
        </div>
      </div>
    ),
    size,
  );
}
