export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Scheme {
  id: string;
  name: string;
  ministry: string | null;
  category: string | null;
  description: string | null;
  eligibility: string | null;
  benefits: string | null;
  how_to_apply: string | null;
  documents_required: string[] | null;
  official_url: string | null;
}

export interface SchemeMatch {
  id: string;
  scheme: Scheme;
  confidence_score: number | null;
  reason: string | null;
  draft_letter: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
  scheme_matches: SchemeMatch[];
}

export interface ClaudeResponse {
  conversation_id: string;
  assistant_message: Message;
  scheme_matches: SchemeMatch[];
}

export interface AdminStats {
  total_users: number;
  total_conversations: number;
  total_messages: number;
  total_scheme_matches: number;
}