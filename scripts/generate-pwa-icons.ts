import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import React from "react";
import { ImageResponse } from "next/og";
import { PwaIconArt } from "../src/lib/pwa/icon-art";

const OUT_DIR = join(process.cwd(), "public", "pwa");

const VARIANTS = [
  { file: "icon-192.png", size: 192, variant: "launcher" as const },
  { file: "icon-512.png", size: 512, variant: "splash" as const },
  { file: "icon-maskable-192.png", size: 192, variant: "splash" as const },
  { file: "icon-maskable-512.png", size: 512, variant: "splash" as const },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const { file, size, variant } of VARIANTS) {
    const response = new ImageResponse(
      React.createElement(PwaIconArt, { size, variant }),
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
