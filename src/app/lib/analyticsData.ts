// lib/data.ts (or utils/data.ts)
import { promises as fs } from 'fs';
import { TextAnalyticsResponse } from '@/app/types/analyticsResponse';

export async function getTextAnalysisData(): Promise<TextAnalyticsResponse> {
  const fileContent = await fs.readFile('src/app/exampleResponse.json', 'utf8');
  return JSON.parse(fileContent);
}
