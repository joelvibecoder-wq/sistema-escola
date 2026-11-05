import { store, ELECTION_ID, LOCATIONS, CANDIDATES, getOrCreateSession, getVoteForSession, json } from '../lib/demo-store.mjs';

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
  try {
    const session = await getOrCreateSession(request);
    const body = await request.json().catch(() => ({}));
    const candidateId = Number(body?.candidateId);
    const city = String(body?.city || '');
    const state = String(body?.state || '');
    if (!CANDIDATES.has(candidateId)) return json({ error: 'Candidato demonstrativo inválido.' }, 400, session.cookie ? { 'Set-Cookie': session.cookie } : {});
    if (!LOCATIONS.has(`${city}|${state}`)) return json({ error: 'Localidade de demonstração inválida.' }, 400, session.cookie ? { 'Set-Cookie': session.cookie } : {});

    const db = store();
    const key = `votes/${ELECTION_ID}/${session.id}`;
    const { modified } = await db.setJSON(key, {
      electionId: ELECTION_ID,
      sessionId: session.id,
      candidateId,
      city,
      state,
      createdAt: new Date().toISOString(),
      simulated: true,
    }, { onlyIfNew: true });

    if (!modified) {
      return json({ error: 'Esta sessão já registrou um voto nesta eleição demonstrativa.' }, 409, session.cookie ? { 'Set-Cookie': session.cookie } : {});
    }
    return json(
      { ok: true, message: 'Voto fictício gravado no armazenamento demonstrativo do Netlify.' },
      201,
      session.cookie ? { 'Set-Cookie': session.cookie } : {},
    );
  } catch (error) {
    console.error('vote function:', error);
    return json({ error: 'Não foi possível registrar o voto de teste.' }, 500);
  }
}
