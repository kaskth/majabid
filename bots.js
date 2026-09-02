'use strict';
/* ============================================================
   مجابيد — ذكاء البوتات وشخصيات الديوانية التفاعلية
   (الشيخ رمضان، صقر الدواسر، خالتي حصة، وزعماء المجالس)
   ============================================================ */
const E = require('./engine.js');

const BOT_PERSONALITIES = [
  {
    id: 'sheikh-ramadan',
    name: 'الشيخ رمضان',
    title: 'حكيم الطاولة',
    avatar: 'a6',
    traits: { riskTolerance: 0.25, jokerThreshold: 50 },
    quotes: {
      eat: [
        'كِل ولا تنكِل يا ولدي.. البركة بالصيدة 🌾',
        'الحمد لله، كنسة طيبة تسر الخاطر ☕',
        'العاقل يجمع بهدوء والقناعة كنز 👑',
      ],
      stop: [
        'وقّف عندك! الصقر ما يفوّت عشاه ⛔',
        'من تعجّل ندم.. والوقفة هذي في وقتها ⚖️',
        'لا ترمِ إلا وأنت صقر يا شاطر 🦅',
      ],
      joker: [
        'هذا الجوكر المبارك.. حان وقته! 🃏',
        'الجوكر لا طلع هابته المجالس 🌟',
      ],
      robbed: [
        'المال الحلال يرجع.. الأيام دُوَل يا رفاق 📜',
        'صحصح يا ولدي، الجايات أكثر بإذن الله 🤲',
      ],
      win: [
        'بيض الله وجوهكم جميعاً.. مجلس عامر بأهله 🏆',
      ],
    },
  },
  {
    id: 'qais-dawsari',
    name: 'صقر الدواسر',
    title: 'الشاب المندفع',
    avatar: 'a4',
    traits: { riskTolerance: 0.85, jokerThreshold: 30 },
    quotes: {
      eat: [
        'طارت طارت! ما تعدي وأنا صقر! 🔥',
        'جاكم الإعصار ما تدرون؟ هات الورق! 🌪️',
        'كنسة ملكية على أصولها! 😎',
      ],
      stop: [
        'وقّففففف! والله ما تاخذها وأنا حي! ⛔⚡',
        'صيدة الصقر ما تفلت أبد! 🦅💥',
        'جنّب وراك يا غالي.. هذي ملكي! 🎯',
      ],
      joker: [
        'جوكرررري نار وشرار! احرق الملعب! 🃏🔥',
        'والله ما خليت لكم ورقة! كش ملك! 👑',
      ],
      robbed: [
        'يا سارقها! والله لأردها لك مضاعفة! 😤',
        'أتحداك تعيدها يا ذيب.. الجولة ما انتهت! 💥',
      ],
      win: [
        'كفوووو يا الصقر! أنا بطل الميدان هذا المساء! 🏆🥇',
      ],
    },
  },
  {
    id: 'aunt-hessa',
    name: 'خالتي حصة',
    title: 'مريحة الجلسة',
    avatar: 'a3',
    traits: { riskTolerance: 0.5, jokerThreshold: 40 },
    quotes: {
      eat: [
        'يا عيني على الرواق.. هات الورق بالحنية ☕',
        'جلسة حلوة كحلّك.. وأكلة تفتح النفس 🌸',
        'يا رب تبارك وتزيد بكومتي 💖',
      ],
      stop: [
        'وقّف شوي يا بعد راسي.. هذي لي! ✋',
        'رويدك رويدك.. ترى العجلة ما فيها بركة 🛑',
        'يا حبيبي استريح.. الأكلة وصلت راعيتها 🌹',
      ],
      joker: [
        'الجوكر الذهبي زان المجلس بحضوره 🃏✨',
        'سمّوا بالرحمن يا جماعة الخير 🤲',
      ],
      robbed: [
        'وين رايح بورقتك يا ولدي؟ ما هقيتها منك! 😅',
        'معليه يا ولدي، اللعب فلة وسعة صدر 🍵',
      ],
      win: [
        'فزنا يا حبايب قلبي! تستاهلون القهوة والحلوى 🍰🏆',
      ],
    },
  },
  {
    id: 'abu-humaid',
    name: 'أبو حميد',
    title: 'المخضرم',
    avatar: 'a1',
    traits: { riskTolerance: 0.6, jokerThreshold: 45 },
    quotes: {
      eat: ['خذ عندك هالحسبة! 🎯', 'العب على الثقيل يا بطل 🎴'],
      stop: ['وقّف يا راعيها! ما تفوتني! ⛔', 'هات الأكلة وانتبه لدورك! 🛑'],
      joker: ['حضر الجوكر وارتفعت الراية! 🃏'],
      robbed: ['حلال عليك.. بس عينك على كومتك القادمة! 😉'],
      win: ['لعب رجال وأداء محترفين! 🏆'],
    },
  },
  {
    id: 'zaeema',
    name: 'زعيمة الملعب',
    title: 'الفارسة',
    avatar: 'a5',
    traits: { riskTolerance: 0.75, jokerThreshold: 35 },
    quotes: {
      eat: ['شيل وانظف الميدان! 🌪️', 'ولا كلمة.. الميدان يتكلم! ⚔️'],
      stop: ['وقّف! مكانك سر! ⛔', 'الأكلة هذي محجوزة من زمان! 🛡️'],
      joker: ['سيف الجوكر يقطع كل الأوراق! 🃏⚔️'],
      robbed: ['حسابك بيوصلك الحين! ⚡'],
      win: ['تاج البطولة ما يلبسه إلا أهله! 👑'],
    },
  },
];

