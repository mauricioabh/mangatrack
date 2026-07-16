import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MangaDetailContent from "@/components/MangaDetailContent";

interface MangaDetailPageProps {
  params: Promise<{
    provider: string;
    mangaId: string;
  }>;
}

export default async function MangaDetailPage({
  params,
}: MangaDetailPageProps) {
  const { userId } = await auth();
  const { provider, mangaId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <MangaDetailContent
      provider={decodeURIComponent(provider)}
      mangaId={decodeURIComponent(mangaId)}
    />
  );
}
