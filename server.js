'use strict';
/* ============================================================
   مجابيد — الخادم (Online Multiplayer 2×2)
   Node.js + ws : غرف، مقاعد، مؤقتات، بوتات، بث الحالة
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const E = require('./engine.js');
const B = require('./bots.js');
const USERS = require('./users.js');

const PORT = process.env.PORT || 3005;
const TURN_MS = +(process.env.TURN_MS || 20000);        // 20 ثانية للدور
const STOP_MS = +(process.env.STOP_MS || 5000);         // نافذة «وقّف!» 5 ثوانٍ
const FINAL_STOP_MS = +(process.env.FINAL_STOP_MS || 4000); // نافذة الطور الختامي

const NUXT_DIR = path.join(__dirname, '.output', 'public');
const PUBLIC_DIR = fs.existsSync(NUXT_DIR) ? NUXT_DIR : path.join(__dirname, 'public');
const FALLBACK_PUBLIC = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';

  let file = path.normalize(path.join(PUBLIC_DIR, p));
  if (!fs.existsSync(file)) {
    // Check fallback public (e.g. avatars)
    const fallbackFile = path.normalize(path.join(FALLBACK_PUBLIC, p));
    if (fs.existsSync(fallbackFile)) {
      file = fallbackFile;
    } else {
      // SPA Fallback to index.html for client-side routing
      const indexFile = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexFile)) {
        file = indexFile;
      }
    }
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

/* ---------- الغرف ---------- */
const ROOMS = new Map();
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const AVATARS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];
let botIdx = 0;

const genCode = () => {
  let c = '';
  do c = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  while (ROOMS.has(c));
  return c;
};

function mkPlayer(pid, name, avatar, isBot = false, personalityId = null) {
  // control: 'human' | 'bot' — من يحرّك المقعد حقيقةً (بعد الانقطاع يكمّل البوت)
  return {
    pid, name, avatar, isBot, personalityId,
    control: isBot ? 'bot' : 'human',
    connected: false, ws: null, lastSeq: 0, lastBubble: null
  };
}

function mkBotSeat() {
  const p = B.BOT_PERSONALITIES[botIdx++ % B.BOT_PERSONALITIES.length];
  return mkPlayer('bot-' + crypto.randomBytes(4).toString('hex'), p.name, p.avatar, true, p.id);
}

function findFreeSeat(room) {
  for (let i = 0; i < 4; i++) if (!room.seats[i]) return i;
  return -1;
}

function createRoom(hostPid, name, avatar) {
  const code = genCode();
  const room = {
    code, phase: 'lobby', seats: emptySeats(),
    specs: [],                 // المشاهدون (بث الجلسات)
    config: { mode: 'teams', target: 0, theme: 1 },
    game: null, events: [], nextEvSeq: 1,
    stopDeadline: null, actionDeadline: null,
    windowId: 0, finalSteal: null, t0: Date.now(),
    matchOver: false,
  };
  room.seats[0] = mkPlayer(hostPid, name, avatar);
  ROOMS.set(code, room);
  return room;
}

const emptySeats = () => [null, null, null, null];
const seatName = (room, s) => room?.seats[s]?.name || `لاعب ${s + 1}`;

/* حدث مهيكل {kind, seat, rank, ...} — النص يتولّد تلقائياً */
function formatEvent(room, ev) {
  const n = seatName(room, ev.seat);
  switch (ev.kind) {
    case 'eat':
      return `${n} كنس ${ev.rank} (${ev.count} ورقات${ev.jokers ? ` + ${ev.jokers} جوكر 🃏` : ''})${ev.victims && ev.victims.length ? ' من الكومات' : ''}`;
    case 'jokerEat': return `🃏 ${n} لعب جوكر وأكل ${ev.rank} — دفنه مع الأكلة!`;
    case 'stop': return `⛔ ${n} صرخ «وقّف!» وخطف ${ev.rank}!`;
    case 'jokerStop': return `⛔ 🃏 ${n} صرخ «وقّف!» بجوكر وخطف الأكلة!`;
    case 'discard': return `${n} رمى ${ev.rank} للميدان`;
    case 'pass': return `${n} تجاوز`;
    case 'flip': return `الكل وقف — انقلبت ${ev.rank} للميدان`;
    case 'skip': return `${n} يده فاضية — انتقز`;
    default: return ev.text || '';
  }
}

