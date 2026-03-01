"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Save,
  Heart,
  Target,
  Globe,
  Briefcase,
  X,
  Plus,
  Github,
  Linkedin,
  Twitter,
  LinkIcon,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import type { Profile } from "@/types";

function SkillEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!skills.includes(input.trim())) {
        onChange([...skills, input.trim()]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--peach-light)] text-[var(--orange-primary)] border border-[var(--glass-border-orange)]"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              className="hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type and press Enter to add"
          className="glass-input flex-1 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            if (input.trim() && !skills.includes(input.trim())) {
              onChange([...skills, input.trim()]);
              setInput("");
            }
          }}
          className="p-2 rounded-lg hover:bg-[var(--peach-light)] text-[var(--text-muted)]"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => {
          setProfile(d.profile);
          setEditData(d.profile || {});
        })
        .catch(() => {});
    }
  }, [status, router]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setEditing(false);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || !profile) {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar
              name={session?.user?.name || "User"}
              src={session?.user?.image}
              size="xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-dark)]">
                {session?.user?.name}
              </h1>
              {profile.headline && (
                <p className="text-[var(--text-muted)]">{profile.headline}</p>
              )}
              {profile.intent && (
                <Badge variant="orange" className="mt-1">
                  Looking for: {profile.intent}
                </Badge>
              )}
            </div>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => { setEditing(false); setEditData(profile); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                <Save className="w-4 h-4 mr-1.5" />
                Save
              </Button>
            </div>
          ) : (
            <Button variant="glass" onClick={() => setEditing(true)}>
              <Edit3 className="w-4 h-4 mr-1.5" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ikigai Section */}
          <Card className="md:col-span-2">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[var(--orange-primary)]" />
                Your Ikigai
              </div>
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { key: "ikigai_love", label: "What I Love", color: "border-l-orange-400" },
                { key: "ikigai_good_at", label: "What I'm Good At", color: "border-l-blue-400" },
                { key: "ikigai_world_needs", label: "What the World Needs", color: "border-l-green-400" },
                { key: "ikigai_paid_for", label: "What I Can Be Paid For", color: "border-l-purple-400" },
              ].map(({ key, label, color }) => (
                <div key={key} className={`p-4 rounded-xl bg-white/40 border-l-4 ${color}`}>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  {editing ? (
                    <Textarea
                      value={(editData as Record<string, string>)[key] || ""}
                      onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-[var(--text-body)]">
                      {(profile as unknown as Record<string, string>)[key] || "Not filled in yet"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Bio & Headline */}
          <Card>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--orange-primary)]" />
                About
              </div>
            </CardTitle>
            {editing ? (
              <div className="space-y-3 mt-3">
                <Input
                  label="Headline"
                  value={editData.headline || ""}
                  onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                />
                <Textarea
                  label="Bio"
                  value={editData.bio || ""}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows={4}
                />
              </div>
            ) : (
              <p className="text-sm text-[var(--text-body)] mt-3">
                {profile.bio || "No bio yet"}
              </p>
            )}
          </Card>

          {/* Skills & Interests */}
          <Card>
            <CardTitle>Skills & Interests</CardTitle>
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Skills
                </p>
                {editing ? (
                  <SkillEditor
                    skills={editData.skills || []}
                    onChange={(skills) => setEditData({ ...editData, skills })}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.length > 0
                      ? profile.skills.map((s) => (
                          <Badge key={s} variant="orange">{s}</Badge>
                        ))
                      : <span className="text-sm text-[var(--text-muted)]">No skills added</span>}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Interests
                </p>
                {editing ? (
                  <SkillEditor
                    skills={editData.interests || []}
                    onChange={(interests) => setEditData({ ...editData, interests })}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.length > 0
                      ? profile.interests.map((i) => (
                          <Badge key={i} variant="blue">{i}</Badge>
                        ))
                      : <span className="text-sm text-[var(--text-muted)]">No interests added</span>}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Social Links */}
          <Card>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--orange-primary)]" />
                Social Profiles
              </div>
            </CardTitle>
            {editing ? (
              <div className="space-y-3 mt-3">
                <Input
                  label="LinkedIn"
                  value={editData.linkedin_url || ""}
                  onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
                <Input
                  label="GitHub"
                  value={editData.github_url || ""}
                  onChange={(e) => setEditData({ ...editData, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                />
                <Input
                  label="Twitter"
                  value={editData.twitter_url || ""}
                  onChange={(e) => setEditData({ ...editData, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                />
                <Input
                  label="Website"
                  value={editData.website_url || ""}
                  onChange={(e) => setEditData({ ...editData, website_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                {[
                  { url: profile.linkedin_url, icon: Linkedin, label: "LinkedIn" },
                  { url: profile.github_url, icon: Github, label: "GitHub" },
                  { url: profile.twitter_url, icon: Twitter, label: "Twitter" },
                  { url: profile.website_url, icon: LinkIcon, label: "Website" },
                ].map(({ url, icon: Icon, label }) =>
                  url ? (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[var(--text-body)] hover:text-[var(--orange-primary)] transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </a>
                  ) : null
                )}
                {!profile.linkedin_url &&
                  !profile.github_url &&
                  !profile.twitter_url &&
                  !profile.website_url && (
                    <p className="text-sm text-[var(--text-muted)]">
                      No social profiles added
                    </p>
                  )}
              </div>
            )}
          </Card>

          {/* Working Preferences */}
          <Card>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[var(--orange-primary)]" />
                Working Preferences
              </div>
            </CardTitle>
            {editing ? (
              <div className="space-y-4 mt-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-dark)] mb-2">Availability</p>
                  <div className="flex flex-wrap gap-2">
                    {["full-time", "part-time", "freelance", "flexible"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setEditData({ ...editData, availability: opt })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          editData.availability === opt
                            ? "bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)] text-white"
                            : "glass-input"
                        }`}
                      >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-dark)] mb-2">Working Style</p>
                  <div className="flex flex-wrap gap-2">
                    {["remote", "hybrid", "in-person", "flexible"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setEditData({ ...editData, working_style: opt })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          editData.working_style === opt
                            ? "bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)] text-white"
                            : "glass-input"
                        }`}
                      >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Availability</span>
                  <Badge variant="default">
                    {profile.availability || "Not set"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Working Style</span>
                  <Badge variant="default">
                    {profile.working_style || "Not set"}
                  </Badge>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
