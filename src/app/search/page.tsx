"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import NextImage from "next/image";
import { motion } from "framer-motion";
// Cache removed - using regular fetch for fresh data

interface Manga {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  status: string;
  genres: string[];
  author?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append("query", searchQuery);
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (genreFilter !== "all") {
        params.append("genre", genreFilter);
      }

      const response = await fetch(`/api/manga/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setMangas(data.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load all manga function
  const loadAllManga = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/manga/search");
      const data = await response.json();

      const apiResponse = data as unknown as ApiResponse<Manga[]>;
      if (apiResponse.success) {
        setMangas(apiResponse.data);
      }
    } catch (error) {
      console.error("Error loading manga:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query or filters change
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (debouncedQuery.trim()) {
          params.append("query", debouncedQuery);
        }
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        if (genreFilter !== "all") {
          params.append("genre", genreFilter);
        }

        const response = await fetch(`/api/manga/search?${params}`);
        const data = await response.json();

        const apiResponse = data as unknown as ApiResponse<Manga[]>;
        if (apiResponse.success) {
          setMangas(apiResponse.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, statusFilter, genreFilter]);

  // Load all manga on component mount or handle URL query
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("q");

    if (queryParam) {
      setSearchQuery(queryParam);
    } else {
      // Load all manga initially
      loadAllManga();
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover Amazing Manga
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Find your next favorite series from our extensive collection
          </motion.p>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Search Input */}
            <div className="flex gap-4">
              <motion.div
                className="flex-1 relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <Input
                  placeholder="Search for manga titles, authors, or genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 h-12 text-lg border-2 border-blue-200 focus:border-blue-400 dark:border-blue-800 dark:focus:border-blue-600 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Search className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setGenreFilter("all");
                    loadAllManga();
                  }}
                  variant="outline"
                  className="h-12 px-6 border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-300"
                >
                  <Star className="h-5 w-5 mr-2" />
                  Browse All
                </Button>
              </motion.div>
            </div>

            {/* Filters */}
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 h-12 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="HIATUS">Hiatus</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-48 h-12 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <SelectValue placeholder="Filter by genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800">
                    <SelectItem value="all">All Genres</SelectItem>
                    <SelectItem value="Action">Action</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Comedy">Comedy</SelectItem>
                    <SelectItem value="Drama">Drama</SelectItem>
                    <SelectItem value="Fantasy">Fantasy</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                    <SelectItem value="Slice of Life">Slice of Life</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Results */}
        {mangas.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h2
              className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {searchQuery.trim()
                ? `Search Results for "${searchQuery}" (${mangas.length})`
                : `Popular Manga (${mangas.length})`}
            </motion.h2>
            <motion.div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mangas.map((manga, index) => (
                <motion.div
                  key={manga.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    rotateY: 5,
                    transition: { duration: 0.3 },
                  }}
                  className="group h-full"
                >
                  <Card className="h-full overflow-hidden border-2 border-transparent bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:via-purple-50 group-hover:to-pink-50 dark:group-hover:from-blue-900/30 dark:group-hover:via-purple-900/30 dark:group-hover:to-pink-900/30">
                    <CardHeader className="shrink-0 pb-3">
                      <div className="flex items-start space-x-4">
                        <motion.div
                          className="relative w-20 h-28 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex-shrink-0 overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          transition={{ duration: 0.3 }}
                        >
                          {manga.coverImage && (
                            <NextImage
                              src={manga.coverImage}
                              alt={manga.title}
                              width={80}
                              height={112}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <motion.div
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardTitle className="min-h-[2.75rem] text-lg line-clamp-2 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 dark:group-hover:from-blue-300 dark:group-hover:via-purple-300 dark:group-hover:to-pink-300 transition-all duration-300">
                              {manga.title}
                            </CardTitle>
                          </motion.div>
                          {manga.author && (
                            <motion.p
                              className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex min-h-5 items-center line-clamp-1"
                              title={`by ${manga.author}`}
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <BookOpen className="mr-1 h-3 w-3 shrink-0 text-blue-500" />
                              <span className="truncate">by {manga.author}</span>
                            </motion.p>
                          )}
                          <motion.div className="mt-2 flex max-h-6 flex-wrap gap-1 overflow-hidden">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                              >
                                {manga.status}
                              </Badge>
                            </motion.div>
                            {manga.genres
                              .slice(0, 2)
                              .map((genre, genreIndex) => (
                                <motion.div
                                  key={genre}
                                  whileHover={{ scale: 1.1 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: genreIndex * 0.1,
                                  }}
                                >
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20 transition-colors duration-200"
                                  >
                                    {genre}
                                  </Badge>
                                </motion.div>
                              ))}
                          </motion.div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col pt-0">
                      <motion.div
                        className="mb-4 min-h-[3.75rem]"
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardDescription className="line-clamp-3 text-gray-600 dark:text-gray-300">
                          {manga.description ?? ""}
                        </CardDescription>
                      </motion.div>
                      <motion.div
                        className="mt-auto"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link href={`/manga/${manga.id}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 group-hover:-translate-y-1 active:scale-95">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* No Results */}
        {mangas.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No manga found" : "No manga available"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search terms or filters"
                : "Try adjusting your filters to see more results"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
