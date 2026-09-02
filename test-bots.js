'use strict';
/* اختبار: لاعب بشري واحد + 3 بوتات يكمّلون — جولة كاملة عبر WebSocket */
const WebSocket = require('ws');
const URL = 'ws://127.0.0.1:' + (process.env.PORT || 3000);

let state = null, seat = -1, roundsEnded = 0, failures = 0;
const err = (m) => { failures++; console.error('❌', m); };

const ws = new WebSocket(URL);
ws.on('open', () => ws.send(JSON.stringify({ type: 'identify', pid: 'test-human-1', name: 'بشري', avatar: '🦊' })));
ws.on('message', (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.type === 'identity') ws.send(JSON.stringify({ type: 'create' }));
  if (m.type === 'joined' && !started) { started = true; setTimeout(() => ws.send(JSON.stringify({ type: 'start' })), 100); }
  if (m.type === 'state') {
    state = m.s; seat = m.s.seat;
    maybeAct();
  }
});
let started = false;

function maybeAct() {
  const S = state;
  if (!S) return;
  if (S.phase === 'end') {
    if (roundsEnded === 0) {
      roundsEnded++;
      console.log(`✅ جولة مع بوتات انتهت: أزرق ${S.result.teams[0]} / أحمر ${S.result.teams[1]}`);
      const bots = S.seats.filter((x) => x && x.isBot).length;
      if (bots !== 3) err('يجب أن يكون هناك 3 بوتات');
      process.exit(failures ? 1 : 0);
    }
    return;
  }
  if (S.phase === 'stop') {
    if (S.canStop) {
      const c = S.myHand.find((x) => x.j || x.r === S.pending.rank);
      if (c) return ws.send(JSON.stringify({ type: 'act', action: 'stop', card: c.id }));
    }
    return;
  }
  if (S.phase !== 'acting' || S.turn !== seat) return;
  const my = S.myOptions || {};
  let best = null;
  for (const c of S.myHand) {
    const o = my.cards[c.id]; if (!o) continue;
    for (const r of o.eats) {
      const f = S.field.filter((x) => x.r === r).length;
      const ch = [1, 3].map((s) => (seat + s) % 4).concat([(seat + 2) % 4])
        .filter((s) => S.piles[s].chain && S.piles[s].chain.rank === r).length;
      const gain = (f + ch) * 12;
      if (!best || gain > best.gain) best = { card: c.id, rank: r, gain };
    }
  }
  if (best && (best.gain >= 24 || my.mustEat)) return ws.send(JSON.stringify({ type: 'act', action: 'eat', card: best.card, rank: best.rank }));
  const d = S.myHand.filter((c) => my.cards[c.id] && my.cards[c.id].discard);
  if (d.length) return ws.send(JSON.stringify({ type: 'act', action: 'discard', card: d[0].id }));
  ws.send(JSON.stringify({ type: 'act', action: 'pass' }));
}

const prog = setInterval(() => {
  if (state) console.log('progress: round', state.round, 'phase', state.phase, 'deck', state.deckCount, 'turn', state.turn, 'hand', state.handCounts.join('/'));
  else console.log('progress: no state yet');
}, 20000);
setTimeout(() => { clearInterval(prog); err('انتهت المهلة — لم تكتمل الجولة'); process.exit(1); }, 360000);

// إضافة تتبع تقدم
let lastLog = Date.now();
const origMaybeAct = maybeAct;
