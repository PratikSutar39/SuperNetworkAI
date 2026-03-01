import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const supabase = getServiceSupabase();

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Remove sensitive fields
    const { password_hash: _, ...safeUser } = user;

    return NextResponse.json({ user: safeUser, profile }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const supabase = getServiceSupabase();

    // Separate user fields from profile fields
    const userFields: Record<string, unknown> = {};
    const profileFields: Record<string, unknown> = {};

    const userAllowedFields = ["name", "avatar_url"];
    const profileAllowedFields = [
      "bio",
      "headline",
      "ikigai_love",
      "ikigai_good_at",
      "ikigai_world_needs",
      "ikigai_paid_for",
      "skills",
      "interests",
      "availability",
      "working_style",
      "portfolio_text",
      "portfolio_url",
      "cv_text",
      "linkedin_url",
      "github_url",
      "twitter_url",
      "website_url",
      "intent",
      "is_public",
    ];

    for (const [key, value] of Object.entries(body)) {
      if (userAllowedFields.includes(key)) {
        userFields[key] = value;
      }
      if (profileAllowedFields.includes(key)) {
        profileFields[key] = value;
      }
    }

    // Update user fields if any provided
    if (Object.keys(userFields).length > 0) {
      userFields.updated_at = new Date().toISOString();
      const { error: userError } = await supabase
        .from("users")
        .update(userFields)
        .eq("id", userId);

      if (userError) {
        return NextResponse.json(
          { error: "Failed to update user data" },
          { status: 500 }
        );
      }
    }

    // Update profile fields if any provided
    if (Object.keys(profileFields).length > 0) {
      profileFields.updated_at = new Date().toISOString();
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileFields)
        .eq("user_id", userId);

      if (profileError) {
        return NextResponse.json(
          { error: "Failed to update profile data" },
          { status: 500 }
        );
      }
    }

    // Fetch and return updated data
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { password_hash: _, ...safeUser } = user;

    return NextResponse.json({ user: safeUser, profile }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
