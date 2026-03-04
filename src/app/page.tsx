"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Search,
  Users,
  MessageSquare,
  Target,
  Sparkles,
  Shield,
  ArrowRight,
  Heart,
  Brain,
  Globe,
  Briefcase,
} from "lucide-react";
import Card from "@/components/ui/Card";

function IkigaiVisual() {
  return (
    <div className="relative w-72 h-72 mx-auto">
      {/* Love circle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-orange-400/15 border border-orange-300/30 flex items-center justify-center">
        <div className="text-center mt-6">
          <Heart className="w-5 h-5 text-orange-500 mx-auto" />
          <span className="text-[10px] font-medium text-orange-600 mt-0.5 block">
            What you love
          </span>
        </div>
      </div>
      {/* Good at circle */}
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-40 h-40 rounded-full bg-blue-400/15 border border-blue-300/30 flex items-center justify-center">
        <div className="text-center ml-6">
          <Brain className="w-5 h-5 text-blue-500 mx-auto" />
          <span className="text-[10px] font-medium text-blue-600 mt-0.5 block">
            What you&apos;re good at
          </span>
        </div>
      </div>
      {/* World needs circle */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-green-400/15 border border-green-300/30 flex items-center justify-center">
        <div className="text-center mb-6">
          <Globe className="w-5 h-5 text-green-500 mx-auto" />
          <span className="text-[10px] font-medium text-green-600 mt-0.5 block">
            What the world needs
          </span>
        </div>
      </div>
      {/* Paid for circle */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-40 h-40 rounded-full bg-purple-400/15 border border-purple-300/30 flex items-center justify-center">
        <div className="text-center mr-6">
          <Briefcase className="w-5 h-5 text-purple-500 mx-auto" />
          <span className="text-[10px] font-medium text-purple-600 mt-0.5 block">
            What you can be paid for
          </span>
        </div>
      </div>
      {/* Center - Ikigai */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xs">Ikigai</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--orange-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="glass-strong sticky top-0 z-40 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">SN</span>
              </div>
              <span className="font-semibold text-[var(--text-dark)]">
                SuperNetworkAI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-glass px-4 py-2 text-sm">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary px-4 py-2 text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-[var(--bg-warm)]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--peach-light)] border border-[var(--glass-border-orange)] text-sm text-[var(--orange-primary)] font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Networking
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-dark)] leading-tight">
            Find Your Perfect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)]">
              Cofounder, Teammate, or Client
            </span>
          </h1>
          <p className="text-lg text-[var(--text-body)] max-w-2xl mx-auto mt-6">
            SuperNetworkAI uses your Ikigai — what you love, what you&apos;re good
            at, what the world needs, and what you can be paid for — to
            intelligently match you with the right people.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              href="/register"
              className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2"
            >
              Start Networking
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="btn-glass px-8 py-3 text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Ikigai Section */}
      <section className="py-20 px-4 bg-[var(--bg-warm)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--text-dark)]">
                Discover Your Ikigai
              </h2>
              <p className="text-[var(--text-body)] mt-4">
                Ikigai is the Japanese concept of finding your purpose — the
                intersection of what you love, what you&apos;re good at, what the
                world needs, and what you can be paid for.
              </p>
              <p className="text-[var(--text-body)] mt-3">
                Our onboarding captures your unique Ikigai to power intelligent
                matching that goes beyond skills alone.
              </p>
            </div>
            <IkigaiVisual />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--text-dark)] text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Share Your Story",
                desc: "Complete your Ikigai profile with skills, interests, portfolio, and what you&apos;re looking for.",
              },
              {
                icon: Search,
                title: "AI-Powered Search",
                desc: "Use natural language to describe your ideal match. Our AI understands context and intent.",
              },
              {
                icon: Users,
                title: "Connect & Collaborate",
                desc: "Get ranked suggestions with AI explanations. Send connection requests and start messaging.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[var(--peach-light)] flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-[var(--orange-primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--text-dark)] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[var(--text-body)]">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-[var(--bg-warm)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--text-dark)] text-center mb-12">
            Built for Meaningful Connections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: Sparkles,
                title: "AI Match Explanations",
                desc: "Understand why each person is suggested with AI-generated explanations based on Ikigai alignment.",
              },
              {
                icon: MessageSquare,
                title: "In-App Messaging",
                desc: "Connect and communicate directly within the platform. No need for external tools.",
              },
              {
                icon: Shield,
                title: "Privacy Controls",
                desc: "Control what's visible on your profile. Block users and manage discoverability.",
              },
              {
                icon: Brain,
                title: "Smart Criteria",
                desc: "AI pre-fills and continuously updates your match criteria based on your profile.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} variant="subtle" className="flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[var(--peach-light)] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[var(--orange-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-dark)] mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-[var(--text-body)]">{desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--text-dark)]">
            Ready to Find Your Match?
          </h2>
          <p className="text-[var(--text-body)] mt-4">
            Join SuperNetworkAI and discover meaningful connections powered by your
            unique purpose.
          </p>
          <Link
            href="/register"
            className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2 mt-8"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">SN</span>
            </div>
            <span className="text-sm text-[var(--text-muted)]">
              SuperNetworkAI
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            AI-Powered Networking Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
