import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/verify-email?status=invalid", req.url)
      );
    }

    const supabase = getServiceSupabase();

    // Find the pending registration by token
    const { data: pending, error: fetchError } = await supabase
      .from("pending_registrations")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (fetchError || !pending) {
      return NextResponse.redirect(
        new URL("/verify-email?status=invalid", req.url)
      );
    }

    // Check expiry
    if (new Date(pending.expires_at) < new Date()) {
      // Clean up expired token
      await supabase
        .from("pending_registrations")
        .delete()
        .eq("id", pending.id);

      return NextResponse.redirect(
        new URL("/verify-email?status=expired", req.url)
      );
    }

    // Check if user already exists (e.g. double-click on link)
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", pending.email)
      .single();

    if (existingUser) {
      // Clean up pending registration
      await supabase
        .from("pending_registrations")
        .delete()
        .eq("id", pending.id);

      return NextResponse.redirect(
        new URL("/verify-email?status=already_verified", req.url)
      );
    }

    // Create the user account in Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        name: pending.name,
        email: pending.email,
        password_hash: pending.password_hash,
      })
      .select("id")
      .single();

    if (userError || !user) {
      console.error("Failed to create user:", userError);
      return NextResponse.redirect(
        new URL("/verify-email?status=error", req.url)
      );
    }

    // Create empty profile
    await supabase.from("profiles").insert({ user_id: user.id });

    // Create default visibility settings
    await supabase.from("visibility_settings").insert({ user_id: user.id });

    // Clean up pending registration
    await supabase
      .from("pending_registrations")
      .delete()
      .eq("id", pending.id);

    // Redirect to verification success page with email for auto-login
    const successUrl = new URL("/verify-email", req.url);
    successUrl.searchParams.set("status", "success");
    successUrl.searchParams.set("email", pending.email);

    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.redirect(
      new URL("/verify-email?status=error", req.url)
    );
  }
}
