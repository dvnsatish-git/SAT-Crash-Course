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
}
