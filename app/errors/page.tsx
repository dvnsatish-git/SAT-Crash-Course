"use client";
import { useState, useEffect, useMemo } from "react";
import { loadData, saveData, awardXp, syncBadges } from "../lib/api-client";
import { MATH_TOPICS, ENGLISH_TOPICS } from "../lib/data";
import { newErrorEntry, pendingReview, isDue, completeReview, markMastered, repeatedPatterns } from "../lib/errorLog";
import { XP_RULES } from "../lib/gamification";
import { ERROR_CATEGORY_LABELS } from "../lib/types";
import type { ErrorEntry, ErrorCategory } from "../lib/types";

const CATS = Object.entries(ERROR_CATEGORY_LABELS) as [ErrorCategory, string][];
const ALL_TOPICS = [...MATH_TOPICS, ...ENGLISH_TOPICS];
const RED = "#ef4444";

type SortMode = "recency" | "frequency" | "severity";

function emptyForm() {
  return {
    section: "math" as "math" | "english",
    topic: MATH_TOPICS[0].id,
    difficulty: "medium" as "easy" | "medium" | "hard",
    questionRef: "",
    userAnswer: "",
    correctAnswer: "",
    category: "concept_gap" as ErrorCategory,
    explanation: "",
    lessonLearned: "",
  };
}

