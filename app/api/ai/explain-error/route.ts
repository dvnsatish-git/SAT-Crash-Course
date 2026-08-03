import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../../../lib/rateLimit";
import { ERROR_CATEGORY_LABELS } from "../../../lib/types";
import type { ErrorCategory } from "../../../lib/types";

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

interface ErrorAnalysis {
  summary: string;
  rootCause: "concept_gap" | "misread" | "careless" | "timing" | "strategy" | "other";
  skill: string;
  lesson: string;
  nextActions: string[];
  reviewQuestions: string[];
}

interface RequestBody {
  section: "math" | "english";
  topic: string;
  difficulty: string;
  questionText?: string;
  userAnswer: string;
  correctAnswer: string;
  category?: ErrorCategory | null;
}

const CATEGORY_TO_ROOT_CAUSE: Record<string, ErrorAnalysis["rootCause"]> = {
  concept_gap: "concept_gap",
  misread: "misread",
  careless: "careless",
  time_pressure: "timing",
  strategy: "strategy",
  grammar_gap: "concept_gap",
  vocabulary_gap: "concept_gap",
  guessed: "other",
  other: "other",
};

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id") ?? "anon";
  const allowed = await checkRateLimit(`ratelimit:explain-error:${deviceId}`, 20, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in a bit." }, { status: 429 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!client) {
    return NextResponse.json({ analysis: mockAnalysis(body), mock: true });
  }

  try {
    const analysis = await generateAnalysis(body);
    return NextResponse.json({ analysis, mock: false });
  } catch (err) {
    console.error("explain-error API failed, falling back to mock analysis:", err);
    return NextResponse.json({ analysis: mockAnalysis(body), mock: true });
  }
}

/** Deterministic, template-based analysis so the AI coach works with no API key configured. */
function mockAnalysis(body: RequestBody): ErrorAnalysis {
  const topicLabel = body.topic.replace(/_/g, " ");
  const categoryLabel = body.category ? ERROR_CATEGORY_LABELS[body.category] : "an unreviewed error type";
  return {
    summary: `You answered "${body.userAnswer}" instead of "${body.correctAnswer}" on a ${body.difficulty} ${topicLabel} question. This looks like ${categoryLabel.toLowerCase()}.`,
    rootCause: body.category ? CATEGORY_TO_ROOT_CAUSE[body.category] : "other",
    skill: topicLabel,
    lesson: `Before your next ${topicLabel} question, restate what's being asked in your own words and double-check your final step against it.`,
    nextActions: [
      `Redo 3-5 ${topicLabel} practice questions focused on this pattern.`,
      "Revisit the concept card or worked example for this skill before drilling again.",
      "Schedule a spaced review of this exact mistake in the Error Log.",
    ],
    reviewQuestions: [`Try another ${body.difficulty} ${topicLabel} question and explain your reasoning out loud before answering.`],
  };
}

async function generateAnalysis(body: RequestBody): Promise<ErrorAnalysis> {
  const prompt = `You are an SAT coach analyzing a student's mistake. Do not claim guaranteed score improvement, do not fabricate official College Board data, and do not present this as certain.

Question topic: ${body.topic} (${body.section}, difficulty: ${body.difficulty})
${body.questionText ? `Question: ${body.questionText}\n` : ""}Student's answer: ${body.userAnswer}
Correct answer: ${body.correctAnswer}
Student-selected error category: ${body.category ? ERROR_CATEGORY_LABELS[body.category] : "not specified"}

Return ONLY valid JSON with no markdown or extra text, matching exactly this shape:
{"summary":"...", "rootCause":"concept_gap|misread|careless|timing|strategy|other", "skill":"...", "lesson":"...", "nextActions":["...","..."], "reviewQuestions":["..."]}`;

  const response = await client!.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content.find((b) => b.type === "text")?.text?.trim() ?? "";
  const json = text.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(json) as ErrorAnalysis;
}