function logEvent(room, ev) {
  const e = typeof ev === 'string' ? { kind: 'sys', text: ev } : { ...ev };
  if (!e.text) e.text = formatEvent(room, e);
  e.seq = room.nextEvSeq++;
  room.events.push(e);
  if (room.events.length > 150) room.events.splice(0, room.events.length - 150);
}

/* ---------- الحالة المعروضة (كل ما هو مخفي يبقى مخفياً) ---------- */
function viewFor(room, seat) {
  const g = room.game;
  const isSpec = seat == null || seat < 0;
  return {
    now: Date.now(), // معايرة ساعة العميل
    room: room.code, phase: room.phase, seat: isSpec ? -1 : seat,
    isSpec, mode: g.mode, target: g.target, theme: room.config.theme,
    matchOver: room.matchOver, specs: room.specs.length,
    round: g.round, dealer: g.dealer,
    isFinal: g.deck.length === 0, deckCount: g.deck.length,
    seats: room.seats.map((s, i) => s ? {
      i, name: s.name, avatar: s.avatar, isBot: s.isBot, bot: s.control === 'bot', team: i % 2,
      bubble: s.lastBubble && (Date.now() - s.lastBubble.at < 5000) ? s.lastBubble : null,
      connected: s.connected,
      rank: (() => { const u = USERS.getByPid(s.pid); return u ? USERS.rankOf(u.pts || 0).cur.emblem : ''; })(),
    } : null),
    field: g.field.map((c) => ({ r: c.rank, s: c.suit })),
    piles: g.piles.map((p) => ({
      chain: p.chain ? {
        rank: p.chain.rank,
        count: p.chain.cards.length,
        jokers: p.chain.jokers,
        suit: p.chain.cards[p.chain.cards.length - 1]?.suit || '♠',
      } : null,
      buriedCount: p.buried.length + p.jokers,
    })),
    handCounts: g.hands.map((h) => h.length),
    turn: g.turn, phase: g.phase,
    deadline: g.phase === 'stop' ? room.stopDeadline : room.actionDeadline,
    myHand: !isSpec ? g.hands[seat].map((c) => ({ id: c.id, r: c.rank, s: c.suit, j: c.joker })) : [],
    myOptions: isSpec ? { cards: {}, discard: false, pass: false, mustEat: false } : E.myOptions(g, seat),
    canStop: !isSpec ? E.canStop(g, seat) : false,
    pending: g.pending ? {
      owner: g.pending.owner,
      rank: g.pending.rank,
      count: g.pending.cards.length,
      stops: g.pending.stops,
      suit: g.pending.cards[g.pending.cards.length - 1]?.suit || '♥',
      hasJoker: g.pending.jokers > 0,
    } : null,
    result: g.phase === 'end' ? g.roundResult : null,
  };
}

function pushState(ws, room, seat) {
  send(ws, { type: 'state', s: viewFor(room, seat), events: [] });
}

function broadcast(room) {
  const g = room.game;
  if (!g) return;
  for (let i = 0; i < 4; i++) {
    const s = room.seats[i];
    if (!s || s.isBot || !s.connected || !s.ws || s.ws.readyState !== 1) continue;
    const events = room.events.filter((e) => e.seq > s.lastSeq);
    s.lastSeq = room.nextEvSeq - 1;
    send(s.ws, { type: 'state', s: viewFor(room, i), events });
  }
  // المشاهدون
  for (let i = room.specs.length - 1; i >= 0; i--) {
    const spec = room.specs[i];
    if (!spec.ws || spec.ws.readyState !== 1) { room.specs.splice(i, 1); continue; }
    const events = room.events.filter((e) => e.seq > spec.lastSeq);
    spec.lastSeq = room.nextEvSeq - 1;
    send(spec.ws, { type: 'state', s: viewFor(room, -1), events });
  }
}

function send(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch (e) { } }

/* ---------- الجدولة ---------- */
const tasks = [];
const schedule = (at, fn) => tasks.push({ at, fn });

function setTurnDeadline(room) {
  const g = room.game;
  if (!g || g.phase !== 'acting') { room.actionDeadline = null; return; }
  const s = room.seats[g.turn];
  room.actionDeadline = s && s.control === 'human' ? Date.now() + TURN_MS : null;
}