export default function ErrorLog() {
  const [entries, setEntries] = useState<ErrorEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [filterSection, setFilterSection] = useState<"all" | "math" | "english">("all");
  const [filterCategory, setFilterCategory] = useState<"all" | ErrorCategory>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "mastered" | "due">("all");
  const [sortMode, setSortMode] = useState<SortMode>("recency");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadData<ErrorEntry[]>("errorLog", []).then((e) => {
      setEntries(e);
      setLoaded(true);
    });
  }, []);

  const persist = (next: ErrorEntry[]) => {
    setEntries(next);
    saveData("errorLog", next);
  };

  const addEntry = () => {
    if (!form.questionRef || !form.userAnswer || !form.correctAnswer) return;
    const entry = newErrorEntry({
      source: "manual",
      section: form.section,
      topic: form.topic,
      difficulty: form.difficulty,
      questionRef: form.questionRef,
      userAnswer: form.userAnswer,
      correctAnswer: form.correctAnswer,
      category: form.category,
      explanation: form.explanation,
      lessonLearned: form.lessonLearned,
    });
    persist([entry, ...entries]);
    setForm(emptyForm());
    setShowForm(false);
  };

  const updateEntry = (id: string, patch: Partial<ErrorEntry>) => {
    persist(entries.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e)));
  };

  const removeEntry = (id: string) => persist(entries.filter((e) => e.id !== id));

  const reviewOutcome = async (id: string, outcome: "correct" | "incorrect") => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const updated = completeReview(entry, outcome);
    persist(entries.map((e) => (e.id === id ? updated : e)));
    const xp = outcome === "correct" ? XP_RULES.completedReview : XP_RULES.incorrectAttempt;
    await awardXp(xp);
    if (updated.mastered) await awardXp(XP_RULES.masteredError);
    await syncBadges();
  };

  const toggleMastered = (entry: ErrorEntry) => updateEntry(entry.id, { mastered: !entry.mastered });

  const dueCount = useMemo(() => entries.filter((e) => isDue(e)).length, [entries]);
  const patterns = useMemo(() => repeatedPatterns(entries), [entries]);

  const filtered = useMemo(() => {
    let list = [...entries];
    if (filterSection !== "all") list = list.filter((e) => e.section === filterSection);
    if (filterCategory !== "all") list = list.filter((e) => e.category === filterCategory);
    if (filterStatus === "active") list = list.filter((e) => !e.mastered);
    if (filterStatus === "mastered") list = list.filter((e) => e.mastered);
    if (filterStatus === "due") list = list.filter((e) => isDue(e));

    const topicCount: Record<string, number> = {};
    for (const e of entries) topicCount[e.topic] = (topicCount[e.topic] ?? 0) + 1;

    if (sortMode === "recency") list.sort((a, b) => b.updatedAt - a.updatedAt);
    if (sortMode === "frequency") list.sort((a, b) => topicCount[b.topic] - topicCount[a.topic]);
    if (sortMode === "severity") {
      const weight: Record<string, number> = { time_pressure: 1, careless: 2, misread: 3, guessed: 3, strategy: 4, grammar_gap: 4, vocabulary_gap: 4, concept_gap: 5, other: 0 };
      list.sort((a, b) => (weight[b.category ?? "other"] ?? 0) - (weight[a.category ?? "other"] ?? 0));
    }
    return list;
  }, [entries, filterSection, filterCategory, filterStatus, sortMode]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0" }}>
      <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: `2px solid ${RED}`, padding: "16px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: RED, textTransform: "uppercase", fontFamily: "monospace" }}>Error Log</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>Learn From Mistakes</div>
              {!loaded && <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>syncing…</span>}
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: RED, border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>+ Log Error</button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 0" }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Total Errors", value: entries.length, color: "#94a3b8" },
            { label: "Due for Review", value: dueCount, color: dueCount > 0 ? "#f59e0b" : "#94a3b8" },
            { label: "Mastered", value: entries.filter((e) => e.mastered).length, color: "#10b981" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Repeated pattern summary */}
        {patterns.length > 0 && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: "bold", marginBottom: 8 }}>⚠ Repeated patterns</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {patterns.slice(0, 6).map((p) => (
                <span key={p.topic} style={{ fontSize: 11, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24", borderRadius: 99, padding: "3px 10px", fontFamily: "monospace" }}>
                  {p.topic} × {p.count}{p.category ? ` · ${ERROR_CATEGORY_LABELS[p.category as ErrorCategory]}` : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: "bold", color: RED, marginBottom: 12 }}>Log a Mistake</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <select value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value as "math" | "english", topic: (e.target.value === "math" ? MATH_TOPICS : ENGLISH_TOPICS)[0].id }))} style={inputStyle}>
                <option value="math">Math</option>
                <option value="english">English</option>
              </select>
              <select value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} style={inputStyle}>
                {(form.section === "math" ? MATH_TOPICS : ENGLISH_TOPICS).map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <select value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value as "easy" | "medium" | "hard" }))} style={inputStyle}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ErrorCategory }))} style={inputStyle}>
                {CATS.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <input placeholder="Question reference (e.g. Bluebook practice 3, Q12)" value={form.questionRef} onChange={(e) => setForm((p) => ({ ...p, questionRef: e.target.value }))} style={{ ...inputStyle, width: "100%", marginBottom: 10, boxSizing: "border-box" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input placeholder="Your answer" value={form.userAnswer} onChange={(e) => setForm((p) => ({ ...p, userAnswer: e.target.value }))} style={inputStyle} />
              <input placeholder="Correct answer" value={form.correctAnswer} onChange={(e) => setForm((p) => ({ ...p, correctAnswer: e.target.value }))} style={inputStyle} />
            </div>
            <textarea placeholder="Explanation (why the correct answer is right)" value={form.explanation} onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))} style={{ ...inputStyle, width: "100%", minHeight: 60, marginBottom: 10, boxSizing: "border-box", fontFamily: "Georgia,serif" }} />
            <textarea placeholder="Lesson learned — what I'll do next time" value={form.lessonLearned} onChange={(e) => setForm((p) => ({ ...p, lessonLearned: e.target.value }))} style={{ ...inputStyle, width: "100%", minHeight: 50, marginBottom: 12, boxSizing: "border-box", fontFamily: "Georgia,serif" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addEntry} style={{ flex: 1, background: RED, border: "none", color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 14, cursor: "pointer", fontWeight: "bold" }}>Save Error</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 10, padding: "11px 0", fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {(["all", "math", "english"] as const).map((s) => (
            <FilterChip key={s} active={filterSection === s} onClick={() => setFilterSection(s)} label={s === "all" ? "All Sections" : s === "math" ? "Math" : "English"} color={RED} />
          ))}
          <FilterChip active={filterStatus === "due"} onClick={() => setFilterStatus(filterStatus === "due" ? "all" : "due")} label={`Due (${dueCount})`} color="#f59e0b" />
          <FilterChip active={filterStatus === "mastered"} onClick={() => setFilterStatus(filterStatus === "mastered" ? "all" : "mastered")} label="Mastered" color="#10b981" />
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} style={{ ...inputStyle, fontSize: 11, padding: "5px 8px" }}>
            <option value="recency">Sort: Recent</option>
            <option value="frequency">Sort: Frequency</option>
            <option value="severity">Sort: Severity</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as "all" | ErrorCategory)} style={{ ...inputStyle, fontSize: 11, padding: "5px 8px" }}>
            <option value="all">All Categories</option>
            {CATS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>

        {/* Entries */}
        {loaded && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
            <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 6 }}>No errors match these filters</div>
            <div style={{ fontSize: 12 }}>Mistakes in Practice, Quiz, and Exam are logged here automatically.</div>
          </div>
        )}

        {filtered.map((e) => {
          const rev = pendingReview(e);
          const due = isDue(e);
          const open = expanded === e.id;
          return (
            <div key={e.id} style={{
              background: e.mastered ? "rgba(16,185,129,0.06)" : due ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${e.mastered ? "rgba(16,185,129,0.25)" : due ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 12, padding: "12px 14px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => setExpanded(open ? null : e.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: e.section === "math" ? "#f97316" : "#8b5cf6", fontFamily: "monospace" }}>{e.topic}</span>
                    <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>· {e.difficulty}</span>
                    {e.category && <span style={{ fontSize: 10, background: "rgba(239,68,68,0.15)", color: "#fca5a5", borderRadius: 99, padding: "1px 7px", fontFamily: "monospace" }}>{ERROR_CATEGORY_LABELS[e.category]}</span>}
                    {e.mastered && <span style={{ fontSize: 10, background: "rgba(16,185,129,0.2)", color: "#10b981", borderRadius: 99, padding: "1px 7px", fontFamily: "monospace" }}>✓ mastered</span>}
                    {due && !e.mastered && <span style={{ fontSize: 10, background: "rgba(245,158,11,0.2)", color: "#f59e0b", borderRadius: 99, padding: "1px 7px", fontFamily: "monospace" }}>review due</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{e.questionRef}</div>
                </div>
                <span style={{ color: "#475569", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
              </div>

              {open && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 6 }}>
                    Your answer: <span style={{ color: "#fca5a5" }}>{e.userAnswer}</span> · Correct: <span style={{ color: "#6ee7b7" }}>{e.correctAnswer}</span>
                  </div>
                  {e.explanation && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, lineHeight: 1.6 }}>{e.explanation}</div>}
                  {e.lessonLearned && <div style={{ fontSize: 12, color: "#fbbf24", marginBottom: 8, fontStyle: "italic" }}>Lesson: {e.lessonLearned}</div>}

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>CATEGORY</div>
                    <select value={e.category ?? ""} onChange={(ev) => updateEntry(e.id, { category: ev.target.value as ErrorCategory })} style={inputStyle}>
                      <option value="">Uncategorized</option>
                      {CATS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </div>

                  {!e.mastered && rev && (
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
                        Next review: {rev.dueDate} {due ? "(due now)" : ""}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => reviewOutcome(e.id, "correct")} style={{ flex: 1, background: "#10b981", border: "none", color: "#fff", borderRadius: 8, padding: "8px 0", fontSize: 12, cursor: "pointer" }}>Got it right ✓</button>
                        <button onClick={() => reviewOutcome(e.id, "incorrect")} style={{ flex: 1, background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", color: "#fca5a5", borderRadius: 8, padding: "8px 0", fontSize: 12, cursor: "pointer" }}>Still wrong ✕</button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => toggleMastered(e)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", borderRadius: 8, padding: "8px 0", fontSize: 12, cursor: "pointer" }}>
                      {e.mastered ? "Reopen" : "Mark Mastered"}
                    </button>
                    <button onClick={() => removeEntry(e.id)} style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color: string }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 11px", borderRadius: 99, fontSize: 11, cursor: "pointer", fontFamily: "monospace",
      border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
      background: active ? `${color}22` : "rgba(255,255,255,0.04)",
      color: active ? color : "#94a3b8",
    }}>{label}</button>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8, padding: "9px 10px", color: "#fff", fontSize: 13, fontFamily: "monospace",
};
