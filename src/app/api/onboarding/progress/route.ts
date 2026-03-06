import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

// GET: Fetch saved onboarding progress
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("onboarding_progress")
      .select("current_step, form_data")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      // No saved progress, return defaults
      return NextResponse.json({ current_step: 1, form_data: {} });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Save onboarding progress
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { current_step, form_data } = body;

    if (typeof current_step !== "number" || current_step < 1 || current_step > 8) {
      return NextResponse.json(
        { error: "Invalid step number" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from("onboarding_progress")
      .upsert(
        {
          user_id: userId,
          current_step,
          form_data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Failed to save progress:", error);
      return NextResponse.json(
        { error: "Failed to save progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Progress saved" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
