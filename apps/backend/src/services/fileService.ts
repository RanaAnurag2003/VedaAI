import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { MAX_SOURCE_TEXT_LENGTH } from '@vedaai/utils';
import type { IUploadedFile } from '../models/Assignment';

export async function extractTextFromFile(
  file: IUploadedFile | null | undefined,
  storedSourceText?: string,
): Promise<string> {
  if (storedSourceText?.trim()) {
    return truncate(storedSourceText);
  }

  if (!file?.path) {
    return '';
  }

  const buffer = await fs.readFile(file.path);
  let text = '';

  if (file.mimeType === 'application/pdf') {
    const parsed = await pdfParse(buffer);
    text = parsed.text;
  } else if (file.mimeType === 'text/plain') {
    text = buffer.toString('utf-8');
  }

  return truncate(text);
}

function truncate(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_SOURCE_TEXT_LENGTH) {
    return trimmed;
  }
  return trimmed.slice(0, MAX_SOURCE_TEXT_LENGTH);
}
