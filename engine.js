'use strict';
/* ============================================================
   مجابيد — محرك قوانين اللعبة (Server-side pure logic)
   ------------------------------------------------------------
   المصدر: القواعد الرسمية للعبة (mjabid.com — 10 قوانين)
   424 ورقة = 8 طوابق كاملة (8×52) + 8 جوكر
   - الأكل: تنزل ورقة تطابق رقماً بالميدان أو قمة كومة خصم
     وتكنس بها كل المطابق دفعة واحدة (ميدان + سلاسل الخصوم).
   - وقّف (الكمين): بعد كل أكلة نافذة 5 ثوانٍ، من عنده نفس
     الرقم أو جوكر يصرخ «وقّف!» ويخطف الأكلة.
   - السرقة: أخذ كل المكشوف (الجبيد) + الجوكرات المدفونة،
     والمدفون المختلف يبقى لصاحبه.
   - الجوكر: ياكل أي رقم تختاره، فيتو لأي أكلة، لا يُرمى
     بالميدان أبداً، يُدفن دائماً ولا يكون الجبيد.
   - الحسبة المخفية: 10 نقاط للعشرة والصور والإكّة،
     50 للجوكر، والباقي صفر — تُكشف نهاية الجولة.
   ============================================================ */

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];
const COUNT_RANKS = new Set(['A', 'J', 'Q', 'K', '10']); // المشاريع: 10 نقاط
const JOKER_VALUE = 50;
const COUNT_VALUE = 10;

const nextSeat = (s) => (s + 1) % 4;
const teamOf = (s) => s % 2;                       // 0 و2 فريق أزرق ، 1 و3 فريق أحمر
const partnerOf = (s) => (s + 2) % 4;
const opponentsOf = (s) => [(s + 1) % 4, (s + 3) % 4];

let _cardId = 0;

