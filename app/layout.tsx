import type { Metadata } from "next";
import Nav from "./components/Nav";
import { EXAM_DATE } from "./lib/data";

const examDateLabel = new Date(`${EXAM_DATE}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" });

export const metadata: Metadata = {
  title: `SAT Prep — ${examDateLabel} Command Center`,
  description: "Personalized SAT prep plan powered by Claude AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0f0c29", paddingBottom: 64 }}>
        {children}
        <Nav />
      </body>
    </html>
  );
}
