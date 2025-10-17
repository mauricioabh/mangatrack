import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MangaDetailContent from "@/components/MangaDetailContent";

interface MangaDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function MangaDetailPage({
  params,
}: MangaDetailPageProps) {
  const { userId } = await auth();
  const { slug } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  return <MangaDetailContent slug={slug} />;
}
