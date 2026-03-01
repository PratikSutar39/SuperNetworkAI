import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import { generateMatchCriteriaFromProfile } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();

    const {
      ikigai_love,
      ikigai_good_at,
      ikigai_world_needs,
      ikigai_paid_for,
      skills,
      interests,
      intent,
      bio,
      headline,
      portfolio_text,
      portfolio_url,
      cv_text,
      linkedin_url,
      github_url,
      twitter_url,
      website_url,
      availability,
      working_style,
    } = body;

    const supabase = getServiceSupabase();

    // Upsert profile data
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          ikigai_love,
          ikigai_good_at,
          ikigai_world_needs,
          ikigai_paid_for,
          skills: skills || [],
          interests: interests || [],
          intent,
          bio,
          headline,
          portfolio_text,
          portfolio_url,
          cv_text,
          linkedin_url,
          github_url,
          twitter_url,
          website_url,
          availability,
          working_style,
          is_public: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to save profile data" },
        { status: 500 }
      );
    }

    // Mark onboarding as completed on users table
    const { error: userError } = await supabase
      .from("users")
      .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (userError) {
      return NextResponse.json(
        { error: "Failed to update onboarding status" },
        { status: 500 }
      );
    }

    // Generate AI match criteria (non-blocking, don't fail if AI call fails)
    try {
      const matchCriteria = await generateMatchCriteriaFromProfile({
        ikigai_love: ikigai_love || "",
        ikigai_good_at: ikigai_good_at || "",
        ikigai_world_needs: ikigai_world_needs || "",
        ikigai_paid_for: ikigai_paid_for || "",
        skills: skills || [],
        interests: interests || [],
        intent: intent || "",
      });

      await supabase.from("match_criteria").upsert(
        {
          user_id: userId,
          desired_skills: matchCriteria.desired_skills,
          desired_interests: matchCriteria.desired_interests,
          desired_intent: matchCriteria.desired_intent,
          desired_availability: matchCriteria.desired_availability,
          desired_working_style: matchCriteria.desired_working_style,
          ai_generated: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch {
      // AI match criteria generation failed, but we don't fail the request
      console.error("Failed to generate AI match criteria");
    }

    return NextResponse.json(
      { message: "Onboarding completed successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
