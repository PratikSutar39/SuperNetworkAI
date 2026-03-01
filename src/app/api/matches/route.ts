import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import { calculateMatchScore, rankMatches } from "@/lib/matching";
import { generateMatchExplanation } from "@/lib/ai";
import type { Profile, MatchCriteria } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const supabase = getServiceSupabase();

    // Fetch current user's profile
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !currentProfile) {
      return NextResponse.json(
        { error: "Profile not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Fetch current user's match criteria
    const { data: matchCriteria } = await supabase
      .from("match_criteria")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Fetch blocked user IDs (both directions)
    const { data: blockedRows } = await supabase
      .from("blocked_users")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    const blockedUserIds = new Set<string>();
    if (blockedRows) {
      for (const row of blockedRows) {
        if (row.blocker_id === userId) {
          blockedUserIds.add(row.blocked_id);
        } else {
          blockedUserIds.add(row.blocker_id);
        }
      }
    }

    // Fetch discoverable profiles with visibility settings
    const { data: visibilitySettings } = await supabase
      .from("visibility_settings")
      .select("user_id, profile_discoverable")
      .eq("profile_discoverable", true);

    const discoverableUserIds = new Set(
      (visibilitySettings || []).map((v) => v.user_id)
    );

    // Fetch all other public profiles
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_public", true)
      .neq("user_id", userId);

    if (allProfilesError) {
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 }
      );
    }

    // Fetch all users for these profiles
    const profileUserIds = (allProfiles || []).map((p) => p.user_id);
    const { data: allUsers } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, onboarding_completed, created_at, updated_at")
      .in("id", profileUserIds);

    const usersMap = new Map(
      (allUsers || []).map((u) => [u.id, u])
    );

    // Filter: exclude blocked users and non-discoverable users
    const candidateProfiles = (allProfiles || []).filter((p) => {
      if (blockedUserIds.has(p.user_id)) return false;
      if (!discoverableUserIds.has(p.user_id)) return false;
      return true;
    });

    // Score each candidate
    const scoredMatches = candidateProfiles
      .map((matchProfile) => {
        const user = usersMap.get(matchProfile.user_id);
        if (!user) return null;

        const { score, category } = calculateMatchScore(
          currentProfile as Profile,
          (matchCriteria as MatchCriteria) || null,
          matchProfile as Profile
        );

        return {
          user,
          profile: matchProfile,
          score,
          category,
        };
      })
      .filter(
        (m): m is NonNullable<typeof m> => m !== null
      );

    // Rank matches
    const ranked = rankMatches(scoredMatches);

    // Take top 10 and generate AI explanations
    const top10 = ranked.slice(0, 10);

    const matchSuggestions = await Promise.all(
      top10.map(async (match) => {
        let explanation = "You share complementary skills and interests that could lead to a great collaboration.";
        let ikigaiAlignment = "Your Ikigai circles show potential for meaningful connection.";

        try {
          const aiExplanation = await generateMatchExplanation(
            {
              name: (session.user as { name?: string }).name || "User",
              ikigai_love: currentProfile.ikigai_love || "",
              ikigai_good_at: currentProfile.ikigai_good_at || "",
              ikigai_world_needs: currentProfile.ikigai_world_needs || "",
              ikigai_paid_for: currentProfile.ikigai_paid_for || "",
              skills: currentProfile.skills || [],
              intent: currentProfile.intent || "",
            },
            {
              name: match.user.name || "User",
              ikigai_love: match.profile.ikigai_love || "",
              ikigai_good_at: match.profile.ikigai_good_at || "",
              ikigai_world_needs: match.profile.ikigai_world_needs || "",
              ikigai_paid_for: match.profile.ikigai_paid_for || "",
              skills: match.profile.skills || [],
              intent: match.profile.intent || "",
            }
          );
          explanation = aiExplanation.explanation;
          ikigaiAlignment = aiExplanation.ikigai_alignment;
        } catch {
          // Use fallback explanation if AI call fails
        }

        // Determine matching skills
        const matchingSkills = (match.profile.skills || []).filter(
          (skill: string) =>
            (currentProfile.skills || []).some(
              (s: string) =>
                s.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(s.toLowerCase())
            )
        );

        return {
          user: match.user,
          profile: match.profile,
          score: match.score,
          category: match.category,
          explanation,
          matching_skills: matchingSkills,
          ikigai_alignment: ikigaiAlignment,
        };
      })
    );

    return NextResponse.json({ matches: matchSuggestions }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
