"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
          },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Create profile row for the new user
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            username,
            display_name: displayName,
            bio: "",
            github_username: "",
            interests: [],
            avatar_url: null,
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Profile creation failed, but auth user exists.
          // The user can create their profile later from the profile page.
          setError("Account created, but profile could not be initialized. Please complete your profile.");
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
      <div className="max-w-md mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Create account</h2>
        <p className="text-center text-gray-400 mb-6">Sign up for CyberSync</p>

        {error && (
          <div className="bg-red-500/10 text-red-400 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cybersecurity-enthusiast"
              required
              className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              required
              className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 transition-colors shadow-sm shadow-indigo-600/20"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="font-medium underline underline-offset-4 hover:text-indigo-400">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}