"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { MATH_TOPICS, ENGLISH_TOPICS } from "../lib/data";
import { QUESTIONS, getQuestions } from "../lib/questions";
import { selectAdaptive } from "../lib/adaptive";
import { loadData, saveData, awardXp } from "../lib/api-client";
import { newErrorEntry } from "../lib/errorLog";
import { XP_RULES } from "../lib/gamification";
import type { Question, ErrorEntry } from "../lib/types";
import type { QuestionHistory, QuestionRecord } from "../lib/adaptive";

type Section = "math" | "english";
const COLOR: Record<Section, string> = { math: "#f97316", english: "#8b5cf6" };

export default function Practice() {
  const [section, setSection] = useState<Section>("math");
  const [topic, setTopic] = useState("");
  const [history, setHistory] = useState<QuestionHistory>({});
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [started, setStarted] = useState(false);

  // Load history from server (falls back to localStorage)
  useEffect(() => {
    loadData<QuestionHistory>("qHistory", {}).then((h) => {
      setHistory(h);
      setHistoryLoaded(true);
    });
  }, []);

  // Deep-link support so the dashboard's daily missions can launch a specific drill
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("section");
    const t = params.get("topic");
    if (s === "math" || s === "english") setSection(s);
    if (t) setTopic(t);
  }, []);

  const topics = section === "math" ? MATH_TOPICS : ENGLISH_TOPICS;
  const color = COLOR[section];

  // Per-topic accuracy derived from history
  const topicPerf = useMemo(() => {
    const result: Record<string, { correct: number; total: number }> = {};
    for (const [id, rec] of Object.entries(history)) {
      const q = QUESTIONS.find((q) => q.id === id);
      if (!q) continue;
      if (!result[q.topic]) result[q.topic] = { correct: 0, total: 0 };
      result[q.topic].correct += rec.correct;
      result[q.topic].total += rec.total;
    }
    return result;
  }, [history]);

  const overallPerf = useMemo(() => {
    const sectionQs = QUESTIONS.filter((q) => q.section === section);
    let correct = 0; let total = 0;
    for (const q of sectionQs) {
      const h = history[q.id];
      if (h) { correct += h.correct; total += h.total; }
    }
    return total > 0 ? Math.round((correct / total) * 100) : null;
  }, [history, section]);

  const pickNext = useCallback(
    (h: QuestionHistory, sec: Section, top: string): Question => {
      if (adaptiveMode) {
        return selectAdaptive(QUESTIONS, h, sec, top || undefined);
      }
      const pool = getQuestions(sec, top || undefined);
      return pool[Math.floor(Math.random() * pool.length)];
    },
    [adaptiveMode]
  );

  const start = () => {
    setCurrentQ(pickNext(history, section, topic));
    setSelected(null);
    setIsAIGenerated(false);
    setSessionCorrect(0);
    setSessionTotal(0);
    setStarted(true);
  };

  const nextQuestion = () => {
    setCurrentQ(pickNext(history, section, topic));
    setSelected(null);
    setIsAIGenerated(false);
  };

  const handleSelect = async (idx: number) => {
    if (selected !== null || !currentQ) return;
    setSelected(idx);
    const isCorrect = idx === currentQ.answer;
    setSessionTotal((n) => n + 1);
    if (isCorrect) setSessionCorrect((n) => n + 1);

    // Track history only for static question bank entries (not AI-generated)
    if (!currentQ.id.startsWith("gen-")) {
      const prev: QuestionRecord = history[currentQ.id] ?? { correct: 0, total: 0, lastAttempt: 0 };
      const updated: QuestionRecord = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        lastAttempt: Date.now(),
      };
      const newHistory = { ...history, [currentQ.id]: updated };
      setHistory(newHistory);
      saveData("qHistory", newHistory); // fire-and-forget
    }

    awardXp(isCorrect ? XP_RULES.correctAnswer : XP_RULES.incorrectAttempt);

    if (!isCorrect) {
      const entry = newErrorEntry({
        source: "practice",
        section: currentQ.section,
        topic: currentQ.topic,
        difficulty: currentQ.difficulty,
        questionRef: currentQ.question.slice(0, 80),
        questionText: currentQ.question,
        userAnswer: currentQ.options[idx],
        correctAnswer: currentQ.options[currentQ.answer],
        explanation: currentQ.explanation,
      });
      loadData<ErrorEntry[]>("errorLog", []).then((log) => saveData("errorLog", [entry, ...log]));
    }
  };

  const requestAIQuestion = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/questions/adaptive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history,
          section,
          topic: topic || undefined,
          generateIfWeak: true,
        }),
      });
      const data = await res.json();
      setCurrentQ(data.question);
      setIsAIGenerated(data.generated ?? false);
      setSelected(null);
    } catch {
      // fall back to next adaptive question
      nextQuestion();
    }
    setAiLoading(false);
  };

  const changeSection = (s: Section) => {
    setSection(s);
    setTopic("");
    setStarted(false);
    setSelected(null);
    setCurrentQ(null);
  };

  const answered = selected !== null;
  const isCorrect = answered && currentQ !== null && selected === currentQ.answer;
  const pct = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : null;

  // Determine if current topic is weak (for AI generate prompt)
  const activeTopic = topic || "all";
  const activePerf = topic ? topicPerf[topic] : null;
  const isTopicWeak = activePerf && activePerf.total >= 2 && activePerf.correct / activePerf.total < 0.5;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: `2px solid ${color}`, padding: "12px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 3, color, textTransform: "uppercase", fontFamily: "monospace" }}>Practice Mode</div>
              <div style={{ fontSize: 17, fontWeight: "bold", marginTop: 2 }}>Adaptive Drills</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {pct !== null && (
                <span style={{ background: `${color}22`, border: `1px solid ${color}55`, borderRadius: 10, padding: "3px 10px", fontFamily: "monospace", fontSize: 12, color }}>
                  {sessionCorrect}/{sessionTotal} · {pct}%
                </span>
              )}
              {overallPerf !== null && (
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b" }}>overall {overallPerf}%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "14px 16px 0" }}>
        {/* Section toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {(["math", "english"] as Section[]).map((s) => (
            <button key={s} onClick={() => changeSection(s)} style={{
              flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "Georgia,serif", fontSize: 14, fontWeight: "bold",
              background: section === s ? COLOR[s] : "rgba(255,255,255,0.06)",
              color: section === s ? "#fff" : "#94a3b8",
            }}>
              {s === "math" ? "📐 Math" : "📖 English"}
            </button>
          ))}
        </div>

        {/* Adaptive mode toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
            {adaptiveMode ? "ADAPTIVE — asks weak topics more often" : "RANDOM — all questions equally"}
          </div>
          <button onClick={() => setAdaptiveMode((v) => !v)} style={{
            background: adaptiveMode ? `${color}22` : "rgba(255,255,255,0.06)",
            border: `1px solid ${adaptiveMode ? color : "rgba(255,255,255,0.12)"}`,
            color: adaptiveMode ? color : "#64748b",
            borderRadius: 99, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "monospace",
          }}>
            {adaptiveMode ? "Adaptive ON" : "Adaptive OFF"}
          </button>
        </div>

        {/* Topic filter with accuracy badges */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={() => { setTopic(""); setStarted(false); }} style={{
            padding: "5px 11px", borderRadius: 99, fontSize: 11, cursor: "pointer", fontFamily: "monospace",
            border: `1px solid ${!topic ? color : "rgba(255,255,255,0.1)"}`,
            background: !topic ? `${color}22` : "rgba(255,255,255,0.04)",
            color: !topic ? color : "#94a3b8",
          }}>All</button>
          {topics.map((t) => {
            const perf = topicPerf[t.id];
            const acc = perf && perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : null;
            const weak = acc !== null && acc < 50;
            const active = topic === t.id;
            return (
              <button key={t.id} onClick={() => { setTopic(t.id); setStarted(false); }} style={{
                padding: "5px 11px", borderRadius: 99, fontSize: 11, cursor: "pointer", fontFamily: "monospace",
                border: `1px solid ${active ? t.color : weak ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
                background: active ? `${t.color}22` : weak ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
                color: active ? t.color : weak ? "#fca5a5" : "#94a3b8",
              }}>
                {t.label.split(" ")[0]}
                {acc !== null && (
                  <span style={{ marginLeft: 5, opacity: 0.8 }}>{acc}%{weak ? "⚠" : ""}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Start screen */}
        {!started && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>{section === "math" ? "📐" : "📖"}</div>
            <div style={{ fontSize: 19, fontWeight: "bold", color, marginBottom: 6 }}>
              {topic ? topics.find((t) => t.id === topic)?.label : `All ${section === "math" ? "Math" : "English"}`}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
              {getQuestions(section, topic || undefined).length} questions in bank
              {adaptiveMode && historyLoaded && " · adaptive selection enabled"}
            </div>
            {isTopicWeak && (
              <div style={{ fontSize: 12, color: "#fca5a5", marginBottom: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 14px", display: "inline-block" }}>
                ⚠ {activePerf && Math.round((activePerf.correct / activePerf.total) * 100)}% accuracy — this is a weak area
              </div>
            )}
            <div>
              <button onClick={start} style={{
                background: color, border: "none", color: "#fff", borderRadius: 12,
                padding: "13px 40px", fontSize: 16, cursor: "pointer", fontFamily: "Georgia,serif", fontWeight: "bold",
              }}>
                {adaptiveMode ? "Start Smart Practice →" : "Start Practice →"}
              </button>
            </div>
          </div>
        )}

        {/* Question card */}
        {started && currentQ && (
          <div>
            {/* Passage */}
            {currentQ.passage && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "12px 14px", marginBottom: 10, fontSize: 13, color: "#cbd5e1", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 6 }}>PASSAGE</div>
                {currentQ.passage}
              </div>
            )}

            {/* Question */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 16px 12px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color, letterSpacing: 1, fontFamily: "monospace", textTransform: "uppercase" }}>
                    {currentQ.topic}
                  </span>
                  <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>· {currentQ.difficulty}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {isAIGenerated && (
                    <span style={{ fontSize: 10, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", borderRadius: 99, padding: "2px 8px", fontFamily: "monospace" }}>🤖 AI Gen</span>
                  )}
                  {adaptiveMode && (
                    <span style={{ fontSize: 10, background: `${color}15`, border: `1px solid ${color}30`, color, borderRadius: 99, padding: "2px 8px", fontFamily: "monospace" }}>adaptive</span>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 15, lineHeight: 1.7, color: "#f0f0f0", marginBottom: 14 }}>{currentQ.question}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {currentQ.options.map((opt, i) => {
                  let bg = "rgba(255,255,255,0.04)";
                  let border = "1px solid rgba(255,255,255,0.1)";
                  let textColor = "#e2e8f0";
                  if (answered) {
                    if (i === currentQ.answer) { bg = "rgba(16,185,129,0.18)"; border = "1px solid #10b981"; textColor = "#6ee7b7"; }
                    else if (i === selected) { bg = "rgba(239,68,68,0.18)"; border = "1px solid #ef4444"; textColor = "#fca5a5"; }
                  } else if (selected === i) {
                    bg = `${color}22`; border = `1px solid ${color}`;
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(i)} style={{
                      background: bg, border, borderRadius: 10, padding: "11px 14px",
                      textAlign: "left", cursor: answered ? "default" : "pointer",
                      color: textColor, fontSize: 14, fontFamily: "Georgia,serif",
                      display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
                    }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", minWidth: 16 }}>{["A","B","C","D"][i]}</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {answered && i === currentQ.answer && <span>✓</span>}
                      {answered && i === selected && i !== currentQ.answer && <span>✗</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation */}
            {answered && (
              <div style={{
                background: isCorrect ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${isCorrect ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                borderRadius: 12, padding: "12px 14px", marginBottom: 10,
              }}>
                <div style={{ fontSize: 13, fontWeight: "bold", color: isCorrect ? "#10b981" : "#ef4444", marginBottom: 6 }}>
                  {isCorrect ? "Correct!" : `Incorrect — answer is ${["A","B","C","D"][currentQ.answer]}`}
                </div>
                <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{currentQ.explanation}</div>
              </div>
            )}

            {/* AI generate prompt when topic is weak */}
            {answered && adaptiveMode && isTopicWeak && !isAIGenerated && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: "#f59e0b" }}>
                  Struggling with {topic || section} ({activePerf && Math.round((activePerf.correct / activePerf.total) * 100)}% accuracy) — get a custom AI question?
                </div>
                <button onClick={requestAIQuestion} disabled={aiLoading} style={{
                  background: "#f59e0b", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: aiLoading ? "default" : "pointer", opacity: aiLoading ? 0.6 : 1, whiteSpace: "nowrap", marginLeft: 10,
                }}>
                  {aiLoading ? "Generating..." : "🤖 Generate"}
                </button>
              </div>
            )}

            {/* Next button */}
            {answered && (
              <button onClick={nextQuestion} style={{
                width: "100%", background: color, border: "none", color: "#fff", borderRadius: 12,
                padding: "13px 0", fontSize: 15, cursor: "pointer", fontFamily: "Georgia,serif", fontWeight: "bold",
              }}>
                {adaptiveMode ? "Next Smart Question →" : "Next Question →"}
              </button>
            )}

            <button onClick={() => setStarted(false)} style={{
              width: "100%", marginTop: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
              color: "#64748b", borderRadius: 10, padding: "9px 0", fontSize: 12, cursor: "pointer",
            }}>End Session</button>
          </div>
        )}

        {/* Topic performance summary */}
        {historyLoaded && Object.keys(topicPerf).length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px", marginTop: 16 }}>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 10 }}>YOUR ACCURACY BY TOPIC</div>
            {Object.entries(topicPerf)
              .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
              .map(([t, perf]) => {
                const acc = Math.round((perf.correct / perf.total) * 100);
                const barColor = acc < 50 ? "#ef4444" : acc < 75 ? "#f59e0b" : "#10b981";
                return (
                  <div key={t} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: "#cbd5e1" }}>{t}</span>
                      <span style={{ fontSize: 11, color: barColor, fontFamily: "monospace" }}>{perf.correct}/{perf.total} · {acc}%</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 4 }}>
                      <div style={{ background: barColor, borderRadius: 99, height: 4, width: `${acc}%`, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
