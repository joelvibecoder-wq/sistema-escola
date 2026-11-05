import { getOrCreateSession, getVoteForSession, json } from '../lib/demo-store.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Método não permitido.' }, 405);
  try {
    const session = await getOrCreateSession(request);
    const vote = await getVoteForSession(session.id);
    return json(
      { hasVoted: Boolean(vote), mode: 'simulation' },
      200,
      session.cookie ? { 'Set-Cookie': session.cookie } : {},
    );
  } catch (error) {
    console.error('session function:', error);
    return json({ error: 'Não foi possível consultar a sessão demonstrativa.' }, 500);
  }
}
