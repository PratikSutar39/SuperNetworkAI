"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Target,
  Sparkles,
  Shield,
  ArrowRight,
  Brain,
  Zap,
  ChevronDown,
} from "lucide-react";

const FLOATING_LOGOS = [
  { name: "GitHub", x: "8%", y: "18%", delay: 0 },
  { name: "Google", x: "85%", y: "12%", delay: 0.5 },
  { name: "Vercel", x: "15%", y: "65%", delay: 1 },
  { name: "Stripe", x: "78%", y: "58%", delay: 1.5 },
  { name: "Discord", x: "45%", y: "8%", delay: 2 },
  { name: "LinkedIn", x: "92%", y: "35%", delay: 0.8 },
  { name: "Notion", x: "5%", y: "42%", delay: 1.2 },
  { name: "Figma", x: "65%", y: "72%", delay: 0.3 },
  { name: "Slack", x: "30%", y: "78%", delay: 1.8 },
  { name: "X", x: "55%", y: "85%", delay: 0.6 },
];

function FloatingLogos() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {FLOATING_LOGOS.map((logo) => (
        <div
          key={logo.name}
          className="absolute w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[10px] font-medium text-white/20 animate-[float-subtle_8s_ease-in-out_infinite]"
          style={{
            left: logo.x,
            top: logo.y,
            animationDuration: `${8 + logo.delay * 2}s`,
            animationDelay: `${logo.delay}s`,
          }}
        >
          {logo.name.slice(0, 2)}
        </div>
      ))}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium text-[var(--text-dark)]">{q}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-sm text-[var(--text-muted)] pb-5 -mt-2">{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--orange-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="glass-strong sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-[var(--text-dark)]">SuperNetwork</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-glass px-4 py-2 text-sm">Log in</Link>
              <Link href="/register" className="btn-primary px-4 py-2 text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <FloatingLogos />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--orange-primary)]/10 border border-[var(--orange-primary)]/20 text-sm text-[var(--orange-primary)] font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Matching
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-dark)] leading-tight">
            Stop Scrolling.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--orange-primary)] to-blue-400">
              Start Matching.
            </span>
          </h1>
          <p className="text-lg text-[var(--text-body)] max-w-2xl mx-auto mt-6">
            SuperNetwork uses your Ikigai — what you love, what you&apos;re good at,
            what the world needs, and what you can be paid for — to match you
            with the right cofounders, teammates, and clients.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2">
              Find Your Match — Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="btn-glass px-8 py-3.5 text-base">
              See How It Works
            </a>
          </div>
          <div className="flex items-center justify-center gap-8 sm:gap-16 mt-16">
            {[
              { value: "120+", label: "Early members" },
              { value: "<10 min", label: "To first match" },
              { value: "92%", label: "Match accuracy" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-[var(--text-dark)]">{value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--text-dark)]">200 DMs. Zero right fits.</h2>
          <p className="text-[var(--text-body)] mt-4 text-lg">
            Finding the right collaborator shouldn&apos;t feel like shouting into a void.
            Traditional networking is broken — too noisy, too random, too much effort for too little signal.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--text-dark)] text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, step: "01", title: "Share what matters", desc: "Complete your Ikigai profile with skills, purpose, and what you\u2019re looking for." },
              { icon: Search, step: "02", title: "Search in plain English", desc: "Describe your ideal match naturally. Our AI understands context and intent." },
              { icon: Users, step: "03", title: "Connect with context", desc: "Get ranked matches with AI explanations. Send requests and start messaging." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="glass-strong p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--orange-primary)]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[var(--orange-primary)]" />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">{step}</span>
                </div>
                <h3 className="font-semibold text-[var(--text-dark)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-body)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--text-dark)] text-center mb-12">Why founders choose SuperNetwork</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Sparkles, title: "Transparent AI matching", desc: "Understand why each person is suggested with AI-generated explanations based on Ikigai alignment." },
              { icon: Zap, title: "Intent-first discovery", desc: "Search by what people want to do, not just what they\u2019ve done. Find collaborators with shared vision." },
              { icon: Shield, title: "Your data, your rules", desc: "Control profile visibility, block users, and manage exactly what\u2019s shared publicly." },
              { icon: Brain, title: "AI icebreakers that work", desc: "Get smart conversation starters based on shared interests and complementary skills." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-subtle flex gap-4 p-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--orange-primary)]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[var(--orange-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-dark)] mb-1">{title}</h3>
                  <p className="text-sm text-[var(--text-body)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--text-dark)] text-center mb-12">Questions?</h2>
          <div className="glass-strong p-6">
            <FAQItem q="How does the AI matching work?" a="We analyze your Ikigai profile, skills, interests, and intent to find people with complementary goals and overlapping strengths. Each match comes with a score and explanation." />
            <FAQItem q="Is my data shared with other users?" a="You control exactly what's visible on your profile through granular privacy settings. Nothing is shared without your explicit consent." />
            <FAQItem q="Is SuperNetwork free?" a="Yes! Core matching, messaging, and profile features are completely free. We may introduce premium features in the future." />
            <FAQItem q="How is this different from LinkedIn?" a="LinkedIn is about broadcasting. SuperNetwork is about matching. We use AI to find the right people based on purpose alignment, not just job titles." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--text-dark)]">Ready to Find Your Match?</h2>
          <p className="text-[var(--text-body)] mt-4">
            Join SuperNetwork and discover meaningful connections powered by your unique purpose.
          </p>
          <Link href="/register" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2 mt-8">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">S</span>
            </div>
            <span className="text-sm text-[var(--text-muted)]">SuperNetwork</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">AI-Powered Networking Platform</p>
        </div>
      </footer>
    </div>
  );
}
