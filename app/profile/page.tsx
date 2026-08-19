"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ProfileRow } from "@/lib/types/supabase";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
        error: err,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (err) {
        console.error("Error fetching profile:", err);
        setError("Error loading profile");
      } else {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setGithubUsername(data.github_username || "");
        setInterests(data.interests || []);
      }
    };

    init();
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (profile?.id === undefined) return;

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || undefined,
          bio: bio || undefined,
          github_username: githubUsername || undefined,
          interests: interests || undefined,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setSuccess("Profile updated successfully");
      setProfile(prev => prev ? { ...prev, display_name: displayName, bio, github_username: githubUsername, interests } as ProfileRow | null : null);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update profile");
    }
  };

  const handleCancel = () => setEditing(false);

  if (profile === null) {
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
          <h1 className="text-2xl font-bold tracking-wide">Profile</h1>
        </div>
      </header>

      {editing ? (
        <div className="max-w-md mx-auto p-6">
          {success && (
            <div className="bg-green-500/10 text-green-400 rounded px-4 py-3 text-sm mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 text-red-400 rounded px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                placeholder="Tell us about your cybersecurity journey..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">GitHub Username</label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="github-username"
                className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cybersecurity Interests</label>
              <p className="text-xs text-gray-500">Add interests that matter to your security journey</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInterests((prev: string[]) => [...prev, "Network Security"])}
                  className={`flex items-center justify-center rounded border ${
                    interests.includes("Network Security")
                      ? "bg-indigo-600 text-white"
                      : "border-gray-600 text-gray-300 hover:bg-indigo-500/20 transition-colors"
                  } px-3 py-1 text-xs`}
                  disabled={interests.includes("Network Security")}
                >
                  Network Security
                </button>
                <button
                  type="button"
                  onClick={() => setInterests((prev: string[]) => [...prev, "Cryptography"])}
                  className={`flex items-center justify-center rounded border ${
                    interests.includes("Cryptography")
                      ? "bg-indigo-600 text-white"
                      : "border-gray-600 text-gray-300 hover:bg-indigo-500/20 transition-colors"
                  } px-3 py-1 text-xs`}
                  disabled={interests.includes("Cryptography")}
                >
                  Cryptography
                </button>
                <button
                  type="button"
                  onClick={() => setInterests((prev: string[]) => [...prev, "Forensics"])}
                  className={`flex items-center justify-center rounded border ${
                    interests.includes("Forensics")
                      ? "bg-indigo-600 text-white"
                      : "border-gray-600 text-gray-300 hover:bg-indigo-500/20 transition-colors"
                  } px-3 py-1 text-xs`}
                  disabled={interests.includes("Forensics")}
                >
                  Forensics
                </button>
                <button
                  type="button"
                  onClick={() => setInterests((prev: string[]) => [...prev, "Web Security"])}
                  className={`flex items-center justify-center rounded border ${
                    interests.includes("Web Security")
                      ? "bg-indigo-600 text-white"
                      : "border-gray-600 text-gray-300 hover:bg-indigo-500/20 transition-colors"
                  } px-3 py-1 text-xs`}
                  disabled={interests.includes("Web Security")}
                >
                  Web Security
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={false}
                onClick={handleSave}
                className="flex h-12 w-full items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 transition-colors shadow-sm shadow-indigo-600/20"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="flex h-12 w-full items-center justify-center rounded-full border border-gray-400 px-5 transition-colors hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-2">Display Name</h2>
          <p className="text-lg text-gray-300">{displayName}</p>

          <h2 className="text-2xl font-bold mb-2">Username</h2>
          <p className="text-lg text-gray-300">{profile?.username}</p>

          <h2 className="text-2xl font-bold mb-2">Bio</h2>
          <p className="text-lg text-gray-300">{bio || "No bio set"}</p>

          <h2 className="text-2xl font-bold mb-2">GitHub</h2>
          {githubUsername ? (
            <a
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              @{githubUsername}
            </a>
          ) : (
            <p className="text-gray-500">Not connected</p>
          )}

          <h2 className="text-2xl font-bold mb-2">Interests</h2>
          <ul className="text-sm text-gray-300 space-y-1">
            {interests.length
              ? interests.map((interest: string) => (
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

          <button
            onClick={() => setEditing(true)}
            className="flex h-12 w-full items-center justify-center rounded-full border border-gray-400 px-5 transition-colors hover:bg-gray-700 mt-4"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}