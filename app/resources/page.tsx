"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, User } from "@supabase/supabase-js";
import { RoadmapSkillRow, ResourceRow } from "@/lib/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";

export default function ResourcesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newResourceType, setNewResourceType] = useState("other");
  const [newStatus, setNewStatus] = useState("not_started");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
        .from("resources")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching resources:", error);
        setError("Error loading resources");
      } else {
        setResources(data as ResourceRow[]);
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
          <h1 className="text-2xl font-bold tracking-wide">
            Learning Resources
          </h1>
          <a href="/dashboard" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Create New Resource Form */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-3">Add New Resource</h3>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!newTitle.trim()) return;

            supabase
              .from("resources")
              .insert({
                user_id: user.id,
                
                title: newTitle,
                description: newDescription || undefined,
                url: newUrl || undefined,
                resource_type: newResourceType,
                status: newStatus,
              })
              .then(({ error }) => {
                if (error) console.error("Error creating resource:", error);
                else {
                  setNewTitle("");
                  setNewDescription("");
                  setNewUrl("");
                  setNewResourceType("other");
                  setNewStatus("not_started");
                  window.location.reload();
                }
              });
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Web Security Overview"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe this resource..."
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  URL
                </label>
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Resource Type
                </label>
                <select
                  value={newResourceType}
                  onChange={(e) => setNewResourceType(e.target.value as string)}
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="article">Article</option>
                  <option value="documentation">Documentation</option>
                  <option value="course">Course</option>
                  <option value="video">Video</option>
                  <option value="book">Book</option>
                  <option value="lab">Lab</option>
                  <option value="ctf">CTF</option>
                  <option value="repository">Repository</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as string)}
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex h-10 w-full items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 transition-colors shadow-sm shadow-indigo-600/20"
                >
                  Add Resource
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewTitle("");
                    setNewDescription("");
                    setNewUrl("");
                    setNewResourceType("other");
                    setNewStatus("not_started");
                  }}
                  className="flex h-10 w-full items-center justify-center rounded-full border border-gray-400 px-5 transition-colors hover:bg-gray-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Existing Resources */}
        {resources.length > 0 ? (
          <div>
            <h3 className="font-medium mb-3">My Resources</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              {resources.map((resource) => (
                <li key={resource.id} className="flex items-center gap-3">
                  <span
                    className={`bg-indigo-500/20 text-indigo-300 rounded px-2 py-0.5 text-xs ${resource.status === "completed" ? "text-green-400" : "text-gray-400"}`}
                  >
                    {resource.title}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {resource.resource_type}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {resource.status}
                  </span>
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-indigo-400 hover:text-indigo-300 transition-colors text-xs underline"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="ml-2 text-gray-500 text-xs">No URL</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No resources yet</p>
            <p className="text-sm mt-2">
              Add your first resource to track learning materials.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}