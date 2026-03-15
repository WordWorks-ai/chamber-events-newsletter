import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Chamber Events Newsletter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          padding: "80px",
          background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 30%, #c7d2fe 60%, #a5b4fc 100%)",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(79, 70, 229, 0.12)",
            display: "flex"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "40%",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(79, 70, 229, 0.08)",
            display: "flex"
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: 700
            }}
          >
            C
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              color: "#4f46e5"
            }}
          >
            Chamber Events Newsletter
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#1e1b4b",
            maxWidth: "900px",
            marginBottom: "24px",
            display: "flex"
          }}
        >
          Scrape, preview, and export chamber event newsletters as PDF.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "#4338ca",
            lineHeight: 1.5,
            maxWidth: "700px",
            display: "flex"
          }}
        >
          80+ chambers of commerce across 35 states. Select a chamber, generate a branded newsletter, and download.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "6px",
            background: "linear-gradient(90deg, #4f46e5, #818cf8, #4f46e5)",
            display: "flex"
          }}
        />
      </div>
    ),
    { ...size }
  );
}
