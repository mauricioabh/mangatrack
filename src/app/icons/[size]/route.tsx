import { ImageResponse } from "next/og";
import { PwaIconArt } from "@/lib/pwa/icon-art";

type IconVariant = {
  size: number;
  /** Full-bleed dark canvas for Android splash / maskable adaptive icons. */
  splash: boolean;
};

const VARIANTS: Record<string, IconVariant> = {
  "192": { size: 192, splash: false },
  "512": { size: 512, splash: true },
  "maskable-192": { size: 192, splash: true },
  "maskable-512": { size: 512, splash: true },
};

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

  const { size, splash } = variant;

  return new ImageResponse(
    <PwaIconArt size={size} variant={splash ? "splash" : "launcher"} />,
    { width: size, height: size },
  );
}