function scheduleBotMove(room) {
  const g = room.game;
  if (!g || g.phase !== 'acting') return;
  const p = room.seats[g.turn];
  if (p && p.control === 'bot') schedule(Date.now() + B.botDelay(), () => botTurnMove(room, g.turn));
}

function openStopWindow(room, ms) {
  const g = room.game;
  room.windowId++;
  const wid = room.windowId;
  room.stopDeadline = Date.now() + ms;
  for (let s = 0; s < 4; s++) {
    const p = room.seats[s];
    if (p && p.control === 'bot' && E.canStop(g, s))
      schedule(Date.now() + B.botDelay(), () => botStopDecision(room, s, wid));
  }
  schedule(room.stopDeadline, () => resolveStopWindow(room, wid));
}

function resolveStopWindow(room, wid) {
  const g = room.game;
  if (!g || g.phase !== 'stop' || !g.pending || wid !== room.windowId) return; // نافذة قديمة
  const owner = g.pending.owner;
  const stolen = room.finalSteal && owner !== room.finalSteal.eater;
  E.applyPending(g);
  room.finalSteal = null;
  room.stopDeadline = null;
  if (stolen) {
    g.turn = E.nextSeat(owner);           // الخاطف ما يلعب
    const st = E.turnStart(g);
    for (const s of st.skipped) logEvent(room, { kind: 'skip', seat: s });
  } else {
    g.turn = owner;                        // آخر من استقرت عنده الأكلة يواصل دوره حتى يرمي
  }
  autoPassIfEmpty(room);
  setTurnDeadline(room);
  scheduleBotMove(room);
  broadcast(room);
}

/* اليد الفاضية تنتقز تلقائياً */
function autoPassIfEmpty(room) {
  const g = room.game;
  let guard = 8;
  while (g.phase === 'acting' && g.hands[g.turn].length === 0 && guard--) {
    const r = E.pass(g, g.turn);
    if (r.roundEnded) { endRound(room); return; }
    logEvent(room, { kind: 'skip', seat: g.turn });
    E.endTurn(g, g.turn);
  }
}

/* ---------- حركات البوت ---------- */
function botTurnMove(room, s) {
  const g = room.game;
  if (!g || g.phase !== 'acting' || g.turn !== s) return;
  const slot = room.seats[s];
  const persId = slot ? slot.personalityId : null;
  const d = B.botAct(g, s, persId);
  let r = d.act === 'eat' ? E.eat(g, s, d.card, d.rank)
    : d.act === 'discard' ? E.discard(g, s, d.card)
    : E.pass(g, s);
  if (!r.ok) r = E.pass(g, s);

  // Trigger speech bubble for bot
  if (r.ok && slot) {
    if (d.act === 'eat') {
      const q = B.getBotQuote(persId, d.joker ? 'joker' : 'eat');
      if (q && Math.random() < 0.8) slot.lastBubble = { text: q, at: Date.now() };
    }
    // Check if any victims were robbed
    if (r.event && r.event.victims && r.event.victims.length) {
      for (const vicSeat of r.event.victims) {
        const vicSlot = room.seats[vicSeat];
        if (vicSlot && vicSlot.control === 'bot') {
          const vq = B.getBotQuote(vicSlot.personalityId, 'robbed');
          if (vq && Math.random() < 0.75) vicSlot.lastBubble = { text: vq, at: Date.now() };
        }
      }
    }
  }

  handlePlayResult(room, s, r);
}

function botStopDecision(room, s, wid) {
  const g = room.game;
  if (!g || g.phase !== 'stop' || !g.pending || wid !== room.windowId) return;
  if (!E.canStop(g, s)) return;
  const slot = room.seats[s];
  const persId = slot ? slot.personalityId : null;
  const d = B.botAct(g, s, persId);
  if (d.act !== 'stop') return;
  const r = E.stop(g, s, d.card);
  if (!r.ok) return;

  if (slot) {
    const q = B.getBotQuote(persId, d.joker ? 'joker' : 'stop');
    if (q) slot.lastBubble = { text: q, at: Date.now() };
  }

  if (r.event) logEvent(room, r.event);
  if (g.deck.length === 0) {
    resolveStopWindow(room, room.windowId); // تحسم فوراً في الطور الختامي
    return;
  }
  openStopWindow(room, STOP_MS);            // إعادة عدّ النافذة
  broadcast(room);
}

