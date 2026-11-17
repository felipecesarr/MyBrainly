// Provider credentials belong on the server. This client sends only a user session token.
async function requestGeneratedFlashcards({ endpoint, getIdToken, title, description, language, count, fetchImpl = fetch }) {
  let url;
  try { url = new URL(endpoint); } catch { throw new Error('Configure an HTTPS AI backend.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) {
    throw new Error('Configure an HTTPS AI backend.');
  }
  if (!Number.isInteger(count) || count < 1 || count > 100 ||
      ![title, description, language].every(value => typeof value === 'string' && value.trim())) {
    throw new Error('Invalid deck request.');
  }
  const sessionToken = typeof getIdToken === 'function' ? await getIdToken() : null;
  if (!sessionToken) throw new Error('An authenticated Firebase session is required.');
  const response = await fetchImpl(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
    body: JSON.stringify({ title, description, language, count })
  });
  if (!response.ok) throw new Error('AI backend request failed.');
  let data;
  try { data = await response.json(); } catch { throw new Error('Invalid AI backend response.'); }
  if (!Array.isArray(data.flashcards) || data.flashcards.length < 1 || data.flashcards.length > count ||
      !data.flashcards.every(card => card && ['word', 'translation', 'example']
        .every(key => typeof card[key] === 'string' && card[key].trim().length > 0))) {
    throw new Error('Invalid AI backend response.');
  }
  return data.flashcards.map(({ word, translation, example }) => ({ word, translation, example }));
}

module.exports = { requestGeneratedFlashcards };
