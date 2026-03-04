"use client";

import { useState, useCallback, useEffect, type KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Handshake, GraduationCap, Pencil, FileText } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OnboardingData {
  ikigai_love: string;
  ikigai_good_at: string;
  ikigai_world_needs: string;
  ikigai_paid_for: string;
  skills: string[];
  interests: string[];
  intent: "" | "Cofounder" | "Teammate" | "Client" | "Mentor";
  bio: string;
  headline: string;
  portfolio_url: string;
  cv_text: string;
  linkedin_url: string;
  github_url: string;
  twitter_url: string;
  website_url: string;
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

const TOTAL_STEPS = 8;

const STEP_TITLES = [
  "Intent",
  "Skills",
  "Interests",
  "Availability",
  "Working Style",
  "Ikigai",
  "Profile",
  "Links",
];

// Predefined options for chip toggles
const SKILL_OPTIONS = [
  "React", "Next.js", "Node.js", "TypeScript", "Python", "Go", "Rust",
  "UI/UX", "Figma", "Tailwind", "GraphQL", "PostgreSQL", "MongoDB",
  "AWS", "Docker", "Kubernetes", "Machine Learning", "Data Science",
  "Product Management", "DevOps", "Swift", "Kotlin", "Flutter",
  "Vue", "Angular", "Firebase", "Redis", "Solidity", "Web3",
];

const INTEREST_OPTIONS = [
  "AI / ML", "Web3 / Crypto", "Climate Tech", "FinTech", "HealthTech",
  "EdTech", "Open Source", "SaaS", "Mobile Apps", "Gaming",
  "Robotics", "IoT", "AR / VR", "Cybersecurity", "Developer Tools",
  "E-commerce", "Social Impact", "Space Tech", "Biotech", "No-Code",
];

const INTENT_OPTIONS: {
  value: OnboardingData["intent"];
  label: string;
  desc: string;
  icon: typeof Users;
}[] = [
  { value: "Cofounder", label: "Co-founder", desc: "Find your co-builder", icon: UserPlus },
  { value: "Teammate", label: "Teammate", desc: "Grow your team with the right people", icon: Users },
  { value: "Client", label: "Client", desc: "Land clients who get what you do", icon: Handshake },
  { value: "Mentor", label: "Mentor", desc: "Guide others with your experience", icon: GraduationCap },
];

const AVAILABILITY_OPTIONS: {
  value: NonNullable<OnboardingData["availability"]>;
  desc: string;
}[] = [
  { value: "Full-time", desc: "40+ hours per week" },
  { value: "Part-time", desc: "10–20 hours per week" },
  { value: "Freelance", desc: "Project-based availability" },
  { value: "Flexible", desc: "Open to different arrangements" },
];

const WORKING_STYLE_OPTIONS: {
  value: NonNullable<OnboardingData["working_style"]>;
  desc: string;
}[] = [
  { value: "Remote", desc: "Work from anywhere" },
  { value: "Hybrid", desc: "Mix of remote and in-person" },
  { value: "In-person", desc: "Prefer office or co-working" },
  { value: "Flexible", desc: "Open to any arrangement" },
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isValidUrl(value: string): boolean {
  if (!value) return true;
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
      if (!data.intent) errors.intent = "Please select your intent.";
      break;
    case 2:
      if (data.skills.length === 0) errors.skills = "Add at least one skill.";
      break;
    case 3:
      break; // interests are optional
    case 4:
      if (!data.availability) errors.availability = "Please select your availability.";
      break;
    case 5:
      if (!data.working_style) errors.working_style = "Please select your working style.";
      break;
    case 6:
      if (!data.ikigai_love.trim()) errors.ikigai_love = "Please share what you love doing.";
      if (!data.ikigai_good_at.trim()) errors.ikigai_good_at = "Please share what you are good at.";
      if (!data.ikigai_world_needs.trim()) errors.ikigai_world_needs = "Please share what the world needs.";
      if (!data.ikigai_paid_for.trim()) errors.ikigai_paid_for = "Please share what you can be paid for.";
      break;
    case 7:
      if (!data.bio.trim()) errors.bio = "A short bio is required.";
      if (!data.headline.trim()) errors.headline = "A headline is required.";
      break;
    case 8:
      if (data.portfolio_url && !isValidUrl(data.portfolio_url)) errors.portfolio_url = "Please enter a valid URL.";
      if (data.linkedin_url && !isValidUrl(data.linkedin_url)) errors.linkedin_url = "Please enter a valid URL.";
      if (data.github_url && !isValidUrl(data.github_url)) errors.github_url = "Please enter a valid URL.";
      if (data.twitter_url && !isValidUrl(data.twitter_url)) errors.twitter_url = "Please enter a valid URL.";
      if (data.website_url && !isValidUrl(data.website_url)) errors.website_url = "Please enter a valid URL.";
      break;
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        selected ? "border-[var(--orange-primary)] bg-[var(--orange-primary)]" : "border-gray-500"
      }`}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  );
}

function StepIndicator({
  current,
  total,
  onGoTo,
}: {
  current: number;
  total: number;
  onGoTo: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onGoTo(n)}
          className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
            n === current
              ? "bg-[var(--orange-primary)] text-white"
              : n < current
                ? "bg-[var(--orange-primary)]/20 text-[var(--orange-primary)]"
                : "bg-white/5 text-[var(--text-muted)] border border-white/10"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
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
    <div className="glass-input px-3 py-2 flex flex-wrap items-center gap-2 min-h-[44px] focus-within:border-[var(--orange-primary)] focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]">
      {tags
        .filter((t) => !SKILL_OPTIONS.includes(t) && !INTEREST_OPTIONS.includes(t))
        .map((tag, i) => {
          const realIndex = tags.indexOf(tag);
          return (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--orange-primary)]/15 text-blue-300 border border-[var(--orange-primary)]/30"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(realIndex)}
                className="hover:text-white"
              >
                &times;
              </button>
            </span>
          );
        })}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 min-w-[140px] bg-transparent border-none outline-none text-sm text-[var(--text-dark)] placeholder:text-[var(--text-muted)]"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step renderers
// ---------------------------------------------------------------------------

function StepIntent({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          What are you building toward?
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Pick one — we&apos;ll focus your feed on what matters to you.
        </p>
      </div>
      <div className="space-y-3">
        {INTENT_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange({ intent: value })}
            className={`toggle-card flex items-center gap-4 ${data.intent === value ? "selected" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              data.intent === value ? "bg-[var(--orange-primary)]/15" : "bg-white/5"
            }`}>
              <Icon className={`w-5 h-5 ${data.intent === value ? "text-[var(--orange-primary)]" : "text-[var(--text-muted)]"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text-dark)]">{label}</p>
              <p className="text-xs text-[var(--text-muted)]">{desc}</p>
            </div>
            <RadioCircle selected={data.intent === value} />
          </button>
        ))}
      </div>
      {errors.intent && <p className="text-xs text-red-400">{errors.intent}</p>}
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
  const toggleSkill = (skill: string) => {
    if (data.skills.includes(skill)) {
      onChange({ skills: data.skills.filter((s) => s !== skill) });
    } else {
      onChange({ skills: [...data.skills, skill] });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          What are your top skills?
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Select from the list or add your own. Pick at least one.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SKILL_OPTIONS.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => toggleSkill(skill)}
            className={`chip-toggle ${data.skills.includes(skill) ? "selected" : ""}`}
          >
            {skill}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-[var(--text-muted)]">Add custom skills:</p>
        <TagInput
          tags={data.skills}
          onAdd={(tag) => onChange({ skills: [...data.skills, tag] })}
          onRemove={(i) => onChange({ skills: data.skills.filter((_, idx) => idx !== i) })}
          placeholder="Type a skill and press Enter"
        />
      </div>
      {errors.skills && <p className="text-xs text-red-400">{errors.skills}</p>}
    </div>
  );
}