/* ---------- نتيجة حركة ---------- */
function handlePlayResult(room, seat, r) {
  const g = room.game;
  if (!r.ok) return;
  if (r.event) logEvent(room, r.event);
  if (r.roundEnded || g.phase === 'end') { endRound(room); return; }
  if (g.phase === 'stop' && g.pending) {
    room.finalSteal = g.deck.length === 0 ? { eater: g.pending.owner } : null;
    openStopWindow(room, g.deck.length === 0 ? FINAL_STOP_MS : STOP_MS);
    broadcast(room);
    return;
  }
  // رمية / تجاوز / قلب — الدور ينتقل
  const st = E.endTurn(g, seat);
  for (const s of st.skipped) logEvent(room, { kind: 'skip', seat: s });
  autoPassIfEmpty(room);
  setTurnDeadline(room);
  scheduleBotMove(room);
  broadcast(room);
}

/* منح النقاط التنافسية لأصحاب الحسابات عند نهاية الجولة/المباراة */
function awardRound(room, res) {
  const g = room.game;
  const deltas = [0, 0, 0, 0];
  let winSeats = [];
  if (g.mode === 'ffa') {
    const order = [0, 1, 2, 3].sort((a, b) => res.scores[b].total - res.scores[a].total);
    const pts = [18, 0, -6, -12];
    order.forEach((s, i) => (deltas[s] = pts[i]));
    winSeats = [order[0]];
  } else if (res.winnerTeam >= 0) {
    for (let s = 0; s < 4; s++) deltas[s] = s % 2 === res.winnerTeam ? 12 : -6;
    winSeats = [res.winnerTeam, res.winnerTeam + 2];
  }
  if (res.matchOver) {
    if (g.mode === 'ffa') {
      const champ = res.session.indexOf(Math.max(...res.session));
      deltas[champ] += 40;
      winSeats = [champ];
    } else {
      const wt = res.session[0] >= res.session[1] ? 0 : 1;
      deltas[wt] += 40; deltas[wt + 2] += 40;
      winSeats = [wt, wt + 2];
    }
  }
  for (let s = 0; s < 4; s++) {
    const slot = room.seats[s];
    if (!slot || slot.isBot) continue;
    const u = USERS.getByPid(slot.pid);
    if (!u) continue;
    USERS.apply(u.username, (x) => {
      x.pts = Math.max(0, (x.pts || 0) + deltas[s]);
      x.matches = (x.matches || 0) + 1;
      if (winSeats.includes(s)) x.wins = (x.wins || 0) + 1;
      x.best = Math.max(x.best || 0, res.scores[s].total);
      x.games = x.games || [];
      x.games.unshift(`${res.winnerSeat === s || (res.winnerTeam >= 0 && s % 2 === res.winnerTeam) ? '🏆' : '🎴'} جولة ${g.round} · ${res.scores[s].total} نقطة${res.matchOver ? ' · نهاية مباراة' : ''}`);
      x.games = x.games.slice(0, 5);
    });
  }
  res.deltas = deltas;
  return deltas;
}

function endRound(room) {
  const g = room.game;
  const res = E.endRound(g);
  awardRound(room, res);
  let txt;
  if (g.mode === 'ffa') {
    txt = res.winnerSeat >= 0
      ? `🏆 نهاية الجولة: ${seatName(room, res.winnerSeat)} الفائز (${res.scores[res.winnerSeat].total} نقطة)`
      : '🤝 نهاية الجولة: تعادل بين اللاعبين';
  } else {
    txt = res.winnerTeam >= 0
      ? `🏆 نهاية الجولة: فاز فريق ${res.winnerTeam === 0 ? 'الأزرق 🔵' : 'الأحمر 🔴'} (${res.teams[0]} : ${res.teams[1]})`
      : '🤝 نهاية الجولة: تعادل';
  }
  logEvent(room, { kind: 'end', text: txt });
  if (res.matchOver) {
    room.matchOver = true;
    let champ;
    if (g.mode === 'ffa') {
      const best = res.session.indexOf(Math.max(...res.session));
      champ = seatName(room, best);
    } else {
      const best = res.session[0] >= res.session[1] ? 0 : 1;
      champ = best === 0 ? 'الفريق الأزرق 🔵' : 'الفريق الأحمر 🔴';
    }
    logEvent(room, { kind: 'sys', text: `👑 انتهت المباراة! البطل: ${champ} (بلغ ${g.target} نقطة)` });
  }
  room.stopDeadline = null; room.actionDeadline = null;
  broadcast(room);
}

