/**
 * Smoke: Consumet multi-provider search + info against CONSUMET_BASE_URL.
 *   npx dotenv -e .env.local -- npx tsx scripts/smoke-consumet.ts
 */
import {
  getMangaInfo,
  searchManga,
  searchMangaMultiProvider,
} from "../src/lib/consumet";

(async () => {
  process.env.CONSUMET_BASE_URL ??= "https://consumet.wayool.com";

  console.log("multi search one piece…");
  const multi = await searchMangaMultiProvider("one piece", 1);
  console.log(
    JSON.stringify({
      total: multi.total,
      providers: multi.providers.map((p) => ({
        provider: p.provider,
        count: p.data.length,
        error: p.error,
      })),
      sample: multi.data.slice(0, 3).map((m) => ({
        provider: m.provider,
        id: m.id,
        title: m.title,
      })),
    })
  );

  console.log("mangahere info one_piece / one-piece…");
  for (const id of ["one_piece", "one-piece", "onepiece"]) {
    try {
      const info = await getMangaInfo("mangahere", id);
      if (info) {
        console.log(
          JSON.stringify({
            id: info.id,
            title: info.title,
            chapters: info.chapters.length,
          })
        );
        break;
      }
    } catch (e) {
      console.log(id, e instanceof Error ? e.message : e);
    }
  }

  const mh = await searchManga("mangahere", "one piece", 1);
  const first = mh.data.find((m) => /one.?piece/i.test(m.title)) ?? mh.data[0];
  if (first) {
    const info = await getMangaInfo("mangahere", first.id, first.title);
    console.log(
      JSON.stringify({
        fromSearch: first.id,
        title: info?.title,
        chapters: info?.chapters.length,
      })
    );
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
