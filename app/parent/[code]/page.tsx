"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { loadDataForDevice } from "../../lib/api-client";
import { emptyProfile, levelInfo } from "../../lib/gamification";
import { topicStats } from "../../lib/adaptive";
import { QUESTIONS } from "../../lib/questions";
import { daysUntilExam } from "../../lib/data";
import type { ExamRecord, ErrorEntry, GamificationProfile } from "../../lib/types";
import type { QuestionHistory } from "../../lib/adaptive";

const CYAN = "#06b6d4";

export default function ParentDashboard() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<GamificationProfile>(emptyProfile());
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [errorLog, setErrorLog] = useState<ErrorEntry[]>([]);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});
  const [qHistory, setQHistory] = useState<QuestionHistory>({});

  useEffect(() => {
    if (!code) return;
    Promise.all([
      loadDataForDevice<GamificationProfile>(code, "gamification", emptyProfile()),
      loadDataForDevice<ExamRecord[]>(code, "examRecords", []),
      loadDataForDevice<ErrorEntry[]>(code, "errorLog", []),
      loadDataForDevice<Record<string, boolean>>(code, "completedDays", {}),
      loadDataForDevice<QuestionHistory>(code, "qHistory", {}),
    ]).then(([p, ex, log, cd, h]) => {
      setProfile(p);
      setExamRecords(ex);
      setErrorLog(log);
      setCompletedDays(cd);
      setQHistory(h);
      setLoaded(true);
    });
  }, [code]);

  const lvl = levelInfo(profile.xp);
  const latest = examRecords.length ? examRecords[examRecords.length - 1] : null;
  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const completionPct = Math.round((completedCount / 42) * 100);
  const stats = topicStats(qHistory, QUESTIONS);
  const weakest = stats.slice(0, 3);
  const masteredCount = errorLog.filter((e) => e.mastered).length;
  const activeErrors = errorLog.length - masteredCount;
  const activityCount = errorLog.length + Object.values(qHistory).reduce((sum, r) => sum + r.total, 0);

  const summary = loaded
    ? `${completionPct}% of the study plan is complete with a ${profile.currentStreak}-day streak. ` +
      (weakest.length > 0
        ? `The main area to watch is ${weakest[0].topic} (${Math.round(weakest[0].accuracy * 100)}% accuracy). `
        : "Not enough practice data yet to identify a focus area. ") +
      (activeErrors > 0 ? `${activeErrors} logged mistakes are still active in the review queue.` : "No mistakes are currently pending review.")
    : "";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0" }}>
      <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: `2px solid ${CYAN}`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: CYAN, textTransform: "uppercase", fontFamily: "monospace" }}>Parent View — Read Only</div>
          <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 4 }}>Progress Summary</div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 24px" }}>
        {!loaded ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>Loading…</div>
        ) : (
          <>
            <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 14, padding: "14px 16px", marginBottom: 16, fontSize: 13, lineHeight: 1.7, color: "#cbd5e1" }}>
              {summary}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
              {[
                { label: "Days to Test", value: daysUntilExam(), color: "#f97316" },
                { label: "Plan Complete", value: `${completionPct}%`, color: "#10b981" },
                { label: "Current Streak", value: profile.currentStreak, color: "#f59e0b" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <Section title="Score Trend">
              {!latest ? (
                <Empty text="No practice tests logged yet." />
              ) : (
                <>
                  <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>
                    Most recent: <strong style={{ color: "#fff" }}>{latest.totalScore}</strong> ({latest.date}) · Math {latest.mathScore} · English {latest.englishScore}
                  </div>
                  {examRecords.length >= 2 && (
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      {examRecords.length} tests logged · first: {examRecords[0].totalScore} → latest: {latest.totalScore}
                    </div>
                  )}
                </>
              )}
            </Section>

            <Section title="Weakest Areas">
              {weakest.length === 0 ? (
                <Empty text="Not enough practice data yet to identify weak areas." />
              ) : (
                weakest.map((s) => (
                  <div key={s.topic} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#cbd5e1", padding: "4px 0" }}>
                    <span>{s.topic}</span>
                    <span style={{ color: "#ef4444", fontFamily: "monospace" }}>{Math.round(s.accuracy * 100)}%</span>
                  </div>
                ))
              )}
            </Section>

            <Section title="Activity Level" note="Level, XP, and activity counts are shown — individual notes and mistake details stay private to the student.">
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 4 }}>Level: <strong style={{ color: "#f59e0b" }}>{lvl.name}</strong> ({profile.xp} XP)</div>
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>{activityCount} total practice interactions logged</div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 10 }}>{title.toUpperCase()}</div>
      {note && <div style={{ fontSize: 11, color: "#475569", marginBottom: 10, fontStyle: "italic" }}>{note}</div>}
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", padding: "8px 4px" }}>{text}</div>;
}
