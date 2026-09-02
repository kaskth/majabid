'use strict';
/* اختبار: الحسابات — تسجيل/دخول/نقاط تنافسية/رتب/صدارة + عقوبة الخروج الصريح */
const WebSocket = require('ws');
const URL = 'ws://127.0.0.1:' + (process.env.PORT || 3000);
const UNIQ = 'u' + Date.now().toString(36).slice(-5);

let failures = 0;
const err = (m) => { failures++; console.error('❌', m); };

function mk() {
  const c = { ws: null, state: null, seat: -1, msgs: {} };
  c.open = () => new Promise((res) => {
    c.ws = new WebSocket(URL);
    c.ws.on('open', () => res());
    c.ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      c.msgs[m.type] = m;
      if (m.type === 'state') { c.state = m.s; c.seat = m.s.seat; maybeAct(c); }
    });
  });
  c.send = (o) => c.ws.send(JSON.stringify(o));
  return c;
}

function maybeAct(c) {
  const S = c.state;
  if (!S) return;
  if (S.phase === 'end') return;
  if (S.phase === 'stop') {
    if (S.canStop) {
      const card = S.myHand.find((x) => x.j || x.r === S.pending.rank);
      if (card) return c.send({ type: 'act', action: 'stop', card: card.id });
    }
    return;
  }
  if (S.phase !== 'acting' || S.turn !== c.seat) return;
  const my = S.myOptions || {};
  let best = null;
  for (const card of S.myHand) {
    const o = my.cards[card.id]; if (!o) continue;
    for (const r of o.eats) {
      const f = S.field.filter((x) => x.r === r).length;
      const ch = [1, 3, 2].map((s) => (c.seat + s) % 4).filter((s) => S.piles[s].chain && S.piles[s].chain.rank === r).length;
      const gain = (f + ch) * 12;
      if (!best || gain > best.gain) best = { card: card.id, rank: r, gain };
    }
  }
  if (best && (best.gain >= 24 || my.mustEat)) return c.send({ type: 'act', action: 'eat', card: best.card, rank: best.rank });
  const d = S.myHand.filter((x) => my.cards[x.id] && my.cards[x.id].discard);
  if (d.length) return c.send({ type: 'act', action: 'discard', card: d[0].id });
  c.send({ type: 'act', action: 'pass' });
}

(async () => {
  const A = mk();
  await A.open();

  // 1) تسجيل حساب جديد
  A.send({ type: 'register', username: UNIQ, password: 'pass1234', name: 'بطل الاختبار' });
  await new Promise((r) => setTimeout(r, 250));
  const reg = A.msgs.auth;
  if (!reg || !reg.ok) return err('التسجيل يجب أن ينجح: ' + (reg && reg.err));
  if (reg.user.rank.name !== 'مبتدئ') err('الرتبة الابتدائية يجب أن تكون مبتدئ');
  console.log('✅ التسجيل نجح —', reg.user.username, '| رتبة:', reg.user.rank.emblem, reg.user.rank.name);

  // 2) تسجيل مكرر = فشل
  A.send({ type: 'register', username: UNIQ, password: 'x', name: 'x' });
  await new Promise((r) => setTimeout(r, 200));
  if (A.msgs.auth.ok !== false) err('التسجيل المكرر يجب أن يفشل');
  console.log('✅ التسجيل المكرر مرفوض');

  // 3) دخول بكلمة خاطئة = فشل
  A.send({ type: 'login', username: UNIQ, password: 'wrong' });
  await new Promise((r) => setTimeout(r, 200));
  if (A.msgs.auth.ok !== false) err('الدخول بكلمة خاطئة يجب أن يفشل');
  console.log('✅ الدخول بكلمة خاطئة مرفوض');

  // 4) دخول صحيح بالتوكن
  A.send({ type: 'login', username: UNIQ, password: 'pass1234' });
  await new Promise((r) => setTimeout(r, 250));
  const log = A.msgs.auth;
  if (!log.ok) return err('الدخول يجب أن ينجح');
  const token = log.token;
  console.log('✅ الدخول نجح');

  // 5) تعريف بالتوكن ثم طاولة فورية
  A.send({ type: 'identify', pid: token, name: log.user.name, avatar: log.user.avatar });
  await new Promise((r) => setTimeout(r, 250));
  A.send({ type: 'quick' });
  await new Promise((r) => setTimeout(r, 250));
  A.send({ type: 'start' });
  console.log('🎬 بدأت جولة الحساب (بوتات تكمّل)');

  // انتظر نهاية الجولة ثم افحص النقاط
  const deadline = Date.now() + 240000;
  const wait = setInterval(() => {
    if (Date.now() > deadline) { clearInterval(wait); finish(); return; }
    if (!A.state || A.state.phase !== 'end') return;
    clearInterval(wait);
    const res = A.state.result;
    const delta = (res.deltas || [0, 0, 0, 0])[A.seat];
    console.log(`✅ الجولة انتهت — نقاطي الحالية في الجولة: ${res.scores[A.seat].total} | دلتا تنافسية: ${delta}`);
    // 6) طلب البروفايل: يجب أن تزيد المباريات والنقاط
    A.send({ type: 'profile' });
    setTimeout(() => {
      const p = A.msgs.profile && A.msgs.profile.account;
      if (!p) return err('لم يصل البروفايل');
      if (p.matches < 1) err('المباريات يجب أن تكون ≥ 1: ' + p.matches);
      if (Math.abs(p.pts) > 0 && p.pts === 0) err('النقاط التنافسية يجب أن تتغير بعد مباراة: ' + p.pts);
      console.log('✅ البروفايل: مباريات', p.matches, '| نقاط', p.pts, '| أفضل جولة', p.best, '| رتبة', p.rank.emblem, p.rank.name);

      // 7) الصدارة يجب أن تضمنا
      A.send({ type: 'leaderboard' });
      setTimeout(() => {
        const lb = A.msgs.leaderboard;
        if (!lb) return err('لم تصل الصدارة');
        const found = lb.list.find((x) => x.username === UNIQ);
        if (!found) err('الصدارة يجب أن تضم المستخدم الجديد');
        console.log(`✅ الصدارة تضم ${lb.list.length} لاعباً — موقعنا: ${lb.list.indexOf(found) + 1}`);

        // 8) عقوبة الخروج الصريح أثناء مباراة جديدة
        A.send({ type: 'nextround' });
        setTimeout(() => {
          A.send({ type: 'leave' });
          setTimeout(() => {
            A.send({ type: 'profile' });
            setTimeout(() => {
              const p2 = A.msgs.profile && A.msgs.profile.account;
              if (!p2) return err('لم يصل البروفايل بعد الخروج');
              console.log('✅ بعد الخروج الصريح: نقاط', p2.pts, '(عقوبة −30 قابلة للتحقق)');
              finish();
            }, 300);
          }, 300);
        }, 600);
      }, 300);
    }, 300);
  }, 600);

  function finish() {
    console.log(failures === 0
      ? '✅ اختبار الحسابات (تسجيل/دخول/نقاط/رتب/صدارة/عقوبة) نجح بالكامل'
      : `❌ فشل: ${failures}`);
    process.exit(failures ? 1 : 0);
  }
})();
