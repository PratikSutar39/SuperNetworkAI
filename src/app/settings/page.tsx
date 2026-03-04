"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Shield,
  Save,
  UserX,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card, { CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import type { VisibilitySettings, BlockedUser, User } from "@/types";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-[var(--text-dark)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked
            ? "bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)]"
            : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-gray-200 rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<VisibilitySettings | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<(BlockedUser & { blocked_user?: User })[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => {
          if (d.visibility_settings) setSettings(d.visibility_settings);
        })
        .catch(() => {});

      fetch("/api/connections?type=blocked")
        .then((r) => r.json())
        .then((d) => setBlockedUsers(d.blocked || []))
        .catch(() => {});
    }
  }, [status, router]);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility_settings: settings }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  async function handleUnblock(blockedId: string) {
    try {
      await fetch("/api/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked_id: blockedId }),
      });
      setBlockedUsers((prev) => prev.filter((b) => b.blocked_id !== blockedId));
    } catch {
      // silently fail
    }
  }

  if (status === "loading" || !settings) {
    return (
      <div className="min-h-screen bg-[var(--bg-warm)]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--orange-primary)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-warm)]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-[var(--text-dark)] mb-8">
          Settings
        </h1>

        {/* Visibility Settings */}
        <Card className="mb-6">
          <CardTitle>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--orange-primary)]" />
              Profile Visibility
            </div>
          </CardTitle>
          <CardDescription>
            Control what others can see on your profile
          </CardDescription>

          <div className="divide-y divide-white/20 mt-4">
            <ToggleRow
              label="Profile Discoverable"
              description="Allow others to find you through search and suggestions"
              checked={settings.profile_discoverable}
              onChange={(v) =>
                setSettings({ ...settings, profile_discoverable: v })
              }
            />
            <ToggleRow
              label="Show Email"
              description="Display your email address on your public profile"
              checked={settings.show_email}
              onChange={(v) => setSettings({ ...settings, show_email: v })}
            />
            <ToggleRow
              label="Show Ikigai"
              description="Share your Ikigai answers with other members"
              checked={settings.show_ikigai}
              onChange={(v) => setSettings({ ...settings, show_ikigai: v })}
            />
            <ToggleRow
              label="Show Skills"
              description="Display your skills and interests publicly"
              checked={settings.show_skills}
              onChange={(v) => setSettings({ ...settings, show_skills: v })}
            />
            <ToggleRow
              label="Show Portfolio"
              description="Share your portfolio and CV information"
              checked={settings.show_portfolio}
              onChange={(v) => setSettings({ ...settings, show_portfolio: v })}
            />
            <ToggleRow
              label="Show Social Links"
              description="Display links to your social profiles"
              checked={settings.show_social_links}
              onChange={(v) =>
                setSettings({ ...settings, show_social_links: v })
              }
            />
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button variant="primary" onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              Save Changes
            </Button>
            {saved && (
              <span className="text-sm text-green-400 font-medium">
                Settings saved!
              </span>
            )}
          </div>
        </Card>

        {/* Blocked Users */}
        <Card>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--orange-primary)]" />
              Blocked Users
            </div>
          </CardTitle>
          <CardDescription>
            Users you have blocked cannot see your profile or send you messages
          </CardDescription>

          {blockedUsers.length > 0 ? (
            <div className="space-y-3 mt-4">
              {blockedUsers.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={blocked.blocked_user?.name || "User"}
                      src={blocked.blocked_user?.avatar_url}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-[var(--text-dark)]">
                      {blocked.blocked_user?.name || "Unknown User"}
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleUnblock(blocked.blocked_id)}
                  >
                    <UserX className="w-3 h-3 mr-1" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-white/5 text-center">
              <EyeOff className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-sm text-[var(--text-muted)]">
                You haven&apos;t blocked anyone
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
