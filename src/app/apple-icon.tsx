import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #2563EB 0%, #7C3AED 100%)",
      }}
    >
      <div
        style={{
          fontSize: 104,
          fontWeight: 800,
          color: "#ffffff",
          display: "flex",
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        M
      </div>
    </div>,
    { ...size },
  );
}
