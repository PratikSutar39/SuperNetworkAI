export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  bio: string | null;
  headline: string | null;
  ikigai_love: string | null;
  ikigai_good_at: string | null;
  ikigai_world_needs: string | null;
  ikigai_paid_for: string | null;
  skills: string[];
  interests: string[];
  availability: string | null;
  working_style: string | null;
  portfolio_text: string | null;
  portfolio_url: string | null;
  cv_text: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  intent: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchCriteria {
  id: string;
  user_id: string;
  desired_skills: string[];
  desired_interests: string[];
  desired_intent: string | null;
  desired_availability: string | null;
  desired_working_style: string | null;
  custom_notes: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "rejected";
  message: string | null;
  created_at: string;
  updated_at: string;
  requester?: User & { profile?: Profile };
  recipient?: User & { profile?: Profile };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface VisibilitySettings {
  id: string;
  user_id: string;
  show_email: boolean;
  show_skills: boolean;
  show_ikigai: boolean;
  show_portfolio: boolean;
  show_social_links: boolean;
  profile_discoverable: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchSuggestion {
  user: User;
  profile: Profile;
  score: number;
  category: "cofounder" | "teammate" | "client" | "mentor";
  explanation: string;
  matching_skills: string[];
  ikigai_alignment: string;
}

export interface Conversation {
  id: string;
  other_user: User & { profile?: Profile };
  last_message: Message | null;
  unread_count: number;
}

export interface OnboardingData {
  ikigai_love: string;
  ikigai_good_at: string;
  ikigai_world_needs: string;
  ikigai_paid_for: string;
  portfolio_text: string;
  portfolio_url: string;
  cv_text: string;
  linkedin_url: string;
  github_url: string;
  twitter_url: string;
  website_url: string;
  intent: string;
  skills: string[];
  interests: string[];
  availability: string;
  working_style: string;
  bio: string;
  headline: string;
}

export interface SearchFilters {
  category?: "cofounder" | "teammate" | "client" | "mentor";
  skills?: string[];
  availability?: string;
  query: string;
}
