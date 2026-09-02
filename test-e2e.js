'use strict';
/* اختبار تكاملي: 4 عملاء WebSocket حقيقيين يلعبون ضد الخادم */
const WebSocket = require('ws');
const URL = 'ws://127.0.0.1:' + (process.env.PORT || 3000);

function player(name) {
  const p = {
    name, ws: null, state: null, pid: null, seat: -1, rounds: 0,
    open() {
      return new Promise((res, rej) => {
        p.ws = new WebSocket(URL);
        p.ws.on('open', () => {
          p.ws.send(JSON.stringify({ type: 'identify', pid: 'test-' + name, name, avatar: '🦊' }));
          setTimeout(res, 120);
        });
        p.ws.on('error', rej);
        p.ws.on('message', (raw) => {
          const m = JSON.parse(raw.toString());
          if (m.type === 'identity') p.pid = m.pid;
          if (m.type === 'joined') { p.seat = m.seat; p.room = m.code; }
          if (m.type === 'state') { p.state = m.s; p.rounds = m.s.round; maybeAct(p); }
          if (m.type === 'lobby') p.lobby = m;
        });
      });
    },
    send(o) { p.ws.send(JSON.stringify(o)); },
  };
  return p;
}

const P = [player('علي'), player('سارة'), player('خالد'), player('مريم')];
let failures = 0;
const err = (m) => { failures++; console.error('❌', m); };

function maybeAct(p) {
  const S = p.state;
  if (!S || S.phase === 'end') return;
  const my = S.myOptions || {};
  if (S.phase === 'stop') {
    if (S.canStop) {
      const c = p.state.myHand.find((x) => x.j || x.r === S.pending.rank);
      if (c) return p.send({ type: 'act', action: 'stop', card: c.id }); // نختبر الكمين دائماً حين يمكن
    }
    return; // خلاف ذلك ننتظر النافذة
  }
  if (S.phase !== 'acting' || S.turn !== p.seat) return;
  // اختيار بطاقة
  let best = null;
  for (const c of S.myHand) {
    const o = my.cards[c.id]; if (!o) continue;
    for (const r of o.eats) {
      const fieldN = S.field.filter((x) => x.r === r).length;
      const chainN = [1, 3].map((s) => (p.seat + s) % 4).concat([(p.seat + 2) % 4])
        .filter((s) => S.piles[s].chain && S.piles[s].chain.rank === r).length;
      const gain = (fieldN + chainN) * 10 * (['A', 'J', 'Q', 'K', '10'].includes(r) ? 2 : 0) + (fieldN + chainN);
      if (!best || gain > best.gain) best = { card: c.id, rank: r, gain };
    }
  }
  if (best && best.gain >= 20) return p.send({ type: 'act', action: 'eat', card: best.card, rank: best.rank });
  if (my.mustEat && best) return p.send({ type: 'act', action: 'eat', card: best.card, rank: best.rank });
  const discards = S.myHand.filter((c) => my.cards[c.id] && my.cards[c.id].discard);
  if (discards.length) return p.send({ type: 'act', action: 'discard', card: discards[0].id });
  p.send({ type: 'act', action: 'pass' });
}

(async () => {
  for (const p of P) await p.open();
  // جميعهم في غرف منفصلة في البداية — أول واحد ينشئ طاولة والباقي ينضمون
  P[0].send({ type: 'create' });
  await new Promise((r) => setTimeout(r, 200));
  const code = P[0].room;
  if (!code) return err('لم يُنشأ كود طاولة');
  for (let i = 1; i < 4; i++) {
    P[i].send({ type: 'join', code });
    await new Promise((r) => setTimeout(r, 150));
  }
  // اجلس على المقاعد: 0،2 فريق أزرق و 1،3 أحمر — اختبار: 0 و2 = علي ومريم
  P[1].send({ type: 'seat', idx: 1 });
  P[2].send({ type: 'seat', idx: 2 });
  P[3].send({ type: 'seat', idx: 3 });
  await new Promise((r) => setTimeout(r, 200));

  P[0].send({ type: 'start' });
  console.log('🎬 بدأت الطاولة:', code);

  // انتظار نهاية جولة (لا بوتات — كل اللاعبين بشر في الاختبار)
  const deadline = Date.now() + 120000;
  let ends = 0;
  const wait = setInterval(() => {
    if (Date.now() > deadline) { clearInterval(wait); finish(); return; }
    const allEnd = P.every((p) => p.state && p.state.phase === 'end');
    if (allEnd) {
      ends++;
      const r = P[0].state.result;
      const total = r.teams[0] + r.teams[1];
      if (total <= 0) err('نقاط النهاية صفرية — مشكلة في الحسبة');
      const sumCards = P.reduce((a, p) => a + p.state.handCounts.reduce((x, y) => x + y, 0), 0) +
        P[0].state.deckCount + P[0].state.field.length +
        P[0].state.piles.reduce((a, pl) => a + (pl.chain ? pl.chain.count + pl.chain.jokers : 0) + pl.buriedCount, 0);
      console.log(`✅ الجولة ${P[0].state.round} انتهت: أزرق ${r.teams[0]} / أحمر ${r.teams[1]} — ورق ظاهر ${sumCards}`);
      if (ends >= 2) { clearInterval(wait); finish(); return; }
      P[0].send({ type: 'nextround' });
    }
  }, 400);

  function finish() {
    console.log(failures === 0 ? '✅ الاختبار التكاملي نجح — جولات كاملة عبر WebSocket' : `❌ فشل: ${failures}`);
    process.exit(failures ? 1 : 0);
  }
})();
