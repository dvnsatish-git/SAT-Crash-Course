"use client";
import Link from "next/link";
import { MATH_TOPICS, ENGLISH_TOPICS } from "../lib/data";

const CYAN = "#06b6d4";

const KHAN_ACADEMY_SAT_HUB = "https://www.khanacademy.org/sat";
const COLLEGE_BOARD_SAT_SUITE = "https://satsuite.collegeboard.org/sat";
const BLUEBOOK_APP_INFO = "https://bluebook.collegeboard.org";

const SEARCH_HINTS: Record<string, string> = {
  linear: "linear equations word problems",
  systems: "systems of equations",
  quadratics: "quadratic equations",
  functions: "functions",
  geometry: "right triangles trigonometry",
  statistics: "statistics and data analysis",
  ratios: "ratios proportions percentages",
  grammar: "standard English conventions",
  transitions: "transitions",
  vocabulary: "words in context",
  reading: "reading comprehension",
  synthesis: "rhetorical synthesis",
};

export default function Resources() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#0f3460 100%)", fontFamily: "Georgia,serif", color: "#f0f0f0" }}>
      <div style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e)", borderBottom: `2px solid ${CYAN}`, padding: "16px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: CYAN, textTransform: "uppercase", fontFamily: "monospace" }}>Official Resources</div>
          <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 4 }}>Launch & Log</div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 24px" }}>
        <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
          This app doesn&apos;t copy or embed Khan Academy or College Board content — these are direct links out to their real sites. After a session there, come back and log your score or mistakes so the planner and analytics can factor it in.
        </div>

        {/* Official full-length tests */}
        <Section title="Official Full-Length Practice">
          <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 12, lineHeight: 1.7 }}>
            Bluebook remains the source of truth for official adaptive practice tests. Schedule one on your plan, take it externally, then log the result here.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ExternalButton href={BLUEBOOK_APP_INFO} label="Open Bluebook" color="#8b5cf6" />
            <ExternalButton href={COLLEGE_BOARD_SAT_SUITE} label="College Board SAT Suite" color="#8b5cf6" />
            <Link href="/tracker" style={{ ...buttonStyle, background: "#10b981" }}>Log a Score →</Link>
          </div>
        </Section>

        {/* Math topics */}
        <Section title="Math — Khan Academy Lessons" note="Open the hub, then search for the term shown under each topic — Khan Academy's own search is more reliable than a guessed deep link.">
          {MATH_TOPICS.map((t) => (
            <TopicRow key={t.id} label={t.label} color={t.color} searchHint={SEARCH_HINTS[t.id]} />
          ))}
        </Section>

        {/* English topics */}
        <Section title="Reading & Writing — Khan Academy Lessons" note="Open the hub, then search for the term shown under each topic.">
          {ENGLISH_TOPICS.map((t) => (
            <TopicRow key={t.id} label={t.label} color={t.color} searchHint={SEARCH_HINTS[t.id]} />
          ))}
        </Section>

        <Section title="Log What You Did">
          <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 12, lineHeight: 1.7 }}>
            After practicing externally, bring the results back in so weak spots and review schedules stay accurate.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/tracker" style={{ ...buttonStyle, background: "#10b981" }}>Log a Practice Test</Link>
            <Link href="/errors" style={{ ...buttonStyle, background: "#ef4444" }}>Log a Missed Question</Link>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: note ? 6 : 12 }}>{title.toUpperCase()}</div>
      {note && <div style={{ fontSize: 11, color: "#475569", marginBottom: 12, fontStyle: "italic" }}>{note}</div>}
      {children}
    </div>
  );
}

function TopicRow({ label, color, searchHint }: { label: string; color: string; searchHint: string }) {
  return (
    <a href={KHAN_ACADEMY_SAT_HUB} target="_blank" rel="noopener noreferrer" style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: `${color}0d`, border: `1px solid ${color}33`, borderRadius: 10,
      padding: "10px 12px", marginBottom: 8, textDecoration: "none", color: "#e2e8f0",
    }}>
      <div>
        <div style={{ fontSize: 13 }}>{label}</div>
        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>search: &quot;{searchHint}&quot;</div>
      </div>
      <span style={{ fontSize: 11, color, fontFamily: "monospace", whiteSpace: "nowrap" }}>Khan Academy ↗</span>
    </a>
  );
}

function ExternalButton({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...buttonStyle, background: color }}>
      {label} ↗
    </a>
  );
}

const buttonStyle: React.CSSProperties = {
  display: "inline-block", color: "#fff", borderRadius: 10, padding: "10px 16px",
  fontSize: 13, fontWeight: "bold", textDecoration: "none",
};
