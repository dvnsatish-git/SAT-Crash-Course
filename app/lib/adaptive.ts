import type { Question } from "./types";

export type QuestionRecord = {
  correct: number;
  total: number;
  lastAttempt: number; // ms timestamp
};

export type QuestionHistory = Record<string, QuestionRecord>;

/** Weighted random selection — harder/wrong questions surface more often */
export function selectAdaptive(
  questions: Question[],
  history: QuestionHistory,
  section?: "math" | "english",
  topic?: string
): Question {
  const pool = questions.filter(
    (q) => (!section || q.section === section) && (!topic || q.topic === topic)
  );
  if (pool.length === 0) return questions[Math.floor(Math.random() * questions.length)];

  const weights = pool.map((q) => questionWeight(q.id, history));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function questionWeight(id: string, history: QuestionHistory): number {
  const h = history[id];
  if (!h || h.total === 0) return 1.5; // unseen: moderate priority

  const accuracy = h.correct / h.total;
  const hoursSince = (Date.now() - h.lastAttempt) / 3_600_000;
  const recencyBoost = Math.exp(-hoursSince / 24); // decays over ~24 h

  if (accuracy < 0.34) return 4.0 + 2.0 * recencyBoost; // very weak
  if (accuracy < 0.67) return 2.0 + 1.0 * recencyBoost; // mixed
  if (accuracy < 0.90) return 0.8;                       // solid
  return 0.3;                                             // mastered
}

/** Per-topic accuracy stats derived from history */
export function topicStats(history: QuestionHistory, questions: Question[]) {
  const map: Record<string, { correct: number; total: number; section: string }> = {};

  for (const [id, rec] of Object.entries(history)) {
    const q = questions.find((q) => q.id === id);
    if (!q || rec.total === 0) continue;
    if (!map[q.topic]) map[q.topic] = { correct: 0, total: 0, section: q.section };
    map[q.topic].correct += rec.correct;
    map[q.topic].total += rec.total;
  }

  return Object.entries(map)
    .filter(([, v]) => v.total >= 2)
    .map(([topic, v]) => ({
      topic,
      section: v.section as "math" | "english",
      accuracy: v.correct / v.total,
      total: v.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Returns the single weakest topic below 50% accuracy with ≥2 attempts */
export function weakestTopic(
  history: QuestionHistory,
  questions: Question[],
  section?: string
) {
  const stats = topicStats(history, questions).filter(
    (s) => !section || s.section === section
  );
  if (stats.length === 0 || stats[0].accuracy >= 0.5) return null;
  return stats[0];
}
