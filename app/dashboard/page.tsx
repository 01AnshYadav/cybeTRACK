"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ProfileRow } from "@/lib/types/supabase";

export default function Dashboard() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
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
      <header className="border-b dark:border-gray-600 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">Dashboard</h1>
          <a href="/profile" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            View Profile
          </a>
          <button
            onClick={async () => {
              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
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
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-medium mb-3">Welcome</h3>
          <p className="text-lg">
            Hello,{" "}
            {profile.username || "User"}
          </p>
        </div>

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

        <div className="bg-gray-800/50 rounded-lg p-6 sm:col-span-2">
          <h3 className="font-medium mb-3">GitHub Integration</h3>
          <p className="text-sm text-gray-400">
            Connect your GitHub account to track repositories and contributions.
            <a
              href="/profile"
              className="font-medium underline underline-offset-4 hover:text-indigo-300 transition-colors ml-1"
            >
              Update profile
            </a>
          </p>
        </div>
      </main>

      <div className="mt-8 pt-8 border-t dark:border-gray-600">
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