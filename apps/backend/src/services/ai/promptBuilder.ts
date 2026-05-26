import type { IAssignment } from '../../models/Assignment';
import { DIFFICULTY_DISTRIBUTION } from '@vedaai/utils';

// ─── System Prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(): string {
  return `You are an expert academic assessment designer with 20+ years of experience creating \
rigorous, pedagogically sound exam papers for schools and universities.

## YOUR TASK
Generate a complete, well-structured exam question paper as a single valid JSON object.

## STRICT OUTPUT RULES
- Output ONLY raw JSON. No markdown fences, no prose, no commentary before or after.
- Every string value must be properly escaped.
- The root object must have exactly two keys: "title" and "sections".

## QUESTION TYPE FIELD CONTRACT
Each question object MUST follow these rules based on its type:
- "mcq"          → include "options": array of exactly 4 distinct answer strings
- "short_answer" → NO "options" field
- "long_answer"  → NO "options" field
- "fill_blank"   → include "blanks": integer (number of blanks in the question text); use ___ to mark blanks
- "true_false"   → NO "options" field; question must be a clear declarative statement

## SECTION STRUCTURE RULES
- Group questions of the same type into the same section where possible.
- Use clear section titles: "Section A", "Section B", "Section C", etc.
- Each section must have a concise "instruction" describing how to attempt it.
  Examples: "Choose the correct option.", "Answer in 2–3 sentences.", "Answer in detail.", "Fill in the blanks.", "State True or False."

## DIFFICULTY DISTRIBUTION (approximate)
- ${Math.round(DIFFICULTY_DISTRIBUTION.easy * 100)}% of questions → "easy"
- ${Math.round(DIFFICULTY_DISTRIBUTION.moderate * 100)}% of questions → "moderate"
- ${Math.round(DIFFICULTY_DISTRIBUTION.hard * 100)}% of questions → "hard"
Spread difficulty within each section where possible.

## MARKS RULES
- Each question's "marks" value must exactly match the marks-per-type specified by the teacher.
- The sum of all question marks across all sections must equal the requested total marks.
- Marks must be a positive integer.

## QUALITY STANDARDS
- Questions must be clear, unambiguous, and age-appropriate for the academic level implied by the title.
- Avoid trivial, repetitive, or trick questions.
- MCQ distractors must be plausible but clearly incorrect.
- Long-answer questions should require analytical or evaluative thinking.`;
}

// ─── User Prompt ─────────────────────────────────────────────────────────────

export function buildUserPrompt(assignment: IAssignment, sourceText: string): string {
  const easy = Math.round(DIFFICULTY_DISTRIBUTION.easy * 100);
  const moderate = Math.round(DIFFICULTY_DISTRIBUTION.moderate * 100);
  const hard = Math.round(DIFFICULTY_DISTRIBUTION.hard * 100);

  // Trim source text to avoid token overflow (keep first ~3000 chars)
  const trimmedSource = sourceText
    ? sourceText.trim().slice(0, 3000) + (sourceText.length > 3000 ? '\n[... content trimmed for brevity ...]' : '')
    : '';

  const marksPerType = assignment.questionTypes
    .map((t) => `  - ${t}: ${(assignment.marksDistribution as Record<string, number>)[t] ?? 0} marks per question`)
    .join('\n');

  const schema = `{
  "title": "string — the exam paper title",
  "sections": [
    {
      "title": "string — e.g. Section A",
      "instruction": "string — brief attempt instruction for this section",
      "questions": [
        {
          "question": "string — the question text",
          "type": "mcq | short_answer | long_answer | fill_blank | true_false",
          "difficulty": "easy | moderate | hard",
          "marks": <positive integer>,

          // Include ONLY for type = "mcq":
          "options": ["string", "string", "string", "string"],

          // Include ONLY for type = "fill_blank":
          "blanks": <positive integer>
        }
      ]
    }
  ]
}`;

  return `## ASSESSMENT REQUIREMENTS

**Paper Title:** ${assignment.title}
**Total Questions:** ${assignment.questionCount}
**Total Marks:** ${assignment.totalMarks}
**Due Date:** ${assignment.dueDate.toISOString().split('T')[0]}

**Question Types to Include:**
${assignment.questionTypes.map((t) => `  - ${t}`).join('\n')}

**Marks Per Question Type:**
${marksPerType}

**Difficulty Distribution:**
  - Easy: ${easy}%  (~${Math.round((easy / 100) * assignment.questionCount)} questions)
  - Moderate: ${moderate}%  (~${Math.round((moderate / 100) * assignment.questionCount)} questions)
  - Hard: ${hard}%  (~${Math.round((hard / 100) * assignment.questionCount)} questions)

**Additional Instructions from Teacher:**
${assignment.additionalInstructions?.trim() || 'None'}

${trimmedSource
  ? `## REFERENCE MATERIAL\nUse the following content as the primary knowledge source for generating questions. \
Questions should directly test understanding of this material.\n\n${trimmedSource}`
  : `## REFERENCE MATERIAL\nNo reference material provided. Generate well-rounded academic questions \
appropriate for the subject implied by the paper title.`}

## OUTPUT SCHEMA
Return a single JSON object matching this schema exactly. No extra fields. No markdown.

${schema}

## SELF-CHECK BEFORE OUTPUTTING
Before finalising your JSON:
1. Count total questions — must equal ${assignment.questionCount}.
2. Sum all marks — must equal ${assignment.totalMarks}.
3. Verify every "mcq" question has exactly 4 "options".
4. Verify no "options" field on non-mcq questions.
5. Verify every "fill_blank" question has a "blanks" integer and uses ___ in the question text.
6. Ensure the JSON is valid and parseable.`;
}

// ─── Retry / Fix Prompt ───────────────────────────────────────────────────────

export function buildFixPrompt(rawJson: string): string {
  return `The JSON you returned could not be parsed or failed schema validation.

## YOUR TASK
Fix the JSON below so it strictly matches the required assessment schema.

## RULES
- Output ONLY the corrected raw JSON object. No markdown, no explanation.
- Do not change the question content — only fix structural/formatting issues.
- Ensure:
  • "mcq" questions have "options": array of exactly 4 strings
  • "fill_blank" questions have "blanks": positive integer
  • No extra fields on any question object
  • All "marks" values are positive integers
  • "difficulty" is one of: easy | moderate | hard
  • "type" is one of: mcq | short_answer | long_answer | fill_blank | true_false

## BROKEN JSON TO FIX
${rawJson}`;
}

