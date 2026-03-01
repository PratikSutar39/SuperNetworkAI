"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Filter, TrendingUp, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import type { MatchSuggestion } from "@/types";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "cofounder", label: "Cofounders" },
  { value: "teammate", label: "Teammates" },
  { value: "client", label: "Clients" },
  { value: "mentor", label: "Mentors" },
];

export default function SearchPage() {
  const { status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          filters: { category: category !== "all" ? category : undefined },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-dark)]">
            Find Your Match
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Use natural language to describe who you&apos;re looking for
          </p>
        </div>

        {/* Search bar */}
        <Card variant="strong" className="p-4 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Try "React developer looking for a cofounder in AI" or "designer available part-time"'
                  className="glass-input w-full pl-12 pr-4 py-3 text-sm"
                />
              </div>
              <Button type="submit" loading={loading} size="lg">
                Search
              </Button>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-[var(--text-muted)]" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    category === cat.value
                      ? "bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)] text-white"
                      : "bg-white/60 text-[var(--text-body)] hover:bg-[var(--peach-light)]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </form>
        </Card>

        {/* Results */}
        {loading ? (
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
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
            {results.map((match) => (
              <Card
                key={match.user.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/profile/${match.user.id}`)}
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    name={match.user.name}
                    src={match.user.avatar_url}
                    size="lg"
                  />
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
                        <span className="text-sm font-semibold text-[var(--orange-primary)]">
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
        ) : searched ? (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--text-muted)]">
              No matches found. Try a different search query.
            </p>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--text-body)] font-medium">
              Describe your ideal match
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
              Our AI understands natural language. Tell us what skills, interests,
              or collaboration style you&apos;re looking for.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
