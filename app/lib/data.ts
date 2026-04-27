export const EXAM_DATE = "2026-06-06";

export function daysUntilExam(): number {
  const exam = new Date(EXAM_DATE);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((exam.getTime() - today.getTime()) / 86400000));
}

export const WEEKS = [
  {
    week: 1, theme: "Math Foundations Reset", color: "#f97316",
    days: [
      { day: "Mon", math: "Linear equations & inequalities (30 min drills)", english: "Reading: paired passages (15 min)", review: "Start wrong answer log" },
      { day: "Tue", math: "Word problems: translate English → algebra (30 min)", english: "Grammar: transitions & punctuation (15 min)", review: "Wrong answer log" },
      { day: "Wed", math: "Ratios, percentages, proportions (30 min)", english: "Reading comprehension passage (15 min)", review: "Wrong answer log" },
      { day: "Thu", math: "TUTOR SESSION: Review week's hardest problems", english: "Vocabulary in context (15 min)", review: "Share wrong answer log with tutor" },
      { day: "Fri", math: "Systems of equations (30 min)", english: "Rhetorical synthesis questions (15 min)", review: "Wrong answer log" },
      { day: "Sat", math: "Mixed drill: all week topics timed (25 min)", english: "Full English module timed (20 min)", review: "Score & analyze" },
      { day: "Sun", math: "Review all wrong answers from the week", english: "Light review only", review: "Plan next week gaps" },
    ],
  },
  {
    week: 2, theme: "Quadratics & Functions", color: "#8b5cf6",
    days: [
      { day: "Mon", math: "Factoring quadratics (30 min)", english: "Passage analysis: purpose questions (15 min)", review: "Wrong answer log" },
      { day: "Tue", math: "Quadratic formula & word problems (30 min)", english: "Grammar: subject-verb agreement (15 min)", review: "Wrong answer log" },
      { day: "Wed", math: "Functions: f(x), domain, range (30 min)", english: "Inference questions (15 min)", review: "Wrong answer log" },
      { day: "Thu", math: "TUTOR SESSION: Quadratics deep dive", english: "Evidence-based questions (15 min)", review: "Share wrong answer log" },
      { day: "Fri", math: "Interpreting graphs of functions (30 min)", english: "Timed passage (15 min)", review: "Wrong answer log" },
      { day: "Sat", math: "Mixed: linear + quadratic timed (25 min)", english: "Full English module timed (20 min)", review: "Score & analyze" },
      { day: "Sun", math: "Error analysis: why did each wrong answer fail?", english: "Light review", review: "Prep week 3 topics" },
    ],
  },
  {
    week: 3, theme: "Geometry & Trigonometry", color: "#06b6d4",
    days: [
      { day: "Mon", math: "Triangles: area, Pythagorean theorem, similarity (30 min)", english: "Passage: main idea & structure (15 min)", review: "Wrong answer log" },
      { day: "Tue", math: "Circles: area, circumference, arcs (30 min)", english: "Grammar: pronoun agreement (15 min)", review: "Wrong answer log" },
      { day: "Wed", math: "Angles, parallel lines, coordinate geometry (30 min)", english: "Timed passage drill (15 min)", review: "Wrong answer log" },
      { day: "Thu", math: "TUTOR SESSION: Geometry problem-solving", english: "Paired passage (15 min)", review: "Share wrong answer log" },
      { day: "Fri", math: "Basic trig: sin/cos/tan in right triangles (30 min)", english: "Vocabulary in context (15 min)", review: "Wrong answer log" },
      { day: "Sat", math: "Geometry timed drill (25 min)", english: "Full English module timed (20 min)", review: "Score & analyze" },
      { day: "Sun", math: "Review geometry formula sheet + wrong answers", english: "Light review", review: "Milestone check: on pace?" },
    ],
  },
  {
    week: 4, theme: "Data, Stats & Full Practice Test #1", color: "#10b981",
    days: [
      { day: "Mon", math: "Reading graphs, tables, scatterplots (30 min)", english: "Data interpretation passages (15 min)", review: "Wrong answer log" },
      { day: "Tue", math: "Mean, median, mode, standard deviation (30 min)", english: "Grammar: comma usage (15 min)", review: "Wrong answer log" },
      { day: "Wed", math: "Probability & counting (30 min)", english: "Timed passage (15 min)", review: "Wrong answer log" },
      { day: "Thu", math: "TUTOR SESSION: Stats & data weak spots", english: "Evidence questions (15 min)", review: "Share wrong answer log" },
      { day: "Fri", math: "Mixed: stats + geometry + quadratics (30 min)", english: "Full passage drill (15 min)", review: "Wrong answer log" },
      { day: "Sat", math: "FULL PRACTICE TEST — Bluebook (timed, all sections)", english: "FULL PRACTICE TEST", review: "Record total score!" },
      { day: "Sun", math: "Deep review: every wrong math answer", english: "Deep review: every wrong English answer", review: "Identify top 3 gaps" },
    ],
  },
  {
    week: 5, theme: "Gap Targeting & Speed", color: "#f59e0b",
    days: [
      { day: "Mon", math: "Top gap from practice test — drill it hard (30 min)", english: "Hardest English question types (15 min)", review: "Wrong answer log" },
      { day: "Tue", math: "Timed math module under strict conditions (25 min)", english: "Timed English module strict (20 min)", review: "Score both" },
      { day: "Wed", math: "Gap #2 from practice test — drill it (30 min)", english: "Grammar speed drill (15 min)", review: "Wrong answer log" },
      { day: "Thu", math: "TUTOR SESSION: Go through practice test errors", english: "Timed passage (15 min)", review: "Tutor reviews score" },
      { day: "Fri", math: "Gap #3 from practice test — drill it (30 min)", english: "Rhetorical synthesis (15 min)", review: "Wrong answer log" },
      { day: "Sat", math: "Mini timed test: math only (College Board module)", english: "Mini timed test: English only", review: "Score & analyze" },
      { day: "Sun", math: "Review & rest — no new topics", english: "Review only", review: "Confidence check" },
    ],
  },
  {
    week: 6, theme: "Final Sprint & Test Readiness", color: "#ef4444",
    days: [
      { day: "Mon", math: "FULL PRACTICE TEST #2 — Bluebook", english: "FULL PRACTICE TEST #2", review: "Record score — compare to Week 4!" },
      { day: "Tue", math: "Review test: math errors only (40 min focused)", english: "Review test: English errors (20 min)", review: "Error log" },
      { day: "Wed", math: "TUTOR SESSION: Final weak spots only", english: "Final English review", review: "Last tutor session" },
      { day: "Thu", math: "Light timed drill — no new topics (25 min)", english: "One timed passage (15 min)", review: "Stay calm, stay sharp" },
      { day: "Fri", math: "Review formula sheet + personal mistake patterns ONLY", english: "Skim notes lightly", review: "Pack supplies, sleep by 10pm" },
      { day: "Sat", math: "SAT EXAM DAY — June 6", english: "SAT EXAM DAY", review: "You have prepared. Trust yourself!" },
      { day: "Sun", math: "REST & celebrate the hard work", english: "REST", review: "Score arrives in ~2 weeks" },
    ],
  },
];

