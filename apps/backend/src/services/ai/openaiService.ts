import OpenAI from 'openai';
import { env } from '../../config/env';
import fetch from 'node-fetch';
import type { AssessmentPaper, Difficulty } from '@vedaai/shared-types';
import type { IAssignment } from '../../models/Assignment';
import { buildSystemPrompt, buildUserPrompt, buildFixPrompt } from './promptBuilder';
import { parseAndValidateAssessment } from './parseResponse';
import { extractTextFromFile } from '../fileService';
import { createLogger } from '@vedaai/utils';

const logger = createLogger('openai');

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

function isValidOpenAIKey(key?: string) {
  if (!key) return false;
  if (key.includes('your') || key.includes('REPLACE') || key === 'sk-your-key') return false;
  return key.startsWith('sk-') && key.length > 30;
}

export interface GenerationResult {
  paper: AssessmentPaper;
  metadata: {
    model: string;
    durationMs: number;
    difficultyBreakdown: Record<Difficulty, number>;
  };
}

export async function generateAssessmentPaper(
  assignment: IAssignment,
): Promise<GenerationResult> {
  const start = Date.now();
  const sourceText = await extractTextFromFile(
    assignment.uploadedFile,
    assignment.sourceText,
  );

  const hasGemini = env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '' && !env.GEMINI_API_KEY.includes('your');

  // If no valid OpenAI key, Hugging Face key, or Gemini key, generate a mock paper for development
  if (!isValidOpenAIKey(env.OPENAI_API_KEY) && !env.HUGGINGFACE_API_KEY && !hasGemini) {
    logger.warn('No OpenAI, Hugging Face, or Gemini key configured — returning mock paper for development');
    const mock = generateMockPaper(assignment);
    return buildResult(mock, start, 'mock-generator');
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(assignment, sourceText);

  const first = await callAI(systemPrompt, userPrompt);
  let raw = first.content;

  try {
    const paper = parseAndValidateAssessment(raw);
    return buildResult(paper, start, first.model);
  } catch (firstError) {
    logger.warn('First parse failed, retrying with fix prompt', {
      assignmentId: assignment._id.toString(),
      error: String(firstError),
    });

    const retry = await callAI(
      systemPrompt,
      buildFixPrompt(raw),
    );

    raw = retry.content;

    const paper = parseAndValidateAssessment(raw);
    return buildResult(paper, start, retry.model);
  }
}

async function callGemini(system: string, user: string): Promise<{ content: string; provider: string; model: string }> {
  const geminiKey = env.GEMINI_API_KEY;
  const model = env.GEMINI_MODEL || 'gemini-1.5-flash';
  if (!geminiKey) throw new Error('Gemini API key not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: user }],
        },
      ],
      systemInstruction: {
        parts: [{ text: system }],
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Gemini API request failed', { status: response.status, body: errorText });
    throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
  }

  const data: any = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    logger.error('Empty response or invalid schema from Gemini', { data });
    throw new Error('Empty response from Gemini API');
  }

  return { content: text, provider: 'gemini', model };
}

async function callOpenAI(system: string, user: string): Promise<{ content: string; provider: string; model: string }> {
  try {
    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    return { content: String(content), provider: 'openai', model: env.OPENAI_MODEL };
  } catch (err: any) {
    logger.error('OpenAI request failed', { message: err?.message, status: err?.status ?? err?.response?.status });
    const status = err?.status ?? err?.response?.status;
    const error = new Error('OpenAI request failed');
    // attach status for caller
    (error as any).status = status;
    throw error;
  }
}

