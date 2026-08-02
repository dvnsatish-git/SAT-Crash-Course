import type { GamificationProfile, StudentBadge } from "./types";

export const LEVELS = [
  { name: "Explorer", minXp: 0 },
  { name: "Builder", minXp: 200 },
  { name: "Strategist", minXp: 500 },
  { name: "Scholar", minXp: 1000 },
  { name: "SAT Master", minXp: 2000 },
  { name: "1500 Legend", minXp: 3500 },
];

export function emptyProfile(): GamificationProfile {
  return { xp: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null };
}

export function levelInfo(xp: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) idx = i;
  }
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;
  const progress = next ? Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100) : 100;
  return { index: idx, name: current.name, next: next?.name ?? null, xpToNext: next ? next.minXp - xp : 0, progress };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

/** Awards XP and updates the daily streak (does not penalize missed days harshly). */
export function recordActivity(profile: GamificationProfile, xpGain: number): GamificationProfile {
  const today = todayStr();
  let currentStreak = profile.currentStreak;

  if (profile.lastActiveDate === today) {
    // already active today — streak unchanged
  } else if (profile.lastActiveDate && daysBetween(profile.lastActiveDate, today) === 1) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  return {
    xp: profile.xp + xpGain,
    currentStreak,
    longestStreak: Math.max(profile.longestStreak, currentStreak),
    lastActiveDate: today,
  };
}

export const XP_RULES = {
  correctAnswer: 10,
  incorrectAttempt: 2,
  completedReview: 15,
  masteredError: 30,
  completedExam: 60,
  completedPlanDay: 20,
};

export const BADGE_CATALOG: { code: string; name: string; description: string; icon: string }[] = [
  { code: "streak_3", name: "3-Day Streak", description: "Studied 3 days in a row", icon: "🔥" },
  { code: "streak_7", name: "Weekly Warrior", description: "Studied 7 days in a row", icon: "🏆" },
  { code: "streak_14", name: "Consistency Champion", description: "Studied 14 days in a row", icon: "💎" },
  { code: "first_error_mastered", name: "Error Slayer", description: "Mastered your first error", icon: "🗡️" },
  { code: "errors_10_mastered", name: "Pattern Breaker", description: "Mastered 10 errors", icon: "🧩" },
  { code: "xp_500", name: "Rising Strategist", description: "Earned 500 XP", icon: "⭐" },
  { code: "xp_2000", name: "SAT Master", description: "Earned 2000 XP", icon: "👑" },
];

export function checkNewBadges(
  profile: GamificationProfile,
  masteredErrorCount: number,
  earned: StudentBadge[]
): StudentBadge[] {
  const have = new Set(earned.map((b) => b.code));
  const newly: StudentBadge[] = [];
  const grant = (code: string) => {
    if (!have.has(code)) newly.push({ code, earnedAt: Date.now() });
  };

  if (profile.currentStreak >= 3) grant("streak_3");
  if (profile.currentStreak >= 7) grant("streak_7");
  if (profile.currentStreak >= 14) grant("streak_14");
  if (masteredErrorCount >= 1) grant("first_error_mastered");
  if (masteredErrorCount >= 10) grant("errors_10_mastered");
  if (profile.xp >= 500) grant("xp_500");
  if (profile.xp >= 2000) grant("xp_2000");

  return newly;
}
