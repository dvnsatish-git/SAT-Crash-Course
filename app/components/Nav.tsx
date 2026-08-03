"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", icon: "📊", label: "Home" },
  { href: "/quiz", icon: "⚡", label: "Quiz" },
  { href: "/practice", icon: "✏️", label: "Practice" },
  { href: "/exam", icon: "⏱️", label: "Exam" },
  { href: "/plan", icon: "📅", label: "Plan" },
  { href: "/tracker", icon: "📈", label: "Scores" },
  { href: "/errors", icon: "🧠", label: "Errors" },
  { href: "/analytics", icon: "📉", label: "Stats" },
  { href: "/resources", icon: "🔗", label: "Resources" },
  { href: "/tutor", icon: "🤖", label: "Tutor" },
];

export default function Nav() {
  const path = usePathname();
  if (path.startsWith("/parent")) return null;
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      background: "rgba(15,12,41,0.97)", backdropFilter: "blur(12px)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex", height: 64, overflowX: "auto",
    }}>
      {ITEMS.map((item) => {
        const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} style={{
            flex: "1 0 64px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 2,
            textDecoration: "none", color: active ? "#f97316" : "#64748b",
            fontSize: 9, fontFamily: "monospace", letterSpacing: 0.3,
            textTransform: "uppercase", transition: "color 0.15s",
            borderTop: active ? "2px solid #f97316" : "2px solid transparent",
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