function StepInterests({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  const toggleInterest = (interest: string) => {
    if (data.interests.includes(interest)) {
      onChange({ interests: data.interests.filter((i) => i !== interest) });
    } else {
      onChange({ interests: [...data.interests, interest] });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          What excites you?
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Select the domains you&apos;re passionate about. This is optional.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {INTEREST_OPTIONS.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            className={`chip-toggle ${data.interests.includes(interest) ? "selected" : ""}`}
          >
            {interest}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-[var(--text-muted)]">Add custom interests:</p>
        <TagInput
          tags={data.interests}
          onAdd={(tag) => onChange({ interests: [...data.interests, tag] })}
          onRemove={(i) => onChange({ interests: data.interests.filter((_, idx) => idx !== i) })}
          placeholder="Type an interest and press Enter"
        />
      </div>
    </div>
  );
}

function StepAvailability({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          How much time can you commit?
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          This helps us match you with people on a similar schedule.
        </p>
      </div>
      <div className="space-y-3">
        {AVAILABILITY_OPTIONS.map(({ value, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange({ availability: value })}
            className={`toggle-card flex items-center gap-4 ${data.availability === value ? "selected" : ""}`}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text-dark)]">{value}</p>
              <p className="text-xs text-[var(--text-muted)]">{desc}</p>
            </div>
            <RadioCircle selected={data.availability === value} />
          </button>
        ))}
      </div>
      {errors.availability && <p className="text-xs text-red-400">{errors.availability}</p>}
    </div>
  );
}

function StepWorkingStyle({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          How do you prefer to work?
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Find people who match your working style.
        </p>
      </div>
      <div className="space-y-3">
        {WORKING_STYLE_OPTIONS.map(({ value, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange({ working_style: value })}
            className={`toggle-card flex items-center gap-4 ${data.working_style === value ? "selected" : ""}`}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text-dark)]">{value}</p>
              <p className="text-xs text-[var(--text-muted)]">{desc}</p>
            </div>
            <RadioCircle selected={data.working_style === value} />
          </button>
        ))}
      </div>
      {errors.working_style && <p className="text-xs text-red-400">{errors.working_style}</p>}
    </div>
  );
}

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
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          What drives you?
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Ikigai — the intersection of love, skill, need, and value. This powers our matching.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea
          id="ikigai_love"
          label="What do you love?"
          placeholder="Building communities, solving puzzles..."
          value={data.ikigai_love}
          onChange={(e) => onChange({ ikigai_love: e.target.value })}
          error={errors.ikigai_love}
          rows={3}
        />
        <Textarea
          id="ikigai_good_at"
          label="What are you good at?"
          placeholder="Full-stack dev, design thinking..."
          value={data.ikigai_good_at}
          onChange={(e) => onChange({ ikigai_good_at: e.target.value })}
          error={errors.ikigai_good_at}
          rows={3}
        />
        <Textarea
          id="ikigai_world_needs"
          label="What does the world need?"
          placeholder="Accessible education, sustainable tech..."
          value={data.ikigai_world_needs}
          onChange={(e) => onChange({ ikigai_world_needs: e.target.value })}
          error={errors.ikigai_world_needs}
          rows={3}
        />
        <Textarea
          id="ikigai_paid_for"
          label="What can you be paid for?"
          placeholder="Software engineering, consulting..."
          value={data.ikigai_paid_for}
          onChange={(e) => onChange({ ikigai_paid_for: e.target.value })}
          error={errors.ikigai_paid_for}
          rows={3}
        />
      </div>
    </div>
  );
}

