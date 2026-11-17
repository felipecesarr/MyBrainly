const test = require('node:test');
const assert = require('node:assert/strict');
const { requestGeneratedFlashcards } = require('../src/services/aiDeckClient.js');

const request = { endpoint: 'https://example.invalid/ai/decks', title: 'Travel', description: 'Airport words', language: 'English', count: 1,
  getIdToken: async () => 'demo-session', fetchImpl: async () => ({ ok: true, json: async () => ({ flashcards: [{ word: 'gate', translation: 'portão', example: 'the boarding gate' }] }) }) };

test('unconfigured and insecure endpoints never request a token or perform network I/O', async () => {
  for (const endpoint of ['', 'http://example.invalid', 'https://name:password@example.invalid', 'https://example.invalid/#fragment']) {
    let calls = 0;
    await assert.rejects(requestGeneratedFlashcards({ ...request, endpoint, getIdToken: async () => { calls++; }, fetchImpl: async () => { calls++; } }), /HTTPS/);
    assert.equal(calls, 0);
  }
});
test('invalid count or fields fail before token lookup and network I/O', async () => {
  for (const patch of [{ count: 0 }, { count: 101 }, { count: 1.5 }, { language: '' }, { title: ' ' }]) {
    let calls = 0;
    await assert.rejects(requestGeneratedFlashcards({ ...request, ...patch, getIdToken: async () => { calls++; } }), /Invalid deck/);
    assert.equal(calls, 0);
  }
});
test('a missing session cannot call the backend', async () => {
  let calls = 0;
  await assert.rejects(requestGeneratedFlashcards({ ...request, getIdToken: async () => null, fetchImpl: async () => { calls++; } }), /authenticated/);
  assert.equal(calls, 0);
});
test('request contains only the Firebase session token and permitted deck fields', async () => {
  let sent;
  const result = await requestGeneratedFlashcards({ ...request, fetchImpl: async (url, options) => { sent = { url, options }; return request.fetchImpl(); } });
  assert.equal(sent.url, request.endpoint);
  assert.deepEqual(sent.options.headers, { 'Content-Type': 'application/json', Authorization: 'Bearer demo-session' });
  assert.deepEqual(JSON.parse(sent.options.body), { title: request.title, description: request.description, language: request.language, count: 1 });
  assert.equal(result[0].word, 'gate');
});
test('HTTP failures do not expose backend response bodies', async () => {
  let read = false;
  await assert.rejects(requestGeneratedFlashcards({ ...request, fetchImpl: async () => ({ ok: false, text: async () => { read = true; return 'private diagnostic'; } }) }), /^Error: AI backend request failed\.$/);
  assert.equal(read, false);
});
test('malformed cards, excessive cards and non-JSON responses are rejected', async () => {
  for (const data of [{}, { flashcards: [] }, { flashcards: [{ word: 123, translation: 'a', example: 'b' }] },
    { flashcards: [{ word: 'a', translation: 'a', example: 'b' }, { word: 'c', translation: 'c', example: 'd' }] }]) {
    await assert.rejects(requestGeneratedFlashcards({ ...request, fetchImpl: async () => ({ ok: true, json: async () => data }) }), /Invalid AI/);
  }
  await assert.rejects(requestGeneratedFlashcards({ ...request, fetchImpl: async () => ({ ok: true, json: async () => { throw Error('not json'); } }) }), /Invalid AI/);
});
test('only documented card fields are returned to the app', async () => {
  const result = await requestGeneratedFlashcards({ ...request, fetchImpl: async () => ({ ok: true, json: async () => ({ flashcards: [{ word: 'gate', translation: 'portão', example: 'the boarding gate', internal: 'ignore this field' }] }) }) });
  assert.deepEqual(Object.keys(result[0]), ['word', 'translation', 'example']);
});
