import { ImageResponse } from "next/og";

type IconVariant = {
  size: number;
  maskable: boolean;
};

const VARIANTS: Record<string, IconVariant> = {
  "192": { size: 192, maskable: false },
  "512": { size: 512, maskable: false },
  "maskable-192": { size: 192, maskable: true },
  "maskable-512": { size: 512, maskable: true },
};

/** Match manifest background_color / theme_color (#0f172a). */
const ICON_GRADIENT =
  "linear-gradient(145deg, #2563EB 0%, #0f172a 55%, #0b1220 100%)";

export function generateStaticParams(): { size: string }[] {
  return Object.keys(VARIANTS).map((size) => ({ size }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
): Promise<Response> {
  const { size: sizeParam } = await params;
  const variant = VARIANTS[sizeParam];

  if (!variant) {
    return new Response("Not found", { status: 404 });
  }

  const { size, maskable } = variant;
  // Maskable: glyph in safe zone (~80%). All variants: full-bleed dark gradient (Watchily pattern).
  const glyphSize = maskable
    ? Math.round(size * 0.42)
    : Math.round(size * 0.58);
  const radius = maskable ? 0 : Math.round(size * 0.22);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius,
        background: ICON_GRADIENT,
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
    </div>,
    { width: size, height: size },
  );
}
