'use strict';
/* اختبار دخان للواجهة الجديدة 1.4: يقلّد سلوك العميل عبر WS */
const WebSocket = require('ws');
const URL = 'ws://127.0.0.1:' + (process.env.PORT || 3001);
let passed = 0, failed = 0;
const say = (ok, msg) => { console.log((ok ? '✅' : '❌') + ' ' + msg); ok ? passed++ : failed++; };

function client(name, avatar, pid) {
  return new Promise((res) => {
    const ws = new WebSocket(URL);
    const box = { ws, msgs: [], waiters: [] };
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'identify', pid: pid || '', name, avatar }));
      res(box);
    });
    ws.on('error', (e) => console.log('   [ws-err]', e.message));
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      // وانتظر واحد فقط يستلم كل رسالة — لا تكرار ولا ضياع
      const wi = box.waiters.findIndex((w) => w.pred(m));
      if (wi >= 0) { const [w] = box.waiters.splice(wi, 1); w.res(m); return; }
      box.msgs.push(m);
      if (box.msgs.length > 900) box.msgs.splice(0, 300);
    });
    // ينتظر أول رسالة تحقق الشرط؛ عند انتهاء المدة يرجع null (لا رفض)
    box.waitFor = function waitFor(pred, timeout = 8000) {
      const i = box.msgs.findIndex(pred);
      if (i >= 0) return Promise.resolve(box.msgs.splice(i, 1)[0]);
      return new Promise((res2) => {
        const w = { pred, res: (m) => { clearTimeout(w.tm); res2(m); } };
        w.tm = setTimeout(() => { box.waiters = box.waiters.filter((x) => x !== w); res2(null); }, timeout);
        box.waiters.push(w);
      });
    };
    box.next = function next(type, timeout) { return box.waitFor((m) => m.type === type, timeout); };
    box.s = snd(box);
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const send = (ws, o) => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };
const snd = (b) => (o) => send(b.ws, o);

