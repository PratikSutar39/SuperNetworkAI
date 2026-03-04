"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Filter, TrendingUp, Users, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import type { MatchSuggestion } from "@/types";

const CATEGORIES = [
  { value: "all", label: "All Matches" },
  { value: "cofounder", label: "Cofounders" },
  { value: "teammate", label: "Teammates" },
  { value: "client", label: "Clients" },
  { value: "mentor", label: "Mentors" },
];

export default function MatchesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchMatches();
    }
  }, [status, router]);

  async function fetchMatches() {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filteredMatches =
    category === "all"
      ? matches
      : matches.filter((m) => m.category === category);

  const categoryColors: Record<string, "orange" | "blue" | "green" | "purple"> = {
    cofounder: "orange",
    teammate: "blue",
    client: "green",
    mentor: "purple",
  };

  return (
    <div className="min-h-screen bg-[var(--bg-warm)]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-dark)]">
              Your Matches
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              People matched to your Ikigai and preferences
            </p>
          </div>
          <Button
            variant="glass"
            onClick={() => {
              setRefreshing(true);
              setLoading(true);
              fetchMatches();
            }}
            loading={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat.value
                  ? "bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)] text-white"
                  : "glass-subtle hover:bg-[var(--peach-light)]"
              }`}
            >
              {cat.label}
              {cat.value !== "all" && (
                <span className="ml-1 opacity-70">
                  ({matches.filter((m) => m.category === cat.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Match list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-white/10 rounded w-3/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match, idx) => (
              <Card
                key={match.user.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/profile/${match.user.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar
                      name={match.user.name}
                      src={match.user.avatar_url}
                      size="lg"
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center text-white text-[10px] font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--text-dark)]">
                        {match.user.name}
                      </h3>
                      <Badge variant={categoryColors[match.category] || "default"}>
                        {match.category}
                      </Badge>
                      <div className="flex items-center gap-1 ml-auto">
                        <TrendingUp className="w-4 h-4 text-[var(--orange-primary)]" />
                        <span className="text-sm font-bold text-[var(--orange-primary)]">
                          {match.score}%
                        </span>
                      </div>
                    </div>
                    {match.profile.headline && (
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        {match.profile.headline}
                      </p>
                    )}
                    <p className="text-sm text-[var(--text-body)] mt-2">
                      {match.explanation}
                    </p>
                    {match.ikigai_alignment && (
                      <p className="text-xs text-[var(--orange-primary)] mt-1 italic">
                        {match.ikigai_alignment}
                      </p>
                    )}
                    {match.profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {match.profile.skills.slice(0, 6).map((skill) => (
                          <Badge key={skill} variant="default">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--text-body)] font-medium">
              {category !== "all"
                ? `No ${category} matches found`
                : "No matches yet"}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Complete your profile to get better matches
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
