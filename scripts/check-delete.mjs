// "Daveti sil" kontrolü: yalnızca yönetim kodu olan siler; davetliler, yanıtlar ve plan verileri gider;
// başka davetler etkilenmez. Yalnızca yerel test sunucusuna karşı çalışır.
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3001';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Only local test servers are permitted.');
let checks = 0;
async function req(path, method = 'GET', body, status = 200) {
  const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json();
  assert.equal(r.status, status, `${method} ${path}: ${JSON.stringify(data)}`);
  checks++;
  return data;
}
const payload = { title: 'Silme denemesi', category: 'Akşam yemeği', hostName: 'Deneme', date: '2027-04-25', time: '17:00', venue: 'Deneme', address: '', description: '', coverId: 'citrus', coverData: null, capacity: null };
const a = await req('/api/mobile/events', 'POST', payload, 201);
const b = await req('/api/mobile/events', 'POST', { ...payload, title: 'Kalan davet' }, 201);
const g = await req(`/api/mobile/events/${a.manageToken}/guests`, 'POST', { name: 'Deneme Misafiri' }, 201);
await req(`/api/mobile/events/${a.manageToken}/social`, 'PATCH', { settings: { questions: [{ id: 'q1', prompt: 'Soru?' }], announcements: [], poll: null }, version: 0 });
await req(`/api/mobile/invites/${a.inviteToken}/social`, 'POST', { guestToken: g.token, pollId: '', votes: [], answers: { q1: 'Cevap' } });
// Davet bağlantısıyla (davetli yetkisi) silinemez
await req(`/api/mobile/events/${a.inviteToken}`, 'DELETE', undefined, 404);
await req(`/api/mobile/events/${a.manageToken}`, 'DELETE');
await req(`/api/mobile/events/${a.manageToken}`, 'GET', undefined, 404);
await req(`/api/mobile/invites/${a.inviteToken}/social`, 'GET', undefined, 404);
await req(`/api/mobile/events/${a.manageToken}`, 'DELETE', undefined, 404);
const kalan = await req(`/api/mobile/events/${b.manageToken}`);
assert.equal(kalan.title, 'Kalan davet');
await req(`/api/mobile/events/${b.manageToken}`, 'DELETE');
console.log(`${checks} HTTP checks passed: owner-only delete, cascade to guests/social, idempotent 404, other events untouched.`);
