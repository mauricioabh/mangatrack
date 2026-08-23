import React from "react";

/** PWA / splash chrome — match manifest `background_color` / `theme_color`. */
export const PWA_SPLASH_BACKGROUND = "#0f172a";

export const PWA_ICON_GRADIENT =
  "linear-gradient(145deg, #2563EB 0%, #7C3AED 100%)";

type IconArtProps = {
  size: number;
  variant: "launcher" | "splash";
};

/**
 * - `splash`: solid opaque #0f172a full canvas + white M (Android 12+ splash / maskable).
 * - `launcher`: rounded gradient tile for legacy home-screen icons.
 */
export function PwaIconArt({ size, variant }: IconArtProps) {
  if (variant === "splash") {
    const glyphSize = Math.round(size * 0.46);

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PWA_SPLASH_BACKGROUND,
        }}
      >
        <div
          style={{
            fontSize: glyphSize,
            fontWeight: 800,
            color: "#ffffff",
            display: "flex",
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          M
        </div>
      </div>
    );
  }

  const glyphSize = Math.round(size * 0.58);
  const radius = Math.round(size * 0.22);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius,
        background: PWA_ICON_GRADIENT,
      }}
    >
      <div
        style={{
          fontSize: glyphSize,
          fontWeight: 800,
          color: "#ffffff",
          display: "flex",
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        M
      </div>
    </div>
  );
}
