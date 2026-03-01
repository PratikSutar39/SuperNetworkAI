import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import { processSearchQuery } from "@/lib/ai";
import { calculateMatchScore } from "@/lib/matching";
import type { Profile, MatchCriteria } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { query, filters } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get current user's profile and match criteria
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: matchCriteria } = await supabase
      .from("match_criteria")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Use AI to extract structured search data from query
    const searchData = await processSearchQuery(query);

    // Build query for profiles
    let profileQuery = supabase
      .from("profiles")
      .select("*")
      .eq("is_public", true)
      .neq("user_id", userId);

    // Apply intent filter from AI extraction or manual filters
    const intentFilter = filters?.category || searchData.intent;
    if (intentFilter) {
      profileQuery = profileQuery.eq("intent", intentFilter);
    }

    // Apply availability filter from AI extraction or manual filters
    const availabilityFilter = filters?.availability || searchData.availability;
    if (availabilityFilter) {
      profileQuery = profileQuery.eq("availability", availabilityFilter);
    }

    // Apply skills filter: use overlaps for array matching
    const skillsFilter = filters?.skills?.length
      ? filters.skills
      : searchData.skills.length
        ? searchData.skills
        : null;

    if (skillsFilter) {
      profileQuery = profileQuery.overlaps("skills", skillsFilter);
    }

    const { data: profiles, error: profilesError } = await profileQuery;

    if (profilesError) {
      return NextResponse.json(
        { error: "Failed to search profiles" },
        { status: 500 }
      );
    }

    // Fetch users for matching profiles
    const profileUserIds = (profiles || []).map((p) => p.user_id);

    if (profileUserIds.length === 0) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const { data: users } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, onboarding_completed, created_at, updated_at")
      .in("id", profileUserIds);

    const usersMap = new Map(
      (users || []).map((u) => [u.id, u])
    );

    // Score and rank results
    const scoredResults = (profiles || [])
      .map((profile) => {
        const user = usersMap.get(profile.user_id);
        if (!user) return null;

        const { score, category } = currentProfile
          ? calculateMatchScore(
              currentProfile as Profile,
              (matchCriteria as MatchCriteria) || null,
              profile as Profile
            )
          : { score: 50, category: "teammate" as const };

        return {
          user,
          profile,
          score,
          category,
        };
      })
      .filter(
        (r): r is NonNullable<typeof r> => r !== null
      );

    // Sort by score descending
    scoredResults.sort((a, b) => b.score - a.score);

    return NextResponse.json(
      {
        results: scoredResults,
        search_metadata: {
          original_query: query,
          parsed: searchData,
          result_count: scoredResults.length,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
