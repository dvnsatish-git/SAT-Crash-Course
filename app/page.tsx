"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { daysUntilExam, WEEKS, MATH_TOPICS, ENGLISH_TOPICS, EXAM_DATE, TARGET_SCORE } from "./lib/data";
import { getLS } from "./lib/storage";
import { loadData, saveData, awardXp, syncBadges } from "./lib/api-client";
import { emptyProfile, levelInfo, BADGE_CATALOG, XP_RULES } from "./lib/gamification";
import { topicStats } from "./lib/adaptive";
import { QUESTIONS } from "./lib/questions";
import { dueEntries } from "./lib/errorLog";
import { generateMissions } from "./lib/missions";
import type { ExamRecord, GamificationProfile, StudentBadge, ErrorEntry } from "./lib/types";
import type { QuestionHistory } from "./lib/adaptive";

const H = { background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #0f3460 100%)", minHeight: "100vh", fontFamily: "Georgia, serif", color: "#f0f0f0" };

export default function Dashboard() {
  const [days, setDays] = useState(0);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});
  const [topicsDone, setTopicsDone] = useState<Record<string, boolean>>({});
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [profile, setProfile] = useState<GamificationProfile>(emptyProfile());
  const [badges, setBadges] = useState<StudentBadge[]>([]);
  const [qHistory, setQHistory] = useState<QuestionHistory>({});
  const [errorLog, setErrorLog] = useState<ErrorEntry[]>([]);
  const [missionCompletions, setMissionCompletions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDays(daysUntilExam());
    setCompletedDays(getLS("completedDays", {}));
    setTopicsDone(getLS("topicsDone", {}));
    setExamRecords(getLS("examRecords", []));
    loadData<GamificationProfile>("gamification", emptyProfile()).then(setProfile);
    syncBadges().then(setBadges);
    loadData<QuestionHistory>("qHistory", {}).then(setQHistory);
    loadData<ErrorEntry[]>("errorLog", []).then(setErrorLog);
    loadData<Record<string, boolean>>("missionCompletions", {}).then(setMissionCompletions);
  }, []);

  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const totalDays = 42;
  const progress = Math.round((completedCount / totalDays) * 100);

  const allTopics = [...MATH_TOPICS, ...ENGLISH_TOPICS];
  const topicsDoneCount = allTopics.filter((t) => topicsDone[t.id]).length;

  const bestScore = examRecords.length
    ? Math.max(...examRecords.map((r) => r.totalScore))
    : null;

  const examDateLabel = new Date(`${EXAM_DATE}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  // Current week based on days elapsed
  const elapsedDays = Math.floor((new Date(EXAM_DATE).getTime() - new Date().getTime()) / 86400000);
  const currentWeekIdx = Math.min(5, Math.max(0, Math.floor((42 - Math.max(0, elapsedDays)) / 7)));
  const todayWeek = WEEKS[currentWeekIdx];
  const todayDayIdx = new Date().getDay(); // 0=Sun
  const dayMap = [6, 0, 1, 2, 3, 4, 5]; // Sun→6, Mon→0, ...
  const todayTask = todayWeek?.days[dayMap[todayDayIdx]];

  const todayStr = new Date().toISOString().slice(0, 10);
  const stats = topicStats(qHistory, QUESTIONS);
  const dueReviewCount = dueEntries(errorLog).length;
  const missions = generateMissions({
    stats,
    dueReviewCount,
    daysUntilExam: days,
    todayCurriculum: todayTask ? { math: todayTask.math, english: todayTask.english } : null,
  });

  const toggleMission = async (id: string) => {
    const key = `${todayStr}:${id}`;
    const nowDone = !missionCompletions[key];
    const next = { ...missionCompletions, [key]: nowDone };
    setMissionCompletions(next);
    saveData("missionCompletions", next);
    if (nowDone) {
      const updated = await awardXp(XP_RULES.completedPlanDay);
      setProfile(updated);
      syncBadges().then(setBadges);
    }
  };

  const quickLinks = [
    { href: "/practice", icon: "✏️", label: "Practice Questions", color: "#f97316", desc: "Topic drills with instant feedback" },
    { href: "/exam", icon: "⏱️", label: "Practice Exam", color: "#8b5cf6", desc: "Timed simulation with score estimate" },
    { href: "/plan", icon: "📅", label: "Study Plan", color: "#06b6d4", desc: "6-week day-by-day schedule" },
    { href: "/tracker", icon: "📈", label: "Score Tracker", color: "#10b981", desc: "Log and track your progress" },
    { href: "/errors", icon: "🧠", label: "Error Log", color: "#ef4444", desc: "Review mistakes on a spaced schedule" },
    { href: "/analytics", icon: "📉", label: "Analytics", color: "#06b6d4", desc: "Domain accuracy, trends & patterns" },
    { href: "/tutor", icon: "🤖", label: "AI Tutor", color: "#f59e0b", desc: "Ask Claude anything SAT-related" },
  ];

  return (
    <div style={H}>
      {/* Header */}
      <div style={{ background: "linear-gradient(90deg, #1a1a2e, #16213e)", borderBottom: "2px solid #f97316", padding: "20px 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 24px rgba(249,115,22,0.15)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#f97316", textTransform: "uppercase", fontFamily: "monospace" }}>SAT Prep Command Center</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#fff", marginTop: 2 }}>{examDateLabel} · {TARGET_SCORE}+ Goal</div>
            </div>
            <div style={{ background: "rgba(249,115,22,0.15)", border: "1px solid #f97316", borderRadius: 12, padding: "10px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: "bold", color: "#f97316", lineHeight: 1 }}>{days}</div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 2, textTransform: "uppercase" }}>Days Left</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace" }}>PLAN PROGRESS</span>
              <span style={{ fontSize: 10, color: "#f97316", fontFamily: "monospace" }}>{completedCount}/{totalDays} · {progress}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 5 }}>
              <div style={{ background: "linear-gradient(90deg,#f97316,#ef4444)", borderRadius: 99, height: 5, width: `${progress}%`, transition: "width 0.4s" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 0" }}>

        {/* Level / XP / streak */}
        {(() => {
          const lvl = levelInfo(profile.xp);
          return (
            <div style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.03))", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: "bold", color: "#f59e0b" }}>{lvl.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{profile.xp} XP{lvl.next ? ` · ${lvl.xpToNext} to ${lvl.next}` : " · max level"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#f97316" }}>🔥 {profile.currentStreak}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>day streak · best {profile.longestStreak}</div>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 5 }}>
                <div style={{ background: "linear-gradient(90deg,#f59e0b,#f97316)", borderRadius: 99, height: 5, width: `${lvl.progress}%`, transition: "width 0.4s" }} />
              </div>
              {badges.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {badges.map((b) => {
                    const meta = BADGE_CATALOG.find((c) => c.code === b.code);
                    if (!meta) return null;
                    return (
                      <span key={b.code} title={meta.description} style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, padding: "3px 9px", fontFamily: "monospace" }}>
                        {meta.icon} {meta.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Days Done", value: completedCount, total: totalDays, color: "#f97316" },
            { label: "Topics Mastered", value: topicsDoneCount, total: allTopics.length, color: "#8b5cf6" },
            { label: "Best Score", value: bestScore ?? "—", total: null, color: "#10b981" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: s.color }}>{s.value}</div>
              {s.total && <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>/ {s.total}</div>}
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Quiz */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace" }}>⚡ Quick Quiz</div>
            <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>pick a mode &amp; go</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {([
              { id: "reel",   icon: "🎬", label: "Reel",   sub: "2q",  color: "#8b5cf6" },
              { id: "rocket", icon: "🚀", label: "Rocket", sub: "4q · 5m", color: "#06b6d4" },
              { id: "beast",  icon: "🔥", label: "Beast",  sub: "7q · 10m", color: "#f97316" },
              { id: "legend", icon: "👑", label: "Legend", sub: "10q · 15m", color: "#10b981" },
            ] as const).map((m) => (
              <Link key={m.id} href={`/quiz?mode=${m.id}`} style={{
                background: `linear-gradient(160deg,${m.color}22,${m.color}0a)`,
                border: `1px solid ${m.color}55`,
                borderRadius: 14, padding: "12px 8px",
                textDecoration: "none", textAlign: "center", display: "block",
              }}>
                <div style={{ fontSize: 26, marginBottom: 5 }}>{m.icon}</div>
                <div style={{ fontSize: 12, fontWeight: "bold", color: m.color, marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>{m.sub}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Missions — adaptive, rule-based */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace" }}>Today&apos;s Missions</div>
            <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>adapts to your weak spots</span>
          </div>
          {missions.map((m) => {
            const key = `${todayStr}:${m.id}`;
            const done = !!missionCompletions[key];
            const typeColor: Record<string, string> = { review: "#f59e0b", drill: "#f97316", timed: "#06b6d4", test: "#8b5cf6", learn: "#10b981" };
            const color = typeColor[m.taskType] ?? "#94a3b8";
            return (
              <div key={m.id} style={{
                background: done ? "rgba(16,185,129,0.06)" : `${color}0d`,
                border: `1px solid ${done ? "rgba(16,185,129,0.3)" : color + "33"}`,
                borderRadius: 12, padding: "10px 12px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <button onClick={() => toggleMission(m.id)} style={{
                  width: 26, height: 26, borderRadius: 99, flexShrink: 0, cursor: "pointer",
                  background: done ? "#10b981" : "rgba(255,255,255,0.07)",
                  border: `2px solid ${done ? "#10b981" : "rgba(255,255,255,0.2)"}`,
                  color: "#fff", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
                }}>{done ? "✓" : ""}</button>
                <Link href={m.href} style={{ flex: 1, textDecoration: "none", color: "#e2e8f0", opacity: done ? 0.55 : 1 }}>
                  <div style={{ fontSize: 13, fontWeight: "bold", textDecoration: done ? "line-through" : "none" }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{m.rationale}</div>
                </Link>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color, fontFamily: "monospace" }}>{m.minutes}m</div>
                  <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase" }}>{m.taskType}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Written weekly curriculum reference */}
        {todayTask && (
          <div style={{ background: `linear-gradient(135deg, ${todayWeek.color}18, ${todayWeek.color}09)`, border: `1px solid ${todayWeek.color}33`, borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: todayWeek.color, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 6 }}>
              Week {todayWeek.week} curriculum reference: {todayWeek.theme}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 3 }}>
              <span style={{ color: "#60a5fa" }}>Math:</span> {todayTask.math}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              <span style={{ color: "#a78bfa" }}>English:</span> {todayTask.english}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {quickLinks.map((l) => (
              <Link key={l.href} href={l.href} style={{
                background: `linear-gradient(135deg, ${l.color}20, ${l.color}0d)`,
                border: `1px solid ${l.color}44`,
                borderRadius: 12, padding: "14px 12px",
                textDecoration: "none", color: "#fff",
                display: "block", transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{l.icon}</div>
                <div style={{ fontSize: 14, fontWeight: "bold", color: l.color, marginBottom: 2 }}>{l.label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{l.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Scores */}
        {examRecords.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 14, marginTop: 8 }}>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10 }}>Recent Scores</div>
            {examRecords.slice(-3).reverse().map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{r.date}</span>
                  <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>{r.type}</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#60a5fa", fontFamily: "monospace" }}>M:{r.mathScore}</span>
                  <span style={{ fontSize: 11, color: "#a78bfa", fontFamily: "monospace" }}>E:{r.englishScore}</span>
                  <span style={{ fontSize: 15, fontWeight: "bold", color: "#f97316" }}>{r.totalScore}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Key Reminder */}
        <div style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 12, padding: 14, marginTop: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: "#f97316", fontWeight: "bold", marginBottom: 6 }}>Before Every Problem</div>
          <div style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.7 }}>
            1. Underline what is being asked<br />
            2. Show all work — no mental math<br />
            3. Re-read the question after solving
          </div>
        </div>
      </div>
    </div>
  );
}
