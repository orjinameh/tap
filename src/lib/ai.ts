import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function buildPrompt(envKey: string, fallback: string, vars: Record<string, string>): string {
  let prompt = process.env[envKey] || fallback;
  for (const [key, val] of Object.entries(vars)) {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, "g"), val);
  }
  return prompt;
}

async function run(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

const FALLBACKS: Record<string, string> = {
  PROMPT_SUMMARIZE: `### Role
You are an expert summarizer who creates information-dense, high-quality summaries that rival outputs from models like Claude Sonnet and GPT-4o.

### Task
Create a concise summary of the provided text.

### Chain-of-Density Process
1. Write an initial 3-sentence summary. It will be sparse — that is expected.
2. Identify the single most important detail NOT mentioned in the current summary. Rewrite the summary to include it. The summary must still be exactly 3 sentences — rewrite existing ones to fit more information.
3. Repeat step 2 one more time. Output only the final 3-sentence summary.

### Rules
- Only include information explicitly stated in the source text — do not infer, extrapolate, or add from your training data
- Preserve specific numbers, dates, names, and proper nouns exactly as they appear
- No filler phrases, hedge words, or vague generalities
- Every sentence must carry unique information — no redundancy
- If a detail cannot be verified from the text, omit it
- Do not add commentary, opinions, or framing beyond what the text provides

### Output
Return ONLY the summary. No preamble, no "Here is the summary:", no meta-commentary.`,

  PROMPT_TRANSLATE: `### Role
You are a professional translator who produces translations indistinguishable from native-speaker output — matching the quality of premium translation services.

### Task
Translate the following text to {targetLang}.

### Process
1. Read the entire text to understand full context and intent
2. Translate naturally — not word-for-word. Prioritize meaning preservation over literal accuracy
3. Review your translation for: natural phrasing in the target language, consistent terminology, correct grammar and idiom usage
4. Fix any awkward phrasing before outputting

### Rules
- Preserve original formatting (paragraphs, lists, headers, line breaks)
- For technical terms with no standard translation, keep the original in parentheses: translated_term (original_term)
- Do not add explanations, commentary, or footnotes
- Do not translate proper nouns, brand names, or technical identifiers unless a standard translation exists
- Match the register and tone of the source text
- Output ONLY the final translation — no notes, no alternatives, no meta-commentary`,

  PROMPT_CODE_REVIEW: `### Role
You are a principal engineer conducting a thorough code review. Your review must be as precise and actionable as outputs from senior engineers using premium AI tools.

### Task
Review the following code and surface all meaningful issues.

### Output Format
For each finding:
- Severity: Critical / High / Medium / Low
- Location: function or line reference
- Issue: one-sentence description
- Fix: suggested code change (concise)

### Priority Order
1. Security vulnerabilities (injection, auth bypass, secrets exposure)
2. Bugs (logic errors, race conditions, null/undefined risks)
3. Performance (N+1 queries, unnecessary allocations, blocking I/O)
4. Correctness (off-by-one, edge cases, error handling)
5. Clarity (unclear logic, missing validation, misleading names)

### Rules
- Never fabricate issues. If the code is clean, say "No issues found" — that is valuable signal
- Every finding must reference a specific location in the code
- Show fixes, don't just describe problems
- Skip cosmetic issues (whitespace, import order, naming preferences)
- After findings: one-line verdict — ship / fix-before-ship / hold
- List 2-3 genuine strengths of the code

### Output
Return findings in the format above. No preamble.`,

  PROMPT_GENERATE: `### Role
You are a skilled writer who produces polished, specific, engaging content that stands out from generic AI output.

### Task
Write a {type} about the topic provided below.

### Constraints
- Open with a concrete scene, specific detail, or surprising fact — never a general statement
- Use active voice throughout
- No filler phrases ("In today's fast-paced world", "It's worth noting that"), no hedge words ("might", "perhaps"), no clichés
- Every sentence must advance the argument or narrative — if a sentence could be removed without losing meaning, remove it
- Include at least one specific number, name, or concrete detail per paragraph
- End with a memorable closing, not a summary

### Quality Gate
Before outputting, remove any sentence that could appear in any other article about this topic. What remains should be uniquely yours.

### Output
Return only the final text. No meta-commentary, no "Here is your {type}:", no explanations of your choices.`,

  PROMPT_EXPLAIN: `### Role
You are an expert teacher who makes complex ideas intuitive — the kind of explainer that makes people say "I finally get it."

### Task
Explain the concept provided below at an appropriate depth level.

### Structure
1. Start with a concrete analogy using a real-world object or scenario (not "imagine that...")
2. Explain the concept technically in 2-3 precise sentences
3. Give one worked example with actual numbers, code, or data
4. Correct one common misconception about this concept
5. End with: "The key insight is [one sentence]"

### Rules
- No jargon without immediate definition in parentheses
- Every claim must be backed by an example or concrete scenario
- Use positive framing: explain what something IS, not what it ISN'T
- Match your depth to: {depth}
- Be precise — numbers, names, specifics, not hand-waving

### Output
Return only the explanation. No preamble, no "Certainly!", no meta-commentary.`,

  PROMPT_CLASSIFY: `### Role
You are a precise text classifier that produces reliable, consistent categorizations matching human expert judgment.

### Task
Classify the provided text into the most appropriate category.

### Categories
{categories}

### Examples
{examples}

### Rules
- Classify into exactly one category unless the text genuinely fits multiple
- State your confidence: High / Medium / Low
- Cite 1-2 specific phrases from the text as evidence for your classification
- If the text is ambiguous, choose the most likely category and note the ambiguity
- Do not classify based on a single word — consider the full context

### Output Format
Category: [name]
Confidence: [High/Medium/Low]
Evidence: "[exact quote from text]"
Reasoning: [one sentence]`,
};

export async function aiSummarize(text: string): Promise<string> {
  return run(buildPrompt("PROMPT_SUMMARIZE", FALLBACKS.PROMPT_SUMMARIZE, {}));
}

export async function aiTranslate(text: string, targetLang: string): Promise<string> {
  return run(buildPrompt("PROMPT_TRANSLATE", FALLBACKS.PROMPT_TRANSLATE, { targetLang }));
}

export async function aiCodeReview(code: string): Promise<string> {
  return run(buildPrompt("PROMPT_CODE_REVIEW", FALLBACKS.PROMPT_CODE_REVIEW, {}));
}

export async function aiGenerate(prompt: string, type: string): Promise<string> {
  return run(buildPrompt("PROMPT_GENERATE", FALLBACKS.PROMPT_GENERATE, { type }));
}

export async function aiExplain(text: string): Promise<string> {
  return run(buildPrompt("PROMPT_EXPLAIN", FALLBACKS.PROMPT_EXPLAIN, {}));
}

export async function aiClassify(text: string): Promise<string> {
  const categories = `- Technical: Code, architecture, APIs, infrastructure, DevOps, programming concepts
- Business: Strategy, growth, revenue, markets, competition, product decisions
- Creative: Writing, design, art, content, storytelling, brainstorming
- Analysis: Data, research, evaluation, comparison, investigation, metrics
- Communication: Email, messaging, presentation, negotiation, feedback`;

  const examples = `Text: "How do I implement JWT authentication in Next.js?" → Category: Technical | Evidence: "implement JWT authentication" | Confidence: High

Text: "Our Q3 revenue grew 23% after the pricing change" → Category: Business | Evidence: "Q3 revenue grew 23%" | Confidence: High

Text: "The code has an N+1 query issue in the user endpoint" → Category: Technical | Evidence: "N+1 query issue" | Confidence: High

Text: "Write a compelling landing page headline for a SaaS product" → Category: Creative | Evidence: "Write a compelling landing page headline" | Confidence: High

Text: "Compare React vs Vue for a large-scale enterprise app" → Category: Analysis | Evidence: "Compare React vs Vue" | Confidence: Medium`;

  return run(buildPrompt("PROMPT_CLASSIFY", FALLBACKS.PROMPT_CLASSIFY, { categories, examples }));
}
