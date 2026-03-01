const AI_API_KEY = process.env.AI_API_KEY!;
const AI_API_BASE_URL =
  process.env.AI_API_BASE_URL || "https://api.together.xyz/v1";
const AI_MODEL = process.env.AI_MODEL || "openai/gpt-oss-120b";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function chatCompletion(
  messages: ChatMessage[],
  temperature = 0.7
): Promise<string> {
  const response = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${response.statusText}`);
  }

  const data: ChatResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function generateMatchExplanation(
  userProfile: {
    name: string;
    ikigai_love: string;
    ikigai_good_at: string;
    ikigai_world_needs: string;
    ikigai_paid_for: string;
    skills: string[];
    intent: string;
  },
  matchProfile: {
    name: string;
    ikigai_love: string;
    ikigai_good_at: string;
    ikigai_world_needs: string;
    ikigai_paid_for: string;
    skills: string[];
    intent: string;
  }
): Promise<{
  score: number;
  category: string;
  explanation: string;
  ikigai_alignment: string;
}> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a networking matchmaker AI. Analyze two user profiles based on their Ikigai (what they love, what they're good at, what the world needs, what they can be paid for), skills, and intent. Return a JSON object with:
- "score": match percentage (0-100)
- "category": one of "cofounder", "teammate", "client", "mentor"
- "explanation": 2-3 sentence explanation of why they match
- "ikigai_alignment": 1 sentence about how their Ikigai circles complement each other

Respond ONLY with valid JSON, no markdown.`,
    },
    {
      role: "user",
      content: `User 1 (${userProfile.name}):
- Loves: ${userProfile.ikigai_love}
- Good at: ${userProfile.ikigai_good_at}
- World needs: ${userProfile.ikigai_world_needs}
- Can be paid for: ${userProfile.ikigai_paid_for}
- Skills: ${userProfile.skills.join(", ")}
- Looking for: ${userProfile.intent}

User 2 (${matchProfile.name}):
- Loves: ${matchProfile.ikigai_love}
- Good at: ${matchProfile.ikigai_good_at}
- World needs: ${matchProfile.ikigai_world_needs}
- Can be paid for: ${matchProfile.ikigai_paid_for}
- Skills: ${matchProfile.skills.join(", ")}
- Looking for: ${matchProfile.intent}`,
    },
  ];

  const result = await chatCompletion(messages, 0.5);
  try {
    return JSON.parse(result);
  } catch {
    return {
      score: 50,
      category: "teammate",
      explanation:
        "These profiles share complementary skills and interests that could lead to a productive collaboration.",
      ikigai_alignment:
        "Their Ikigai circles show potential for meaningful connection.",
    };
  }
}

export async function processSearchQuery(query: string): Promise<{
  intent: string | null;
  skills: string[];
  attributes: string[];
  availability: string | null;
  rewritten_query: string;
}> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a search query processor for a networking platform. Extract structured information from natural language search queries. Return a JSON object with:
- "intent": one of "cofounder", "teammate", "client", "mentor", or null
- "skills": array of specific skills mentioned
- "attributes": array of other attributes or qualities mentioned
- "availability": "full-time", "part-time", "freelance", or null
- "rewritten_query": a cleaner version of the query for text search

Respond ONLY with valid JSON, no markdown.`,
    },
    {
      role: "user",
      content: query,
    },
  ];

  const result = await chatCompletion(messages, 0.3);
  try {
    return JSON.parse(result);
  } catch {
    return {
      intent: null,
      skills: [],
      attributes: [],
      availability: null,
      rewritten_query: query,
    };
  }
}

export async function generateMatchCriteriaFromProfile(profile: {
  ikigai_love: string;
  ikigai_good_at: string;
  ikigai_world_needs: string;
  ikigai_paid_for: string;
  skills: string[];
  interests: string[];
  intent: string;
}): Promise<{
  desired_skills: string[];
  desired_interests: string[];
  desired_intent: string;
  desired_availability: string;
  desired_working_style: string;
}> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Based on a user's Ikigai profile, generate ideal match criteria. Return a JSON object with:
- "desired_skills": array of 5-8 complementary skills they should look for
- "desired_interests": array of 3-5 shared interests that would indicate alignment
- "desired_intent": what kind of person would best complement them ("cofounder", "teammate", "client", "mentor")
- "desired_availability": recommended availability match ("full-time", "part-time", "flexible")
- "desired_working_style": recommended working style match ("remote", "hybrid", "in-person", "flexible")

Respond ONLY with valid JSON, no markdown.`,
    },
    {
      role: "user",
      content: `Ikigai:
- Loves: ${profile.ikigai_love}
- Good at: ${profile.ikigai_good_at}
- World needs: ${profile.ikigai_world_needs}
- Can be paid for: ${profile.ikigai_paid_for}
Skills: ${profile.skills.join(", ")}
Interests: ${profile.interests.join(", ")}
Looking for: ${profile.intent}`,
    },
  ];

  const result = await chatCompletion(messages, 0.5);
  try {
    return JSON.parse(result);
  } catch {
    return {
      desired_skills: [],
      desired_interests: [],
      desired_intent: profile.intent || "teammate",
      desired_availability: "flexible",
      desired_working_style: "flexible",
    };
  }
}

export async function generateProfileSummary(profile: {
  name: string;
  bio: string;
  ikigai_love: string;
  ikigai_good_at: string;
  ikigai_world_needs: string;
  ikigai_paid_for: string;
  skills: string[];
}): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "Generate a concise, engaging 2-sentence profile summary based on the user's Ikigai and skills. Write in third person. Be professional but warm.",
    },
    {
      role: "user",
      content: `Name: ${profile.name}
Bio: ${profile.bio}
Loves: ${profile.ikigai_love}
Good at: ${profile.ikigai_good_at}
World needs: ${profile.ikigai_world_needs}
Can be paid for: ${profile.ikigai_paid_for}
Skills: ${profile.skills.join(", ")}`,
    },
  ];

  return chatCompletion(messages, 0.7);
}
