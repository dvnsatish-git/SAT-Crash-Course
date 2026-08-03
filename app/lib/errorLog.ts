import type { ErrorEntry, ErrorReview } from "./types";

/** Same-day correction, then 1/3/7/14/30-day retests */
export const REVIEW_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function newErrorEntry(
  partial: Omit<
    ErrorEntry,
    "id" | "createdAt" | "updatedAt" | "reviews" | "mastered" | "category" | "explanation" | "lessonLearned" | "confidenceAfter"
  > &
    Partial<Pick<ErrorEntry, "category" | "explanation" | "lessonLearned" | "confidenceAfter">>
): ErrorEntry {
  const now = Date.now();
  return {
    id: `err-${now}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    category: partial.category ?? null,
    explanation: partial.explanation ?? "",
    lessonLearned: partial.lessonLearned ?? "",
    confidenceAfter: partial.confidenceAfter ?? null,
    reviews: [{ stage: 1, dueDate: addDays(1), completedAt: null, outcome: null }],
    mastered: false,
    ...partial,
  };
}

/** The next incomplete review, if any */
export function pendingReview(entry: ErrorEntry): ErrorReview | null {
  return entry.reviews.find((r) => r.completedAt === null) ?? null;
}

export function isDue(entry: ErrorEntry, asOf: string = todayStr()): boolean {
  const rev = pendingReview(entry);
  return !entry.mastered && rev !== null && rev.dueDate <= asOf;
}

export function dueEntries(entries: ErrorEntry[], asOf: string = todayStr()): ErrorEntry[] {
  return entries.filter((e) => isDue(e, asOf));
}

/**
 * Records the outcome of the current pending review. On success, schedules the
 * next spaced interval (or marks mastered once the 30-day stage passes). On
 * failure, resets to the 1-day stage so the concept gets reinforced sooner.
 */
export function completeReview(entry: ErrorEntry, outcome: "correct" | "incorrect"): ErrorEntry {
  const rev = pendingReview(entry);
  if (!rev) return entry;

  const now = Date.now();
  const completedReview: ErrorReview = { ...rev, completedAt: now, outcome };
  const otherReviews = entry.reviews.filter((r) => r !== rev);

  if (outcome === "incorrect") {
    const nextReview: ErrorReview = { stage: 1, dueDate: addDays(1), completedAt: null, outcome: null };
    return { ...entry, updatedAt: now, reviews: [...otherReviews, completedReview, nextReview] };
  }

  const nextStage = rev.stage + 1;
  if (nextStage >= REVIEW_INTERVALS_DAYS.length) {
    return { ...entry, updatedAt: now, mastered: true, reviews: [...otherReviews, completedReview] };
  }
  const nextReview: ErrorReview = {
    stage: nextStage,
    dueDate: addDays(REVIEW_INTERVALS_DAYS[nextStage]),
    completedAt: null,
    outcome: null,
  };
  return { ...entry, updatedAt: now, reviews: [...otherReviews, completedReview, nextReview] };
}

export function markMastered(entry: ErrorEntry, mastered: boolean): ErrorEntry {
  return { ...entry, mastered, updatedAt: Date.now() };
}

/** Groups by topic to summarize repeated mistake patterns */
export function repeatedPatterns(entries: ErrorEntry[]): { topic: string; section: string; count: number; category: string | null }[] {
  const map: Record<string, { section: string; count: number; categories: Record<string, number> }> = {};
  for (const e of entries) {
    const key = e.topic;
    if (!map[key]) map[key] = { section: e.section, count: 0, categories: {} };
    map[key].count += 1;
    if (e.category) map[key].categories[e.category] = (map[key].categories[e.category] ?? 0) + 1;
  }
  return Object.entries(map)
    .filter(([, v]) => v.count >= 2)
    .map(([topic, v]) => {
      const topCategory = Object.entries(v.categories).sort((a, b) => b[1] - a[1])[0];
      return { topic, section: v.section, count: v.count, category: topCategory ? topCategory[0] : null };
    })
    .sort((a, b) => b.count - a.count);
}
