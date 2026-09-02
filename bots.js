'use strict';
/* ============================================================
   مجابيد — ذكاء البوت (يلعب بالمعلومات المرئية فقط، لا غش)
   ============================================================ */
const E = require('./engine.js');

const BOT_NAMES = [
  { name: 'أبو حميد', avatar: 'a1' },
  { name: 'عمّو سالم', avatar: 'a2' },
  { name: 'خالتي فاطمة', avatar: 'a3' },
  { name: 'الغزالي', avatar: 'a4' },
  { name: 'سيدي علي', avatar: 'a5' },
  { name: 'الشيخ رمضان', avatar: 'a6' },
  { name: 'أم كريم', avatar: 'a1' },
  { name: 'مجدي الشبح', avatar: 'a2' },
  { name: 'جابر الهضبة', avatar: 'a3' },
  { name: 'زعيمة الملعب', avatar: 'a4' },
];

function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

/* قيمة مرئية للكنسة (بدون معرفة الجوكرات المدفونة — تقييم متحفظ) */
function visibleCaptureValue(t, seat, rank) {
  let v = 0;
  for (const c of t.field) if (c.rank === rank) v += E.cardValue(c);
  for (const s of E.eatSources(t, seat)) {
    const ch = t.piles[s].chain;
    if (ch && ch.rank === rank) for (const c of ch.cards) v += E.cardValue(c);
  }
  return v;
}

/* ---------- قرار البوت أثناء دوره ---------- */
function botAct(t, seat) {
  const hand = t.hands[seat];
  // في الفردي: الجميع خصوم — في الفرق: الخصمان فقط (الشريكة محمية)
  const opps = t.mode === 'ffa'
    ? [0, 1, 2, 3].filter((x) => x !== seat)
    : E.opponentsOf(seat);

  // 1) نافذة «وقّف!» — الكمين
  if (t.phase === 'stop' && t.pending) {
    const p = t.pending;
    if (p.owner === seat) return { act: 'wait' };          // صاحبها
    if (p.stops.includes(seat)) return { act: 'wait' };
    // في الطور الختامي: اللاعب التالي فقط
    if (t.deck.length === 0 && E.nextSeat(p.owner) !== seat) return { act: 'wait' };
    const card = hand.find((c) => c.rank === p.rank) || hand.find((c) => c.joker) || null;
    if (!card) return { act: 'wait' };
    // الجوكر = كنز — اخطفه دائماً تقريباً
    if (p.jokers > 0) return { act: 'stop', card: card.id };
    const gain = p.cards.reduce((a, c) => a + E.cardValue(c), 0);
    if (gain >= 30 && Math.random() < 0.8) return { act: 'stop', card: card.id };
    if (gain >= 10 && Math.random() < 0.25) return { act: 'stop', card: card.id };
    return { act: 'wait' };
  }

  if (t.phase !== 'acting' || t.turn !== seat) return { act: 'wait' };

  // 2) الأكل أم الرمي؟
  const ranks = E.availableRanks(t, seat);
  const opts = E.myOptions(t, seat);
  const mustEat = opts.mustEat;

  // تقييم الأكلات المتاحة
  let best = null;
  for (const c of hand) {
    const candidates = c.joker ? ranks : (ranks.includes(c.rank) ? [c.rank] : []);
    for (const r of candidates) {
      const v = visibleCaptureValue(t, seat, r);
      const cnt = t.field.filter((x) => x.rank === r).length +
        E.eatSources(t, seat).filter((s) => t.piles[s].chain && t.piles[s].chain.rank === r).length;
      const score = v + cnt * 2; // ميل خفيف لبناء الكومة
      if (!best || score > best.score) best = { act: 'eat', card: c.id, rank: r, score, joker: c.joker };
    }
  }
  // الجوكر: كنز — لا نرميه أبداً، نأكل به بس لو الأكل يستاهل
  if (best && best.joker && best.score < 60) best = null;

  const hungryEat = best && (best.score >= 25 || mustEat);

  if (hungryEat) return { act: 'eat', card: best.card, rank: best.rank };

  // 3) رمي: أقل الأوراق قيمة، وتجنب فتح جبيد الخصوم
  if (!mustEat) {
    const dangerRanks = new Set();
    for (const s of opps) {
      const ch = t.piles[s].chain;
      if (ch) dangerRanks.add(ch.rank);
    }
    const partner = t.piles[E.partnerOf(seat)].chain;
    let cards = hand.filter((c) => !c.joker);
    cards = cards
      .map((c) => {
        let score = E.cardValue(c) * 3;
        if (dangerRanks.has(c.rank)) score += 6;
        if (partner && partner.rank === c.rank) score += 8;
        return { c, score };
      })
      .sort((a, b) => a.score - b.score);
    for (const { c } of cards) {
      if (E.partnerProtection(t, seat, c)) continue;
      if (dangerRanks.has(c.rank) && !mustEat) {
        // الخطر: لو رميناها يمكن للخصم ياكلها — نتأكد ما عندنا بديل آمن
        const safeAlt = cards.some((o) => o.c.id !== c.id && !dangerRanks.has(o.c.rank) && !E.partnerProtection(t, seat, o.c));
        if (!safeAlt && Math.random() < 0.7) continue;
      }
      return { act: 'discard', card: c.id };
    }
  }
  // 4) تجاوز
  return { act: 'pass' };
}

/* زمن تفكير البوت (ميلي ثانية) — قابل للضبط عبر البيئة للاختبارات */
const _min = +(process.env.BOT_MIN || 700);
const _max = +(process.env.BOT_MAX || 1500);
const botDelay = () => rand(_min, _max);

module.exports = { BOT_NAMES, botAct, botDelay };
