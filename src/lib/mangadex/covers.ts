export function buildCoverUrl(
  mangaId: string,
  fileName: string,
  size?: 256 | 512
): string {
  const base = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  if (size) {
    // MangaDex serves sized covers as {fileName}.{size}.jpg when fileName includes .jpg
    return `${base}.${size}.jpg`;
  }
  return base;
}
