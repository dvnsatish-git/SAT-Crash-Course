import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { QUESTIONS, getQuestions } from "../../../lib/questions";
import { selectAdaptive, weakestTopic } from "../../../lib/adaptive";
import type { QuestionHistory } from "../../../lib/adaptive";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOPIC_LABELS: Record<string, string> = {
  linear: "Linear Equations and Word Problems",
  systems: "Systems of Equations",
  quadratics: "Quadratic Equations",
  functions: "Functions",
  geometry: "Geometry and Trigonometry",
  statistics: "Statistics and Data Analysis",
  ratios: "Ratios, Proportions, and Percentages",
  grammar: "Grammar and Standard English Conventions",
  transitions: "Transition Words and Logical Flow",
  vocabulary: "Vocabulary in Context",
  reading: "Reading Comprehension",
  synthesis: "Rhetorical Synthesis",
};

export async function POST(req: NextRequest) {
  const { history, section, topic, generateIfWeak = false } = await req.json() as {
    history: QuestionHistory;
    section?: "math" | "english";
    topic?: string;
    generateIfWeak?: boolean;
  };

  // Attempt to generate a Claude question when topic is weak
  if (generateIfWeak) {
    const weak = weakestTopic(history, QUESTIONS, section);
    const targetTopic = topic || weak?.topic;
    const targetSection = section || weak?.section;

    if (targetTopic && targetSection && weak && weak.accuracy < 0.5 && weak.total >= 2) {
      try {
        const generated = await generateQuestion(
          targetSection,
          targetTopic,
          history,
          weak.accuracy
        );
        return NextResponse.json({ question: generated, generated: true, weakTopic: weak.topic });
      } catch (e) {
        console.error("Claude question generation failed:", e);
        // Fall through to adaptive selection
      }
    }
  }

  // Adaptive selection from question bank
  const question = selectAdaptive(QUESTIONS, history, section, topic || undefined);
  return NextResponse.json({ question, generated: false });
}

async function generateQuestion(
  section: "math" | "english",
  topic: string,
  history: QuestionHistory,
  accuracy: number
) {
  const accuracyPct = Math.round(accuracy * 100);
  const difficulty = accuracyPct < 40 ? "easy" : accuracyPct < 65 ? "medium" : "hard";

  // Find recently wrong questions in this topic for context (avoid repeating them)
  const topicQs = getQuestions(section, topic);
  const wrongRecently = topicQs
    .filter((q) => {
      const h = history[q.id];
      return h && h.total > 0 && h.correct / h.total < 0.5;
    })
    .map((q) => q.question)
    .slice(0, 3);

  const prompt = `You are an expert SAT ${section === "math" ? "Math" : "Reading & Writing"} question writer.

Generate exactly ONE new, original SAT-style question on the topic: "${TOPIC_LABELS[topic] || topic}"
Student accuracy on this topic: ${accuracyPct}% — target difficulty: ${difficulty}
${wrongRecently.length > 0 ? `\nDo NOT repeat or closely resemble these questions the student already got wrong:\n${wrongRecently.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n` : ""}
Return ONLY valid JSON with no markdown or extra text:
{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":0,"explanation":"..."}

Requirements:
- answer is 0–3 (index: 0=A 1=B 2=C 3=D)
- All 4 options must be plausible and distinct
- explanation must show clear step-by-step reasoning
- question must be SAT-authentic in style and difficulty
${section === "math" ? "- For math: use concrete numbers, avoid ambiguity, show numerical setup" : "- For English: use a realistic sentence or short passage excerpt as context"}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content.find((b) => b.type === "text")?.text?.trim() ?? "";
  // Strip any accidental markdown code fences
  const json = text.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(json) as {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };

  return {
    id: `gen-${Date.now()}`,
    section,
    topic,
    difficulty,
    question: parsed.question,
    options: parsed.options as [string, string, string, string],
    answer: parsed.answer as 0 | 1 | 2 | 3,
    explanation: parsed.explanation,
    generated: true,
  };
}
