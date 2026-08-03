"use client";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  { label: "Explain linear equations", text: "Explain how to solve SAT linear equation word problems step by step. Give me a quick tip I can remember." },
  { label: "Quadratic tips", text: "What are the most important quadratic equation strategies for the SAT? Focus on factoring and when to use the quadratic formula." },
  { label: "Grammar rules", text: "What are the top 5 grammar rules tested on the SAT Reading & Writing section? Give me quick examples for each." },
  { label: "Transition words", text: "How do I pick the right transition word on the SAT? Explain the categories (contrast, addition, cause-effect, example) with examples." },
  { label: "Reading strategies", text: "What's the best strategy for SAT reading comprehension questions? How do I approach 'main purpose' and 'evidence' questions?" },
  { label: "Geometry formulas", text: "What geometry formulas do I need to memorize for the SAT, and which ones are given to me? Focus on the most commonly tested ones." },
  { label: "Stats & data tips", text: "How do I interpret scatterplots, tables, and graphs on the SAT Math section? What mistakes should I avoid?" },
  { label: "Time management", text: "How should I pace myself during the SAT? How many minutes per question for Math and for Reading & Writing?" },
];

export default function Tutor() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const newMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          system: "You are an expert SAT tutor helping a 10th grade student preparing for the SAT on September 12, 2026. Her target score is 1550+. Her strengths are English; her weaknesses are math word problems, quadratics, careless mistakes, and geometry. Be encouraging, concise, and specific. Use examples. Format explanations with clear steps when solving math problems. For English, focus on the patterns and strategies that work on the digital SAT.",
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.text || "Something went wrong. Try again." }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error — please try again." }]);
    }
    setLoading(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: "2px solid #f59e0b", padding: "16px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#f59e0b", textTransform: "uppercase", fontFamily: "monospace" }}>AI Tutor</div>
            <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 4 }}>Ask Claude</div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#64748b", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Clear</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "12px 16px", flex: 1, display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}>
        {/* Quick prompts */}
        {messages.length === 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 10 }}>QUICK QUESTIONS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => send(p.text)} style={{
                  background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                  color: "#f59e0b", borderRadius: 99, padding: "6px 13px", fontSize: 12, cursor: "pointer", fontFamily: "Georgia,serif",
                }}>{p.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, marginBottom: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 8 }}>Your SAT Tutor</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                Ask anything — math concepts, grammar rules, test strategy, or request a practice problem with step-by-step explanation.
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 8 }}>
              <div style={{
                background: m.role === "user" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${m.role === "user" ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12, padding: "11px 14px", fontSize: 14, lineHeight: 1.7,
                color: "#e2e8f0", maxWidth: "88%", whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8, padding: "4px 0" }}>
              <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "11px 14px", fontSize: 13, color: "#64748b", fontStyle: "italic" }}>
                Claude is thinking...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8, position: "sticky", bottom: 0, paddingBottom: 8 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Ask a question or request a practice problem..."
            style={{
              flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: "Georgia,serif", outline: "none",
            }}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{
            background: "#f59e0b", border: "none", color: "#fff", borderRadius: 12, padding: "12px 18px",
            fontSize: 18, cursor: loading || !input.trim() ? "default" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1,
          }}>→</button>
        </div>
      </div>
    </div>
  );
}
