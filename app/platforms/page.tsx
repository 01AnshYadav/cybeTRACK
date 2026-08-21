"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

export default function PlatformsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<
    {
      platform: string;
      platform_user_id: string;
      last_synced_at: string | null;
    }[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // Fetch connected accounts (tokens are protected by RLS)
      const {
        data: accounts,
        error,
      } = await supabase
        .from("connected_accounts")
        .select("platform, platform_user_id, updated_at")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching connected accounts:", error);
      } else {
        setConnectedAccounts(
          (accounts as {
            platform: string;
            platform_user_id: string;
            updated_at: string;
          }[]).map((acc) => ({
            platform: acc.platform,
            platform_user_id: acc.platform_user_id,
            last_synced_at: acc.updated_at,
          }))
        );
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
      <header className="border-b dark.border-gray-600 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">Connected Platforms</h1>
          <a href="/dashboard" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Connected Accounts */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-3">Connected Accounts</h3>

          {connectedAccounts.length > 0 ? (
            <div className="space-y-3">
              {connectedAccounts.map((acc) => (
                <div key={acc.platform} className="p-4 border-t dark.border-gray-600">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-400 text-xl">{acc.platform}</span>
                    <span className="text-gray-400 text-sm ml-auto">
                      {acc.last_synced_at ? (
                        `Last synced: ${new Date(acc.last_synced_at).toLocaleDateString()}`
                      ) : (
                        "Never synced"
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Linked account: {acc.platform_user_id || "—"}
                  </p>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={() => {
                        window.alert(
                          "Disconnect functionality would revoke OAuth tokens and remove the connection."
                        );
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="secondary"
                      className="w-full text-sm"
                      onClick={() => syncAccountActivity(acc.platform)}
                    >
                      Sync Activity
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No connected accounts</p>
              <p className="text-sm mt-2">
                Connect a platform to track your activity and progress here.
              </p>
            </div>
          )}
        </div>

        {/* Supported Platforms */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-medium mb-3">Available Platforms</h3>
          <p className="text-sm text-gray-400 mb-4">
            Connect a platform to import your cybersecurity learning activity.
          </p>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full py-3 text-left"
              onClick={() => window.alert("GitHub OAuth flow would start here.")}
            >
              GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full py-3 text-left"
              onClick={() => window.alert("TryHackMe connection would start here.")}
            >
              TryHackMe
            </Button>
            <Button
              variant="outline"
              className="w-full py-3 text-left"
              onClick={() => window.alert("Hack The Box connection would start here.")}
            >
              Hack The Box
            </Button>
            <Button
              variant="outline"
              className="w-full py-3 text-left"
              onClick={() => window.alert("PortSwigger connection would start here.")}
            >
              PortSwigger
            </Button>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-gray-800/50 rounded-lg p-6 mt-6">
          <h3 className="font-medium mb-3">Sync Status</h3>
          <p className="text-sm text-gray-400 mb-4">
            Activity is automatically tracked when you perform actions on connected platforms.
          </p>
          <p className="text-xs text-gray-500">
            Last full sync:{(connectedAccounts.length > 0 ? connectedAccounts.map((a) => `${a.platform}: ${a.last_synced_at || "never"}`).join(", ") : "No accounts connected")}
          </p>
        </div>
      </main>
    </div>
  );
}

async function syncAccountActivity(platform: string) {
  // In a full implementation, this would trigger the platform OAuth flow
  // and then import new activity entries into the activity table
  window.alert(
    `Sync for ${platform} would import new activity entries from your platform account.`
  );
}