export interface User {
  id: number;
  learner_id: string;
  email: string;
  name: string | null;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string | null;
  learning_goal: string | null;
  explanation_language: string;
  daily_duration: number;
  weekly_frequency: number;
  current_level: string;
  target_level: string;
  bangla_assistance: boolean;
  female_voice: boolean;
  voice_speed: string;
  personality: string;
  correction_intensity: string;
  profile_image: string | null;
  onboarding_completed: boolean;
  learner_id?: string;
  email?: string;
  user_name?: string;
  created_at?: string;
}

export interface Progress {
  id: number;
  user_id: number;
  total_speaking_time: number;
  practice_streak: number;
  last_practice_date: string | null;
  accuracy: number;
  conversation_length_avg: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  confidence: number;
}

export interface Settings {
  id: number;
  user_id: number;
  subtitles_enabled: boolean;
  subtitle_font_size: string;
  focus_word_highlighting: boolean;
  english_captions: boolean;
  bangla_captions: boolean;
  auto_scroll: boolean;
  reduced_motion: boolean;
  large_text: boolean;
}

export interface LearnerMemory {
  id: number;
  user_id: number;
  strengths: string | null;
  weaknesses: string | null;
  recurring_mistakes: string | null;
  vocabulary: string | null;
  pronunciation_notes: string | null;
  topics: string | null;
  completed_lessons: string | null;
  unfinished_lessons: string | null;
  goals: string | null;
  preferences: string | null;
  recent_performance: string | null;
  long_term_performance: string | null;
}

export interface Session {
  session_id: string;
  date: string;
  duration: number;
  mode: string;
  topic: string | null;
  summary: string | null;
  scores: string | null;
  ended_at: string | null;
}

export interface VocabItem {
  id: number;
  word: string;
  meaning: string | null;
  example: string | null;
  pronunciation: string | null;
  difficulty: string;
  date_introduced: string;
  mastery: number;
  review_status: string;
  context: string | null;
}

export interface Mistake {
  id: number;
  original_sentence: string;
  corrected_sentence: string;
  explanation: string | null;
  category: string | null;
  frequency: number;
  first_seen: string;
  last_seen: string;
  improvement_status: string;
  severity: string;
}

export interface Goal {
  id: number;
  title: string;
  description: string | null;
  current_status: string | null;
  target_status: string | null;
  progress: number;
  blocking_factor: string | null;
  next_action: string | null;
}

export interface Schedule {
  id: number;
  user_id: number;
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
  sunday: string | null;
}

export interface LevelHistory {
  id: number;
  level: string;
  confidence: number;
  evidence_count: number;
  grammar_score: number;
  vocabulary_score: number;
  fluency_score: number;
  pronunciation_score: number;
  comprehension_score: number;
  confidence_score: number;
  assessed_at: string;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  banglaExplanation?: string;
  focusWord: string;
  category: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  correction?: Correction;
}