(async () => {
  const A = await client('سالم', 'a3');
  const idA = await A.next('identity');
  say(!!idA.pid, 'A استلم identity بمعرّف');

  A.s({ type: 'create' });
  const joined = await A.next('joined');
  say(joined.seat === 0 && joined.code.length >= 4, `A أنشأ طاولة ${joined.code} (مقعد ${joined.seat})`);
  const lb1 = await A.next('lobby');
  say(lb1.code === joined.code && lb1.seats[0] && lb1.seats[0].name === 'سالم' && lb1.seats[0].avatar === 'a3' && lb1.seats[0].me === true, 'lobby فيه المقعد + الأفاتار a3');

  // إعدادات الردهة (نتجاهل أي lobby قديمة)
  A.s({ type: 'config', mode: 'ffa', target: 500, theme: 2 });
  let lb2 = null;
  for (let k = 0; k < 4; k++) {
    const cand = await A.next('lobby');
    if (cand.config.mode === 'ffa' && cand.config.target === 500 && cand.config.theme === 2) { lb2 = cand; break; }
  }
  say(!!lb2, 'وضع/هدف/مظهر تحدّثوا في الردهة');

  // الجلسات (قبل البدء)
  const S0 = await client('متفرج', 'a1');
  S0.s({ type: 'sessions' });
  const sess0 = await S0.next('sessions');
  say(Array.isArray(sess0.list), 'قائمة الجلسات تصل (قبل البدء)');
  S0.ws.close();

  // الرابط ?room: انضمام بالكود
  const C = await client('جابر', 'a5');
  C.s({ type: 'join', code: joined.code });
  const joinedC = await C.next('joined');
  say(joinedC.seat === 1, `C انضم بالكود → مقعد ${joinedC.seat}`);

  // ابدأ اللعب — ننتظر دور A تحديداً (أي بوتات/تجاوزات قبلها لا تهم)
  A.s({ type: 'start' });
  const st1 = await A.waitFor((m) => m.type === 'state' && m.s.phase === 'acting' && m.s.turn === 0, +(process.env.TURN0_MS || 20000));
  say(!!st1 && st1.s.phase === 'acting', 'الحالة الأولى: مرحلة اللعب + دور A');
  if (!st1) { console.log(`\n===== النتيجة: ${passed} ✅ / ${failed} ❌ =====`); process.exit(1); }
  say(st1.s.mode === 'ffa' && st1.s.theme === 2 && st1.s.target === 500, `الحالة تحمل ffa/theme 2/هدف 500`);
  say(st1.s.deckCount === 424 - 13 - 12 * 3 - 13, `رزمة ${st1.s.deckCount} بعد التوزيع`);
  say(st1.s.myHand.length === 13 || st1.s.myHand.length === 12, `يد A: ${st1.s.myHand.length} ورقات`);
  say(Object.keys(st1.s.myOptions.cards).length === st1.s.myHand.length, 'myOptions يغطي كل اليد');
  say(st1.s.seats.every((x) => x && typeof x.rank === 'string'), 'لا undefined في rank — رتبة سلسلة دائماً');
  say(st1.s.seats.every((x) => x && (x.avatar === 'a1' || x.avatar === 'a2' || x.avatar === 'a3' || x.avatar === 'a4' || x.avatar === 'a5' || x.avatar === 'a6')), 'كل الأفاتارات مفاتيح PNG');

  // أول حركة قانونية: رمية إن وُجدت وإلا أكلة (في بداية FFA كل الأوراق تأكل غالباً)
  const opts1 = st1.s.myOptions;
  let sent = null, actedEv = null, st2 = null;
  for (const c of st1.s.myHand) {
    const o = opts1.cards[c.id];
    if (o && o.discard) { sent = { action: 'discard', card: c.id }; break; }
    if (o && o.eats && o.eats.length && !sent) sent = { action: 'eat', card: c.id, rank: o.eats[0] };
  }
  say(!!sent, `أُرسلت حركة قانونية من A (${sent && sent.action})`);
  A.s({ type: 'act', ...sent });
  st2 = await A.waitFor((m) => m.type === 'state', 5000);
  const evsInMsgs = A.msgs.flatMap((m) => m.events || []);
  actedEv = ((st2 && st2.events) || []).concat(evsInMsgs)
    .find((e) => e.seat === 0 && ['discard', 'eat', 'jokerEat'].includes(e.kind) && e.cardId === sent.card);
  say(!!actedEv, `حدث ${actedEv ? actedEv.kind : '—'} وصل لعناصر (cardId/rank/seat)`);
  say(st2 != null && st2.s.deckCount <= st1.s.deckCount, 'رزمة تتناقص عبر الأحداث');
  if (!actedEv) {
    console.log('   [dbg] sent:', JSON.stringify(sent));
    console.log('   [dbg] st2:', st2 ? `deck=${st2.s.deckCount} turn=${st2.s.turn} phase=${st2.s.phase}` : 'null');
    for (const e of evsInMsgs) console.log('   [dbg] ev:', JSON.stringify(e).slice(0, 140));
    for (const m of A.msgs) if (m.type === 'error') console.log('   [dbg] err:', m.msg);
  }

  // مشاهدة من B
  const B = await client('مشاهدة', 'a2');
  B.s({ type: 'watch', code: joined.code });
  const watched = await B.next('watched');
  say(watched.code === joined.code, 'B افتتح المشاهدة');
  const stB = await B.next('state');
  say(stB.s.isSpec === true && stB.s.seat === -1 && stB.s.myHand.length === 0, 'حالة المشاهد: بلا يد وبلا مقعد');

  // شات مع فقاعة
  A.s({ type: 'chat', text: 'يلا نلعب!' });
  const chatEv = await wait(800).then(() => B.msgs.flatMap((m) => m.events || []).find((e) => e.kind === 'chat'));
  say(!!chatEv && /سالم/.test(chatEv.text), 'حدث شات وصل للمشاهد باسم الرامي');

  // lib.sessions أثناء اللعب
  B.s({ type: 'sessions' });
  const sess1 = await B.next('sessions');
  const room = sess1.list.find((r) => r.code === joined.code);
  say(!!room && room.players.filter(Boolean).length === 4 && room.specs >= 1, 'قائمة الجلسات تعرض المباشرة مع المشاهدين');

  // مغادرة صريحة → بوت يكمّل و الجلسة تستمر
  A.s({ type: 'leave' });
  const stB2 = await B.waitFor((m) => m.type === 'state' && m.s.seats[0] && m.s.seats[0].bot === true, 8000);
  say(!!stB2, 'بعد الخروج الصريح: بوت يكمل مكان A');

  // أفحص استمرارية اللعبة عدة تحركات بوت
  await wait(+(process.env.BOT_WAIT_MS || 2600));
  const moves = B.msgs.flatMap((m) => m.events || []).filter((e) => ['discard', 'eat', 'jokerEat', 'stop', 'jokerStop', 'flip'].includes(e.kind));
  say(moves.length >= +(process.env.MOVES_MIN || 2), `اللعبة مستمرة: ${moves.length} حركة بوت إضافية مرصودة`);

  console.log(`\n===== النتيجة: ${passed} ✅ / ${failed} ❌ =====`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
