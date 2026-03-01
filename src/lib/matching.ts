import type { Profile, MatchCriteria, MatchSuggestion, User } from "@/types";

function skillOverlapScore(
  userSkills: string[],
  matchSkills: string[],
  desiredSkills: string[]
): number {
  if (desiredSkills.length === 0 && matchSkills.length === 0) return 0;

  const normalizeSkill = (s: string) => s.toLowerCase().trim();
  const matchNormalized = matchSkills.map(normalizeSkill);
  const desiredNormalized = desiredSkills.map(normalizeSkill);

  let score = 0;
  let total = Math.max(desiredNormalized.length, 1);

  for (const desired of desiredNormalized) {
    if (matchNormalized.some((ms) => ms.includes(desired) || desired.includes(ms))) {
      score++;
    }
  }

  // Bonus for complementary skills (match has skills user doesn't)
  const userNormalized = userSkills.map(normalizeSkill);
  const complementary = matchNormalized.filter(
    (ms) => !userNormalized.some((us) => us.includes(ms) || ms.includes(us))
  );
  const complementaryBonus = Math.min(complementary.length * 5, 20);

  return Math.min(((score / total) * 80) + complementaryBonus, 100);
}

function intentCompatibilityScore(
  userIntent: string | null,
  matchIntent: string | null,
  desiredIntent: string | null
): number {
  if (!userIntent || !matchIntent) return 50;

  const compatibilityMap: Record<string, string[]> = {
    cofounder: ["cofounder", "teammate"],
    teammate: ["cofounder", "teammate", "mentor"],
    client: ["freelance", "teammate", "cofounder"],
    mentor: ["teammate", "cofounder"],
  };

  const compatible = compatibilityMap[userIntent] || [];
  if (matchIntent === desiredIntent) return 100;
  if (compatible.includes(matchIntent)) return 75;
  return 30;
}

function availabilityScore(
  userAvailability: string | null,
  matchAvailability: string | null
): number {
  if (!userAvailability || !matchAvailability) return 50;
  if (userAvailability === matchAvailability) return 100;
  if (userAvailability === "flexible" || matchAvailability === "flexible")
    return 80;
  return 40;
}

function workingStyleScore(
  userStyle: string | null,
  matchStyle: string | null
): number {
  if (!userStyle || !matchStyle) return 50;
  if (userStyle === matchStyle) return 100;
  if (userStyle === "flexible" || matchStyle === "flexible") return 80;
  if (
    (userStyle === "hybrid" && matchStyle === "remote") ||
    (userStyle === "remote" && matchStyle === "hybrid")
  )
    return 70;
  return 30;
}

function determineCategory(
  userIntent: string | null,
  matchIntent: string | null
): "cofounder" | "teammate" | "client" | "mentor" {
  if (userIntent === "cofounder" && matchIntent === "cofounder")
    return "cofounder";
  if (userIntent === "mentor" || matchIntent === "mentor") return "mentor";
  if (userIntent === "client" || matchIntent === "client") return "client";
  return "teammate";
}

export function calculateMatchScore(
  userProfile: Profile,
  userCriteria: MatchCriteria | null,
  matchProfile: Profile
): { score: number; category: "cofounder" | "teammate" | "client" | "mentor" } {
  const desiredSkills = userCriteria?.desired_skills || [];

  const skills = skillOverlapScore(
    userProfile.skills,
    matchProfile.skills,
    desiredSkills
  );
  const intent = intentCompatibilityScore(
    userProfile.intent,
    matchProfile.intent,
    userCriteria?.desired_intent || null
  );
  const avail = availabilityScore(
    userProfile.availability,
    matchProfile.availability
  );
  const style = workingStyleScore(
    userProfile.working_style,
    matchProfile.working_style
  );

  // Weighted score
  const score = Math.round(
    skills * 0.35 + intent * 0.30 + avail * 0.15 + style * 0.20
  );
  const category = determineCategory(userProfile.intent, matchProfile.intent);

  return { score: Math.min(score, 100), category };
}

export function rankMatches(
  matches: Array<{
    user: User;
    profile: Profile;
    score: number;
    category: "cofounder" | "teammate" | "client" | "mentor";
  }>
): typeof matches {
  return [...matches].sort((a, b) => b.score - a.score);
}

export function filterMatchesByCategory(
  matches: MatchSuggestion[],
  category: string
): MatchSuggestion[] {
  if (!category || category === "all") return matches;
  return matches.filter((m) => m.category === category);
}