function nextRound(room) {
  const g = room.game;
  g.dealer = E.nextSeat(g.dealer);
  E.deal(g);
  room.finalSteal = null; room.stopDeadline = null; room.actionDeadline = null;
  logEvent(room, { kind: 'sys', text: `🎬 بدأت الجولة ${g.round} — الموزّع: ${seatName(room, g.dealer)}` });
  setTurnDeadline(room);
  scheduleBotMove(room);
  broadcast(room);
}

/* ---------- الاتصالات ---------- */
wss.on('connection', (ws) => {
  const client = { ws, pid: null, name: 'ضيف', avatar: AVATARS[0], roomCode: null, seat: -1 };

  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw.toString()); } catch { return; }

    if (m.type === 'identify') {
      // هل هذا توكن حساب حقيقي؟ (حسابات فعلية + جلسات محفوظة)
      const acct = USERS.byToken(m.pid);
      if (acct) {
        client.pid = acct.id;
        client.username = acct.username;
        client.name = acct.name;
        client.avatar = acct.avatar;
        send(ws, { type: 'identity', pid: client.pid, avatars: AVATARS, account: USERS.pubFull(acct) });
      } else {
        client.pid = (typeof m.pid === 'string' && m.pid && m.pid.length <= 64) ? m.pid : crypto.randomBytes(12).toString('hex');
        client.name = (typeof m.name === 'string' && m.name.trim() ? m.name.trim() : 'ضيف').slice(0, 16);
        client.avatar = typeof m.avatar === 'string' && m.avatar ? m.avatar.slice(0, 4) : AVATARS[0];
        send(ws, { type: 'identity', pid: client.pid, avatars: AVATARS });
      }

      // إعادة اتصال كمتفرج سابق
      for (const room of ROOMS.values()) {
        const si = room.specs.findIndex((sp) => sp.pid === client.pid);
        if (si >= 0) {
          room.specs[si].ws = ws;
          client.roomCode = room.code; client.seat = -1; client.isSpec = true;
          send(ws, { type: 'watched', code: room.code });
          pushState(ws, room, -1);
          return;
        }
      }
      // إعادة اتصال: استرجاع المقعد
      for (const room of ROOMS.values()) {
        const idx = room.seats.findIndex((s) => s && s.pid === client.pid);
        if (idx >= 0) {
          const slot = room.seats[idx];
          slot.connected = true; slot.ws = ws; slot.control = 'human';
          slot.name = client.name; slot.avatar = client.avatar;
          client.roomCode = room.code; client.seat = idx;
          send(ws, { type: 'joined', code: room.code, seat: idx });
          if (room.phase === 'playing' && room.game) {
            setTurnDeadline(room); scheduleBotMove(room);
            broadcast(room);
          } else lobbyBroadcast(room);
          return;
        }
      }
      return;
    }

    if (m.type === 'register') {
      const r = USERS.register(m.username, m.password, (m.name || client.name).trim() || m.username, m.avatar || client.avatar);
      if (!r.ok) return send(ws, { type: 'auth', ok: false, err: r.err });
      client.pid = r.user.username; // سيتحول التوكن بعد إعادة التعريف
      send(ws, { type: 'auth', ok: true, token: r.token, user: r.user });
      return;
    }

    if (m.type === 'login') {
      const r = USERS.login(m.username, m.password);
      if (!r.ok) return send(ws, { type: 'auth', ok: false, err: r.err });
      send(ws, { type: 'auth', ok: true, token: r.token, user: r.user });
      return;
    }

    if (m.type === 'logout') {
      USERS.logout(m.token);
      send(ws, { type: 'auth', ok: false, err: '', loggedOut: true });
      return;
    }

    if (m.type === 'profile') {
      const u = client.username ? USERS.getByPid(client.pid) : null;
      if (!u) return;
      send(ws, { type: 'profile', account: USERS.pubFull(u) });
      return;
    }

    if (m.type === 'leaderboard') {
      send(ws, { type: 'leaderboard', list: USERS.leaderboard(10), my: client.username ? USERS.getByPid(client.pid) ? USERS.pubFull(USERS.getByPid(client.pid)) : null : null });
      return;
    }

    if (m.type === 'create') {
      if (client.roomCode) return;
      if (ROOMS.size > 500) return send(ws, { type: 'error', msg: 'الخوادم ممتلئة — حاول لاحقاً' });
      const room = createRoom(client.pid, client.name, client.avatar);
      const slot = room.seats[0];
      slot.ws = ws; slot.connected = true; slot.lastSeq = 0;
      client.roomCode = room.code; client.seat = 0;
      send(ws, { type: 'joined', code: room.code, seat: 0 });
      lobbyBroadcast(room);
      return;
    }

    if (m.type === 'join') {
      if (client.roomCode) return;
      const room = ROOMS.get(String(m.code || '').toUpperCase());
      if (!room) return send(ws, { type: 'error', msg: 'لا توجد طاولة بهذا الكود' });
      if (room.phase !== 'lobby') return send(ws, { type: 'error', msg: 'الطاولة بدأت بالفعل' });
      const idx = findFreeSeat(room);
      if (idx < 0) return send(ws, { type: 'error', msg: 'الطاولة ممتلئة' });
      const slot = mkPlayer(client.pid, client.name, client.avatar);
      slot.ws = ws; slot.connected = true;
      room.seats[idx] = slot;
      client.roomCode = room.code; client.seat = idx;
      send(ws, { type: 'joined', code: room.code, seat: idx });
      lobbyBroadcast(room);
      return;
    }

    if (m.type === 'quick') {
      if (client.roomCode) return;
      let room = [...ROOMS.values()].find((r) => r.phase === 'lobby' && findFreeSeat(r) >= 0);
      if (!room) room = createRoom(client.pid, client.name, client.avatar);
      const idx = findFreeSeat(room);
      const slot = mkPlayer(client.pid, client.name, client.avatar);
      slot.ws = ws; slot.connected = true;
      room.seats[idx] = slot;
      client.roomCode = room.code; client.seat = idx;
      send(ws, { type: 'joined', code: room.code, seat: idx });
      lobbyBroadcast(room);
      return;
    }

    if (m.type === 'seat') {
      const room = ROOMS.get(client.roomCode);
      if (!room || room.phase !== 'lobby') return;
      if (!Number.isInteger(m.idx) || m.idx < 0 || m.idx > 3) return;
      const occ = room.seats[m.idx];
      if (occ && occ.pid !== client.pid) return send(ws, { type: 'error', msg: 'المقعد مشغول' });
      const cur = room.seats.findIndex((s) => s && s.pid === client.pid);
      if (cur >= 0) {
        if (cur === m.idx) return;
        room.seats[m.idx] = room.seats[cur];
        room.seats[cur] = null;
      } else {
        const slot = mkPlayer(client.pid, client.name, client.avatar);
        slot.ws = ws; slot.connected = true;
        room.seats[m.idx] = slot;
      }
      client.seat = m.idx;
      lobbyBroadcast(room);
      return;
    }

    if (m.type === 'start') {
      const room = ROOMS.get(client.roomCode);
      if (!room || room.phase !== 'lobby') return;
      for (let i = 0; i < 4; i++) if (!room.seats[i]) room.seats[i] = mkBotSeat();
      room.phase = 'playing';
      room.matchOver = false;
      room.game = E.newGame({ mode: room.config.mode, target: room.config.target });
      E.deal(room.game);
      room.finalSteal = null; room.stopDeadline = null; room.actionDeadline = null;
      for (const s of room.seats) if (s) s.lastSeq = 0;
      logEvent(room, { kind: 'sys', text: `🎬 بدأت الجولة ${room.game.round} — ${room.game.mode === 'ffa' ? 'فردي 🎯 (كل واحد لنفسه)' : 'جماعي 2×2 🤝'} — الموزّع: ${seatName(room, room.game.dealer)}${room.game.target > 0 ? ` — حتى ${room.game.target} نقطة` : ''}` });
      setTurnDeadline(room);
      scheduleBotMove(room);
      broadcast(room);
      return;
    }

    if (m.type === 'config') {
      const room = ROOMS.get(client.roomCode);
      if (!room || room.phase !== 'lobby' || client.seat < 0) return;
      if (['teams', 'ffa'].includes(m.mode)) room.config.mode = m.mode;
      if ([0, 500, 1000, 2000].includes(+m.target)) room.config.target = +m.target;
      if ([1, 2, 3, 4].includes(+m.theme)) room.config.theme = +m.theme;
      lobbyBroadcast(room);
      return;
    }

    if (m.type === 'watch') {
      if (client.roomCode) return;
      const room = ROOMS.get(String(m.code || '').toUpperCase());
      if (!room || !room.game) return send(ws, { type: 'error', msg: 'لا توجد جلسة نشطة بهذا الكود' });
      if (room.specs.length >= 8) return send(ws, { type: 'error', msg: 'المشاهدون كثر — حاول لاحقاً' });
      const spec = { ws, pid: client.pid, name: client.name, lastSeq: 0, pings: 0 };
      room.specs.push(spec);
      client.roomCode = room.code; client.seat = -1; client.isSpec = true;
      send(ws, { type: 'watched', code: room.code });
      pushState(ws, room, -1);
      return;
    }

    if (m.type === 'sessions') {
      const list = [...ROOMS.values()]
        .filter((r) => r.phase === 'playing' && r.game)
        .map((r) => ({
          code: r.code, mode: r.config.mode, target: r.config.target, theme: r.config.theme,
          round: r.game.round, deck: r.game.deck.length,
          players: r.seats.map((s, i) => s ? { i, name: s.name, isBot: s.isBot, avatar: s.avatar } : null),
          specs: r.specs.length,
        }));
      send(ws, { type: 'sessions', list });
      return;
    }

    if (m.type === 'rematch') {
      const room = ROOMS.get(client.roomCode);
      if (!room || room.phase !== 'playing' || !room.game || room.game.phase !== 'end' || !room.matchOver) return;
      room.matchOver = false;
      E.resetMatch(room.game);
      logEvent(room, { kind: 'sys', text: '🔁 بدأت مباراة جديدة — الحساب من الصفر' });
      nextRound(room);
      return;
    }

    if (m.type === 'nextround') {
      const room = ROOMS.get(client.roomCode);
      if (!room || room.phase !== 'playing' || !room.game || room.game.phase !== 'end') return;
      if (room.matchOver) return; // المباراة انتهت — استخدم «مباراة جديدة»
      nextRound(room);
      return;
    }

    if (m.type === 'act') {
      const room = ROOMS.get(client.roomCode);
      if (!room || room.phase !== 'playing' || !room.game) return;
      const seat = client.seat;
      if (seat < 0) return;
      const g = room.game;
      let r = null;
      if (m.action === 'eat') r = E.eat(g, seat, m.card, m.rank);
      else if (m.action === 'stop') r = E.stop(g, seat, m.card);
      else if (m.action === 'discard') r = E.discard(g, seat, m.card);
      else if (m.action === 'pass') r = E.pass(g, seat);
      if (!r) return;
      if (!r.ok) return send(ws, { type: 'error', msg: r.err });
      if (m.action === 'stop') {
        // «وقّف!» لا تمر عبر handlePlayResult — نسجّل الحدث هنا
        if (r.event) logEvent(room, r.event);
        if (g.deck.length === 0) { resolveStopWindow(room, room.windowId); return; }
        openStopWindow(room, STOP_MS);
        broadcast(room);
        return;
      }
      handlePlayResult(room, seat, r); // يسجّل الحدث مرة واحدة
      return;
    }

    if (m.type === 'chat') {
      const room = ROOMS.get(client.roomCode);
      if (!room || !room.game) return;
      const text = String(m.text || '').slice(0, 60);
      if (!text) return;
      const who = client.isSpec ? (client.name + ' 👁️') : seatName(room, client.seat);
      logEvent(room, { kind: 'chat', text: `${who}: ${text}` });
      const s = room.seats[client.seat];
      if (s) s.lastBubble = { text, at: Date.now() };
      broadcast(room);
      return;
    }

    if (m.type === 'leave') leaveRoom(client, true);
  });

  ws.on('close', () => { if (client.roomCode) leaveRoom(client, false); });
});

