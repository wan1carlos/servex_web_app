import type { AxiosError } from 'axios';

export interface NormalizedError {
  status?: number;
  message: string;
  data?: any;
}

export const isAxiosError = (error: unknown): error is AxiosError => {
  return !!(error as any)?.isAxiosError || !!(error as any)?.response || !!(error as any)?.config;
};

export const normalizeAxiosError = (error: unknown): NormalizedError => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.message || 'Request error';
    const data = error.response?.data;
    return { status, message, data };
  }
  const message = typeof (error as any)?.message === 'string' ? (error as any).message : String(error);
  return { message };
};
