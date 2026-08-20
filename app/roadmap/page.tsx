"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, User } from "@supabase/supabase-js";
import { RoadmapRow } from "@/lib/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";

export default function RoadmapPage() {
  const [user, setUser] = useState<User | null>(null);
  const [roadmaps, setRoadmaps] = useState<RoadmapRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
        .from("roadmaps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching roadmaps:", error);
      } else {
        setRoadmaps(data as RoadmapRow[]);
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

  return (
    <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
      <header className="border-b dark:border-gray-600 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">Learning Roadmap</h1>
          <a href="/dashboard" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2">
        {/* Create New Roadmap Form */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-medium mb-3">Create New Roadmap</h3>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;

            supabase
              .from("roadmaps")
              .insert({
                user_id: user.id,
                title,
                description: description || undefined,
                domain: domain || undefined,
                status: "active",
              })
              .then(({ error }) => {
                if (error) console.error("Error creating roadmap:", error);
                else {
                  setTitle("");
                  setDescription("");
                  setDomain(undefined);
                  window.location.reload();
                }
              });
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Roadmap Title</label>
                <Input
                  type="text"
                  placeholder="e.g., Web Security Mastery"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your learning goals for this roadmap..."
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cybersecurity Domain</label>
                <select
                  value={domain || ""}
                  onChange={(e) => setDomain(e.target.value as string)}
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select domain (optional)</option>
                  <option value="Networking">Networking</option>
                  <option value="Web Security">Web Security</option>
                  <option value="Forensics">Forensics</option>
                  <option value="Cryptography">Cryptography</option>
                  <option value="SOC">SOC</option>
                  <option value="CTF">CTF</option>
                  <option value="GovSec">Governance Security</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 transition-colors shadow-sm shadow-indigo-600/20"
                >
                  Create Roadmap
                </button>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="flex h-12 w-full items-center justify-center rounded-full border border-gray-400 px-5 transition-colors hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Existing Roadmaps */}
        {roadmaps.length > 0 ? (
          <div className="lg:col-span-2">
            <h3 className="font-medium mb-3">My Roadmaps</h3>
            <ul className="space-y-4">
              {roadmaps.map((roadmap) => (
                <li
                  key={roadmap.id}
                  className="bg-gray-800/50 rounded-lg p-5 border-t dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold">{roadmap.title}</h4>
                    <span
                      className={`text-sm font-medium ${roadmap.status === "completed" ? "text-green-400" : "text-indigo-400"}`}
                    >
                      {roadmap.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2">
                    {roadmap.description || "No description set"}
                  </p>

                  <div className="mt-3 pt-3 border-t dark:border-gray-600">
                    <p className="text-xs text-gray-500">Domain: {roadmap.domain || "General"}</p>
                    <p className="text-xs text-gray-500">
                      Target: {roadmap.target_date ? new Date(roadmap.target_date).toLocaleDateString() : "No target date"}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="mt-2 w-full text-sm"
                    onClick={() => {
                      // Navigate to roadmap detail - for now just reload
                      window.location.reload();
                    }}
                  >
                    View Details
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="lg:col-span-2 text-center py-12">
            <p className="text-gray-500">No roadmaps yet</p>
            <p className="text-sm mt-2">
              Create your first roadmap to track your cybersecurity learning journey.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}