function lobbyBroadcast(room) {
  for (let i = 0; i < 4; i++) {
    const s = room.seats[i];
    if (!s || s.isBot || !s.connected || !s.ws || s.ws.readyState !== 1) continue;
    // لكل عميل: «me» تُحسب حسب هويته هو فقط
    send(s.ws, {
      type: 'lobby', code: room.code,
      config: room.config,
      seats: room.seats.map((x, j) => x ? { j, name: x.name, avatar: x.avatar, isBot: x.isBot, me: x.pid === s.pid } : null),
    });
  }
}

function leaveRoom(client, explicit) {
  const room = ROOMS.get(client.roomCode);
  client.roomCode = null; client.seat = -1;
  if (!room) return;
  // مشاهد يغادر — لا يلمس المقاعد
  if (client.isSpec) {
    client.isSpec = false;
    const i = room.specs.findIndex((sp) => sp.pid === client.pid);
    if (i >= 0) room.specs.splice(i, 1);
    return;
  }
  const idx = room.seats.findIndex((s) => s && s.pid === client.pid);
  if (idx < 0) return;
  const slot = room.seats[idx];
  slot.connected = false; slot.ws = null; slot.lastSeq = 0;

  const humansLeft = room.seats.some((s) => s && !s.isBot && s.connected);
  if (room.phase === 'lobby' || !room.game) {
    room.seats[idx] = null;
    if (!humansLeft) { ROOMS.delete(room.code); return; }
    lobbyBroadcast(room);
    return;
  }
  if (!humansLeft) { ROOMS.delete(room.code); return; }
  // أثناء اللعب: البوت يكمّل مكانه، وعقوبة خروج صريح −30 نقطة تنافسية لأصحاب الحسابات
  slot.control = 'bot';
  let penaltyText = '';
  if (explicit) {
    const u = USERS.getByPid(slot.pid);
    if (u) {
      USERS.apply(u.username, (x) => { const before = x.pts || 0; x.pts = Math.max(0, x.pts - 30); penaltyText = before > 0 ? ' (−30 نقطة تنافسية)' : ''; });
    }
  }
  logEvent(room, { kind: 'sys', text: `${slot.name} غادر — البوت يكمّل مكانه${penaltyText}` });
  setTurnDeadline(room);
  scheduleBotMove(room);
  broadcast(room);
}