function StepProfile({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          Tell people about you
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          A short headline and bio so others know who you are.
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
          placeholder="Write a short paragraph about yourself..."
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          error={errors.bio}
          rows={4}
        />
      </div>
    </div>
  );
}

function StepLinks({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--text-dark)]">
          Connect your presence
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          All fields are optional. Add what you&apos;re comfortable sharing.
        </p>
      </div>
      <div className="space-y-4">
        <Input
          id="portfolio_url"
          label="Portfolio URL"
          type="url"
          placeholder="https://your-portfolio.com"
          value={data.portfolio_url}
          onChange={(e) => onChange({ portfolio_url: e.target.value })}
          error={errors.portfolio_url}
        />
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
        <Textarea
          id="cv_text"
          label="CV / Resume Text"
          placeholder="Paste your CV or a summary of your experience..."
          value={data.cv_text}
          onChange={(e) => onChange({ cv_text: e.target.value })}
          rows={6}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Sidebar (live preview)
// ---------------------------------------------------------------------------

function ProfileSidebar({ data, userName }: { data: OnboardingData; userName: string }) {
  return (
    <div className="glass-strong p-5 space-y-5">
      <div className="flex flex-col items-center text-center">
        <Avatar name={userName} size="lg" />
        <p className="text-sm font-semibold text-[var(--text-dark)] mt-3">{userName}</p>
        <p className="text-xs text-[var(--text-muted)]">
          {data.headline || "Set up your profile"}
        </p>
      </div>

      {data.skills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.slice(0, 8).map((skill) => (
              <Badge key={skill} variant="blue" className="text-[10px]">{skill}</Badge>
            ))}
            {data.skills.length > 8 && (
              <span className="text-[10px] text-[var(--text-muted)]">
                +{data.skills.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {data.intent && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Looking for</p>
          <p className="text-xs text-[var(--text-dark)]">{data.intent}</p>
        </div>
      )}

      {data.availability && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Availability</p>
          <p className="text-xs text-[var(--text-dark)]">{data.availability}</p>
        </div>
      )}

      <div className="pt-3 border-t border-white/5 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Pencil className="w-3 h-3" /> Edit Profile
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <FileText className="w-3 h-3" /> Import CV
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity Sidebar
// ---------------------------------------------------------------------------

function ActivitySidebar() {
  return (
    <div className="space-y-4">
      <div className="glass-strong p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Top Matches
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          Complete your profile to discover matches.
        </p>
      </div>
      <div className="glass-strong p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Pending Requests
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          No pending requests yet.
        </p>
      </div>
      <div className="glass-strong p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Recent Activity
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          Your activity will appear here.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const updateData = useCallback((patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key];
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

  function goToStep(n: number) {
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
        throw new Error(body.error || `Submission failed (${res.status})`);
      }
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--orange-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const userName = session?.user?.name || "User";
  const pct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-deep)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-[var(--text-dark)] hidden sm:block">SuperNetwork</span>
          </div>
          <div className="glass-strong px-4 py-2 rounded-xl text-xs text-[var(--text-muted)] flex items-center gap-2">
            <span>Editing your profile — navigate freely between steps and save when ready.</span>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-[var(--orange-primary)] font-medium hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6">
          {/* Left sidebar - profile preview */}
          <div className="hidden lg:block">
            <ProfileSidebar data={data} userName={userName} />
          </div>

          {/* Center - main content */}
          <div className="space-y-5">
            {/* Progress */}
            <div className="glass-strong p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-dark)]">
                  Step {step} of {TOTAL_STEPS}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <StepIndicator current={step} total={TOTAL_STEPS} onGoTo={goToStep} />
            </div>

            {/* Step content */}
            <div className="glass-strong p-6">
              {submitError && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {submitError}
                </div>
              )}

              {step === 1 && <StepIntent data={data} onChange={updateData} errors={errors} />}
              {step === 2 && <StepSkills data={data} onChange={updateData} errors={errors} />}
              {step === 3 && <StepInterests data={data} onChange={updateData} />}
              {step === 4 && <StepAvailability data={data} onChange={updateData} errors={errors} />}
              {step === 5 && <StepWorkingStyle data={data} onChange={updateData} errors={errors} />}
              {step === 6 && <StepIkigai data={data} onChange={updateData} errors={errors} />}
              {step === 7 && <StepProfile data={data} onChange={updateData} errors={errors} />}
              {step === 8 && <StepLinks data={data} onChange={updateData} errors={errors} />}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/5">
                {step > 1 ? (
                  <Button type="button" variant="glass" onClick={handleBack} disabled={submitting}>
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
            </div>
          </div>

          {/* Right sidebar - activity */}
          <div className="hidden lg:block">
            <ActivitySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
