"use client";
import { useState, useEffect, useCallback } from "react";
import { shuffled, getQuestions } from "../lib/questions";
import { loadData, saveData } from "../lib/api-client";
import type { Question, ExamRecord } from "../lib/types";

type Phase = "setup" | "exam" | "results";

function estimateScore(correct: number, total: number): number {
  if (total === 0) return 200;
  return Math.round((200 + (correct / total) * 600) / 10) * 10;
}

function fmt(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Exam() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examSize, setExamSize] = useState<"quick" | "standard">("quick");
  const [showReview, setShowReview] = useState(false);

  const SIZES = { quick: { math: 10, english: 10, mins: 30 }, standard: { math: 15, english: 15, mins: 45 } };

  const startExam = () => {
    const cfg = SIZES[examSize];
    const mathQs = shuffled(getQuestions("math")).slice(0, cfg.math);
    const engQs = shuffled(getQuestions("english")).slice(0, cfg.english);
    const all = [...mathQs, ...engQs];
    setQuestions(all);
    setAnswers(new Array(all.length).fill(null));
    setCurrent(0);
    setTimeLeft(cfg.mins * 60);
    setPhase("exam");
  };

  const submit = useCallback(async (qs: Question[], ans: (number | null)[]) => {
    const mathQs = qs.filter((q) => q.section === "math");
    const engQs = qs.filter((q) => q.section === "english");
    const mathAns = ans.slice(0, mathQs.length);
    const engAns = ans.slice(mathQs.length);
    const mathCorrect = mathQs.filter((q, i) => mathAns[i] === q.answer).length;
    const engCorrect = engQs.filter((q, i) => engAns[i] === q.answer).length;
    const mathScore = estimateScore(mathCorrect, mathQs.length);
    const engScore = estimateScore(engCorrect, engQs.length);
    const record: ExamRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      type: "practice",
      mathCorrect, mathTotal: mathQs.length,
      englishCorrect: engCorrect, englishTotal: engQs.length,
      mathScore, englishScore: engScore,
      totalScore: mathScore + engScore,
      notes: "",
    };
    const prev = await loadData<ExamRecord[]>("examRecords", []);
    saveData("examRecords", [...prev, record]);
    setPhase("results");
  }, []);

  useEffect(() => {
    if (phase !== "exam") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); submit(questions, answers); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, questions, answers, submit]);

  const totalQs = questions.length;
  const answered = answers.filter((a) => a !== null).length;
  const pctAnswered = totalQs > 0 ? Math.round((answered / totalQs) * 100) : 0;
  const urgentTime = timeLeft < 300;

  // Results calculations
  const mathQs = questions.filter((q) => q.section === "math");
  const engQs = questions.filter((q) => q.section === "english");
  const mathAns = answers.slice(0, mathQs.length);
  const engAns = answers.slice(mathQs.length);
  const mathCorrect = mathQs.filter((q, i) => mathAns[i] === q.answer).length;
  const engCorrect = engQs.filter((q, i) => engAns[i] === q.answer).length;
  const mathScore = estimateScore(mathCorrect, mathQs.length);
  const engScore = estimateScore(engCorrect, engQs.length);

  if (phase === "setup") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: "2px solid #8b5cf6", padding: "16px 20px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#8b5cf6", textTransform: "uppercase", fontFamily: "monospace" }}>Exam Simulation</div>
            <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 4 }}>Practice Test</div>
          </div>
        </div>
        <div style={{ maxWidth: 720, margin: "40px auto 0", padding: "0 16px", width: "100%" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, lineHeight: 1.6 }}>
              Choose your exam format. Questions are randomly selected from the full question bank. Your estimated SAT score is calculated at the end.
            </div>
            {(["quick", "standard"] as const).map((size) => {
              const cfg = SIZES[size];
              return (
                <div key={size} onClick={() => setExamSize(size)} style={{
                  background: examSize === size ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                  border: `2px solid ${examSize === size ? "#8b5cf6" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 14, padding: "16px 18px", marginBottom: 10, cursor: "pointer",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: "bold", color: examSize === size ? "#a78bfa" : "#fff", marginBottom: 4 }}>
                        {size === "quick" ? "Quick Exam" : "Standard Exam"}
                      </div>
                      <div style={{ fontSize: 13, color: "#94a3b8" }}>
                        {cfg.math} Math + {cfg.english} English = {cfg.math + cfg.english} total questions
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: "bold", color: "#8b5cf6" }}>{cfg.mins}</div>
                      <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>MINUTES</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12, padding: 14, marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#f97316", marginBottom: 6, fontWeight: "bold" }}>Before you start</div>
            <div style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.7 }}>
              · Timer starts immediately — treat it like the real SAT<br />
              · You can navigate between questions<br />
              · Answers are revealed only after submission
            </div>
          </div>
          <button onClick={startExam} style={{
            width: "100%", background: "#8b5cf6", border: "none", color: "#fff", borderRadius: 12, padding: "16px 0", fontSize: 17, cursor: "pointer", fontFamily: "Georgia,serif", fontWeight: "bold",
          }}>Start Exam</button>
        </div>
      </div>
    );
  }

  if (phase === "exam") {
    const q = questions[current];
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0" }}>
        {/* Exam header */}
        <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: "2px solid #8b5cf6", padding: "10px 20px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>Q {current + 1} / {totalQs}</div>
              <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: "bold", color: urgentTime ? "#ef4444" : "#f0f0f0" }}>{fmt(timeLeft)}</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>{answered}/{totalQs} done</div>
            </div>
            {/* Progress */}
            <div style={{ marginTop: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 3 }}>
              <div style={{ background: "#8b5cf6", borderRadius: 99, height: 3, width: `${pctAnswered}%`, transition: "width 0.3s" }} />
            </div>
            {/* Section label */}
            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["math", "english"].map((s) => {
                const sQs = questions.filter((q) => q.section === s);
                const sStart = s === "math" ? 0 : mathQs.length;
                const sAnswered = answers.slice(sStart, sStart + sQs.length).filter((a) => a !== null).length;
                return (
                  <span key={s} style={{ fontSize: 10, fontFamily: "monospace", color: s === "math" ? "#f97316" : "#8b5cf6" }}>
                    {s === "math" ? "Math" : "English"}: {sAnswered}/{sQs.length}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "14px 16px" }}>
          {/* Section badge */}
          <div style={{ marginBottom: 10 }}>
            <span style={{
              background: q.section === "math" ? "rgba(249,115,22,0.2)" : "rgba(139,92,246,0.2)",
              color: q.section === "math" ? "#f97316" : "#a78bfa",
              borderRadius: 99, padding: "3px 10px", fontSize: 11, fontFamily: "monospace",
            }}>{q.section === "math" ? "Math" : "English"} · {q.topic}</span>
          </div>

          {/* Passage */}
          {q.passage && (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", marginBottom: 10, fontSize: 13, color: "#cbd5e1", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 6 }}>PASSAGE</div>
              {q.passage}
            </div>
          )}

          {/* Question */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 16px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 15, lineHeight: 1.7, color: "#f0f0f0", marginBottom: 14 }}>{q.question}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt, i) => {
                const sel = answers[current] === i;
                return (
                  <button key={i} onClick={() => setAnswers((prev) => { const n = [...prev]; n[current] = i; return n; })} style={{
                    background: sel ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${sel ? "#8b5cf6" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 10, padding: "12px 14px", textAlign: "left", cursor: "pointer",
                    color: sel ? "#c4b5fd" : "#e2e8f0", fontSize: 14, fontFamily: "Georgia,serif",
                    display: "flex", gap: 10, alignItems: "center", transition: "all 0.15s",
                  }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b", minWidth: 18 }}>{["A", "B", "C", "D"][i]}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} style={{
              flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: current === 0 ? "#334155" : "#94a3b8",
              borderRadius: 10, padding: "10px 0", fontSize: 14, cursor: current === 0 ? "default" : "pointer",
            }}>← Prev</button>
            {current < totalQs - 1 ? (
              <button onClick={() => setCurrent(current + 1)} style={{
                flex: 1, background: "#8b5cf6", border: "none", color: "#fff", borderRadius: 10, padding: "10px 0", fontSize: 14, cursor: "pointer", fontWeight: "bold",
              }}>Next →</button>
            ) : (
              <button onClick={() => submit(questions, answers)} style={{
                flex: 1, background: "#10b981", border: "none", color: "#fff", borderRadius: 10, padding: "10px 0", fontSize: 14, cursor: "pointer", fontWeight: "bold",
              }}>Submit Exam</button>
            )}
          </div>

          {/* Question nav dots */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {questions.map((q, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: 28, height: 28, borderRadius: 6, border: `1px solid ${i === current ? "#8b5cf6" : "rgba(255,255,255,0.1)"}`,
                background: answers[i] !== null ? (i === current ? "#8b5cf6" : "rgba(139,92,246,0.3)") : (i === current ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)"),
                color: i === current ? "#fff" : "#94a3b8", fontSize: 10, cursor: "pointer", fontFamily: "monospace",
              }}>{i + 1}</button>
            ))}
          </div>

          {answered < totalQs && (
            <button onClick={() => submit(questions, answers)} style={{
              width: "100%", marginTop: 14, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5",
              borderRadius: 10, padding: "10px 0", fontSize: 13, cursor: "pointer",
            }}>Submit Early ({totalQs - answered} unanswered)</button>
          )}
        </div>
      </div>
    );
  }

  // Results
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0" }}>
      <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: "2px solid #10b981", padding: "16px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#10b981", textTransform: "uppercase", fontFamily: "monospace" }}>Results</div>
          <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 4 }}>Exam Complete</div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px" }}>
        {/* Score summary */}
        <div style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 16, padding: "20px 18px", marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#10b981", letterSpacing: 3, fontFamily: "monospace", marginBottom: 8 }}>ESTIMATED TOTAL SCORE</div>
          <div style={{ fontSize: 56, fontWeight: "bold", color: "#fff", lineHeight: 1 }}>{mathScore + engScore}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>out of 1600 · rough estimate</div>
        </div>

        {/* Section breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Math", correct: mathCorrect, total: mathQs.length, score: mathScore, color: "#f97316" },
            { label: "English", correct: engCorrect, total: engQs.length, score: engScore, color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} style={{ background: `${s.color}15`, border: `1px solid ${s.color}44`, borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: s.color, fontFamily: "monospace", marginBottom: 6 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>{s.score}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.correct}/{s.total} correct</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{Math.round((s.correct / s.total) * 100)}%</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setShowReview(!showReview)} style={{
            flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0",
            borderRadius: 10, padding: "11px 0", fontSize: 13, cursor: "pointer",
          }}>{showReview ? "Hide Review" : "Review Answers"}</button>
          <button onClick={() => setPhase("setup")} style={{
            flex: 1, background: "#8b5cf6", border: "none", color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13, cursor: "pointer", fontWeight: "bold",
          }}>New Exam</button>
        </div>

        {/* Answer review */}
        {showReview && (
          <div>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 10 }}>ANSWER REVIEW</div>
            {questions.map((q, i) => {
              const userAns = answers[i];
              const correct = userAns === q.answer;
              return (
                <div key={q.id} style={{
                  background: correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${correct ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                  borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: q.section === "math" ? "#f97316" : "#8b5cf6" }}>Q{i+1} · {q.section} · {q.topic}</span>
                    <span style={{ fontSize: 13, color: correct ? "#10b981" : "#ef4444" }}>{correct ? "✓ Correct" : "✗ Wrong"}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 8, lineHeight: 1.5 }}>{q.question}</div>
                  {!correct && (
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                      Your answer: <span style={{ color: "#fca5a5" }}>{userAns !== null ? ["A","B","C","D"][userAns] : "unanswered"}</span>
                      &nbsp;· Correct: <span style={{ color: "#6ee7b7" }}>{["A","B","C","D"][q.answer]} — {q.options[q.answer]}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, fontStyle: "italic" }}>{q.explanation}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
