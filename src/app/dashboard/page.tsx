"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Search,
  Users,
  MessageSquare,
  TrendingUp,
  Heart,
  Star,
  Briefcase,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import type { MatchSuggestion, Connection, Conversation } from "@/types";

function MatchCard({ match }: { match: MatchSuggestion }) {
  const router = useRouter();
  const categoryColors = {
    cofounder: "orange" as const,
    teammate: "blue" as const,
    client: "green" as const,
    mentor: "purple" as const,
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/profile/${match.user.id}`)}>
      <div className="flex items-start gap-4">
        <Avatar name={match.user.name} src={match.user.avatar_url} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[var(--text-dark)] truncate">
              {match.user.name}
            </h3>
            <Badge variant={categoryColors[match.category]}>
              {match.category}
            </Badge>
          </div>
          {match.profile.headline && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5 truncate">
              {match.profile.headline}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-[var(--orange-primary)]" />
              <span className="text-sm font-semibold text-[var(--orange-primary)]">
                {match.score}% match
              </span>
            </div>
          </div>
          <p className="text-sm text-[var(--text-body)] mt-2 line-clamp-2">
            {match.explanation}
          </p>
          {match.matching_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {match.matching_skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProfileCompletionBar({ profile }: { profile: Record<string, unknown> | null }) {
  if (!profile) return null;

  const fields = [
    "ikigai_love",
    "ikigai_good_at",
    "ikigai_world_needs",
    "ikigai_paid_for",
    "bio",
    "headline",
    "skills",
    "interests",
    "intent",
    "availability",
    "working_style",
  ];

  const filled = fields.filter((f) => {
    const val = profile[f];
    if (Array.isArray(val)) return val.length > 0;
    return val && val !== "";
  }).length;

  const pct = Math.round((filled / fields.length) * 100);

  return (
    <Card variant="subtle" className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-dark)]">
          Profile Completion
        </span>
        <span className="text-sm font-semibold text-[var(--orange-primary)]">
          {pct}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.matches || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingSuggestions(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    fetchSuggestions();

    // Fetch profile
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile))
      .catch(() => {});

    // Fetch connections
    fetch("/api/connections")
      .then((r) => r.json())
      .then((d) => setConnections(d.connections?.filter((c: Connection) => c.status === "pending") || []))
      .catch(() => {});

    // Fetch conversations
    fetch("/api/messages?type=conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {});
  }, [status, router, fetchSuggestions]);

  function handleRefresh() {
    setRefreshing(true);
    setLoadingSuggestions(true);
    fetchSuggestions();
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--orange-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const pendingConnections = connections.filter(
    (c) => c.recipient_id === (session?.user as { id: string })?.id
  );

  return (
    <div className="min-h-screen bg-[var(--bg-warm)]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-dark)]">
            Welcome back, {session?.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Here are your personalized suggestions based on your Ikigai
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick search */}
            <Card
              variant="subtle"
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push("/search")}
            >
              <div className="flex items-center gap-3 text-[var(--text-muted)]">
                <Search className="w-5 h-5" />
                <span className="text-sm">
                  Search for cofounders, teammates, or clients...
                </span>
              </div>
            </Card>

            {/* Suggestions header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[var(--orange-primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text-dark)]">
                  Suggested for You
                </h2>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={handleRefresh}
                loading={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Suggestion cards */}
            {loadingSuggestions ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((match) => (
                  <MatchCard key={match.user.id} match={match} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Heart className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--text-muted)]">
                  No suggestions yet. Complete your profile to get matched!
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push("/onboarding")}
                >
                  Complete Profile
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileCompletionBar profile={profile} />

            {/* Pending Connections */}
            <Card variant="subtle" className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[var(--orange-primary)]" />
                <h3 className="text-sm font-semibold text-[var(--text-dark)]">
                  Pending Connections
                </h3>
                {pendingConnections.length > 0 && (
                  <Badge variant="orange">{pendingConnections.length}</Badge>
                )}
              </div>
              {pendingConnections.length > 0 ? (
                <div className="space-y-2">
                  {pendingConnections.slice(0, 3).map((conn) => (
                    <div
                      key={conn.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 cursor-pointer"
                      onClick={() => router.push(`/profile/${conn.requester_id}`)}
                    >
                      <Avatar
                        name={conn.requester?.name || "User"}
                        src={conn.requester?.avatar_url}
                        size="sm"
                      />
                      <span className="text-sm text-[var(--text-body)] truncate">
                        {conn.requester?.name || "Someone"} wants to connect
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  No pending requests
                </p>
              )}
            </Card>

            {/* Unread Messages */}
            <Card variant="subtle" className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-[var(--orange-primary)]" />
                <h3 className="text-sm font-semibold text-[var(--text-dark)]">
                  Messages
                </h3>
                {unreadMessages > 0 && (
                  <Badge variant="orange">{unreadMessages}</Badge>
                )}
              </div>
              {conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.slice(0, 3).map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 cursor-pointer"
                      onClick={() => router.push("/messages")}
                    >
                      <Avatar
                        name={conv.other_user.name}
                        src={conv.other_user.avatar_url}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-[var(--text-dark)] truncate block">
                          {conv.other_user.name}
                        </span>
                        {conv.last_message && (
                          <span className="text-xs text-[var(--text-muted)] truncate block">
                            {conv.last_message.content}
                          </span>
                        )}
                      </div>
                      {conv.unread_count > 0 && (
                        <Badge variant="orange">{conv.unread_count}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  No messages yet
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => router.push("/messages")}
              >
                View all messages
              </Button>
            </Card>

            {/* Quick Stats */}
            <Card variant="subtle" className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-[var(--orange-primary)]" />
                <h3 className="text-sm font-semibold text-[var(--text-dark)]">
                  Your Network
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-white/40">
                  <div className="text-xl font-bold text-[var(--orange-primary)]">
                    {connections.filter((c) => c.status === "accepted").length}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Connections
                  </div>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/40">
                  <div className="text-xl font-bold text-[var(--orange-primary)]">
                    {suggestions.length}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Matches
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
