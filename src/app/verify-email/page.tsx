"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid password. Please try again.");
      setLoading(false);
    } else {
      router.push("/onboarding");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-warm)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">SN</span>
          </div>
        </div>

        <Card variant="strong">
          {status === "success" && (
            <div className="text-center py-4 space-y-4">
              {/* Success checkmark */}
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
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
                  className="text-green-500"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-[var(--text-dark)]">
                Email verified!
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Your account has been created successfully. Sign in to start
                your Ikigai journey.
              </p>

              <form onSubmit={handleLogin} className="space-y-4 pt-2 text-left">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50/80 border border-red-200/50 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-[var(--text-body)]">
                  {email}
                </div>

                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  Sign in & Start Ikigai
                </Button>
              </form>
            </div>
          )}

          {status === "already_verified" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
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
                  className="text-blue-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-dark)]">
                Already verified
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                This email has already been verified. You can sign in to your
                account.
              </p>
              <Link href="/login">
                <Button variant="primary" size="lg" className="w-full mt-2">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}

          {status === "expired" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto">
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
                  className="text-yellow-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-dark)]">
                Link expired
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                This verification link has expired. Please register again to
                receive a new link.
              </p>
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full mt-2">
                  Register Again
                </Button>
              </Link>
            </div>
          )}

          {(status === "invalid" || status === "error" || !status) && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
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
                  className="text-red-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-dark)]">
                {status === "error"
                  ? "Something went wrong"
                  : "Invalid verification link"}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {status === "error"
                  ? "An error occurred while verifying your email. Please try again."
                  : "This verification link is invalid or has already been used."}
              </p>
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full mt-2">
                  Register Again
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-warm)]">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-8 w-8 text-[var(--orange-primary)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-[var(--text-muted)]">
              Verifying...
            </span>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
