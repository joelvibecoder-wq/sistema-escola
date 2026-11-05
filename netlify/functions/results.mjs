import { store, ELECTION_ID, LOCATIONS, json } from '../lib/demo-store.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Método não permitido.' }, 405);
  try {
    const url = new URL(request.url);
    const city = String(url.searchParams.get('city') || '');
    const state = String(url.searchParams.get('state') || '');
    if (!LOCATIONS.has(`${city}|${state}`)) return json({ error: 'Localidade de demonstração inválida.' }, 400);

    const db = store();
    const { blobs } = await db.list({ prefix: `votes/${ELECTION_ID}/` });
    const votes = [0, 0, 0];
    for (const item of blobs) {
      const vote = await db.get(item.key, { type: 'json', consistency: 'strong' });
      if (vote && vote.city === city && vote.state === state && [1, 2, 3].includes(vote.candidateId)) {
        votes[vote.candidateId - 1] += 1;
      }
    }
    return json({ city, state, votes, simulated: true });
  } catch (error) {
    console.error('results function:', error);
    return json({ error: 'Não foi possível consultar a apuração demonstrativa.' }, 500);
  }
}
