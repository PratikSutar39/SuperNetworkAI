"use client";

import { useState, useCallback, useEffect, type KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OnboardingData {
  // Step 1: Ikigai
  ikigai_love: string;
  ikigai_good_at: string;
  ikigai_world_needs: string;
  ikigai_paid_for: string;
  // Step 2: Skills & Interests
  skills: string[];
  interests: string[];
  intent: "" | "Cofounder" | "Teammate" | "Client" | "Mentor";
  // Step 3: Portfolio & CV
  bio: string;
  headline: string;
  portfolio_url: string;
  cv_text: string;
  // Step 4: Social Profiles
  linkedin_url: string;
  github_url: string;
  twitter_url: string;
  website_url: string;
  // Step 5: Working Preferences
  availability: "" | "Full-time" | "Part-time" | "Freelance" | "Flexible";
  working_style: "" | "Remote" | "Hybrid" | "In-person" | "Flexible";
}

const INITIAL_DATA: OnboardingData = {
  ikigai_love: "",
  ikigai_good_at: "",
  ikigai_world_needs: "",
  ikigai_paid_for: "",
  skills: [],
  interests: [],
  intent: "",
  bio: "",
  headline: "",
  portfolio_url: "",
  cv_text: "",
  linkedin_url: "",
  github_url: "",
  twitter_url: "",
  website_url: "",
  availability: "",
  working_style: "",
};

const STEP_TITLES = [
  "Ikigai Discovery",
  "Skills & Interests",
  "Portfolio & CV",
  "Social Profiles",
  "Working Preferences",
];

const TOTAL_STEPS = 5;

const INTENT_OPTIONS: Array<OnboardingData["intent"]> = [
  "Cofounder",
  "Teammate",
  "Client",
  "Mentor",
];

const AVAILABILITY_OPTIONS: Array<NonNullable<OnboardingData["availability"]>> = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Flexible",
];

const WORKING_STYLE_OPTIONS: Array<NonNullable<OnboardingData["working_style"]>> = [
  "Remote",
  "Hybrid",
  "In-person",
  "Flexible",
];