function makeDeck() {
  const d = [];
  for (let k = 0; k < 8; k++)
    for (const r of RANKS)
      for (const s of SUITS)
        d.push({ id: 'c' + (++_cardId), rank: r, suit: s, joker: false });
  for (let j = 0; j < 8; j++)
    d.push({ id: 'j' + (++_cardId), rank: 'JK', suit: '★', joker: true });
  return d; // 8×52 + 8 = 424
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyPile() {
  return { chain: null, buried: [], jokers: 0 }; // buried: ورق مدفون (غير جوكر)، jokers: جوكرات مدفونة (غير مرئية)
}

function newGame(opts = {}) {
  const mode = opts.mode === 'ffa' ? 'ffa' : 'teams';
  const target = +opts.target || 0;
  return {
    opts, mode, target,
    dealer: 0, turn: 0, round: 0,
    deck: [], field: [],                        // field: قائمة أوراق الميدان
    hands: [[], [], [], []],
    piles: [emptyPile(), emptyPile(), emptyPile(), emptyPile()],
    pending: null,                              // أكلة معلّقة (نافذة وقّف)
    phase: 'idle',                              // 'acting' | 'stop' | 'end'
    passChain: [],
    session: mode === 'ffa' ? [0, 0, 0, 0] : [0, 0],   // نقاط الجلسة (مخفية أثناء اللعب)
    roundsWon: mode === 'ffa' ? [0, 0, 0, 0] : [0, 0],
    roundResult: null,
  };
}

/* إعادة ضبط المباراة (جلسة جديدة بنفس الإعدادات) */
function resetMatch(t) {
  t.session = t.mode === 'ffa' ? [0, 0, 0, 0] : [0, 0];
  t.roundsWon = t.mode === 'ffa' ? [0, 0, 0, 0] : [0, 0];
  t.roundResult = null;
}

/* ---------- التوزيع ---------- */
function deal(t) {
  t.deck = shuffle(makeDeck());
  t.field = [];
  // الميدان يفتح بـ 13 ورقة: وحدة من كل رتبة بلا جوكر
  for (const r of RANKS) {
    const i = t.deck.findIndex((c) => c.rank === r);
    t.field.push(t.deck.splice(i, 1)[0]);
  }
  t.hands = [[], [], [], []];
  t.piles = [emptyPile(), emptyPile(), emptyPile(), emptyPile()];
  t.pending = null;
  t.passChain = [];
  t.roundResult = null;
  const d = t.dealer;
  for (let s = 0; s < 4; s++) {
    const n = s === d ? 13 : 12;                // الموزّع 13 والباقي 12
    for (let i = 0; i < n; i++) t.hands[s].push(t.deck.pop());
  }
  t.round++;
  t.phase = 'acting';
  t.turn = d;
}

/* ---------- مساعدات ---------- */
const findCard = (hand, id) => hand.find((c) => c.id === id);

function fieldRanks(t) {
  const m = new Map();
  for (const c of t.field) m.set(c.rank, (m.get(c.rank) || 0) + 1);
  return m;
}

// المصادر التي يأكل منها اللاعب: خصماه + (شريكة في وضع الفرق)
function eatSources(t, seat) {
  if (t.mode === 'ffa') return [(seat + 1) % 4, (seat + 2) % 4, (seat + 3) % 4];
  return [...opponentsOf(seat), partnerOf(seat)];
}

function canEatAt(t, seat, rank) {
  if (t.field.some((c) => c.rank === rank)) return true;
  return eatSources(t, seat).some((s) => t.piles[s].chain && t.piles[s].chain.rank === rank);
}

function availableRanks(t, seat) {
  const set = new Set();
  for (const c of t.field) set.add(c.rank);
  for (const s of eatSources(t, seat)) {
    const ch = t.piles[s].chain;
    if (ch) set.add(ch.rank);
  }
  return [...set];
}

// كل أوراق اللاعب «تأكل»؟ ⇒ الأكل إجباري ولا يجوز الرمي
function mandateEat(t, seat) {
  const h = t.hands[seat];
  if (!h.length) return false;
  const ranks = availableRanks(t, seat);
  if (!ranks.length) return false;
  return h.every((c) => (c.joker ? true : ranks.includes(c.rank)));
}

// حماية الشريكة: لا ترمِ ورقة تكشف جبيد كومة شريكتك ما دام عندك بديل
// (وضع الفرق فقط — في الفردي لا توجد شريكة)
function partnerProtection(t, seat, card) {
  if (t.mode === 'ffa') return false;
  if (card.joker) return true; // الجوكر لا يُرمى أصلاً
  const ps = partnerOf(seat);
  const ch = t.piles[ps].chain;
  if (!ch || ch.rank !== card.rank) return false;
  // بديل موجود؟ (ورقة أخرى تُرمى أو أي أكلة ممكنة)
  const altDiscard = t.hands[seat].some((c2) => c2.id !== card.id && !c2.joker && (t.piles[ps].chain ? t.piles[ps].chain.rank !== c2.rank : true));
  const altEat = t.hands[seat].some((c2) => (c2.joker ? availableRanks(t, seat).length > 0 : canEatAt(t, seat, c2.rank)));
  return altDiscard || altEat;
}

/* ---------- الأكل (يشمل السرقة من قمم الكومات) ---------- */
function eat(t, seat, cardId, chosenRank) {
  if (t.phase !== 'acting' || t.turn !== seat)
    return { ok: false, err: 'ليس دورك' };
  const card = findCard(t.hands[seat], cardId);
  if (!card) return { ok: false, err: 'الورقة غير موجودة' };
  let rank;
  if (card.joker) {
    // الجوكر يأكل أي رقم تختاره — ويُدفن معه دائماً
    rank = chosenRank;
    if (!rank || !availableRanks(t, seat).includes(rank))
      return { ok: false, err: 'اختر رقماً يمكن أكله' };
  } else {
    rank = card.rank;
  }
  if (!canEatAt(t, seat, rank))
    return { ok: false, err: 'لا يوجد ما يطابق هذا الرقم' };

  // كنْس كل المطابق دفعة واحدة: الميدان + قمم كومات الخصوم (والشريكة)
  const gotCards = [];
  let gotJokers = 0;
  const victims = [];
  const fieldN = t.field.filter((c) => c.rank === rank).length;
  if (fieldN) {
    const keep = [];
    for (const c of t.field) (c.rank === rank ? gotCards.push(c) : keep.push(c));
    t.field = keep;
  }
  for (const s of eatSources(t, seat)) {
    const p = t.piles[s];
    if (p.chain && p.chain.rank === rank) {
      gotCards.push(...p.chain.cards);
      gotJokers += p.chain.jokers + p.jokers;   // الجوكرات المدفونة في الكومة تذهب مع الأكلة
      p.chain = null;
      p.jokers = 0;                             // المدفون المختلف (غير الجوكر) يبقى لصاحبه
      victims.push(s);
    }
  }
  // الورقة الملعوبة تنضم للكنس
  t.hands[seat] = t.hands[seat].filter((c) => c.id !== cardId);
  if (card.joker) gotJokers++; else gotCards.push(card);

  t.pending = { owner: seat, rank, cards: gotCards, jokers: gotJokers, stops: [] };
  t.phase = 'stop';
  t.passChain = [];
  return {
    ok: true,
    event: {
      kind: card.joker ? 'jokerEat' : 'eat',
      seat, rank, count: gotCards.length + gotJokers, jokers: gotJokers,
      victims, fieldN, cardId, cardJoker: card.joker,
    },
  };
}

/* ---------- وقّف! (الكمين) ---------- */
function canStop(t, seat) {
  if (t.phase !== 'stop' || !t.pending) return false;
  if (seat === t.pending.owner || t.pending.stops.includes(seat)) return false;
  if (t.deck.length === 0 && seat !== nextSeat(t.pending.owner)) return false; // الطور الختامي: اللاعب التالي فقط
  // يشترط توفر الورقة المطلوبة في يده (نفس الرقم أو جوكر)
  return t.hands[seat].some((c) => c.joker || c.rank === t.pending.rank);
}

function stop(t, seat, cardId) {
  if (!canStop(t, seat)) return { ok: false, err: 'لا يمكنك الوقوف الآن' };
  const card = findCard(t.hands[seat], cardId);
  if (!card) return { ok: false, err: 'الورقة غير موجودة' };
  if (!card.joker && card.rank !== t.pending.rank)
    return { ok: false, err: 'تحتاج نفس الرقم أو جوكر' };
  t.hands[seat] = t.hands[seat].filter((c) => c.id !== cardId);
  if (card.joker) t.pending.jokers++; else t.pending.cards.push(card);
  const prevOwner = t.pending.owner;
  t.pending.owner = seat;
  t.pending.stops.push(seat);
  return {
    ok: true,
    event: {
      kind: card.joker ? 'jokerStop' : 'stop',
      seat, rank: t.pending.rank, joker: card.joker, cardId,
      count: t.pending.cards.length + t.pending.jokers,
      prevOwner,
    },
  };
}

/* ---------- تثبيت الأكلة عند صاحبها ---------- */
function applyPending(t) {
  const p = t.pending;
  const pile = t.piles[p.owner];
  if (pile.chain) {
    pile.buried.push(...pile.chain.cards);
    pile.jokers += pile.chain.jokers;
  }
  pile.chain = { rank: p.rank, cards: p.cards, jokers: p.jokers };
  t.pending = null;
  t.phase = 'acting';
  return p.owner;
}

/* ---------- الرمي للميدان ---------- */
function discard(t, seat, cardId) {
  if (t.phase !== 'acting' || t.turn !== seat)
    return { ok: false, err: 'ليس دورك' };
  const card = findCard(t.hands[seat], cardId);
  if (!card) return { ok: false, err: 'الورقة غير موجودة' };
  if (card.joker) return { ok: false, err: 'الجوكر لا يُرمى بالميدان أبداً' };
  if (mandateEat(t, seat))
    return { ok: false, err: 'كل أوراقك تأكل — الأكل إجباري' };
  if (partnerProtection(t, seat, card))
    return { ok: false, err: 'ممنوع كشف جبيد كومة شريكتك وعندك بديل' };
  t.hands[seat] = t.hands[seat].filter((c) => c.id !== cardId);
  t.field.push(card);
  t.passChain = [];
  return { ok: true, event: { kind: 'discard', seat, rank: card.rank, cardId } };
}

/* ---------- قلب ورقة من الرزمة (الجوكر لا ينقلب أبداً) ---------- */
function popFlip(t) {
  const jokers = [];
  let flipped = null;
  while (t.deck.length && !flipped) {
    const c = t.deck.pop();
    if (c.joker) jokers.push(c);
    else flipped = c;
  }
  for (const j of jokers) t.deck.push(j); // الجوكرات تبقى بالرزمة لكن لا تُقلب
  return flipped;
}

/* ---------- تجاوز ---------- */
function pass(t, seat) {
  if (t.phase !== 'acting' || t.turn !== seat)
    return { ok: false, err: 'ليس دورك' };
  t.passChain.push(seat);
  if (t.passChain.length < 4)
    return { ok: true, event: { kind: 'pass', seat } };
  // وقف الجميع (دور على الأربعة وما عند أحد حركة): تنقلب ورقة
  t.passChain = [];
  const flipped = popFlip(t);
  if (!flipped) {
    // الرزمة خالية أصلاً (أو بلا ورق قابل للقلب) — تنتهي الجولة
    const r = endRound(t);
    return { ok: true, roundEnded: true, res: r };
  }
  t.field.push(flipped);
  return {
    ok: true,
    flipped: true,
    event: { kind: 'flip', seat, rank: flipped.rank },
  };
}

/* ---------- إدارة الدور ---------- */
function refill(t, seat, upTo = 13) {
  while (t.hands[seat].length < upTo && t.deck.length) t.hands[seat].push(t.deck.pop());
}

function turnStart(t) {
  let seat = t.turn;
  const skipped = [];
  let guard = 8;
  while (guard--) {
    refill(t, seat);
    if (t.hands[seat].length === 0) {
      // اليد فاضية — ينتقز تلقائياً
      skipped.push(seat);
      seat = nextSeat(seat);
      continue;
    }
    break;
  }
  t.turn = seat;
  t.phase = 'acting';
  return { seat, skipped };
}

function endTurn(t, seat) {
  t.turn = nextSeat(seat);
  return turnStart(t);
}

/* ---------- نهاية الجولة: الحسبة المخفية تنكشف ---------- */
function countPile(pile) {
  let n = 0, j = 0;
  for (const c of pile.buried) n += COUNT_RANKS.has(c.rank) ? 1 : 0;
  if (pile.chain) {
    for (const c of pile.chain.cards) n += COUNT_RANKS.has(c.rank) ? 1 : 0;
    j += pile.chain.jokers;
  }
  j += pile.jokers;
  return { n, j, total: n * COUNT_VALUE + j * JOKER_VALUE };
}

function endRound(t) {
  const scores = t.piles.map((p) => {
    const r = countPile(p);
    return { ...r };
  });
  let winnerTeam = -1, winnerSeat = -1, teams = null;
  if (t.mode === 'ffa') {
    // كل واحد لنفسه: نقاط كل لاعب على حدة
    for (let i = 0; i < 4; i++) t.session[i] += scores[i].total;
    const totals = scores.map((s) => s.total);
    const max = Math.max(...totals);
    const winners = totals.filter((x) => x === max).length;
    if (winners === 1) { winnerSeat = totals.indexOf(max); t.roundsWon[winnerSeat]++; }
  } else {
    teams = [scores[0].total + scores[2].total, scores[1].total + scores[3].total];
    t.session[0] += teams[0];
    t.session[1] += teams[1];
    if (teams[0] !== teams[1]) {
      winnerTeam = teams[0] > teams[1] ? 0 : 1;
      t.roundsWon[winnerTeam]++;
    }
  }
  // هدف النقاط: هل انتهت المباراة؟
  const matchOver = t.target > 0 && Math.max(...t.session) >= t.target;
  t.roundResult = {
    mode: t.mode, target: t.target, matchOver,
    scores, teams, winnerTeam, winnerSeat,
    session: [...t.session], roundsWon: [...t.roundsWon],
  };
  t.phase = 'end';
  return t.roundResult;
}

/* ---------- خيارات اللاعب (تُرسل للواجهة) ---------- */
function myOptions(t, seat) {
  const out = { cards: {}, discard: false, pass: true, mustEat: false };
  if (t.phase !== 'acting' || t.turn !== seat) return out;
  const ranks = availableRanks(t, seat);
  out.mustEat = mandateEat(t, seat);
  for (const c of t.hands[seat]) {
    const eats = c.joker ? [...ranks] : (ranks.includes(c.rank) ? [c.rank] : []);
    let okDiscard = false;
    if (!c.joker && !out.mustEat && !partnerProtection(t, seat, c)) okDiscard = true;
    out.cards[c.id] = { eats, discard: okDiscard };
    if (okDiscard) out.discard = true;
  }
  return out;
}

function cardValue(c) { return c.joker ? JOKER_VALUE : COUNT_RANKS.has(c.rank) ? COUNT_VALUE : 0; }

module.exports = {
  RANKS, SUITS, COUNT_RANKS, JOKER_VALUE, COUNT_VALUE,
  makeDeck, shuffle, newGame, resetMatch, deal, nextSeat, teamOf, partnerOf, opponentsOf,
  eatSources, availableRanks, canEatAt, mandateEat, partnerProtection,
  eat, stop, canStop, applyPending, discard, pass, turnStart, endTurn,
  refill, endRound, myOptions, countPile, cardValue,
};
