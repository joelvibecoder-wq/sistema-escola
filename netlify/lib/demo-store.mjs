import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';

export const ELECTION_ID = 'ELEITORAL-DIGITAL-DEMO-2026';
export const LOCATIONS = new Set([
  'Ponta Grossa|PR',
  'Curitiba|PR',
  'São Paulo|SP',
  'Florianópolis|SC',
]);
export const CANDIDATES = new Set([1, 2, 3]);
export const store = () => getStore({ name: 'eleitoral-digital-demo-votes', region: 'us-east-2' });

export function readSession(request) {
  const raw = request.headers.get('cookie') || '';
  const pair = raw.split(';').map(v => v.trim()).find(v => v.startsWith('ed_demo_session='));
  if (!pair) return null;
  const value = decodeURIComponent(pair.slice('ed_demo_session='.length));
  return /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}

export function sessionCookie(id) {
  return `ed_demo_session=${encodeURIComponent(id)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`;
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export async function getOrCreateSession(request) {
  const existing = readSession(request);
  const id = existing || randomUUID();
  return { id, cookie: existing ? null : sessionCookie(id) };
}

export async function getVoteForSession(id) {
  return store().get(`votes/${ELECTION_ID}/${id}`, { type: 'json', consistency: 'strong' });
}
