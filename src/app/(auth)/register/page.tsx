"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Show "check your email" state
      setEmailSent(true);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-warm)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">SN</span>
            </div>
          </div>

          <Card variant="strong">
            <div className="text-center py-4 space-y-4">
              {/* Mail icon */}
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--orange-primary)]"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-[var(--text-dark)]">
                Check your email
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                We&apos;ve sent a verification link to{" "}
                <span className="font-medium text-[var(--text-dark)]">
                  {email}
                </span>
                . Click the link in the email to verify your account and start
                building your profile.
              </p>

              <div className="pt-2 space-y-3">
                <p className="text-xs text-[var(--text-muted)]">
                  The link will expire in 24 hours.
                </p>
                <Button
                  type="button"
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setEmailSent(false);
                    setLoading(false);
                  }}
                >
                  Use a different email
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-warm)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">SN</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-dark)]">
            Join SuperNetworkAI
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Discover your perfect cofounder, teammate, or client
          </p>
        </div>

        <Card variant="strong">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50/80 border border-red-200/50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Input
              id="name"
              label="Full Name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--orange-primary)] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
