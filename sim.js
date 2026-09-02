'use strict';
/* اختبار المحرك: 300 جولة وهمية مع تحقق من القوانين وحفظ الورق (424) */
const E = require('./engine.js');
const B = require('./bots.js');

let failures = 0;
function assert(cond, msg) { if (!cond) { failures++; console.error('FAIL:', msg); } }

function totalCards(t) {
  let sum = t.deck.length + t.field.length;
  for (const h of t.hands) sum += h.length;
  for (const p of t.piles)
    sum += p.buried.length + p.jokers + (p.chain ? p.chain.cards.length + p.chain.jokers : 0);
  if (t.pending) sum += t.pending.cards.length + t.pending.jokers; // الأكلة المعلّقة في الهواء
  return sum;
}

/* خطوة واحدة تحاكي الخادم تماماً */
function simStep(t) {
  if (t.phase === 'stop' && t.pending) {
    const eligible = [0, 1, 2, 3].filter((s) => E.canStop(t, s));
    const stoppers = eligible
      .map((s) => ({ s, d: B.botAct(t, s) }))
      .filter((x) => x.d.act === 'stop');
    if (stoppers.length && Math.random() < 0.7) {
      const pick = stoppers[Math.floor(Math.random() * stoppers.length)];
      const r = E.stop(t, pick.s, pick.d.card);
      assert(r.ok, 'stop يجب أن ينجح: ' + r.err);
      if (t.deck.length === 0) {
        // الطور الختامي: تحسم فوراً — الخاطف لا يلعب
        const stopper = pick.s;
        E.applyPending(t);
        t.turn = E.nextSeat(stopper);
        E.turnStart(t);
      }
      return;
    }
    const owner = t.pending.owner;
    E.applyPending(t);
    t.turn = owner; // آخر من استقرت عنده الأكلة يواصل دوره
    return;
  }
  if (t.phase !== 'acting') return;
  const seat = t.turn;
  const d = B.botAct(t, seat);
  let r =
    d.act === 'eat' ? E.eat(t, seat, d.card, d.rank)
    : d.act === 'discard' ? E.discard(t, seat, d.card)
    : E.pass(t, seat);
  if (!r.ok) {
    const r2 = E.pass(t, seat);
    assert(r2.ok, `لا توجد حركة قانونية لـ${seat} (${d.act}: ${r.err})`);
    r = r2;
  }
  if (r.roundEnded || t.phase === 'end') return;
  if (t.phase === 'stop') return;      // أكلة معلّقة — النافذة تنتظر
  E.endTurn(t, seat);                   // رمية/تجاوز/قلب → الدور للي بعده
}

let lenSum = 0, ffaRounds = 0;
for (let i = 0; i < 300; i++) {
  const mode = i % 2 === 0 ? 'teams' : 'ffa';
  const target = i % 5 === 0 ? 500 : 0;
  const t = E.newGame({ mode, target });
  E.deal(t);
  let guard = 0;
  while (t.phase !== 'end' && guard++ < 6000) {
    if (totalCards(t) !== 424) {
      assert(false, `أوراق مفقودة/زائدة: ${totalCards(t)} (phase=${t.phase})`);
      break;
    }
    simStep(t);
  }
  assert(t.phase === 'end', 'الجولة يجب أن تنتهي');
  if (t.phase !== 'end') break;
  const r = t.roundResult;
  assert(r.mode === mode, 'وضع الجولة يجب أن يطابق الإعداد');
  if (mode === 'ffa') {
    ffaRounds++;
    assert(r.session.length === 4, 'جلسة الفردي يجب أن تكون 4 قيم');
    assert(r.winnerSeat >= -1 && r.winnerSeat <= 3, 'الفائز بالفردي يجب أن يكون مقعداً صحيحاً: ' + r.winnerSeat);
    const sum = r.scores.reduce((a, s) => a + s.total, 0);
    assert(sum === r.session.reduce((a, b) => a + b, 0), 'مجموع جلسة الفردي لا يطابق النقاط');
  } else {
    assert(r.teams.length === 2, 'نتائج الفرق يجب أن تكون اثنتين');
  }
  lenSum += guard;
}

console.log(failures === 0
  ? `✅ المحاكاة نجحت: 300 جولة تامة (وضعان: ${300 - ffaRounds} فرق + ${ffaRounds} فردي)، حفظ كامل للورق (424) في كل خطوة`
  : `❌ فشل: ${failures} مشكلة`);
process.exit(failures ? 1 : 0);
