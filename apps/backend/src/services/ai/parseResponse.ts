import { AssessmentPaperSchema, type AssessmentPaper } from '@vedaai/shared-types';
import { createLogger } from '@vedaai/utils';

const logger = createLogger('ai-parse');

export function parseAndValidateAssessment(raw: string): AssessmentPaper {
  let parsed: unknown;

  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    logger.error('JSON parse failed', { error: String(err) });
    throw new Error('Failed to parse AI response as JSON');
  }

  const result = AssessmentPaperSchema.safeParse(parsed);
  if (!result.success) {
    logger.error('Schema validation failed', {
      issues: result.error.flatten(),
    });
    throw new Error('AI response did not match required assessment schema');
  }

  return result.data;
}
