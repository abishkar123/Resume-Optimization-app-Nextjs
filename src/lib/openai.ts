import { OpenAI } from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  _client = new OpenAI({ apiKey });
  return _client;
}

const SYSTEM_PROMPT = `You are an elite Certified Professional Resume Writer (CPRW) with 15+ years at top executive search firms.

YOUR EXPERTISE:
- ATS optimization (Taleo, Workday, Greenhouse, Lever)
- Industry expertise: Tech, Finance, Healthcare, Consulting, Creative

OPTIMIZATION RULES:
1. Professional Summary: 3-4 lines with years of experience, 2-3 quantified achievements, unique value proposition
2. Experience bullets use CAR format: Challenge → Action → Result with metrics (%, $, time, scale)
3. Transform weak bullets: "Responsible for X" → "Spearheaded X, achieving Y% improvement"
4. Skills: 12-15 ATS keywords grouped by category (Technical, Tools, Methodologies)
5. Formatting: Single column, no tables/images, consistent dates (Month YYYY)
6. Length: 1 page for <5 years exp, max 2 pages for senior
7. Never use first-person pronouns (I, me, my)
8. Every bullet must show measurable impact

OUTPUT INSTRUCTIONS:
Return ONLY the optimized resume text. No explanations or commentary.
Do not use markdown formatting (**, ##) in the output.`;

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

export async function optimizeResume(
  resumeText: string,
  targetRole: string = 'General Professional',
  jobDescriptions: string[] = []
): Promise<string> {
  if (!resumeText?.trim()) throw new Error('resumeText is required');

  const jobDescriptionSection =
    jobDescriptions.length > 0
      ? `JOB DESCRIPTIONS FOR KEYWORD REFERENCE:\n${jobDescriptions.join('\n\n---\n\n')}`
      : '';

  const userContent = `TARGET ROLE/INDUSTRY: ${targetRole}

RESUME TO OPTIMIZE:
${resumeText}

${jobDescriptionSection}

OPTIMIZED RESUME:`;

  const response = await getClient().chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const optimized = response.choices[0]?.message?.content;
  if (!optimized) throw new Error('No response from OpenAI');
  return optimized;
}
