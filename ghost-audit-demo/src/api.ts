import type { PrivacyScore } from './types';
import type { BreachRecord } from './types';
import { recordsFromApiResults } from './data/mockRecords';
import type { PersistedDashboard } from './types';

const jsonHeaders = { 'Content-Type': 'application/json' };
const cred: RequestInit = { credentials: 'include' };

export interface ApiBreach {
  id: string;
  name: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  dataTypes: string[];
  pwnCount: number;
  verified: boolean;
  description: string;
  severity: 'action' | 'notice';
  monitoringNote: string;
}

export interface TestQuestion {
  id: string;
  prompt: string;
  options: { value: string; label: string }[];
}

export interface IpLookup {
  query?: string;
  ip?: string;
  City?: string;
  Postal?: string;
  RegionName?: string;
  CountryName?: string;
  TimeZone?: string;
  error?: string;
}

export interface SessionState {
  dashboard: PersistedDashboard | null;
  score: PrivacyScore;
}

async function readJson<T>(res: Response, failMessage: string): Promise<T> {
  if (!res.ok) throw new Error(failMessage);
  return res.json() as Promise<T>;
}

export async function fetchSessionState(): Promise<SessionState> {
  const res = await fetch('/api/state', cred);
  return readJson(res, 'Could not load session');
}

export async function saveSessionState(dashboard: PersistedDashboard): Promise<{ score: PrivacyScore }> {
  const res = await fetch('/api/state', {
    ...cred,
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ dashboard }),
  });
  return readJson(res, 'Could not save session');
}

export async function fetchBreaches(email: string): Promise<BreachRecord[]> {
  const res = await fetch(`/api/breaches?email=${encodeURIComponent(email)}`, cred);
  const data = await readJson<{ results: ApiBreach[] }>(res, 'Scan failed');
  return recordsFromApiResults(data.results);
}

export async function fetchPrivacyScore(): Promise<PrivacyScore> {
  const res = await fetch('/api/score', cred);
  return readJson(res, 'Score failed');
}

export async function fetchTestQuestions(): Promise<TestQuestion[]> {
  const res = await fetch('/api/test', cred);
  const data = await readJson<{ questions: TestQuestion[] }>(res, 'Could not load test');
  return data.questions;
}

export async function submitTest(
  answers: string[],
): Promise<{ score: number; total: number; privacyScore?: PrivacyScore }> {
  const res = await fetch('/api/test', {
    ...cred,
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ answers }),
  });
  return readJson(res, 'Could not submit test');
}

export async function fetchIpData(): Promise<IpLookup> {
  const res = await fetch('/api/getData', cred);
  return readJson(res, 'Could not load IP data');
}
