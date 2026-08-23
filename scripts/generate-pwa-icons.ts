import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import React from "react";
import { ImageResponse } from "next/og";

const OUT_DIR = join(process.cwd(), "public", "pwa");

const ICON_GRADIENT =
  "linear-gradient(145deg, #2563EB 0%, #0f172a 55%, #0b1220 100%)";

type Variant = { file: string; size: number; maskable: boolean };

const VARIANTS: Variant[] = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "icon-maskable-192.png", size: 192, maskable: true },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
];

function IconArt({ size, maskable }: { size: number; maskable: boolean }) {
  const glyphSize = maskable
    ? Math.round(size * 0.42)
    : Math.round(size * 0.58);
  const radius = maskable ? 0 : Math.round(size * 0.22);

  return React.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius,
        background: ICON_GRADIENT,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          fontSize: glyphSize,
          fontWeight: 800,
          color: "#ffffff",
          display: "flex",
          lineHeight: 1,
          letterSpacing: "-0.04em",
        },
      },
      "M",
    ),
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const { file, size, maskable } of VARIANTS) {
    const response = new ImageResponse(
      React.createElement(IconArt, { size, maskable }),
      { width: size, height: size },
    );
    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(join(OUT_DIR, file), bytes);
    console.log(`wrote public/pwa/${file} (${bytes.length} bytes)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