/* ---------- النبض ---------- */
const aliveWss = (s) => s && s.ws && s.ws.readyState === 1;

setInterval(() => {
  const now = Date.now();
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].at <= now) {
      const t = tasks.splice(i, 1)[0];
      try { t.fn(); } catch (e) { console.error('task:', e); }
    }
  }
  // كشف المقاعد الميتة (انقطاع قاسٍ بلا حدث close) وتحويلها لبوت
  for (const room of ROOMS.values()) {
    for (let i = 0; i < 4; i++) {
      const slot = room.seats[i];
      if (!slot || slot.isBot) continue;
      const wsAlive = aliveWss(slot);
      if (slot.connected && !wsAlive) {
        slot.connected = false; slot.ws = null; slot.lastSeq = 0;
        if (room.game && room.phase === 'playing') {
          slot.control = 'bot';
          logEvent(room, { kind: 'sys', text: `${slot.name} انقطع — البوت يكمّل مكانه` });
          scheduleBotMove(room);
          broadcast(room);
        }
      }
    }
    // تنقية الغرف اليتيمة (لا إنسان حي)
    const anyHuman = room.seats.some((s) => s && !s.isBot && s.connected && aliveWss(s));
    if (!anyHuman) ROOMS.delete(room.code);
    else if (room.phase === 'lobby') {
      // إزالة مقاعد البشر المقطوعين من الردهة
      for (let i = 0; i < 4; i++) {
        const s = room.seats[i];
        if (s && !s.isBot && !s.connected) room.seats[i] = null;
      }
    }
  }
  for (const room of ROOMS.values()) {
    const g = room.game;
    if (!g || room.phase !== 'playing' || g.phase !== 'acting') continue;
    if (room.actionDeadline && now >= room.actionDeadline) {
      const s = g.turn;
      const slot = room.seats[s];
      if (slot && slot.control === 'human' && slot.connected) {
        logEvent(room, { kind: 'sys', text: `⏰ انتهى وقت ${slot.name} — لعبت حركة تلقائية` });
        const d = B.botAct(g, s);
        let r = d.act === 'eat' ? E.eat(g, s, d.card, d.rank)
          : d.act === 'discard' ? E.discard(g, s, d.card)
          : E.pass(g, s);
        if (!r.ok) r = E.pass(g, s);
        handlePlayResult(room, s, r);
      } else {
        room.actionDeadline = null;
      }
    }
  }
}, 200);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🃏 مجابيد جاهز على http://localhost:${PORT}`);
});
