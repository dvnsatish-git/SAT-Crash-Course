"use client";
import { useState, useEffect } from "react";
import { QUESTIONS } from "../lib/questions";
import { selectAdaptive } from "../lib/adaptive";
import { loadData, saveData } from "../lib/api-client";
import type { QuestionHistory } from "../lib/adaptive";
import type { Question } from "../lib/types";

type Phase = "select" | "playing" | "done";

const MODES = [
  { id: "reel",    label: "Reel Mode",    sub: "2 questions · no timer · just vibe",   icon: "🎬", count: 2,  time: 0,   color: "#8b5cf6" },
  { id: "rocket",  label: "Rocket Mode",  sub: "4 questions · 5 min · blast off 🚀",   icon: "🚀", count: 4,  time: 300, color: "#06b6d4" },
  { id: "beast",   label: "Beast Mode",   sub: "7 questions · 10 min · go hard 🔥",    icon: "🔥", count: 7,  time: 600, color: "#f97316" },
  { id: "legend",  label: "Legend Mode",  sub: "10 questions · 15 min · become elite", icon: "👑", count: 10, time: 900, color: "#10b981" },
];

type Mode = typeof MODES[0];

export default function QuickQuiz() {
  const [phase, setPhase]       = useState<Phase>("select");
  const [mode, setMode]         = useState<Mode>(MODES[0]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExpl, setShowExpl] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory]   = useState<QuestionHistory>({});
  const [results, setResults]   = useState<boolean[]>([]);
  const [autoMode, setAutoMode] = useState<Mode | null>(null);

  useEffect(() => {
    // Read ?mode= param — must run client-side only
    const modeId = new URLSearchParams(window.location.search).get("mode");
    if (modeId) {
      const m = MODES.find((m) => m.id === modeId);
      if (m) setAutoMode(m);
    }
  }, []);

  useEffect(() => {
    loadData<QuestionHistory>("qHistory", {}).then((h) => {
      setHistory(h);
      // Auto-start once history is ready
      if (autoMode) startQuizWith(autoMode, h);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "playing" || mode.time === 0) return;
    if (timeLeft <= 0) { setPhase("done"); return; }
    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { clearInterval(t); setPhase("done"); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, mode.time, timeLeft]);

  const startQuizWith = (m: Mode, h: QuestionHistory) => {
    setMode(m);
    const usedIds = new Set<string>();
    const picked: Question[] = [];
    for (let i = 0; i < m.count; i++) {
      const pool = QUESTIONS.filter((q) => !usedIds.has(q.id));
      if (!pool.length) break;
      const q = selectAdaptive(pool, h);
      picked.push(q);
      usedIds.add(q.id);
    }
    setQuestions(picked);
    setCurrent(0);
    setSelected(null);
    setShowExpl(false);
    setResults([]);
    setTimeLeft(m.time);
    setPhase("playing");
  };

  const startQuiz = (m: Mode) => startQuizWith(m, history);

  const answer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExpl(true);
    const q = questions[current];
    const correct = idx === q.answer;
    setResults((r) => [...r, correct]);
    const prev = history[q.id] || { correct: 0, total: 0, lastAttempt: 0 };
    const next = {
      ...history,
      [q.id]: { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1, lastAttempt: Date.now() },
    };
    setHistory(next);
    saveData("qHistory", next);
  };

  const goNext = () => {
    if (current + 1 >= questions.length) { setPhase("done"); return; }
    setCurrent((c) => c + 1);
    setSelected(null);
    setShowExpl(false);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── SELECT ──────────────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0", paddingBottom: 80 }}>
        <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: "2px solid #8b5cf6", padding: "16px 20px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#8b5cf6", textTransform: "uppercase", fontFamily: "monospace" }}>On-the-Go</div>
            <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 4 }}>Quick Quiz</div>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24, lineHeight: 1.7 }}>
            Bus, break, waiting in line — pick a mode and get those reps in. 🎯
          </div>

          {MODES.map((m) => (
            <button key={m.id} onClick={() => startQuiz(m)} style={{
              width: "100%", background: `linear-gradient(135deg,${m.color}18,${m.color}08)`,
              border: `1px solid ${m.color}44`, borderRadius: 16, padding: "18px 20px",
              marginBottom: 12, cursor: "pointer", textAlign: "left", color: "#f0f0f0",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <span style={{ fontSize: 34 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 3 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{m.sub}</div>
              </div>
              <span style={{ fontSize: 20, color: m.color }}>›</span>
            </button>
          ))}

          <div style={{ marginTop: 8, fontSize: 12, color: "#475569", fontFamily: "monospace", textAlign: "center" }}>
            Questions are selected based on your weak topics
          </div>
        </div>
      </div>
    );
  }

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const total = results.length;
    const correct = results.filter(Boolean).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const emoji = pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📚";

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 20px 100px", textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 14 }}>{emoji}</div>
        <div style={{ fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 4 }}>{correct}/{total}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", fontFamily: "monospace", marginBottom: 4 }}>{pct}% correct</div>
        <div style={{ fontSize: 12, color: mode.color, fontFamily: "monospace", marginBottom: 32 }}>{mode.label}</div>

        <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
          {results.map((r, i) => (
            <div key={i} style={{ width: 38, height: 38, borderRadius: 99, background: r ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)", border: `2px solid ${r ? "#10b981" : "#ef4444"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
              {r ? "✓" : "✕"}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 400 }}>
          <button onClick={() => startQuiz(mode)} style={{ flex: 1, background: mode.color, border: "none", color: "#fff", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: "bold", cursor: "pointer" }}>
            Again ↺
          </button>
          <button onClick={() => setPhase("select")} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", borderRadius: 12, padding: "14px 0", fontSize: 15, cursor: "pointer" }}>
            Change Mode
          </button>
        </div>
      </div>
    );
  }

  // ── PLAYING ─────────────────────────────────────────────────────────────────
  const q = questions[current];
  if (!q) return null;

  const isCorrect = selected !== null && selected === q.answer;
  const progressPct = (current / questions.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      {/* Progress bar + timer */}
      <div style={{ background: "rgba(15,12,41,0.95)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => setPhase("select")} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: mode.color, borderRadius: 99, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "monospace", minWidth: 48, textAlign: "right" }}>
          {mode.time > 0 ? (
            <span style={{ color: timeLeft < 30 ? "#ef4444" : "#94a3b8" }}>{fmtTime(timeLeft)}</span>
          ) : (
            `${current + 1}/${questions.length}`
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: "16px 16px 0", maxWidth: 520, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Badges */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: mode.color, fontFamily: "monospace", fontWeight: "bold" }}>Q{current + 1}</span>
          <span style={{ fontSize: 10, background: q.section === "math" ? "rgba(249,115,22,0.2)" : "rgba(139,92,246,0.2)", color: q.section === "math" ? "#f97316" : "#8b5cf6", borderRadius: 99, padding: "2px 9px", fontFamily: "monospace" }}>
            {q.section.toUpperCase()}
          </span>
          <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>{q.difficulty}</span>
        </div>

        {/* Question card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "20px 18px", marginBottom: 14, lineHeight: 1.75, fontSize: 15, color: "#e2e8f0" }}>
          {q.question}
        </div>

        {/* Answer options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            let bg = "rgba(255,255,255,0.04)";
            let border = "rgba(255,255,255,0.1)";
            let col = "#e2e8f0";
            if (selected !== null) {
              if (i === q.answer)    { bg = "rgba(16,185,129,0.18)";  border = "#10b981"; col = "#10b981"; }
              else if (i === selected) { bg = "rgba(239,68,68,0.18)"; border = "#ef4444"; col = "#ef4444"; }
            }
            return (
              <button key={i} onClick={() => answer(i)} style={{
                width: "100%", background: bg, border: `1px solid ${border}`,
                borderRadius: 12, padding: "14px 16px", textAlign: "left",
                color: col, fontSize: 14, fontFamily: "Georgia,serif",
                cursor: selected !== null ? "default" : "pointer",
                lineHeight: 1.5, transition: "all 0.15s",
              }}>
                <span style={{ fontFamily: "monospace", marginRight: 8, opacity: 0.55 }}>
                  {["A","B","C","D"][i]}.
                </span>
                {opt.replace(/^[A-D]\.\s*/i, "")}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExpl && (
          <div style={{ marginTop: 14, background: isCorrect ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.07)", border: `1px solid ${isCorrect ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: "bold", color: isCorrect ? "#10b981" : "#ef4444", marginBottom: 6 }}>
              {isCorrect ? "✓ Correct!" : `✕ Answer: ${["A","B","C","D"][q.answer]}`}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.65 }}>{q.explanation}</div>
          </div>
        )}
      </div>

      {/* Next / Results button */}
      {selected !== null && (
        <div style={{ padding: "16px", maxWidth: 520, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          <button onClick={goNext} style={{ width: "100%", background: mode.color, border: "none", color: "#fff", borderRadius: 14, padding: "16px 0", fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>
            {current + 1 >= questions.length ? "See Results →" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
