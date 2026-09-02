'use strict';
/* اختبار: وضع الفردي ×4 + هدف الجلسة + وضع المشاهدة (Spectator) */
const WebSocket = require('ws');
const URL = 'ws://127.0.0.1:' + (process.env.PORT || 3000);

let failures = 0;
const err = (m) => { failures++; console.error('❌', m); };

function player(name) {
  const p = { name, ws: null, state: null, seat: -1, room: null };
  p.open = () => new Promise((res, rej) => {
    p.ws = new WebSocket(URL);
    p.ws.on('open', () => p.ws.send(JSON.stringify({ type: 'identify', pid: 'ffa-' + name, name, avatar: '🦊' })));
    p.ws.on('error', rej);
    p.ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.type === 'identity') p.ws.send(JSON.stringify({ type: 'create' }));
      if (m.type === 'joined') { p.seat = m.seat; p.room = m.code; }
      if (m.type === 'state') { p.state = m.s; maybeAct(p); }
    });
    setTimeout(res, 150);
  });
  p.send = (o) => p.ws.send(JSON.stringify(o));
  return p;
}

function maybeAct(p) {
  const S = p.state;
  if (!S) return;
  if (S.phase === 'end') return;
  if (S.phase === 'stop') {
    if (S.canStop) {
      const c = S.myHand.find((x) => x.j || x.r === S.pending.rank);
      if (c) return p.send({ type: 'act', action: 'stop', card: c.id });
    }
    return;
  }
  if (S.phase !== 'acting' || S.turn !== p.seat) return;
  const my = S.myOptions || {};
  let best = null;
  for (const c of S.myHand) {
    const o = my.cards[c.id]; if (!o) continue;
    for (const r of o.eats) {
      const f = S.field.filter((x) => x.r === r).length;
      const ch = [1, 2, 3].map((s) => (p.seat + s) % 4)
        .filter((s) => S.piles[s].chain && S.piles[s].chain.rank === r).length;
      const gain = (f + ch) * 12;
      if (!best || gain > best.gain) best = { card: c.id, rank: r, gain };
    }
  }
  if (best && (best.gain >= 24 || my.mustEat)) return p.send({ type: 'act', action: 'eat', card: best.card, rank: best.rank });
  const d = S.myHand.filter((c) => my.cards[c.id] && my.cards[c.id].discard);
  if (d.length) return p.send({ type: 'act', action: 'discard', card: d[0].id });
  p.send({ type: 'act', action: 'pass' });
}

(async () => {
  const P = [player('أ'), player('ب'), player('ج'), player('د')];
  for (const p of P) await p.open();
  await new Promise((r) => setTimeout(r, 250));
  const code = P[0].room;
  for (let i = 1; i < 4; i++) { P[i].send({ type: 'join', code }); await new Promise((r) => setTimeout(r, 140)); }
  P[1].send({ type: 'seat', idx: 1 });
  P[2].send({ type: 'seat', idx: 2 });
  P[3].send({ type: 'seat', idx: 3 });
  await new Promise((r) => setTimeout(r, 200));
  P[0].send({ type: 'config', mode: 'ffa', target: 500, theme: 2 });
  await new Promise((r) => setTimeout(r, 200));

  // مشاهد: يجب أن يشاهد الجلسة بلا يد
  let specState = null, specOk = false;
  const spec = new WebSocket(URL);
  spec.on('open', () => spec.send(JSON.stringify({ type: 'identify', pid: 'spec-1', name: 'مشاهد', avatar: '👁️' })));
  spec.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.type === 'identity') spec.send(JSON.stringify({ type: 'watch', code }));
    if (m.type === 'watched') { specOk = true; }
    if (m.type === 'state' && specState === null) specState = m.s;
  });
  await new Promise((r) => setTimeout(r, 300));

  P[0].send({ type: 'start' });
  console.log('🎬 بدأت طاولة الفردي:', code, '(هدف 500، ثيم 2)');

  const deadline = Date.now() + 150000;
  const wait = setInterval(async () => {
    if (Date.now() > deadline) { clearInterval(wait); finish(); return; }
    const allEnd = P.every((p) => p.state && p.state.phase === 'end');
    if (!allEnd) return;
    const r = P[0].state.result;
    // فحوصات الجولة
    if (r.mode !== 'ffa') err(`يجب أن تكون النتيجة فردي — وجد ${r.mode}`);
    if (r.target !== 500) err('يجب أن يكون الهدف 500');
    if (r.session.length !== 4) err('جلسة الفردي يجب أن تحتوي 4 قيم');
    const seatNames = P[0].state.seats.filter(Boolean).map((s) => s.name);
    if (seatNames.length !== 4) err('يجب أن يكون 4 لاعبين');
    const modeOnState = P.every((p) => p.state.mode === 'ffa');
    if (!modeOnState) err('حالة اللاعب يجب أن تحمل mode=ffa');
    console.log(`✅ جولة الفردي انتهت: ${r.scores.map((s) => s.total).join(' / ')} — الفائز: مقعد ${r.winnerSeat}`);
    // جولة ثانية (الهدف 500 نادراً ما يكتمل بجولة واحدة)
    P[0].send({ type: 'nextround' });
    await new Promise((q) => setTimeout(q, 400));
    const secondStarted = P.every((p) => p.state && p.state.phase === 'acting');
    if (!secondStarted) err('الجولة الثانية يجب أن تبدأ');
    // فحص المشاهد
    if (specOk && specState) {
      if (specState.seat !== -1 || !specState.isSpec) err('المشاهد يجب أن يملك isSpec=true و seat=-1');
      if (specState.myHand.length !== 0) err('المشاهد لا يملك يداً');
      if (specState.piles.length !== 4) err('المشاهد يرى الكومات الأربع');
      console.log('✅ وضع المشاهدة يعمل (isSpec، بلا يد، يرى الطاولة)');
    } else err('لم يستلم المشاهد الحالة');
    clearInterval(wait);
    finish();
  }, 500);

  function finish() {
    console.log(failures === 0
      ? '✅ اختبار الفردي + الهدف + المشاهدة نجح بالكامل'
      : `❌ فشل: ${failures}`);
    process.exit(failures ? 1 : 0);
  }
})();
