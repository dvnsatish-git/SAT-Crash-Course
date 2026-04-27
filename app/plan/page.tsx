"use client";
import { useState, useEffect } from "react";
import { WEEKS } from "../lib/data";
import { loadData, saveData } from "../lib/api-client";

export default function Plan() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData<Record<string, boolean>>("completedDays", {}).then((d) => {
      setCompletedDays(d);
      setLoaded(true);
    });
  }, []);

  const toggle = (weekIdx: number, dayIdx: number) => {
    const key = `${weekIdx}-${dayIdx}`;
    const next = { ...completedDays, [key]: !completedDays[key] };
    setCompletedDays(next);
    saveData("completedDays", next);
  };

  const totalDone = Object.values(completedDays).filter(Boolean).length;
  const pct = Math.round((totalDone / 42) * 100);
  const w = WEEKS[currentWeek];
  const weekDone = w.days.filter((_, di) => completedDays[`${currentWeek}-${di}`]).length;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0" }}>
      <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: "2px solid #06b6d4", padding: "16px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#06b6d4", textTransform: "uppercase", fontFamily: "monospace" }}>Study Schedule</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>6-Week Plan</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {!loaded && <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>syncing…</span>}
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#06b6d4" }}>{totalDone}/42 · {pct}%</span>
            </div>
          </div>
          <div style={{ marginTop: 8, background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 4 }}>
            <div style={{ background: "linear-gradient(90deg,#06b6d4,#8b5cf6)", borderRadius: 99, height: 4, width: `${pct}%`, transition: "width 0.4s" }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {WEEKS.map((week, i) => {
            const wDone = week.days.filter((_, di) => completedDays[`${i}-${di}`]).length;
            return (
              <button key={i} onClick={() => setCurrentWeek(i)} style={{
                background: currentWeek === i ? week.color : "rgba(255,255,255,0.05)",
                border: `1px solid ${currentWeek === i ? week.color : "rgba(255,255,255,0.1)"}`,
                color: "#fff", borderRadius: 99, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "monospace",
              }}>
                W{week.week}{wDone > 0 && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>{wDone}/7</span>}
              </button>
            );
          })}
        </div>

        <div style={{
          background: `linear-gradient(135deg,${w.color}22,${w.color}0d)`, border: `1px solid ${w.color}44`,
          borderRadius: 14, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 10, color: w.color, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace" }}>Week {w.week}</div>
            <div style={{ fontSize: 17, fontWeight: "bold", color: "#fff", marginTop: 2 }}>{w.theme}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: w.color }}>{weekDone}/7</div>
            <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>days done</div>
          </div>
        </div>

        {w.days.map((day, di) => {
          const key = `${currentWeek}-${di}`;
          const done = completedDays[key];
          return (
            <div key={di} onClick={() => toggle(currentWeek, di)} style={{
              background: done ? `${w.color}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${done ? w.color + "55" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ background: done ? w.color : "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontFamily: "monospace" }}>{day.day}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 3 }}><span style={{ color: "#60a5fa" }}>Math: </span>{day.math}</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 3 }}><span style={{ color: "#a78bfa" }}>English: </span>{day.english}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}><span style={{ color: "#fbbf24" }}>Review: </span>{day.review}</div>
                </div>
                <div style={{
                  width: 30, height: 30, borderRadius: 99, flexShrink: 0, marginLeft: 10,
                  background: done ? w.color : "rgba(255,255,255,0.07)", border: `2px solid ${done ? w.color : "rgba(255,255,255,0.15)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>{done ? "✓" : ""}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
