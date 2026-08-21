"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { User, createClient } from "@supabase/supabase-js";
import { ActivityRow } from "@/lib/types/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ActivityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const {
        data,
        error,
      } = await supabase
        .from("activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activity:", error);
      } else {
        setActivity(data as ActivityRow[]);
      }
      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-400">Please log in</span>
      </div>
    );
  }

  const groupedActivity = activity.reduce((acc, item) => {
    const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : "unknown";
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ActivityRow[]>);

  const sortedDates = Object.keys(groupedActivity).sort(
    (a, b) => new Date(b).valueOf() - new Date(a).valueOf()
  );

  return (
    <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
      <header className="border-b dark:border-gray-600 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">
            Activity
          </h1>
          <a href="/dashboard" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {activity.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="bg-gray-800/50 rounded-lg p-6 border-t dark:border-gray-600">
                <h2 className="font-medium text-sm text-indigo-300 mb-3">
                  {date}
                </h2>
                <ul className="text-sm text-gray-300 space-y-1">
                  {groupedActivity[date].map((activityItem) => (
                    <li key={activityItem.id} className="flex items-center gap-2">
                      <span
                        className={`text-indigo-400 text-xs font-medium`}
                      >
                        {activityItem.activity_type}
                      </span>
                      <span className="text-gray-300 text-xs">
                        {activityItem.title}
                      </span>
                      <span className="text-gray-400 text-xs ml-auto">
                        {new Date(activityItem.created_at).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No activity yet</p>
            <p className="text-sm mt-2">
              Activity will appear here as you complete actions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}