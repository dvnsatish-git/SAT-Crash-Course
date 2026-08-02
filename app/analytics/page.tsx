"use client";
import { useState, useEffect, useMemo } from "react";
import { loadData } from "../lib/api-client";
import { topicStats } from "../lib/adaptive";
import { QUESTIONS } from "../lib/questions";
import { ERROR_CATEGORY_LABELS } from "../lib/types";
import type { ExamRecord, ErrorEntry, ErrorCategory } from "../lib/types";
import type { QuestionHistory } from "../lib/adaptive";

const CYAN = "#06b6d4";

export default function Analytics() {
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [history, setHistory] = useState<QuestionHistory>({});
  const [errorLog, setErrorLog] = useState<ErrorEntry[]>([]);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      loadData<ExamRecord[]>("examRecords", []),
      loadData<QuestionHistory>("qHistory", {}),
      loadData<ErrorEntry[]>("errorLog", []),
      loadData<Record<string, boolean>>("completedDays", {}),
    ]).then(([ex, h, log, cd]) => {
      setExamRecords(ex);
      setHistory(h);
      setErrorLog(log);
      setCompletedDays(cd);
      setLoaded(true);
    });
  }, []);

  const stats = useMemo(() => topicStats(history, QUESTIONS), [history]);
  const weakest = stats.slice(0, 3);
  const strongest = [...stats].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of errorLog) {
      const key = e.category ?? "other";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [errorLog]);

  const activityBySection = useMemo(() => {
    const bySection = { math: 0, english: 0 };
    for (const e of errorLog) bySection[e.section] += 1;
    for (const [id, rec] of Object.entries(history)) {
      const q = QUESTIONS.find((q) => q.id === id);
      if (q) bySection[q.section] += rec.total;
    }
    return bySection;
  }, [errorLog, history]);

  const masteredCount = errorLog.filter((e) => e.mastered).length;
  const activeCount = errorLog.length - masteredCount;
  const repeatedErrorCount = errorLog.filter((e) => {
    const sameTopicCount = errorLog.filter((o) => o.topic === e.topic).length;
    return sameTopicCount >= 2;
  }).length;

  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const completionPct = Math.round((completedCount / 42) * 100);

  const scores = examRecords.map((r) => r.totalScore);
  const minScore = scores.length ? Math.min(...scores) - 50 : 800;
  const maxCategoryCount = Math.max(1, ...categoryBreakdown.map(([, c]) => c));
  const maxActivity = Math.max(1, activityBySection.math, activityBySection.english);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0" }}>
      <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: `2px solid ${CYAN}`, padding: "16px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: CYAN, textTransform: "uppercase", fontFamily: "monospace" }}>Analytics</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>Progress Insights</div>
            {!loaded && <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>syncing…</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 24px" }}>
        {/* Top stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Completion", value: `${completionPct}%`, color: "#10b981" },
            { label: "Active Errors", value: activeCount, color: "#f59e0b" },
            { label: "Mastered", value: masteredCount, color: "#10b981" },
            { label: "Repeated", value: repeatedErrorCount, color: "#ef4444" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Score trend */}
        <Section title="Score Trend">
          {examRecords.length === 0 ? (
            <Empty text="Log a practice test in the Score Tracker to see your trend here." />
          ) : (
            <div style={{ position: "relative", height: 100, display: "flex", alignItems: "flex-end", gap: 4 }}>
              {examRecords.map((r, i) => {
                const h = Math.max(4, Math.min(100, ((r.totalScore - minScore) / (1600 - minScore)) * 100));
                return (
                  <div key={r.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {i === examRecords.length - 1 && <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace" }}>{r.totalScore}</div>}
                    <div style={{ width: "100%", height: `${h}%`, background: CYAN, borderRadius: "3px 3px 0 0", minHeight: 4, marginTop: 4 }} />
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Domain accuracy */}
        <Section title="Accuracy by Domain">
          {stats.length === 0 ? (
            <Empty text="Answer a few Practice or Quiz questions per topic to see accuracy breakdowns." />
          ) : (
            stats.map((s) => {
              const acc = Math.round(s.accuracy * 100);
              const color = acc < 50 ? "#ef4444" : acc < 75 ? "#f59e0b" : "#10b981";
              return (
                <BarRow key={s.topic} label={s.topic} sublabel={`${s.total} attempts`} pct={acc} color={color} valueLabel={`${acc}%`} />
              );
            })
          )}
        </Section>

        {/* Strongest / weakest */}
        {stats.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <MiniList title="Weakest Skills" color="#ef4444" items={weakest.map((s) => `${s.topic} (${Math.round(s.accuracy * 100)}%)`)} />
            <MiniList title="Strongest Skills" color="#10b981" items={strongest.map((s) => `${s.topic} (${Math.round(s.accuracy * 100)}%)`)} />
          </div>
        )}

        {/* Error categories */}
        <Section title="Error Categories">
          {categoryBreakdown.length === 0 ? (
            <Empty text="No logged errors yet — mistakes in Practice, Quiz, and Exam are captured automatically." />
          ) : (
            categoryBreakdown.map(([cat, count]) => (
              <BarRow
                key={cat}
                label={ERROR_CATEGORY_LABELS[cat as ErrorCategory] ?? cat}
                pct={(count / maxCategoryCount) * 100}
                color="#ef4444"
                valueLabel={String(count)}
              />
            ))
          )}
        </Section>

        {/* Activity by subject (question-attempt proxy, not wall-clock time) */}
        <Section title="Activity by Subject" note="Counted by questions attempted — the app doesn't track wall-clock study time yet.">
          <BarRow label="Math" pct={(activityBySection.math / maxActivity) * 100} color="#f97316" valueLabel={`${activityBySection.math} attempts`} />
          <BarRow label="English" pct={(activityBySection.english / maxActivity) * 100} color="#8b5cf6" valueLabel={`${activityBySection.english} attempts`} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 12 }}>{title.toUpperCase()}</div>
      {note && <div style={{ fontSize: 11, color: "#475569", marginBottom: 10, fontStyle: "italic" }}>{note}</div>}
      {children}
    </div>
  );
}

function BarRow({ label, sublabel, pct, color, valueLabel }: { label: string; sublabel?: string; pct: number; color: string; valueLabel: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: "#cbd5e1" }}>{label}{sublabel && <span style={{ color: "#475569", marginLeft: 6, fontSize: 10 }}>{sublabel}</span>}</span>
        <span style={{ fontSize: 11, color, fontFamily: "monospace" }}>{valueLabel}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 4 }}>
        <div style={{ background: color, borderRadius: 99, height: 4, width: `${Math.min(100, pct)}%`, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function MiniList({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ fontSize: 10, color, fontFamily: "monospace", marginBottom: 8 }}>{title.toUpperCase()}</div>
      {items.length === 0 ? (
        <div style={{ fontSize: 11, color: "#475569" }}>Not enough data yet</div>
      ) : (
        items.map((it, i) => <div key={i} style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 4 }}>{it}</div>)
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", padding: "16px 8px" }}>{text}</div>;
}
