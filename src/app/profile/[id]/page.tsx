"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  Heart,
  Target,
  Globe,
  Briefcase,
  UserPlus,
  MessageSquare,
  ShieldOff,
  Github,
  Linkedin,
  Twitter,
  LinkIcon,
  Check,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import type { Profile, User, Connection } from "@/types";

export default function PublicProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectModal, setConnectModal] = useState(false);
  const [connectMessage, setConnectMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setProfile(data.profile);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    async function fetchConnectionStatus() {
      try {
        const res = await fetch("/api/connections");
        if (res.ok) {
          const data = await res.json();
          const conn = data.connections?.find(
            (c: { requester_id: string; recipient_id: string; status: string }) =>
              c.requester_id === userId || c.recipient_id === userId
          );
          if (conn) {
            setConnectionStatus(conn.status);
            setConnection(conn);
          }
        }
      } catch {
        // silently fail
      }
    }

    if (status === "authenticated") {
      fetchProfile();
      fetchConnectionStatus();
    }
  }, [status, userId, router]);

  async function handleConnect() {
    setSending(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: userId,
          message: connectMessage,
        }),
      });
      if (res.ok) {
        setConnectionStatus("pending");
        setConnectModal(false);
        setConnectMessage("");
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  }

  async function handleAcceptReject(newStatus: "accepted" | "rejected") {
    if (!connection) return;
    setAccepting(true);
    try {
      const res = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connection.id,
          status: newStatus,
        }),
      });
      if (res.ok) {
        setConnectionStatus(newStatus);
      }
    } catch {
      // silently fail
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-warm)]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--orange-primary)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-warm)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <ShieldOff className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-[var(--text-dark)]">
            Profile Not Found
          </h2>
          <p className="text-[var(--text-muted)] mt-2">
            This profile may be private or doesn&apos;t exist.
          </p>
          <Button variant="glass" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentUserId = (session?.user as { id: string })?.id;
  const isOwnProfile = currentUserId === userId;

  return (
    <div className="min-h-screen bg-[var(--bg-warm)]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatar_url} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-dark)]">
                {user.name}
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
          {!isOwnProfile && (
            <div className="flex gap-2">
              {connectionStatus === "accepted" ? (
                <Button
                  variant="glass"
                  onClick={() => router.push(`/messages?user=${userId}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Message
                </Button>
              ) : connectionStatus === "pending" &&
                connection?.recipient_id === currentUserId ? (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleAcceptReject("accepted")}
                    loading={accepting}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleAcceptReject("rejected")}
                    disabled={accepting}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Decline
                  </Button>
                </>
              ) : connectionStatus === "pending" ? (
                <Button variant="glass" disabled>
                  Request Pending
                </Button>
              ) : connectionStatus === "rejected" ? (
                <Button variant="glass" disabled>
                  Request Declined
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setConnectModal(true)}>
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Connect
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ikigai */}
          <Card className="md:col-span-2">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[var(--orange-primary)]" />
                Ikigai
              </div>
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { val: profile.ikigai_love, label: "What They Love", color: "border-l-orange-400" },
                { val: profile.ikigai_good_at, label: "What They're Good At", color: "border-l-blue-400" },
                { val: profile.ikigai_world_needs, label: "What the World Needs", color: "border-l-green-400" },
                { val: profile.ikigai_paid_for, label: "What They Can Be Paid For", color: "border-l-purple-400" },
              ].map(({ val, label, color }) => (
                <div key={label} className={`p-4 rounded-xl bg-white/5 border-l-4 ${color}`}>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <p className="text-sm text-[var(--text-body)]">
                    {val || "Not shared"}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* About */}
          <Card>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--orange-primary)]" />
                About
              </div>
            </CardTitle>
            <p className="text-sm text-[var(--text-body)] mt-3">
              {profile.bio || "No bio provided"}
            </p>
          </Card>

          {/* Skills */}
          <Card>
            <CardTitle>Skills & Interests</CardTitle>
            <div className="mt-3 space-y-3">
              {profile.skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s) => (
                      <Badge key={s} variant="orange">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.interests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((i) => (
                      <Badge key={i} variant="blue">{i}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Social */}
          <Card>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--orange-primary)]" />
                Social Profiles
              </div>
            </CardTitle>
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
            </div>
          </Card>

          {/* Preferences */}
          <Card>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[var(--orange-primary)]" />
                Working Preferences
              </div>
            </CardTitle>
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Availability</span>
                <Badge variant="default">{profile.availability || "Not set"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Working Style</span>
                <Badge variant="default">{profile.working_style || "Not set"}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Connect Modal */}
        <Modal
          isOpen={connectModal}
          onClose={() => setConnectModal(false)}
          title={`Connect with ${user.name}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-body)]">
              Send a connection request with an optional message.
            </p>
            <Textarea
              label="Message (optional)"
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              placeholder="Hi! I'd love to connect because..."
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setConnectModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConnect} loading={sending}>
                <UserPlus className="w-4 h-4 mr-1.5" />
                Send Request
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