async function callHuggingFace(system: string, user: string): Promise<{ content: string; provider: string; model: string }> {
  const hfKey = env.HUGGINGFACE_API_KEY;
  const model = env.HUGGINGFACE_MODEL || 'gpt2';
  if (!hfKey) throw new Error('Hugging Face API key not configured');

  // For HF we combine system+user into a single prompt
  const prompt = `${system}\n\n${user}`;

  const url = `https://api-inference.huggingface.co/models/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 512, temperature: 0.7 } }),
  });

  if (!res.ok) {
    const txt = await res.text();
    logger.error('HuggingFace request failed', { status: res.status, body: txt });
    throw new Error(`HuggingFace request failed with status ${res.status}`);
  }

  const data = await res.json();
  // HF response for text-generation is usually an array with generated_text
  let content = '';
  if (Array.isArray(data) && data[0]?.generated_text) content = String(data[0].generated_text);
  else if (typeof data === 'string') content = data;
  else content = JSON.stringify(data);
  return { content, provider: 'huggingface', model };
}

async function callAI(system: string, user: string): Promise<{ content: string; provider: string; model: string }> {
  const hasGemini = env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '' && !env.GEMINI_API_KEY.includes('your');
  const hasOpenAI = isValidOpenAIKey(env.OPENAI_API_KEY);
  const hasHuggingFace = !!env.HUGGINGFACE_API_KEY;

  let lastError: Error | null = null;

  // Prioritize Gemini if key exists
  if (hasGemini) {
    try {
      logger.info('Attempting generation using Gemini API');
      return await callGemini(system, user);
    } catch (geminiErr: any) {
      lastError = geminiErr;
      logger.error('Gemini request failed, trying fallbacks if available', { message: geminiErr?.message });
      // If Gemini is the only provider configured, fail fast with the real error
      if (!hasOpenAI && !hasHuggingFace) {
        throw new Error(`Gemini API failed: ${geminiErr?.message ?? 'Unknown error'}`);
      }
    }
  }

  // Fallback to OpenAI if key valid
  if (hasOpenAI) {
    try {
      return await callOpenAI(system, user);
    } catch (err: any) {
      lastError = err;
      const status = err?.status;
      if (status === 401 && hasHuggingFace) {
        logger.info('Falling back to Hugging Face for generation');
        return await callHuggingFace(system, user);
      }
      if (!hasHuggingFace) throw err;
    }
  }

  // Fallback to Hugging Face
  if (hasHuggingFace) {
    logger.info('Falling back to Hugging Face for generation');
    return await callHuggingFace(system, user);
  }

  throw lastError ?? new Error('No valid AI key configured or all requests failed');
}

function buildResult(paper: AssessmentPaper, start: number, modelName?: string): GenerationResult {
  const breakdown: Record<Difficulty, number> = {
    easy: 0,
    moderate: 0,
    hard: 0,
  };

  for (const section of paper.sections) {
    for (const q of section.questions) {
      breakdown[q.difficulty]++;
    }
  }

  return {
    paper,
    metadata: {
      model: modelName ?? env.OPENAI_MODEL,
      durationMs: Date.now() - start,
      difficultyBreakdown: breakdown,
    },
  };
}

function generateMockPaper(assignment: IAssignment): AssessmentPaper {
  const title = assignment.title || 'Generated Assessment';
  const questionCount = Number(assignment.questionCount) || 10;
  const marksMap = assignment.marksDistribution || { mcq: 1, short_answer: 2, long_answer: 5 };
  const types = assignment.questionTypes && assignment.questionTypes.length > 0 ? assignment.questionTypes : ['mcq', 'short_answer', 'long_answer'];

  const sections = [
    {
      title: 'Section A',
      instruction: 'Answer the following questions',
      questions: Array.from({ length: questionCount }).map((_, i) => {
        const t = types[i % types.length] as string;
        const marks = (marksMap as any)[t] ?? 1;
        if (t === 'mcq') {
          return {
            question: `Sample MCQ question ${i + 1}: What is ${i + 1}?`,
            type: 'mcq',
            difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'moderate' : 'hard',
            marks,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
          } as any;
        }
        if (t === 'short_answer') {
          return {
            question: `Sample short answer question ${i + 1}: Explain ${i + 1}.`,
            type: 'short_answer',
            difficulty: 'moderate',
            marks,
          } as any;
        }
        if (t === 'long_answer') {
          return {
            question: `Sample long answer question ${i + 1}: Discuss ${i + 1} in detail.`,
            type: 'long_answer',
            difficulty: 'hard',
            marks,
          } as any;
        }
        if (t === 'fill_blank') {
          return {
            question: `Fill in the blank: ${i + 1} ____.`,
            type: 'fill_blank',
            difficulty: 'easy',
            marks,
            blanks: 1,
          } as any;
        }
        return {
          question: `True/False question ${i + 1}: Statement about ${i + 1}.`,
          type: 'true_false',
          difficulty: 'easy',
          marks,
        } as any;
      }),
    },
  ];

  return { title, sections } as AssessmentPaper;
}