export const MATH_TOPICS = [
  { id: "linear", label: "Linear Equations & Word Problems", color: "#f97316" },
  { id: "systems", label: "Systems of Equations", color: "#f59e0b" },
  { id: "quadratics", label: "Quadratic Equations", color: "#8b5cf6" },
  { id: "functions", label: "Functions", color: "#a78bfa" },
  { id: "geometry", label: "Geometry & Trigonometry", color: "#06b6d4" },
  { id: "statistics", label: "Statistics & Data Analysis", color: "#10b981" },
  { id: "ratios", label: "Ratios, Proportions & Percentages", color: "#34d399" },
];

export const ENGLISH_TOPICS = [
  { id: "grammar", label: "Grammar & Conventions", color: "#8b5cf6" },
  { id: "transitions", label: "Transitions", color: "#a78bfa" },
  { id: "vocabulary", label: "Vocabulary in Context", color: "#60a5fa" },
  { id: "reading", label: "Reading Comprehension", color: "#f59e0b" },
  { id: "synthesis", label: "Rhetorical Synthesis", color: "#10b981" },
];

export const MATH_TIPS = [
  "Circle or underline what the question is asking before you start solving.",
  "Show ALL work — never do steps in your head on the SAT.",
  "After solving, re-read the question: did you answer what was actually asked?",
  "Use the Desmos calculator built into the digital SAT — always double-check arithmetic.",
  "Write down units (miles, dollars, etc.) to catch mismatches early.",
  "If stuck, skip and come back — don't burn time on one problem.",
  "In word problems, translate one sentence at a time, not all at once.",
  "For systems of equations, elimination is usually faster than substitution.",
  "Memorize: sum of roots = -b/a, product of roots = c/a for quadratics.",
  "Area formulas are given at the top of the math module — use them!",
];

export const ENGLISH_TIPS = [
  "For 'purpose of paragraph' questions, read the paragraph before AND after it.",
  "Transitions (however, therefore, moreover) — match the logic, not just the tone.",
  "Rhetorical synthesis: pick the answer that uses BOTH sources, not just one.",
  "Grammar: read the sentence aloud in your head — your ear often catches errors.",
  "Evidence questions: always find the evidence FIRST, then pick the claim it supports.",
  "Vocabulary in context: replace the word with each answer and see which fits the meaning.",
  "Comma splice: two independent clauses need a period, semicolon, or comma + conjunction.",
  "Subject-verb agreement: ignore phrases between commas when finding the subject.",
  "Parallelism: list items must all be the same grammatical form.",
  "Concision: if two answers say the same thing, the shorter one is almost always correct.",
];
