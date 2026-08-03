import { MATH_TOPICS, ENGLISH_TOPICS } from "./data";

export type MissionTaskType = "learn" | "drill" | "timed" | "review" | "test";

export interface Mission {
  id: string;
  subject: "math" | "english" | "mixed";
  taskType: MissionTaskType;
  title: string;
  minutes: number;
  priority: number; // 1 = highest
  rationale: string;
  href: string;
}

interface TopicStat {
  topic: string;
  section: "math" | "english";
  accuracy: number;
  total: number;
}

const TOPIC_LABEL: Record<string, string> = Object.fromEntries(
  [...MATH_TOPICS, ...ENGLISH_TOPICS].map((t) => [t.id, t.label])
);

/**
 * Rule-based daily mission generator. Adapts to recent errors, weak topics,
 * due spaced reviews, and test-date urgency. Falls back to the written
 * weekly curriculum when there isn't enough performance data yet.
 */
export function generateMissions(params: {
  stats: TopicStat[];
  dueReviewCount: number;
  daysUntilExam: number;
  todayCurriculum: { math: string; english: string } | null;
}): Mission[] {
  const { stats, dueReviewCount, daysUntilExam, todayCurriculum } = params;
  const missions: Mission[] = [];
  let priority = 1;

  if (dueReviewCount > 0) {
    missions.push({
      id: "review",
      subject: "mixed",
      taskType: "review",
      title: `Review ${dueReviewCount} due error${dueReviewCount === 1 ? "" : "s"}`,
      minutes: Math.min(30, dueReviewCount * 4),
      priority: priority++,
      rationale: "Spaced repetition — these mistakes are scheduled for retest today.",
      href: "/errors",
    });
  }

  const weak = stats.filter((s) => s.accuracy < 0.5 && s.total >= 2).slice(0, 2);
  for (const w of weak) {
    missions.push({
      id: `drill-${w.topic}`,
      subject: w.section,
      taskType: "drill",
      title: `Targeted drill: ${TOPIC_LABEL[w.topic] ?? w.topic}`,
      minutes: 20,
      priority: priority++,
      rationale: `${Math.round(w.accuracy * 100)}% accuracy over ${w.total} attempts — your weakest active area.`,
      href: `/practice?section=${w.section}&topic=${w.topic}`,
    });
  }

  if (weak.length === 0 && todayCurriculum) {
    missions.push({
      id: "learn-math",
      subject: "math",
      taskType: "learn",
      title: todayCurriculum.math,
      minutes: 30,
      priority: priority++,
      rationale: "Today's curriculum topic — not enough attempts yet to detect a weak area.",
      href: "/practice?section=math",
    });
    missions.push({
      id: "learn-english",
      subject: "english",
      taskType: "learn",
      title: todayCurriculum.english,
      minutes: 15,
      priority: priority++,
      rationale: "Today's curriculum topic — not enough attempts yet to detect a weak area.",
      href: "/practice?section=english",
    });
  }

  const urgent = daysUntilExam <= 21;
  missions.push({
    id: "timed",
    subject: "mixed",
    taskType: urgent ? "test" : "timed",
    title: urgent ? "Timed full-length simulation" : "Timed module practice",
    minutes: urgent ? 90 : 25,
    priority: priority++,
    rationale: urgent
      ? `Only ${daysUntilExam} days left — prioritize full-length pacing practice.`
      : "At least twice a week, build stamina and pacing under timed conditions.",
    href: "/exam",
  });

  if (stats.length > 0) {
    missions.push({
      id: "quick-quiz",
      subject: "mixed",
      taskType: "drill",
      title: "Quick Quiz — mixed adaptive reps",
      minutes: 10,
      priority: priority++,
      rationale: "Short adaptive rep set that leans on your weaker topics.",
      href: "/quiz",
    });
  }

  return missions.sort((a, b) => a.priority - b.priority).slice(0, 6);
}
