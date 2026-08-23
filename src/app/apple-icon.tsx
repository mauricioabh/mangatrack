import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const ICON_GRADIENT =
  "linear-gradient(145deg, #2563EB 0%, #0f172a 55%, #0b1220 100%)";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ICON_GRADIENT,
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
