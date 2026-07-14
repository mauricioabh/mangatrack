import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import FeatureCards from "@/components/FeatureCards";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Treat Clerk/DB misconfig (e.g. CI placeholder keys) as signed-out so `/` stays 200.
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    userId = null;
  }

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/30">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-700 shadow-2xl border-b-4 border-white/20 dark:border-gray-800/20">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 dark:bg-gray-800/30 rounded-lg backdrop-blur-sm">
                <BookOpen className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
              <span className="text-lg font-bold text-white drop-shadow-lg">
                MangaTrack
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* UserButton is now handled by GlobalHeader */}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200 sm:text-3xl">
            Discover, Read & Track
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              {" "}
              Manga
            </span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-base text-gray-700 dark:text-gray-300 sm:text-lg">
            A beautiful, modern web app for discovering, reading, and tracking
            your favorite manga series with automated updates and seamless
            reading experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 hover:shadow-lg"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <FeatureCards />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Made with ♥ by mauricioabh</p>
        </div>
      </footer>
    </div>
  );
}
