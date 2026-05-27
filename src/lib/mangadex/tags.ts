import { mangadexFetch } from "./client";
import type {
  MangaDexCollectionResponse,
  MangaDexEntity,
  MangaDexTagAttributes,
} from "./types";
import { pickLocalized } from "./locale";

let tagCache: Map<string, string> | null = null;

async function loadTagNameToId(): Promise<Map<string, string>> {
  if (tagCache) return tagCache;

  const res = await mangadexFetch<
    MangaDexCollectionResponse<MangaDexEntity<MangaDexTagAttributes>>
  >("/manga/tag");

  const map = new Map<string, string>();
  for (const tag of res.data) {
    const name = pickLocalized(tag.attributes.name);
    if (name) {
      map.set(name.toLowerCase(), tag.id);
    }
  }
  tagCache = map;
  return map;
}

export async function resolveGenreTagId(genreName: string): Promise<string | null> {
  const map = await loadTagNameToId();
  return map.get(genreName.toLowerCase()) ?? null;
}

export function clearTagCache(): void {
  tagCache = null;
}
