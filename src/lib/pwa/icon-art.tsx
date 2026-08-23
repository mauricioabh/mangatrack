/** PWA / splash chrome — match manifest `background_color` / `theme_color`. */
export const PWA_SPLASH_BACKGROUND = "#0f172a";

export const PWA_ICON_GRADIENT =
  "linear-gradient(145deg, #2563EB 0%, #7C3AED 100%)";

type IconArtProps = {
  size: number;
  variant: "launcher" | "splash";
};

/**
 * - `splash`: opaque dark full-bleed canvas (Android 12+ system splash reads icon edges).
 * - `launcher`: rounded gradient tile (home screen / legacy splash).
 */
export function PwaIconArt({ size, variant }: IconArtProps) {
  if (variant === "splash") {
    const badgeSize = Math.round(size * 0.52);
    const glyphSize = Math.round(size * 0.34);
    const badgeRadius = Math.round(badgeSize * 0.22);

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
            width: badgeSize,
            height: badgeSize,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: badgeRadius,
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
