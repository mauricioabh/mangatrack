"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BookOpen, Search, Bell } from "lucide-react";

export default function FeatureCards() {
  return (
    <div className="grid md:grid-cols-3 gap-4 mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="text-center"
      >
        <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 group card-hover">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Search className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
            </motion.div>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Discover
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Search and discover new manga from our extensive database with
              real-time updates
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="text-center"
      >
        <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/30 border-purple-200 dark:border-purple-800 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700 group card-hover">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
            </motion.div>
            <CardTitle className="text-purple-900 dark:text-purple-100">
              Read
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Enjoy smooth reading experience with our optimized manga reader
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="text-center"
      >
        <Card className="h-full bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/30 border-emerald-200 dark:border-emerald-800 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700 group card-hover">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Bell className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
            </motion.div>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">
              Track
            </CardTitle>
            <CardDescription className="text-emerald-700 dark:text-emerald-300">
              Never miss new chapters with automatic notifications and reading
              history
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
}
