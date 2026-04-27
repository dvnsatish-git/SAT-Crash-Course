import type { Question } from "./types";

export const QUESTIONS: Question[] = [
  // ===== MATH: LINEAR EQUATIONS =====
  {
    id: "m001", section: "math", topic: "linear", difficulty: "easy",
    question: "If 4x − 9 = 2x + 7, what is the value of x?",
    options: ["−1", "2", "8", "16"],
    answer: 2,
    explanation: "Subtract 2x from both sides: 2x − 9 = 7. Add 9: 2x = 16. Divide by 2: x = 8.",
  },
  {
    id: "m002", section: "math", topic: "linear", difficulty: "medium",
    question: "A taxi charges a $2.50 flat fee plus $0.75 per mile. If a ride costs $11.50, how many miles was the ride?",
    options: ["8", "12", "14", "16"],
    answer: 1,
    explanation: "Set up: 2.50 + 0.75m = 11.50 → 0.75m = 9 → m = 12 miles.",
  },
  {
    id: "m003", section: "math", topic: "linear", difficulty: "medium",
    question: "Company A rents cars for $40 + $0.15 per mile. Company B charges $25 + $0.20 per mile. For how many miles do both companies charge the same amount?",
    options: ["100", "200", "300", "400"],
    answer: 2,
    explanation: "Set equal: 40 + 0.15m = 25 + 0.20m → 15 = 0.05m → m = 300 miles.",
  },
  {
    id: "m004", section: "math", topic: "linear", difficulty: "hard",
    question: "A venue sells adult tickets for $12 and student tickets for $7. A total of 80 tickets were sold for $735. How many student tickets were sold?",
    options: ["31", "35", "41", "45"],
    answer: 3,
    explanation: "Let s = student tickets, a = 80 − s. Then 12(80 − s) + 7s = 735 → 960 − 5s = 735 → s = 45.",
  },

  // ===== MATH: SYSTEMS OF EQUATIONS =====
  {
    id: "m005", section: "math", topic: "systems", difficulty: "easy",
    question: "If 3x + y = 11 and x − y = 1, what is the value of x?",
    options: ["1", "2", "3", "4"],
    answer: 2,
    explanation: "Add the equations: 4x = 12, so x = 3.",
  },
  {
    id: "m006", section: "math", topic: "systems", difficulty: "medium",
    question: "At a bakery, 2 muffins and 3 cookies cost $8.50. Four muffins and 1 cookie cost $9.50. What does one cookie cost?",
    options: ["$1.00", "$1.50", "$2.00", "$2.50"],
    answer: 1,
    explanation: "Multiply equation 1 by 2: 4m + 6c = 17. Subtract equation 2: 5c = 7.50 → c = $1.50.",
  },
  {
    id: "m007", section: "math", topic: "systems", difficulty: "medium",
    question: "Marcus is 3 times as old as his sister. In 4 years, Marcus will be twice as old as his sister. How old is Marcus now?",
    options: ["4", "8", "12", "16"],
    answer: 2,
    explanation: "Let s = sister's age, Marcus = 3s. In 4 years: 3s + 4 = 2(s + 4) → s = 4. Marcus = 3(4) = 12.",
  },
  {
    id: "m008", section: "math", topic: "systems", difficulty: "medium",
    question: "Two numbers have a sum of 45 and a difference of 13. What is the larger number?",
    options: ["13", "16", "22", "29"],
    answer: 3,
    explanation: "x + y = 45 and x − y = 13. Add: 2x = 58 → x = 29.",
  },

  // ===== MATH: QUADRATICS =====
  {
    id: "m009", section: "math", topic: "quadratics", difficulty: "easy",
    question: "What are the solutions to x² − 5x + 6 = 0?",
    options: ["x = 1 and x = 6", "x = 2 and x = 3", "x = −2 and x = −3", "x = −1 and x = 6"],
    answer: 1,
    explanation: "Factor: (x − 2)(x − 3) = 0, so x = 2 or x = 3.",
  },
  {
    id: "m010", section: "math", topic: "quadratics", difficulty: "hard",
    question: "A ball is launched upward. Its height h (in feet) at time t seconds is h = −16t² + 48t + 5. What is the maximum height the ball reaches?",
    options: ["32 ft", "37 ft", "41 ft", "53 ft"],
    answer: 2,
    explanation: "Vertex at t = 48/(2×16) = 1.5 s. h(1.5) = −16(2.25) + 48(1.5) + 5 = −36 + 72 + 5 = 41 ft.",
  },
  {
    id: "m011", section: "math", topic: "quadratics", difficulty: "medium",
    question: "The product of two consecutive positive integers is 56. What is the greater integer?",
    options: ["6", "8", "9", "14"],
    answer: 1,
    explanation: "n(n + 1) = 56 → n² + n − 56 = 0 → (n − 7)(n + 8) = 0 → n = 7. Greater integer = 8.",
  },
  {
    id: "m012", section: "math", topic: "quadratics", difficulty: "medium",
    question: "Which of the following is a factor of x² + 6x + 5?",
    options: ["x + 2", "x + 3", "x + 5", "x − 1"],
    answer: 2,
    explanation: "Factor: x² + 6x + 5 = (x + 1)(x + 5). So (x + 5) is a factor.",
  },

  // ===== MATH: FUNCTIONS =====
  {
    id: "m013", section: "math", topic: "functions", difficulty: "easy",
    question: "If f(x) = 3x² − 2x + 1, what is f(−2)?",
    options: ["7", "9", "17", "21"],
    answer: 2,
    explanation: "f(−2) = 3(4) − 2(−2) + 1 = 12 + 4 + 1 = 17.",
  },
  {
    id: "m014", section: "math", topic: "functions", difficulty: "medium",
    question: "The function g is defined by g(x) = 2x + k, where k is a constant. If g(3) = 11, what is g(−1)?",
    options: ["−3", "1", "3", "7"],
    answer: 2,
    explanation: "g(3) = 6 + k = 11 → k = 5. g(−1) = −2 + 5 = 3.",
  },
  {
    id: "m015", section: "math", topic: "functions", difficulty: "medium",
    question: "If f(x) = x² and g(x) = 3x − 2, what is f(g(2))?",
    options: ["4", "8", "16", "36"],
    answer: 2,
    explanation: "g(2) = 6 − 2 = 4. f(4) = 4² = 16.",
  },
  {
    id: "m016", section: "math", topic: "functions", difficulty: "easy",
    question: "For what value of x is the function h(x) = x / (x − 3) undefined?",
    options: ["x = 0", "x = 3", "x = −3", "h(x) is defined for all x"],
    answer: 1,
    explanation: "h(x) is undefined when the denominator equals zero: x − 3 = 0 → x = 3.",
  },

  // ===== MATH: GEOMETRY =====
  {
    id: "m017", section: "math", topic: "geometry", difficulty: "easy",
    question: "In a right triangle, one leg has length 5 and the hypotenuse has length 13. What is the length of the other leg?",
    options: ["8", "10", "11", "12"],
    answer: 3,
    explanation: "By the Pythagorean theorem: 5² + b² = 13² → 25 + b² = 169 → b² = 144 → b = 12.",
  },
  {
    id: "m018", section: "math", topic: "geometry", difficulty: "medium",
    question: "A circle has a circumference of 20π. What is its area?",
    options: ["10π", "40π", "100π", "400π"],
    answer: 2,
    explanation: "C = 2πr = 20π → r = 10. Area = πr² = π(100) = 100π.",
  },
  {
    id: "m019", section: "math", topic: "geometry", difficulty: "medium",
    question: "Two parallel lines are cut by a transversal. One co-interior (same-side interior) angle measures 65°. What is the measure of the other co-interior angle?",
    options: ["65°", "115°", "125°", "180°"],
    answer: 1,
    explanation: "Co-interior angles are supplementary (add to 180°): 180° − 65° = 115°.",
  },
  {
    id: "m020", section: "math", topic: "geometry", difficulty: "medium",
    question: "In right triangle ABC (right angle at C), sin(A) = 3/5. What is cos(A)?",
    options: ["3/4", "4/5", "5/3", "5/4"],
    answer: 1,
    explanation: "If sin(A) = 3/5, then opposite = 3, hypotenuse = 5, so adjacent = √(25 − 9) = 4. cos(A) = 4/5.",
  },
  {
    id: "m021", section: "math", topic: "geometry", difficulty: "medium",
    question: "What is the distance between points (1, 4) and (5, 1)?",
    options: ["3", "4", "5", "7"],
    answer: 2,
    explanation: "d = √((5−1)² + (1−4)²) = √(16 + 9) = √25 = 5.",
  },
  {
    id: "m030", section: "math", topic: "geometry", difficulty: "easy",
    question: "A square has a perimeter of 24. What is its area?",
    options: ["6", "24", "36", "144"],
    answer: 2,
    explanation: "Perimeter = 4s = 24 → s = 6. Area = s² = 36.",
  },

  // ===== MATH: STATISTICS =====
  {
    id: "m022", section: "math", topic: "statistics", difficulty: "medium",
    question: "The mean of five numbers is 14. Four of the numbers are 8, 12, 18, and 20. What is the fifth number?",
    options: ["8", "12", "14", "16"],
    answer: 1,
    explanation: "Total sum = 5 × 14 = 70. Known sum = 8 + 12 + 18 + 20 = 58. Fifth number = 70 − 58 = 12.",
  },
  {
    id: "m023", section: "math", topic: "statistics", difficulty: "easy",
    question: "A bag contains 4 red, 3 blue, and 5 green marbles. If one marble is drawn at random, what is the probability it is NOT red?",
    options: ["1/3", "2/3", "3/4", "5/12"],
    answer: 1,
    explanation: "Not red = 3 + 5 = 8 marbles out of 12 total. Probability = 8/12 = 2/3.",
  },
  {
    id: "m024", section: "math", topic: "statistics", difficulty: "hard",
    question: "A population of bacteria triples every 3 hours. If there are 200 bacteria initially, how many will there be after 9 hours?",
    options: ["600", "1,800", "5,400", "16,200"],
    answer: 2,
    explanation: "After 3h: 600. After 6h: 1,800. After 9h: 5,400. (200 × 3³ = 200 × 27 = 5,400).",
  },
  {
    id: "m025", section: "math", topic: "statistics", difficulty: "medium",
    question: "A line of best fit predicts a student's score as 80. The student's actual score was 72. What is the residual for this student?",
    options: ["−8", "8", "−72", "152"],
    answer: 0,
    explanation: "Residual = actual − predicted = 72 − 80 = −8. A negative residual means the actual value is below the prediction.",
  },

  // ===== MATH: RATIOS & PERCENTAGES =====
  {
    id: "m026", section: "math", topic: "ratios", difficulty: "medium",
    question: "A jacket is discounted 20%, then discounted an additional 15% off the sale price. What is the total percent decrease from the original price?",
    options: ["32%", "35%", "30%", "28%"],
    answer: 0,
    explanation: "After 20% off: 80% remains. After 15% off that: 80% × 85% = 68%. Total decrease = 100% − 68% = 32%.",
  },
  {
    id: "m027", section: "math", topic: "ratios", difficulty: "medium",
    question: "If 40% of x equals 60% of 20, what is x?",
    options: ["12", "20", "30", "40"],
    answer: 2,
    explanation: "0.40x = 0.60 × 20 = 12 → x = 12 / 0.40 = 30.",
  },
  {
    id: "m028", section: "math", topic: "ratios", difficulty: "hard",
    question: "Two similar triangles have corresponding sides in the ratio 2:5. If the smaller triangle has area 8 cm², what is the area of the larger triangle?",
    options: ["20 cm²", "40 cm²", "50 cm²", "64 cm²"],
    answer: 2,
    explanation: "Area ratio = (side ratio)² = (2/5)² = 4/25. Larger area = 8 × (25/4) = 50 cm².",
  },
  {
    id: "m029", section: "math", topic: "ratios", difficulty: "hard",
    question: "The ratio of A to B is 3:4, and the ratio of B to C is 2:3. What is the ratio of A to C?",
    options: ["1:3", "1:2", "3:8", "2:3"],
    answer: 1,
    explanation: "A:B = 3:4, B:C = 2:3. Scale to common B: A:B = 3:4, B:C = 4:6. So A:B:C = 3:4:6. A:C = 3:6 = 1:2.",
  },

  // ===== ENGLISH: GRAMMAR =====
  {
    id: "e001", section: "english", topic: "grammar", difficulty: "medium",
    question: "The jury, along with its alternates, _____ scheduled to deliberate this week.",
    options: ["is", "are", "have been", "were"],
    answer: 0,
    explanation: "The subject is 'jury' (singular). 'Along with its alternates' is a parenthetical phrase that doesn't change the subject's number. Use singular 'is.'",
  },
  {
    id: "e002", section: "english", topic: "grammar", difficulty: "medium",
    question: "Which sentence contains a comma splice?",
    options: [
      "The deadline passed; the report was never submitted.",
      "The deadline passed, the report was never submitted.",
      "The deadline passed, but the report was never submitted.",
      "The deadline passed. The report was never submitted.",
    ],
    answer: 1,
    explanation: "Option B joins two independent clauses with only a comma — this is a comma splice. Options A (semicolon), C (comma + coordinating conjunction), and D (period) are all correct.",
  },
  {
    id: "e003", section: "english", topic: "grammar", difficulty: "easy",
    question: "The professor expects students to complete readings, write essays, and _____ class discussions.",
    options: ["participating in", "to participate in", "participate in", "will participate in"],
    answer: 2,
    explanation: "The list uses base verb form: 'complete, write, participate.' Parallel structure requires 'participate in' to match the other verbs.",
  },
  {
    id: "e004", section: "english", topic: "grammar", difficulty: "medium",
    question: "By the time the guests arrived, the hosts _____ all the food.",
    options: ["prepared", "prepare", "have prepared", "had prepared"],
    answer: 3,
    explanation: "Past perfect ('had prepared') is used for an action completed before another past action ('arrived').",
  },
  {
    id: "e005", section: "english", topic: "grammar", difficulty: "medium",
    question: "Which sentence CORRECTLY places the modifier?",
    options: [
      "Running down the street, the wallet was found by Maria.",
      "Running down the street, Maria found the wallet.",
      "The wallet was found by Maria, running down the street.",
      "Running, the wallet was discovered by Maria on the street.",
    ],
    answer: 1,
    explanation: "The participial phrase 'Running down the street' must immediately precede the noun it modifies — Maria was running, not the wallet. Option B is correct.",
  },
  {
    id: "e006", section: "english", topic: "grammar", difficulty: "easy",
    question: "Which version correctly shows possession?",
    options: [
      "The childrens' books were scattered on the floor.",
      "The children's books were scattered on the floor.",
      "The childrens books were scattered on the floor.",
      "The children's book's were scattered on the floor.",
    ],
    answer: 1,
    explanation: "'Children' is already an irregular plural (not 'childrens'). To form its possessive, add 's: 'children's.'",
  },
  {
    id: "e007", section: "english", topic: "grammar", difficulty: "easy",
    question: "Which version is MOST concise without losing meaning?",
    options: [
      "Due to the fact that it was raining, the game was cancelled.",
      "Because it was raining, the game was cancelled.",
      "The game was cancelled owing to the precipitation that occurred.",
      "It was raining and for this reason the game got cancelled.",
    ],
    answer: 1,
    explanation: "'Because' is far more concise than 'Due to the fact that' while conveying the same causal meaning. SAT Writing consistently rewards concision.",
  },

  // ===== ENGLISH: TRANSITIONS =====
  {
    id: "e008", section: "english", topic: "transitions", difficulty: "easy",
    question: "Cats are generally independent animals. _____, they often form strong bonds with their owners.",
    options: ["As a result", "Furthermore", "For example", "However"],
    answer: 3,
    explanation: "The second sentence presents a contrast (independence vs. bonding). 'However' signals a contrast or concession.",
  },
  {
    id: "e009", section: "english", topic: "transitions", difficulty: "easy",
    question: "The study found that regular exercise improves memory. _____, participants who exercised also reported significantly better sleep quality.",
    options: ["Nevertheless", "Moreover", "However", "In other words"],
    answer: 1,
    explanation: "The second sentence adds another benefit of exercise. 'Moreover' introduces an additional point that reinforces the first claim.",
  },
  {
    id: "e010", section: "english", topic: "transitions", difficulty: "medium",
    question: "The proposed bridge design is innovative. _____, engineers worry it may be too costly to build.",
    options: ["Similarly", "Therefore", "That said", "In addition"],
    answer: 2,
    explanation: "'That said' acknowledges the prior point (innovation) while introducing a counterargument (cost) — a concessive transition.",
  },
  {
    id: "e011", section: "english", topic: "transitions", difficulty: "easy",
    question: "The river flooded its banks after three days of heavy rain. _____, hundreds of residents were forced to evacuate.",
    options: ["In contrast", "Conversely", "As a result", "Regardless"],
    answer: 2,
    explanation: "The flooding caused the evacuation. 'As a result' signals a cause-and-effect relationship.",
  },
  {
    id: "e012", section: "english", topic: "transitions", difficulty: "easy",
    question: "Many scientific breakthroughs arose from unintended experiments. _____, penicillin was discovered when mold accidentally contaminated a petri dish.",
    options: ["However", "Instead", "For instance", "Therefore"],
    answer: 2,
    explanation: "Penicillin is a specific example of the general claim about unintended discoveries. 'For instance' introduces an illustrative example.",
  },

  // ===== ENGLISH: VOCABULARY IN CONTEXT =====
  {
    id: "e013", section: "english", topic: "vocabulary", difficulty: "easy",
    question: "The politician's speech was deliberately opaque, making it difficult for the audience to understand her true position. As used in context, 'opaque' most nearly means:",
    options: ["transparent", "unclear", "powerful", "lengthy"],
    answer: 1,
    explanation: "The context clue 'making it difficult to understand' signals that 'opaque' means unclear or obscure.",
  },
  {
    id: "e014", section: "english", topic: "vocabulary", difficulty: "easy",
    question: "The scientist's tenacious pursuit of the answer led her to run more than 400 experiments before finding a solution. As used in context, 'tenacious' most nearly means:",
    options: ["casual", "brief", "persistent", "collaborative"],
    answer: 2,
    explanation: "Running 400+ experiments suggests unwavering determination. 'Tenacious' means stubbornly persistent.",
  },
  {
    id: "e015", section: "english", topic: "vocabulary", difficulty: "medium",
    question: "The critic called the novel derivative, arguing it offered nothing original to the genre. As used in context, 'derivative' most nearly means:",
    options: ["innovative", "mathematical", "unoriginal", "complex"],
    answer: 2,
    explanation: "'Nothing original' in the same sentence clarifies that 'derivative' here means lacking originality — borrowed from or based on others' work.",
  },
  {
    id: "e016", section: "english", topic: "vocabulary", difficulty: "easy",
    question: "Her candid assessment of the team's weaknesses surprised those who expected more diplomatic feedback. As used in context, 'candid' most nearly means:",
    options: ["harsh", "photographed", "lengthy", "honest"],
    answer: 3,
    explanation: "Contrasted with 'diplomatic,' 'candid' implies straightforward, unfiltered honesty.",
  },
  {
    id: "e017", section: "english", topic: "vocabulary", difficulty: "medium",
    question: "The architect's plan was considered audacious by those who said it was impossibly ambitious. As used in context, 'audacious' most nearly means:",
    options: ["modest", "bold", "flawed", "careful"],
    answer: 1,
    explanation: "'Impossibly ambitious' signals extreme daring. 'Audacious' means boldly daring or fearlessly ambitious.",
  },

  // ===== ENGLISH: READING COMPREHENSION (Passage 1) =====
  {
    id: "e018", section: "english", topic: "reading", difficulty: "medium",
    passage: "Urban heat islands occur when cities are significantly warmer than surrounding rural areas. Dark surfaces such as asphalt and concrete absorb more solar radiation than vegetation, releasing this heat in the evenings. Cities can be 2–5°C warmer than nearby areas, with the effect most pronounced during summer nights. Urban planners increasingly advocate for green infrastructure—parks, green roofs, and tree-lined streets—as a cost-effective strategy to reduce these temperature differences.",
    question: "What is the primary purpose of this passage?",
    options: [
      "To argue that rural areas are more comfortable than cities",
      "To explain urban heat islands and describe a potential solution",
      "To warn readers about the dangers of asphalt surfaces",
      "To describe how solar radiation damages city infrastructure",
    ],
    answer: 1,
    explanation: "The passage defines urban heat islands (cause/effect) and then proposes green infrastructure as a solution. Option B is the most accurate summary of the passage's full scope.",
  },
  {
    id: "e019", section: "english", topic: "reading", difficulty: "easy",
    passage: "Urban heat islands occur when cities are significantly warmer than surrounding rural areas. Dark surfaces such as asphalt and concrete absorb more solar radiation than vegetation, releasing this heat in the evenings. Cities can be 2–5°C warmer than nearby areas, with the effect most pronounced during summer nights. Urban planners increasingly advocate for green infrastructure—parks, green roofs, and tree-lined streets—as a cost-effective strategy to reduce these temperature differences.",
    question: "According to the passage, when is the urban heat island effect most pronounced?",
    options: ["Winter daytime hours", "Spring evenings", "Summer nights", "Rainy weather"],
    answer: 2,
    explanation: "The passage states the effect is 'most pronounced during summer nights.'",
  },
  {
    id: "e020", section: "english", topic: "reading", difficulty: "medium",
    passage: "Urban heat islands occur when cities are significantly warmer than surrounding rural areas. Dark surfaces such as asphalt and concrete absorb more solar radiation than vegetation, releasing this heat in the evenings. Cities can be 2–5°C warmer than nearby areas, with the effect most pronounced during summer nights. Urban planners increasingly advocate for green infrastructure—parks, green roofs, and tree-lined streets—as a cost-effective strategy to reduce these temperature differences.",
    question: "Based on the passage, which action would most likely REDUCE the urban heat island effect?",
    options: [
      "Paving more pedestrian areas with dark asphalt",
      "Replacing a vacant lot with a community garden",
      "Widening highways to reduce traffic congestion",
      "Installing dark-colored roofing tiles on buildings",
    ],
    answer: 1,
    explanation: "The passage says green infrastructure (parks, trees) reduces the effect. A community garden adds vegetation, lowering heat absorption. Options A and D increase dark surfaces.",
  },

  // ===== ENGLISH: READING COMPREHENSION (Passage 2) =====
  {
    id: "e021", section: "english", topic: "reading", difficulty: "medium",
    passage: "When Mount Vesuvius erupted in 79 AD, it buried the ancient city of Pompeii under volcanic ash and pumice. For nearly 1,700 years, the city lay hidden beneath the surface. When excavations began in the 18th century, archaeologists found remarkably preserved buildings, artwork, and even food. These discoveries have given historians extraordinary insight into daily Roman life—from graffiti scratched on walls to loaves of carbonized bread still sitting in bakeries.",
    question: "How is this passage primarily organized?",
    options: [
      "Comparison between Pompeii and other Roman cities",
      "Chronological account of events followed by their significance",
      "A series of arguments supporting archaeological funding",
      "Problem and solution structure",
    ],
    answer: 1,
    explanation: "The passage moves through time (eruption → burial → excavation) and then explains the significance of the findings — a chronological structure followed by discussion of impact.",
  },
  {
    id: "e022", section: "english", topic: "reading", difficulty: "easy",
    passage: "When Mount Vesuvius erupted in 79 AD, it buried the ancient city of Pompeii under volcanic ash and pumice. For nearly 1,700 years, the city lay hidden beneath the surface. When excavations began in the 18th century, archaeologists found remarkably preserved buildings, artwork, and even food. These discoveries have given historians extraordinary insight into daily Roman life—from graffiti scratched on walls to loaves of carbonized bread still sitting in bakeries.",
    question: "Which detail from the passage BEST supports the claim that Pompeii provides insight into everyday Roman life?",
    options: [
      "The eruption occurred in 79 AD",
      "Excavations began in the 18th century",
      "Graffiti on walls and bread in bakeries were preserved",
      "Mount Vesuvius buried the city under ash and pumice",
    ],
    answer: 2,
    explanation: "Graffiti and bread in bakeries are examples of ordinary daily objects. They directly support the claim about insight into everyday life. The other options are historical facts that don't illustrate daily life specifically.",
  },
  {
    id: "e023", section: "english", topic: "reading", difficulty: "medium",
    passage: "When Mount Vesuvius erupted in 79 AD, it buried the ancient city of Pompeii under volcanic ash and pumice. For nearly 1,700 years, the city lay hidden beneath the surface. When excavations began in the 18th century, archaeologists found remarkably preserved buildings, artwork, and even food. These discoveries have given historians extraordinary insight into daily Roman life—from graffiti scratched on walls to loaves of carbonized bread still sitting in bakeries.",
    question: "Based on the passage, what can be inferred about Pompeii's preserved items?",
    options: [
      "Most artifacts were damaged beyond recognition",
      "Only stone structures survived the eruption",
      "Volcanic ash encased the city rapidly, preserving ordinary objects in unusual detail",
      "Excavations destroyed most of the original site",
    ],
    answer: 2,
    explanation: "The passage describes bread, artwork, and graffiti as 'remarkably preserved,' implying the rapid burial in ash protected items that would normally decay.",
  },

  // ===== ENGLISH: RHETORICAL SYNTHESIS =====
  {
    id: "e024", section: "english", topic: "synthesis", difficulty: "hard",
    passage: "Source 1: Students who sleep 8 or more hours per night perform significantly better on cognitive tests.\nSource 2: Schools that start at 8:30 AM or later report higher attendance rates and improved academic performance.",
    question: "Which statement best uses BOTH sources to argue that school start times affect student learning?",
    options: [
      "Sleep is important for students, and many students do not get enough of it.",
      "Later school start times allow students to get more sleep, which research links to better cognitive performance and attendance.",
      "Many schools begin before 8 AM, which is inconvenient for working families.",
      "Students who sleep more tend to perform better on cognitive tests.",
    ],
    answer: 1,
    explanation: "Option B integrates both sources: later start times (Source 2) allow more sleep, which improves cognitive performance (Source 1). It's the only answer that draws on both sources to support the specific claim.",
  },
  {
    id: "e025", section: "english", topic: "synthesis", difficulty: "hard",
    passage: "Source 1: Taking handwritten notes engages different neural pathways than typing, activating areas linked to memory and comprehension.\nSource 2: Students who write notes by hand tend to paraphrase information rather than transcribe it verbatim, leading to deeper processing.",
    question: "Which statement best synthesizes BOTH sources to argue that handwriting improves learning?",
    options: [
      "Typing is more efficient than handwriting for most students.",
      "Handwriting activates memory-linked neural pathways and encourages paraphrasing, both of which support deeper learning.",
      "Students should always write by hand instead of using computers.",
      "Neural pathways are engaged during all forms of note-taking.",
    ],
    answer: 1,
    explanation: "Option B integrates the neural benefit (Source 1) and the paraphrasing effect (Source 2) into a unified argument about handwriting improving learning.",
  },
  {
    id: "e026", section: "english", topic: "synthesis", difficulty: "medium",
    passage: "In a study of 500 students, 65% of those who used flashcards scored above 600 on SAT Math, compared to 40% of students who did not use flashcards.",
    question: "Which conclusion is BEST supported by this data?",
    options: [
      "Flashcards cause students to score above 600 on the SAT.",
      "Students who used flashcards were more likely to score above 600 than those who did not.",
      "All students should use flashcards to prepare for the SAT.",
      "SAT Math performance is entirely determined by study tools used.",
    ],
    answer: 1,
    explanation: "The data shows correlation (more flashcard users scored above 600), not causation. Option B accurately reflects what the data shows without overstating it.",
  },
];

export function getQuestions(section?: "math" | "english", topic?: string): Question[] {
  return QUESTIONS.filter(
    (q) =>
      (!section || q.section === section) &&
      (!topic || q.topic === topic)
  );
}

export function shuffled(arr: Question[]): Question[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function pickRandom(section?: "math" | "english", topic?: string, count = 1): Question[] {
  const pool = shuffled(getQuestions(section, topic));
  return pool.slice(0, Math.min(count, pool.length));
}
