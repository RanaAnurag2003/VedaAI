import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { error?: string })?.error ??
      error.message ??
      'Something went wrong'
    );
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
