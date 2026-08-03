"use client";
import { useState, useEffect } from "react";
import { loadData, saveData } from "../lib/api-client";
import { MATH_TOPICS, ENGLISH_TOPICS, TARGET_SCORE } from "../lib/data";
import { PRACTICE_SOURCE_LABELS } from "../lib/types";
import type { ExamRecord, DomainResult, PracticeSource } from "../lib/types";

const TARGET = TARGET_SCORE;
const SOURCES = Object.entries(PRACTICE_SOURCE_LABELS) as [PracticeSource, string][];

export default function Tracker() {
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ math: "", english: "", date: new Date().toISOString().slice(0, 10), type: "practice" as "practice" | "official", notes: "", source: "bluebook" as PracticeSource });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [domainResults, setDomainResults] = useState<DomainResult[]>([]);
  const [showDomainBuilder, setShowDomainBuilder] = useState(false);
  const [domainDraft, setDomainDraft] = useState({ section: "math" as "math" | "english", topic: MATH_TOPICS[0].id, correct: "", total: "" });
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  useEffect(() => {
    loadData<ExamRecord[]>("examRecords", []).then((r) => { setRecords(r); setLoaded(true); });
  }, []);

  const persist = (next: ExamRecord[]) => {
    setRecords(next);
    saveData("examRecords", next);
  };

  const save = () => {
    const m = parseInt(form.math), e = parseInt(form.english);
    if (!form.math || !form.english || isNaN(m) || isNaN(e) || m < 200 || m > 800 || e < 200 || e > 800) {
      setError("Both scores must be between 200 and 800."); return;
    }
    const record: ExamRecord = {
      id: Date.now().toString(), date: form.date, type: form.type,
      mathCorrect: 0, mathTotal: 0, englishCorrect: 0, englishTotal: 0,
      mathScore: m, englishScore: e, totalScore: m + e, notes: form.notes,
      source: form.source,
      domainResults: domainResults.length > 0 ? domainResults : undefined,
    };
    persist([...records, record].sort((a, b) => a.date.localeCompare(b.date)));
    setForm({ math: "", english: "", date: new Date().toISOString().slice(0, 10), type: "practice", notes: "", source: "bluebook" });
    setDomainResults([]);
    setShowDomainBuilder(false);
    setError(""); setShowForm(false);
  };

  const addDomainResult = () => {
    const c = parseInt(domainDraft.correct), t = parseInt(domainDraft.total);
    if (isNaN(c) || isNaN(t) || t <= 0 || c < 0 || c > t) return;
    setDomainResults((prev) => [...prev, { section: domainDraft.section, topic: domainDraft.topic, correct: c, total: t }]);
    setDomainDraft((p) => ({ ...p, correct: "", total: "" }));
  };

  const removeDomainResult = (idx: number) => setDomainResults((prev) => prev.filter((_, i) => i !== idx));

  const remove = (id: string) => persist(records.filter((r) => r.id !== id));

  const best = records.length ? Math.max(...records.map((r) => r.totalScore)) : null;
  const latest = records.length ? records[records.length - 1].totalScore : null;
  const improvement = records.length >= 2 ? records[records.length - 1].totalScore - records[0].totalScore : null;
  const minScore = Math.max(400, records.length ? Math.min(...records.map((r) => r.totalScore)) - 50 : 800);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0" }}>
      <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: "2px solid #10b981", padding: "16px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#10b981", textTransform: "uppercase", fontFamily: "monospace" }}>Score Tracker</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>Progress Log</div>
              {!loaded && <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>syncing…</span>}
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: "#10b981", border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>+ Add Score</button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px" }}>
        {showForm && (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: "bold", color: "#10b981", marginBottom: 12 }}>Log a Score</div>
            {error && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 8 }}>{error}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[{ label: "Math (200–800)", key: "math" }, { label: "English (200–800)", key: "english" }].map((f) => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginBottom: 4 }}>{f.label}</div>
                  <input type="number" min={200} max={800} step={10}
                    value={form[f.key as "math" | "english"]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 10px", color: "#fff", fontSize: 14, fontFamily: "monospace", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginBottom: 4 }}>Date</div>
                <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 10px", color: "#fff", fontSize: 14, fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginBottom: 4 }}>Type</div>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "practice" | "official" }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 10px", color: "#fff", fontSize: 14, fontFamily: "monospace", boxSizing: "border-box" }}>
                  <option value="practice">Practice</option>
                  <option value="official">Official</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginBottom: 4 }}>Source</div>
              <select value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value as PracticeSource }))}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 10px", color: "#fff", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }}>
                {SOURCES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
            <input type="text" placeholder="Notes (optional)…" value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 10px", color: "#fff", fontSize: 13, fontFamily: "Georgia,serif", boxSizing: "border-box", marginBottom: 12 }} />

            <button onClick={() => setShowDomainBuilder(!showDomainBuilder)} style={{ background: "none", border: "none", color: "#10b981", fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 10 }}>
              {showDomainBuilder ? "▾" : "▸"} Add domain-level breakdown (optional)
            </button>

            {showDomainBuilder && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, marginBottom: 12 }}>
                {domainResults.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#e2e8f0", padding: "4px 0" }}>
                    <span>{d.section === "math" ? "📐" : "📖"} {d.topic}: {d.correct}/{d.total} ({Math.round((d.correct / d.total) * 100)}%)</span>
                    <button onClick={() => removeDomainResult(i)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 13 }}>✕</button>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: domainResults.length > 0 ? 8 : 0, marginBottom: 8 }}>
                  <select value={domainDraft.section} onChange={(e) => { const section = e.target.value as "math" | "english"; setDomainDraft((p) => ({ ...p, section, topic: (section === "math" ? MATH_TOPICS : ENGLISH_TOPICS)[0].id })); }}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 8px", color: "#fff", fontSize: 12, fontFamily: "monospace" }}>
                    <option value="math">Math</option>
                    <option value="english">English</option>
                  </select>
                  <select value={domainDraft.topic} onChange={(e) => setDomainDraft((p) => ({ ...p, topic: e.target.value }))}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 8px", color: "#fff", fontSize: 12, fontFamily: "monospace" }}>
                    {(domainDraft.section === "math" ? MATH_TOPICS : ENGLISH_TOPICS).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                  <input type="number" placeholder="Correct" min={0} value={domainDraft.correct} onChange={(e) => setDomainDraft((p) => ({ ...p, correct: e.target.value }))}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 8px", color: "#fff", fontSize: 12, fontFamily: "monospace" }} />
                  <input type="number" placeholder="Total" min={1} value={domainDraft.total} onChange={(e) => setDomainDraft((p) => ({ ...p, total: e.target.value }))}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 8px", color: "#fff", fontSize: 12, fontFamily: "monospace" }} />
                  <button onClick={addDomainResult} style={{ background: "#10b981", border: "none", color: "#fff", borderRadius: 8, padding: "0 14px", fontSize: 12, cursor: "pointer" }}>Add</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} style={{ flex: 1, background: "#10b981", border: "none", color: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 14, cursor: "pointer", fontWeight: "bold" }}>Save Score</button>
              <button onClick={() => { setShowForm(false); setError(""); setDomainResults([]); setShowDomainBuilder(false); }} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 10, padding: "11px 0", fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {records.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
              {[
                { label: "Tests", value: records.length, color: "#94a3b8" },
                { label: "Latest", value: latest, color: "#60a5fa" },
                { label: "Best", value: best, color: "#10b981" },
                { label: improvement !== null && improvement > 0 ? "Gained" : "Change", value: improvement !== null ? `${improvement > 0 ? "+" : ""}${improvement}` : "—", color: improvement !== null && improvement > 0 ? "#10b981" : "#f97316" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {latest !== null && (
              <div style={{ background: latest >= TARGET ? "rgba(16,185,129,0.1)" : "rgba(249,115,22,0.1)", border: `1px solid ${latest >= TARGET ? "rgba(16,185,129,0.3)" : "rgba(249,115,22,0.3)"}`, borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: latest >= TARGET ? "#10b981" : "#f97316", fontWeight: "bold" }}>{latest >= TARGET ? "Target Reached!" : `${TARGET - latest} points from ${TARGET} goal`}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Target: {TARGET} · Current: {latest}</div>
                </div>
                <div style={{ fontSize: 24 }}>{latest >= TARGET ? "🎯" : "🚀"}</div>
              </div>
            )}

            {/* Bar chart */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 14 }}>SCORE HISTORY</div>
              <div style={{ position: "relative", height: 120, display: "flex", alignItems: "flex-end", gap: 4 }}>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: `${Math.min(100, Math.max(0, ((TARGET - minScore) / (1600 - minScore)) * 100))}%`, borderTop: "1px dashed rgba(249,115,22,0.5)" }} />
                {records.map((r, i) => {
                  const h = Math.max(4, Math.min(100, ((r.totalScore - minScore) / (1600 - minScore)) * 100));
                  const isLatest = i === records.length - 1;
                  return (
                    <div key={r.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {isLatest && <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace", position: "absolute", top: -16 }}>{r.totalScore}</div>}
                      <div style={{ width: "100%", height: `${h}%`, background: isLatest ? "#10b981" : r.type === "official" ? "#f97316" : "#60a5fa", borderRadius: "3px 3px 0 0", minHeight: 4 }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>{records[0]?.date}</span>
                <span style={{ fontSize: 9, color: "#f97316", fontFamily: "monospace" }}>— {TARGET} goal</span>
                <span style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>{records[records.length - 1]?.date}</span>
              </div>
            </div>
          </>
        )}

        {records.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
            <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 8 }}>No scores yet</div>
            <div style={{ fontSize: 13 }}>Log a Bluebook practice test or complete an in-app exam to start tracking.</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 10 }}>ALL ENTRIES</div>
            {[...records].reverse().map((r) => (
              <div key={r.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{r.date}</span>
                      <span style={{ fontSize: 10, background: r.type === "official" ? "rgba(249,115,22,0.2)" : "rgba(96,165,250,0.2)", color: r.type === "official" ? "#f97316" : "#60a5fa", borderRadius: 99, padding: "1px 7px", fontFamily: "monospace" }}>{r.type}</span>
                      {r.source && <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{PRACTICE_SOURCE_LABELS[r.source]}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 14 }}>
                      <span style={{ fontSize: 12, color: "#f97316", fontFamily: "monospace" }}>Math: {r.mathScore}</span>
                      <span style={{ fontSize: 12, color: "#8b5cf6", fontFamily: "monospace" }}>English: {r.englishScore}</span>
                    </div>
                    {r.notes && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontStyle: "italic" }}>{r.notes}</div>}
                    {r.domainResults && r.domainResults.length > 0 && (
                      <button onClick={() => setExpandedRecord(expandedRecord === r.id ? null : r.id)} style={{ background: "none", border: "none", color: "#10b981", fontSize: 11, cursor: "pointer", padding: 0, marginTop: 6 }}>
                        {expandedRecord === r.id ? "▾ Hide" : "▸ Show"} domain breakdown ({r.domainResults.length})
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: r.totalScore >= TARGET ? "#10b981" : "#f0f0f0" }}>{r.totalScore}</div>
                    <button onClick={() => remove(r.id)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 16 }}>✕</button>
                  </div>
                </div>
                {expandedRecord === r.id && r.domainResults && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {r.domainResults.map((d, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#cbd5e1", padding: "3px 0" }}>
                        <span>{d.section === "math" ? "📐" : "📖"} {d.topic}</span>
                        <span style={{ fontFamily: "monospace", color: d.correct / d.total < 0.5 ? "#ef4444" : "#10b981" }}>{d.correct}/{d.total} ({Math.round((d.correct / d.total) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