// ---------------------------------------------------------------------------
// Tag Input Component
// ---------------------------------------------------------------------------

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input.trim();
      if (value && !tags.includes(value)) {
        onAdd(value);
        setInput("");
      }
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onRemove(tags.length - 1);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--text-dark)]">
        {label}
      </label>
      <div className="glass-input px-3 py-2 flex flex-wrap items-center gap-2 min-h-[44px] focus-within:border-[var(--orange-primary)] focus-within:shadow-[0_0_0_3px_rgba(232,115,74,0.15)]">
        {tags.map((tag, i) => (
          <Badge key={tag} variant="orange" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="ml-0.5 hover:text-[var(--orange-deep)] focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-[var(--text-dark)] placeholder:text-[var(--text-muted)]"
        />
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Press Enter to add. Backspace to remove the last item.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ikigai Diagram Component
// ---------------------------------------------------------------------------

function IkigaiDiagram({ data }: { data: OnboardingData }) {
  const filled = {
    love: data.ikigai_love.trim().length > 0,
    good: data.ikigai_good_at.trim().length > 0,
    world: data.ikigai_world_needs.trim().length > 0,
    paid: data.ikigai_paid_for.trim().length > 0,
  };

  const circles = [
    {
      label: "Love",
      color: "rgba(232, 115, 74, 0.35)",
      activeColor: "rgba(232, 115, 74, 0.55)",
      top: "0%",
      left: "25%",
      active: filled.love,
    },
    {
      label: "Good At",
      color: "rgba(59, 130, 246, 0.30)",
      activeColor: "rgba(59, 130, 246, 0.50)",
      top: "0%",
      left: "55%",
      active: filled.good,
    },
    {
      label: "World Needs",
      color: "rgba(16, 185, 129, 0.30)",
      activeColor: "rgba(16, 185, 129, 0.50)",
      top: "35%",
      left: "55%",
      active: filled.world,
    },
    {
      label: "Paid For",
      color: "rgba(168, 85, 247, 0.30)",
      activeColor: "rgba(168, 85, 247, 0.50)",
      top: "35%",
      left: "25%",
      active: filled.paid,
    },
  ];

  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-square select-none">
      {circles.map((c) => (
        <div
          key={c.label}
          className="absolute w-[55%] aspect-square rounded-full flex items-center justify-center transition-all duration-500 ease-out"
          style={{
            top: c.top,
            left: c.left,
            background: c.active ? c.activeColor : c.color,
            transform: c.active ? "scale(1.05)" : "scale(1)",
            border: c.active
              ? "2px solid rgba(255,255,255,0.6)"
              : "1px solid rgba(255,255,255,0.3)",
            boxShadow: c.active
              ? "0 4px 20px rgba(0,0,0,0.08)"
              : "none",
          }}
        >
          <span className="text-xs font-semibold text-white drop-shadow-sm text-center leading-tight px-2">
            {c.label}
          </span>
        </div>
      ))}
      {/* Center label */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <span
          className="text-[11px] font-bold tracking-wide uppercase transition-colors duration-500"
          style={{
            color:
              filled.love && filled.good && filled.world && filled.paid
                ? "var(--orange-primary)"
                : "var(--text-muted)",
          }}
        >
          Ikigai
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress Bar
// ---------------------------------------------------------------------------

function ProgressBar({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--text-dark)]">
          {STEP_TITLES[step - 1]}
        </span>
        <span className="text-[var(--text-muted)]">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(135deg, var(--orange-primary), var(--orange-deep))",
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidUrl(value: string): boolean {
  if (!value) return true; // empty is ok (optional)
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateStep(step: number, data: OnboardingData): Record<string, string> {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1:
      if (!data.ikigai_love.trim())
        errors.ikigai_love = "Please share what you love doing.";
      if (!data.ikigai_good_at.trim())
        errors.ikigai_good_at = "Please share what you are good at.";
      if (!data.ikigai_world_needs.trim())
        errors.ikigai_world_needs = "Please share what the world needs.";
      if (!data.ikigai_paid_for.trim())
        errors.ikigai_paid_for = "Please share what you can be paid for.";
      break;
    case 2:
      if (data.skills.length === 0)
        errors.skills = "Add at least one skill.";
      if (!data.intent)
        errors.intent = "Please select your intent.";
      break;
    case 3:
      if (!data.bio.trim())
        errors.bio = "A short bio is required.";
      if (!data.headline.trim())
        errors.headline = "A headline is required.";
      if (data.portfolio_url && !isValidUrl(data.portfolio_url))
        errors.portfolio_url = "Please enter a valid URL.";
      break;
    case 4:
      if (data.linkedin_url && !isValidUrl(data.linkedin_url))
        errors.linkedin_url = "Please enter a valid URL.";
      if (data.github_url && !isValidUrl(data.github_url))
        errors.github_url = "Please enter a valid URL.";
      if (data.twitter_url && !isValidUrl(data.twitter_url))
        errors.twitter_url = "Please enter a valid URL.";
      if (data.website_url && !isValidUrl(data.website_url))
        errors.website_url = "Please enter a valid URL.";
      break;
    case 5:
      if (!data.availability)
        errors.availability = "Please select your availability.";
      if (!data.working_style)
        errors.working_style = "Please select your working style.";
      break;
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Step Renderers
// ---------------------------------------------------------------------------

function StepIkigai({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          Discover Your Ikigai
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Ikigai is the Japanese concept of finding purpose at the intersection
          of what you love, what you are good at, what the world needs, and what
          you can be paid for.
        </p>
      </div>

      <IkigaiDiagram data={data} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea
          id="ikigai_love"
          label="What do you love?"
          placeholder="I'm passionate about building communities, solving puzzles, creating art..."
          value={data.ikigai_love}
          onChange={(e) => onChange({ ikigai_love: e.target.value })}
          error={errors.ikigai_love}
          rows={3}
        />
        <Textarea
          id="ikigai_good_at"
          label="What are you good at?"
          placeholder="Full-stack development, design thinking, strategic planning..."
          value={data.ikigai_good_at}
          onChange={(e) => onChange({ ikigai_good_at: e.target.value })}
          error={errors.ikigai_good_at}
          rows={3}
        />
        <Textarea
          id="ikigai_world_needs"
          label="What does the world need?"
          placeholder="Accessible education, sustainable technology, mental health support..."
          value={data.ikigai_world_needs}
          onChange={(e) => onChange({ ikigai_world_needs: e.target.value })}
          error={errors.ikigai_world_needs}
          rows={3}
        />
        <Textarea
          id="ikigai_paid_for"
          label="What can you be paid for?"
          placeholder="Software engineering, consulting, content creation..."
          value={data.ikigai_paid_for}
          onChange={(e) => onChange({ ikigai_paid_for: e.target.value })}
          error={errors.ikigai_paid_for}
          rows={3}
        />
      </div>
    </div>
  );
}

function StepSkills({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          Skills & Interests
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Tell us what you bring to the table and what excites you.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <TagInput
            label="Skills"
            tags={data.skills}
            onAdd={(tag) => onChange({ skills: [...data.skills, tag] })}
            onRemove={(i) =>
              onChange({ skills: data.skills.filter((_, idx) => idx !== i) })
            }
            placeholder="Type a skill and press Enter"
          />
          {errors.skills && (
            <p className="text-xs text-red-500 mt-1">{errors.skills}</p>
          )}
        </div>

        <TagInput
          label="Interests"
          tags={data.interests}
          onAdd={(tag) => onChange({ interests: [...data.interests, tag] })}
          onRemove={(i) =>
            onChange({
              interests: data.interests.filter((_, idx) => idx !== i),
            })
          }
          placeholder="Type an interest and press Enter"
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--text-dark)]">
            I am looking to be a...
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {INTENT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ intent: option })}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-[var(--orange-primary)] focus:ring-offset-2 ${
                  data.intent === option
                    ? "bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] text-white border-transparent shadow-md"
                    : "glass-input text-[var(--text-body)] hover:border-[var(--orange-primary)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.intent && (
            <p className="text-xs text-red-500 mt-1">{errors.intent}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StepPortfolio({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          Portfolio & CV
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Share your story so the right people can find you.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          id="headline"
          label="Headline"
          placeholder="e.g. Full-Stack Engineer | Open-Source Enthusiast"
          value={data.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          error={errors.headline}
        />

        <Textarea
          id="bio"
          label="Bio"
          placeholder="Write a short paragraph about yourself, your experience, and what drives you..."
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          error={errors.bio}
          rows={4}
        />

        <Input
          id="portfolio_url"
          label="Portfolio URL"
          type="url"
          placeholder="https://your-portfolio.com"
          value={data.portfolio_url}
          onChange={(e) => onChange({ portfolio_url: e.target.value })}
          error={errors.portfolio_url}
        />

        <Textarea
          id="cv_text"
          label="CV / Portfolio Text"
          placeholder="Paste your CV, resume, or a detailed description of your experience here..."
          value={data.cv_text}
          onChange={(e) => onChange({ cv_text: e.target.value })}
          error={errors.cv_text}
          rows={8}
          className="min-h-[160px]"
        />
      </div>
    </div>
  );
}

function StepSocials({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          Social Profiles
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Connect your social presence so others can learn more about you. All
          fields are optional.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          id="linkedin_url"
          label="LinkedIn"
          type="url"
          placeholder="https://linkedin.com/in/yourname"
          value={data.linkedin_url}
          onChange={(e) => onChange({ linkedin_url: e.target.value })}
          error={errors.linkedin_url}
        />
        <Input
          id="github_url"
          label="GitHub"
          type="url"
          placeholder="https://github.com/yourname"
          value={data.github_url}
          onChange={(e) => onChange({ github_url: e.target.value })}
          error={errors.github_url}
        />
        <Input
          id="twitter_url"
          label="Twitter / X"
          type="url"
          placeholder="https://twitter.com/yourname"
          value={data.twitter_url}
          onChange={(e) => onChange({ twitter_url: e.target.value })}
          error={errors.twitter_url}
        />
        <Input
          id="website_url"
          label="Website"
          type="url"
          placeholder="https://yourwebsite.com"
          value={data.website_url}
          onChange={(e) => onChange({ website_url: e.target.value })}
          error={errors.website_url}
        />
      </div>
    </div>
  );
}

function StepPreferences({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          Working Preferences
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Let us know how you prefer to work so we can match you with
          like-minded people.
        </p>
      </div>

      <div className="space-y-5">
        {/* Availability */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--text-dark)]">
            Availability
          </label>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABILITY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ availability: option })}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-[var(--orange-primary)] focus:ring-offset-2 ${
                  data.availability === option
                    ? "bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] text-white border-transparent shadow-md"
                    : "glass-input text-[var(--text-body)] hover:border-[var(--orange-primary)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.availability && (
            <p className="text-xs text-red-500 mt-1">{errors.availability}</p>
          )}
        </div>

        {/* Working Style */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--text-dark)]">
            Working Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {WORKING_STYLE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ working_style: option })}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-[var(--orange-primary)] focus:ring-offset-2 ${
                  data.working_style === option
                    ? "bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] text-white border-transparent shadow-md"
                    : "glass-input text-[var(--text-body)] hover:border-[var(--orange-primary)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.working_style && (
            <p className="text-xs text-red-500 mt-1">{errors.working_style}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Onboarding Page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const updateData = useCallback((patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    // Clear field-level errors for changed fields
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        delete next[key];
      }
      return next;
    });
  }, []);

  function handleNext() {
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Submission failed (${res.status})`
        );
      }

      router.push("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  // -----------------------------------------------------------------------
  // Loading / Auth guard
  // -----------------------------------------------------------------------

  if (status === "loading") {
    return (
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
          <span className="text-sm text-[var(--text-muted)]">Loading...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">SN</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-dark)]">
            Complete Your Profile
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm">
            {session?.user?.name
              ? `Welcome, ${session.user.name}! `
              : ""}
            Let&apos;s set up your profile so we can find your perfect match.
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar step={step} />

        {/* Step Content */}
        <Card variant="strong">
          {submitError && (
            <div className="mb-5 p-3 rounded-xl bg-red-50/80 border border-red-200/50 text-red-600 text-sm">
              {submitError}
            </div>
          )}

          {step === 1 && (
            <StepIkigai data={data} onChange={updateData} errors={errors} />
          )}
          {step === 2 && (
            <StepSkills data={data} onChange={updateData} errors={errors} />
          )}
          {step === 3 && (
            <StepPortfolio data={data} onChange={updateData} errors={errors} />
          )}
          {step === 4 && (
            <StepSocials data={data} onChange={updateData} errors={errors} />
          )}
          {step === 5 && (
            <StepPreferences
              data={data}
              onChange={updateData}
              errors={errors}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--glass-border)]">
            {step > 1 ? (
              <Button
                type="button"
                variant="glass"
                onClick={handleBack}
                disabled={submitting}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <Button type="button" variant="primary" size="lg" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={submitting}
                onClick={handleSubmit}
              >
                Complete Profile
              </Button>
            )}
          </div>
        </Card>

        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                // Allow navigating back freely, forward only if current step validates
                if (n < step) {
                  setErrors({});
                  setStep(n);
                } else if (n > step) {
                  const stepErrors = validateStep(step, data);
                  if (Object.keys(stepErrors).length === 0) {
                    setErrors({});
                    setStep(n);
                  } else {
                    setErrors(stepErrors);
                  }
                }
              }}
              aria-label={`Go to step ${n}: ${STEP_TITLES[n - 1]}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--orange-primary)] focus:ring-offset-2 ${
                n === step
                  ? "bg-[var(--orange-primary)] scale-125"
                  : n < step
                    ? "bg-[var(--orange-primary)]/50"
                    : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
