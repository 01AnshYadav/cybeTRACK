"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    Array<{
      user_id: string;
      username: string;
      display_name: string | null;
      achievements_earned: number;
      activities_completed: number;
      days_since_first_activity: number;
      roadmaps_completed: number;
    }>
  >([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error("Supabase environment variables not configured");
        }

        const supa = supabase;

        const { data, error: qError } = await supa
          .from("leaderboard_ranking")
          .select("*");

        if (qError) {
          console.error("Error fetching leaderboard:", qError);
          setError("Error loading leaderboard data");
        } else {
          setLeaderboard(
            data as Array<{
              user_id: string;
              username: string;
              display_name: string | null;
              achievements_earned: number;
              activities_completed: number;
              days_since_first_activity: number;
              roadmaps_completed: number;
            }>
          );
          setLoaded(true);
        }
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load leaderboard");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-400">Loading leaderboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
        <p className="text-red-400">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
        <p className="text-gray-400">Loading leaderboard data...</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
        <p className="text-gray-400">No public profiles found on the leaderboard yet.</p>
        <p className="text-sm text-gray-500 mt-2">
          Be the first to make your profile public and start earning achievements!
        </p>
      </div>
    );
  }

  // Sort by achievements, then activities, then days (descending for achievements/activities, ascending for days)
  const sorted = [...leaderboard].sort((a, b) => {
    if (b.achievements_earned != null && a.achievements_earned != null) {
      return b.achievements_earned - a.achievements_earned;
    }
    if (b.activities_completed != null && a.activities_completed != null) {
      return b.activities_completed - a.activities_completed;
    }
    return (a.days_since_first_activity || 0) - (b.days_since_first_activity || 0);
  });

  return (
    <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
      <header className="border-b dark.border-gray-600 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">Leaderboard</h1>
          <a href="/profile" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Your Profile
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800/50 rounded-lg">
            <thead>
              <tr className="border-b dark.border-gray-600">
                <th className="text-left text-sm font-medium text-gray-300 px-6 py-3">Rank</th>
                <th className="text-left text-sm font-medium text-gray-300 px-6 py-3">User</th>
                <th className="text-left text-sm font-medium text-gray-300 px-6 py-3">Achievements</th>
                <th className="text-left text-sm font-medium text-gray-300 px-6 py-3">Activities</th>
                <th className="text-left text-sm font-medium text-gray-300 px-6 py-3">Roadmaps</th>
                <th className="text-left text-sm font-medium text-gray-300 px-6 py-3">Activity Span</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry, index) => {
                return (
                  <tr key={entry.user_id} className="hover:bg-gray-700/50">
                    <td className="text-center font-medium text-gray-300 px-6 py-4">
                      {index + 1}
                    </td>
                    <td className="text-left font-medium text-gray-200 px-6 py-4">
                      {entry.display_name || entry.username || "Unknown"}
                    </td>
                    <td className="text-center text-sm text-gray-400 px-6 py-4">
                      {entry.achievements_earned}
                    </td>
                    <td className="text-center text-sm text-gray-400 px-6 py-4">
                      {entry.activities_completed}
                    </td>
                    <td className="text-center text-sm text-gray-400 px-6 py-4">
                      {entry.roadmaps_completed}
                    </td>
                    <td className="text-center text-sm text-gray-400 px-6 py-4">
                      {entry.days_since_first_activity > 0
                        ? `${entry.days_since_first_activity}d`
                        : "Just starting"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      <div className="mt-8 pt-8 border-t dark.border-gray-600">
        <p className="text-sm text-gray-500">
          Rankings based on achievements earned, activities completed, and activity span.
        </p>
      </div>
    </div>
  );
}