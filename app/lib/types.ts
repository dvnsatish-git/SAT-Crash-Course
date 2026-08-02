export interface Question {
  id: string;
  section: "math" | "english";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  passage?: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface SessionResult {
  id: string;
  date: string;
  section: "math" | "english" | "mixed";
  topic: string;
  correct: number;
  total: number;
}

export interface DomainResult {
  section: "math" | "english";
  topic: string;
  correct: number;
  total: number;
}

export interface ExamRecord {
  id: string;
  date: string;
  type: "practice" | "official";
  mathCorrect: number;
  mathTotal: number;
  englishCorrect: number;
  englishTotal: number;
  mathScore: number;
  englishScore: number;
  totalScore: number;
  notes: string;
  source?: PracticeSource;
  domainResults?: DomainResult[];
}

export type PracticeSource =
  | "bluebook"
  | "question_bank"
  | "khan_academy"
  | "uworld"
  | "1600.io"
  | "school_tutor"
  | "app_generated"
  | "other";

export const PRACTICE_SOURCE_LABELS: Record<PracticeSource, string> = {
  bluebook: "College Board Bluebook",
  question_bank: "College Board Question Bank",
  khan_academy: "Khan Academy",
  uworld: "UWorld",
  "1600.io": "1600.io",
  school_tutor: "School or Tutor",
  app_generated: "Original App-Generated Practice",
  other: "Other",
};

export type ErrorCategory =
  | "concept_gap"
  | "misread"
  | "careless"
  | "time_pressure"
  | "strategy"
  | "grammar_gap"
  | "vocabulary_gap"
  | "guessed"
  | "other";

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  concept_gap: "Concept gap",
  misread: "Misread question",
  careless: "Careless calculation",
  time_pressure: "Time pressure",
  strategy: "Strategy error",
  grammar_gap: "Grammar rule gap",
  vocabulary_gap: "Vocabulary/comprehension gap",
  guessed: "Guessed",
  other: "Other",
};

export interface ErrorReview {
  stage: number; // index into REVIEW_INTERVALS_DAYS
  dueDate: string; // YYYY-MM-DD
  completedAt: number | null;
  outcome: "correct" | "incorrect" | null;
}

export type ErrorSource = "practice" | "quiz" | "exam" | "manual" | PracticeSource;

export interface ErrorEntry {
  id: string;
  createdAt: number;
  updatedAt: number;
  source: ErrorSource;
  testOrAssignment?: string;
  section: "math" | "english";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questionRef: string;
  questionText?: string;
  userAnswer: string;
  correctAnswer: string;
  category: ErrorCategory | null;
  explanation: string;
  lessonLearned: string;
  confidenceAfter: number | null; // 1-5
  reviews: ErrorReview[];
  mastered: boolean;
}

export interface GamificationProfile {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
}

export interface StudentBadge {
  code: string;
  earnedAt: number;
}
