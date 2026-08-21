"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { ProfileRow, RoadmapRow, ActivityRow, GoalRow, AchievementRow } from "@/lib/types/supabase";

export default function Dashboard() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [roadmaps, setRoadmaps] = useState<RoadmapRow[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);
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

      // Fetch profile
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Fetch roadmaps
      const {
        data: roadmapData,
        error: roadmapError,
      } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch recent activity (last 5)
      const {
        data: activityData,
        error: activityError,
      } = await supabase
        .from("activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch goals
      const {
        data: goalsData,
        error: goalsError,
      } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch achievements
      const {
        data: achievementsData,
        error: achievementsError,
      } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (profileError) {
        console.error("Error fetching profile - message:", profileError?.message);
        console.error("Error fetching profile - code:", profileError?.code);
        console.error("Error fetching profile - details:", profileError?.details);
        console.error("Error fetching profile - hint:", profileError?.hint);
      } else {
        setProfile(profileData as ProfileRow);
      }

      if (roadmapError) {
        console.error("Error fetching roadmaps - message:", roadmapError?.message);
        console.error("Error fetching roadmaps - code:", roadmapError?.code);
        console.error("Error fetching roadmaps - details:", roadmapError?.details);
        console.error("Error fetching roadmaps - hint:", roadmapError?.hint);
      } else {
        setRoadmaps(roadmapData as RoadmapRow[]);
      }

      if (activityError) {
        console.error("Error fetching activity - message:", activityError?.message);
        console.error("Error fetching activity - code:", activityError?.code);
        console.error("Error fetching activity - details:", activityError?.details);
        console.error("Error fetching activity - hint:", activityError?.hint);
      } else {
        setRecentActivity(activityData as ActivityRow[]);
      }

      if (goalsError) {
        console.error("Error fetching goals - message:", goalsError?.message);
        console.error("Error fetching goals - code:", goalsError?.code);
        console.error("Error fetching goals - details:", goalsError?.details);
        console.error("Error fetching goals - hint:", goalsError?.hint);
      } else {
        setGoals(goalsData as GoalRow[]);
      }

      if (achievementsError) {
        console.error("Error fetching achievements - message:", achievementsError?.message);
        console.error("Error fetching achievements - code:", achievementsError?.code);
        console.error("Error fetching achievements - details:", achievementsError?.details);
        console.error("Error fetching achievements - hint:", achievementsError?.hint);
      } else {
        setAchievements(achievementsData as AchievementRow[]);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
        <p className="text-red-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
      <header className="border-b dark.border-gray-600 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">Dashboard</h1>
          <a href="/profile" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            View Profile
          </a>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors ml-4"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2">
        {/* Welcome Section */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-medium mb-3">Welcome</h3>
          <p className="text-lg">
            Hello,{" "}
            {profile.username || "User"}
          </p>
        </div>

        {/* Cybersecurity Interests Section */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-medium mb-3">Cybersecurity Interests</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            {profile.interests?.length
              ? profile.interests.map((interest: string) => (
                  <li key={interest} className="flex items-center gap-2">
                    <span className="bg-indigo-500/20 text-indigo-300 rounded px-2 py-0.5 text-xs">
                      {interest}
                    </span>
                  </li>
                ))
              : (
                  <li className="text-gray-500">Not set</li>
                )}
          </ul>
        </div>

        {/* Goals Section */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-medium mb-3">Goals</h3>
          {goals.length > 0 ? (
            <ul className="text-sm text-gray-300 space-y-1">
              {goals.map((goal) => (
                <li key={goal.id} className="flex items-center gap-2">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-gray-400 text-xs ml-auto">
                    {goal.progress}% complete
                  </span>
                  {goal.target_date ? (
                    <span className="text-xs text-gray-500">
                      expires {new Date(goal.target_date).toLocaleDateString()}
                    </span>
                  ) : (
                    <span></span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No goals set</p>
          )}
        </div>

        {/* Roadmaps Section */}
        <div className="bg-gray-800/50 rounded-lg p-6 sm:col-span-2">
          <h3 className="font-medium mb-3">Learning Roadmaps</h3>
          {roadmaps.length > 0 ? (
            <ul className="text-sm text-gray-300 space-y-2">
              {roadmaps.map((roadmap) => (
                <li key={roadmap.id} className="flex items-center gap-3">
                  <span className="bg-indigo-500/20 text-indigo-300 rounded px-2 py-0.5 text-xs">
                    {roadmap.title}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {roadmap.domain || "—"}
                  </span>
                  <span className="text-gray-500 text-xs ml-2">
                    {roadmap.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No roadmaps yet. <a href="/roadmap" className="font-medium underline hover:text-indigo-300 transition-colors">Create your first roadmap</a>.</p>
          )}
        </div>

        {/* Achievements Section */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-medium mb-3">Achievements</h3>
          {achievements.length > 0 ? (
            <ul className="text-sm text-gray-300 space-y-1">
              {achievements.map((achievement) => (
                <li key={achievement.id} className="flex items-center gap-2">
                  <span className="bg-indigo-500/20 text-indigo-300 rounded px-2 py-0.5 text-xs">
                    {achievement.title}
                  </span>
                  <span className="text-gray-400 text-xs">
                    earned {new Date(achievement.earned_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No achievements yet</p>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-medium mb-3">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <ul className="text-sm text-gray-300 space-y-1">
              {recentActivity.map((activityItem) => (
                <li key={activityItem.id} className="flex items-center gap-2">
                  <span className="text-indigo-400 text-xs font-medium">
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
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>

        {/* Connected Platforms Section */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-medium mb-3">Connected Platforms</h3>
          <p className="text-sm text-gray-400 mb-2">
            Platforms connected to import activity.
          </p>
          <p className="text-xs text-gray-500">
            Use /platforms to manage connections.
          </p>
        </div>
      </main>

      <div className="mt-8 pt-8 border-t dark.border-gray-600">
        <p className="text-sm text-gray-500">
          CyberSync Foundation v0.1.0{" "}
          <a
            href="#"
            className="font-medium underline underline-offset-4 hover:text-indigo-300 transition-colors"
          >
            Features roadmap →
          </a>
        </p>
      </div>
    </div>
  );
}