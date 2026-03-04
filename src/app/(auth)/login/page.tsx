"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-warm)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">SN</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-dark)]">
            Welcome back
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Sign in to find your next great connection
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[var(--orange-primary)] hover:underline font-medium"
            >
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