const BOT_NAMES = BOT_PERSONALITIES.map((p) => ({
  id: p.id,
  name: p.name,
  avatar: p.avatar,
  personality: p,
}));

function rand(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function getBotQuote(personalityId, eventKind) {
  const p = BOT_PERSONALITIES.find((x) => x.id === personalityId) || BOT_PERSONALITIES[0];
  const list = p.quotes[eventKind] || p.quotes.eat || [];
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

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
function botAct(t, seat, personalityId) {
  const hand = t.hands[seat];
  const pers = BOT_PERSONALITIES.find((x) => x.id === personalityId) || BOT_PERSONALITIES[0];
  const traits = pers.traits || { riskTolerance: 0.5, jokerThreshold: 40 };

  const opps = t.mode === 'ffa'
    ? [0, 1, 2, 3].filter((x) => x !== seat)
    : E.opponentsOf(seat);

  // 1) نافذة «وقّف!» — الكمين
  if (t.phase === 'stop' && t.pending) {
    const p = t.pending;
    if (p.owner === seat) return { act: 'wait' };
    if (p.stops.includes(seat)) return { act: 'wait' };
    if (t.deck.length === 0 && E.nextSeat(p.owner) !== seat) return { act: 'wait' };

    const matchingRank = hand.find((c) => c.rank === p.rank);
    const jokerCard = hand.find((c) => c.joker);
    const card = matchingRank || (p.jokers > 0 || traits.riskTolerance > 0.6 ? jokerCard : null);
    if (!card) return { act: 'wait' };

    if (p.jokers > 0) return { act: 'stop', card: card.id, joker: card.joker };
    const gain = p.cards.reduce((a, c) => a + E.cardValue(c), 0);
    if (gain >= 20 && Math.random() < traits.riskTolerance) {
      return { act: 'stop', card: card.id, joker: card.joker };
    }
    if (gain >= 10 && Math.random() < (traits.riskTolerance * 0.4)) {
      return { act: 'stop', card: card.id, joker: card.joker };
    }
    return { act: 'wait' };
  }

  if (t.phase !== 'acting' || t.turn !== seat) return { act: 'wait' };

  // 2) الأكل أم الرمي؟
  const ranks = E.availableRanks(t, seat);
  const opts = E.myOptions(t, seat);
  const mustEat = opts.mustEat;

  let best = null;
  for (const c of hand) {
    const candidates = c.joker ? ranks : (ranks.includes(c.rank) ? [c.rank] : []);
    for (const r of candidates) {
      const v = visibleCaptureValue(t, seat, r);
      const cnt = t.field.filter((x) => x.rank === r).length +
        E.eatSources(t, seat).filter((s) => t.piles[s].chain && t.piles[s].chain.rank === r).length;
      const score = v + cnt * 2;
      if (!best || score > best.score) {
        best = { act: 'eat', card: c.id, rank: r, score, joker: c.joker };
      }
    }
  }

  if (best && best.joker && best.score < traits.jokerThreshold) best = null;

  const hungryEat = best && (best.score >= 20 || mustEat);
  if (hungryEat) {
    return { act: 'eat', card: best.card, rank: best.rank, joker: best.joker };
  }

  // 3) الرمي
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
        const safeAlt = cards.some(
          (o) => o.c.id !== c.id && !dangerRanks.has(o.c.rank) && !E.partnerProtection(t, seat, o.c)
        );
        if (!safeAlt && Math.random() < 0.7) continue;
      }
      return { act: 'discard', card: c.id };
    }
  }

  // 4) تجاوز
  return { act: 'pass' };
}

const _min = +(process.env.BOT_MIN || 600);
const _max = +(process.env.BOT_MAX || 1300);
const botDelay = () => rand(_min, _max);

module.exports = {
  BOT_PERSONALITIES,
  BOT_NAMES,
  botAct,
  botDelay,
  getBotQuote,
};
