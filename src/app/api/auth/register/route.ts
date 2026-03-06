import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getServiceSupabase } from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;
    const supabase = getServiceSupabase();

    // Check if user already exists (fully verified)
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);
    const verification_token = crypto.randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Delete any existing pending registration for this email
    await supabase
      .from("pending_registrations")
      .delete()
      .eq("email", email);

    // Create pending registration
    const { error: insertError } = await supabase
      .from("pending_registrations")
      .insert({
        email,
        name,
        password_hash,
        verification_token,
        expires_at,
      });

    if (insertError) {
      console.error("Failed to create pending registration:", insertError);
      return NextResponse.json(
        { error: "Failed to initiate registration" },
        { status: 500 }
      );
    }

    // Send verification email via Resend
    await sendVerificationEmail({ email, name, token: verification_token });

    return NextResponse.json(
      {
        message: "Verification email sent. Please check your inbox.",
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
