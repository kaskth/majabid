/* ═══════════════════════════════════════════════════════════
   مجابيد 1.4 — عميل الجيل الجديد
   (بطاقات مرسومة، أفاتارات مصوّرة، مروحة يد احترافية،
    مؤثرات متسلسلة، بوتات تفكر، صدارة ومنصة تتويج)
   ═══════════════════════════════════════════════════════════ */
'use strict';
const $ = (s) => document.querySelector(s);
const AVATAR_KEYS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];
const LS = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
};
const CHAT_PHRASES = [
  'جنب وراك! ما تاخذها وأنا موجود!',
  'أتحداك تاخذها! 😎',
  'بيّض الله وجهك يا الذيب!',
  'سرّع اللعب يا غالي!',
  'صحصح يا خوي!',
  'السلام عليكم... وعليكم السلام!',
  '😂😂😂',
  'يلا نلعب!',
  '📣 جاوبني!',
];
const TEAM_NAMES = ['الأزرق 🔵', 'الأحمر 🔴'];
const RING_C = 151; // محيط حلقة الدور

/* ───── الحالة ───── */
let ws = null, S = null, P = null, mySeat = -1, roomCode = null;
let selected = null, shownEndRound = 0, reconnectTimer = null, chipOpen = false;
let clockSkew = 0, prevTurn = -1, wasMyTurn = false;
let lastPing = 0, isSpec = false, lobbyCfg = null, lastSessReq = 0;
let account = null, authToken = LS.get('majabid.token', '');
let dealAt = 0, dealRound = -1, animLock = false, seqTimer = null, watchdogT = null;
const flyMarks = new Set();
let escapingId = null;

/* ───── أدوات ───── */
function avTag(av, cls = '') {
  const k = String(av || '');
  if (/^a[1-6]$/.test(k)) return `<img src="/avatars/${k}.png" alt="" ${cls ? `class="${cls}"` : ''}>`;
  return `<span ${cls ? `class="${cls}"` : ''} style="font-size:1.6em;line-height:1;display:grid;place-items:center;width:100%;height:100%">${av || '👤'}</span>`;
}
function toast(msg, gold = false) {
  const t = $('#toast');
  t.textContent = msg; t.classList.toggle('gold', gold);
  t.classList.remove('hidden');
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.add('hidden'), 2800);
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const nm = (s) => (s && s.name) ? s.name : '؟';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ═══════════ الصوت ═══════════ */
let actx = null, muted = LS.get('majabid.muted', false);
function ac() {
  try {
    if (!actx) { const A = window.AudioContext || window.webkitAudioContext; if (A) actx = new A(); }
    if (actx && actx.state === 'suspended') actx.resume();
  } catch { }
  return actx;
}
function tone(f, d, type = 'sine', g = .07, delay = 0) {
  if (muted || !actx) return;
  try {
    const t0 = actx.currentTime + delay;
    const o = actx.createOscillator(), gn = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    gn.gain.setValueAtTime(.0001, t0);
    gn.gain.exponentialRampToValueAtTime(g, t0 + .02);
    gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(gn); gn.connect(actx.destination);
    o.start(t0); o.stop(t0 + d + .05);
  } catch { }
}
function noise(d, g = .1, f = 900, delay = 0) {
  if (muted || !actx) return;
  try {
    const t0 = actx.currentTime + delay;
    const len = Math.floor(actx.sampleRate * d);
    const buf = actx.createBuffer(1, len, actx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    const src = actx.createBufferSource(); src.buffer = buf;
    const flt = actx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = f;
    const gn = actx.createGain(); gn.gain.value = g;
    src.connect(flt); flt.connect(gn); gn.connect(actx.destination);
    src.start(t0);
  } catch { }
}
const SFX = {
  ui() { tone(540, .07, 'sine', .04); },
  pick() { tone(660, .05, 'triangle', .05); },
  deal() { noise(.08, .06, 2200); tone(500, .07, 'triangle', .04); },
  discard() { noise(.13, .11, 1200); tone(300, .1, 'triangle', .07); },
  eat() { tone(650, .09, 'sine', .08); tone(870, .13, 'sine', .07, .07); noise(.12, .06, 800, .02); },
  joker() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .16, 'square', .05, i * .09)); },
  stop() { tone(880, .12, 'square', .09); tone(880, .1, 'square', .07, .16); noise(.1, .07, 1500); },
  flip() { tone(430, .09, 'triangle', .05); tone(430, .09, 'triangle', .05, .11); },
  turn() { tone(760, .08, 'sine', .05); tone(1020, .1, 'sine', .04, .09); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'sine', .07, i * .12)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, .26, 'sine', .07, i * .15)); },
  chat() { tone(720, .06, 'sine', .04); },
  ping() { tone(980, .1, 'square', .07); tone(1240, .14, 'square', .06, .1); },
};

/* ═══════════ المؤثرات (Canvas) ═══════════ */
const FX = { ctx: null, parts: [], W: 0, H: 0 };
const FX_COLORS = ['#f5c542', '#ffdf8e', '#17c26b', '#4f8cff', '#ff5a5a', '#fff'];
function fxInit() {
  const cv = $('#fx');
  FX.W = cv.width = window.innerWidth;
  FX.H = cv.height = window.innerHeight;
  try { FX.ctx = cv.getContext('2d'); } catch { FX.ctx = null; }
  window.addEventListener('resize', () => {
    FX.W = cv.width = window.innerWidth;
    FX.H = cv.height = window.innerHeight;
  });
  requestAnimationFrame(fxLoop);
}
function spark(x, y, color, n = 16, power = 1) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = (2 + Math.random() * 5) * power;
    FX.parts.push({ type: 'p', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: .12, life: 1, decay: .02 + Math.random() * .02, color: color || FX_COLORS[(Math.random() * FX_COLORS.length) | 0], r: 1.5 + Math.random() * 2.5 });
  }
}
function ringFx(x, y, color) { FX.parts.push({ type: 'r', x, y, r: 6, life: 1, decay: .03, color: color || '#f5c542' }); }
function confettiBurst(n = 140) {
  for (let i = 0; i < n; i++)
    FX.parts.push({ type: 'c', x: Math.random() * FX.W, y: -20 - Math.random() * FX.H * .3, vx: (Math.random() - .5) * 2.4, vy: 2 + Math.random() * 3.4, rot: Math.random() * Math.PI, vr: (Math.random() - .5) * .3, w: 5 + Math.random() * 6, h: 9 + Math.random() * 8, color: FX_COLORS[(Math.random() * FX_COLORS.length) | 0], life: 1, decay: .0016 });
}
function fxLoop() {
  const ctx = FX.ctx;
  if (ctx) {
    ctx.clearRect(0, 0, FX.W, FX.H);
    for (let i = FX.parts.length - 1; i >= 0; i--) {
      const p = FX.parts[i];
      p.life -= p.decay;
      if (p.life <= 0 || p.y > FX.H + 30) { FX.parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.type === 'p') {
        p.x += p.vx; p.y += p.vy; p.vy += p.g;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      } else if (p.type === 'r') {
        p.r += 3.2;
        ctx.strokeStyle = p.color; ctx.lineWidth = 3 * p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.stroke();
      } else if (p.type === 'c') {
        p.x += p.vx + Math.sin(p.y * .02) * 1.2; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(fxLoop);
}
function flashEl(cls) {
  const f = $('#flash');
  f.classList.remove('go', 'gold-go');
  void f.offsetWidth;
  f.classList.add(cls + ' go');
  setTimeout(() => f.classList.remove('go', 'gold-go'), 700);
}

/* ═══════════ الاتصال ═══════════ */
function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}`);
  ws.onopen = () => {
    ac();
    ws.send(JSON.stringify({
      type: 'identify',
      pid: authToken || LS.get('majabid.pid', ''),
      name: $('#inp-name').value.trim() || LS.get('majabid.name', '') || 'ضيف',
      avatar: LS.get('majabid.avatar', 'a1'),
    }));
    // رابط دعوة ?room=CODE → انضم مباشرة
    const pre = new URLSearchParams(location.search).get('room');
    if (pre && !roomCode) {
      const code = pre.toUpperCase().slice(0, 6);
      $('#inp-code').value = code;
      setTimeout(() => send({ type: 'join', code }), 350);
    }
  };
  ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch { return; } handle(m); };
  ws.onclose = () => {
    if (roomCode) { toast('⚠️ انقطع الاتصال — إعادة المحاولة...', true); clearTimeout(reconnectTimer); reconnectTimer = setTimeout(connect, 1400); }
  };
}
function send(obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }

function handle(m) {
  switch (m.type) {
    case 'identity': {
      LS.set('majabid.pid', m.pid);
      if (m.account) applyAccount(m.account);
      else if (!account) { $('#auth-box').classList.remove('hidden'); $('#account-box').classList.add('hidden'); $('#guest-fields').classList.remove('hidden'); updateHomeBar(); }
      break;
    }
    case 'auth': {
      if (m.ok) {
        authToken = m.token; LS.set('majabid.token', authToken);
        applyAccount(m.user);
        updateHomeBar();
        toast(`أهلاً ${m.user.name} ✅`);
        ws.send(JSON.stringify({ type: 'identify', pid: authToken, name: m.user.name, avatar: m.user.avatar }));
      } else if (m.loggedOut) {
        authToken = ''; LS.set('majabid.token', '');
        applyAccount(null); updateHomeBar();
        toast('تم تسجيل الخروج');
      } else toast('❌ ' + (m.err || 'فشل'), true);
      break;
    }
    case 'profile': if (m.account) { applyAccount(m.account, true); updateHomeBar(); } break;
    case 'leaderboard': renderLeaderboard(m.list, m.my); break;
    case 'sessions': renderSheetList(m.list); break;
    case 'error': toast('❌ ' + m.msg, true); SFX.ui(); break;
    case 'joined':
      mySeat = m.seat; roomCode = m.code; isSpec = false;
      try { history.replaceState(null, '', '/'); } catch { }
      show('screen-lobby'); renderLobby(null);
      toast(`انضممت للطاولة ${m.code} ✅`);
      break;
    case 'lobby': renderLobby(m); break;
    case 'watched':
      roomCode = m.code; mySeat = -1; isSpec = true;
      shownEndRound = 0; prevTurn = -1; P = null;
      try { history.replaceState(null, '', '/'); } catch { }
      show('screen-game');
      toast(`👁️ تشاهد الآن جلسة ${m.code}`);
      break;
    case 'state':
      S = m.s; mySeat = S.seat; isSpec = !!S.isSpec;
      if (S.now) clockSkew = Date.now() - S.now;
      processEvents(m.events || []);
      break;
  }
}
function show(id) {
  for (const s of document.querySelectorAll('.screen')) s.classList.add('hidden');
  $('#' + id).classList.remove('hidden');
}

/* ═══════════ حالة الجلسة المسبقة (لترتيب الحركات) ═══════════ */
function cloneT() {
  return {
    phase: S.phase, turn: S.turn, isFinal: S.isFinal,
    handCounts: [...S.handCounts],
    field: S.field.slice(),
    piles: S.piles.map((p) => ({ chain: p.chain ? { rank: p.chain.rank, count: p.chain.count, jokers: p.chain.jokers } : null, buriedCount: p.buriedCount })),
    pending: S.pending ? { owner: S.pending.owner, rank: S.pending.rank, count: S.pending.count, stops: [...S.pending.stops] } : null,
    deckCount: S.deckCount,
  };
}
function mutate(ev) {
  if (!P) return;
  switch (ev.kind) {
    case 'discard':
      if (ev.seat !== mySeat) P.handCounts[ev.seat] = Math.max(0, (P.handCounts[ev.seat] || 0) - 1);
      P.field.push({ r: ev.rank, s: '♥' });
      break;
    case 'eat': case 'jokerEat':
      if (ev.seat != null) P.handCounts[ev.seat] = Math.max(0, (P.handCounts[ev.seat] || 0) - 1);
      for (const v of (ev.victims || [])) P.piles[v].chain = null;
      let rem = ev.fieldN || 0;
      P.field = P.field.filter((c) => !(c.r === ev.rank && rem-- > 0));
      P.pending = { owner: ev.seat, rank: ev.rank, count: ev.count, stops: [] };
      break;
    case 'stop': case 'jokerStop':
      if (ev.seat != null && ev.seat !== mySeat) P.handCounts[ev.seat] = Math.max(0, (P.handCounts[ev.seat] || 0) - 1);
      P.pending = { owner: ev.seat, rank: ev.rank, count: ev.count, stops: P.pending ? [...P.pending.stops, ev.seat] : [ev.seat] };
      break;
    case 'flip':
      P.field.push({ r: ev.rank, s: '♥' });
      break;
  }
}
const T = () => P || S;

/* ═══════════ معالجة الأحداث المتسلسلة ═══════════ */
const seq = [];
function processEvents(events) {
  if (!events.length) { renderState(); return; }
  for (const ev of events) {
    if (ev.kind === 'chat') { addLog(ev); chatBubble(ev); SFX.chat(); continue; }
    if (ev.kind === 'sys' || ev.kind === 'skip' || ev.kind === 'pass' || ev.kind === 'end') { addLog(ev); continue; }
    seq.push(ev);
  }
  if (seqTimer) return;
  if (seq.length) seqTimer = setTimeout(pump, 260);
  else renderState();
}
function addLog(ev) {
  let text = ev.text;
  if (!text && ev.kind && ev.seat != null) {
    const n = nm(S.seats[ev.seat]);
    const map = {
      eat: `${n} كنس ${ev.rank} (${ev.count} ورقات${ev.jokers ? ` +${ev.jokers} جوكر 🃏` : ''})`,
      jokerEat: `🃏 ${n} أكل ${ev.rank} بجوكر!`,
      stop: `⛔ ${n} خطف ${ev.rank}!`,
      jokerStop: `⛔ ${n} خطف بجوكر!`,
      discard: `${n} رمى ${ev.rank}`,
      pass: `${n} تجاوز`,
      flip: `انقلبت ${ev.rank} للميدان`,
      skip: `${n} يده فاضية`,
    };
    text = map[ev.kind];
  }
  if (!text) return;
  const log = $('#log');
  const el = document.createElement('div');
  el.className = 'log-item k-' + ev.kind;
  el.textContent = text;
  log.appendChild(el);
  while (log.children.length > 34) log.removeChild(log.firstChild);
  requestAnimationFrame(() => { try { log.scrollLeft = -log.scrollWidth; } catch { } });
}
function chatBubble(ev) {
  if (ev.seat == null || ev.seat < 0 || ev.seat === mySeat) return;
  const parts = ev.text.split(':');
  const text = parts.slice(1).join(':').trim();
  const slot = S.seats[ev.seat];
  if (!slot) return;
  slot.bubble = { text: text || ev.text, at: Date.now() };
  renderSeats();
}

async function pump() {
  seqTimer = null;
  animLock = true;
  clearTimeout(watchdogT);
  watchdogT = setTimeout(() => { animLock = false; P = null; renderState(); }, 3200);
  const ev = seq.shift();
  if (!ev) { finishSeq(); return; }
  P = P || cloneT();
  try { mutate(ev); } catch { }
  renderState();
  try { await animateEvent(ev); } catch (e) { /* لا نجمّد أبداً */ }
  if (seq.length) setTimeout(pump, 60);
  else finishSeq();
}
function finishSeq() {
  clearTimeout(watchdogT);
  P = null; flyMarks.clear(); escapingId = null; animLock = false;
  renderState();
}

/* ═══════════ الطيران ═══════════ */
function flyTo(el, toPt, dur, spin = true) {
  return new Promise((res) => {
    const r = el.getBoundingClientRect();
    const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    const dx = toPt.x - x0, dy = toPt.y - y0;
    const midX = x0 + dx * .28, midY = y0 + dy * .18 - (dy < 0 ? 70 : 46);
    const t0 = performance.now();
    const total = dur || clamp(480 + Math.hypot(dx, dy) * .055, 480, 950);
    const dir = dx >= 0 ? 1 : -1;
    function step(t) {
      const p = clamp((t - t0) / total, 0, 1);
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * midX + e * e * toPt.x;
      const y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * midY + e * e * toPt.y;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.transform = `translate(-50%,-50%) rotate(${spin ? (1 - e) * 30 * dir : 0}deg) scale(${1 - .12 * p})`;
      if (p < 1) requestAnimationFrame(step); else res();
    }
    requestAnimationFrame(step);
  });
}
function handPoint() { const r = $('#hand').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 14 }; }
function fieldPoint() { const r = $('#field').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 + 14 }; }
function seatPoint(i, lift = 0) { const r = $('#seat-zone-' + i).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top - 12 + lift }; }
function deckPoint() { const r = $('#deck').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
function myCardEl(id) { return document.querySelector(`#hand [data-id="${id}"]`); }

async function animateEvent(ev) {
  switch (ev.kind) {
    case 'discard': {
      SFX.discard();
      const mine = ev.seat === mySeat;
      let from = mine ? myCardEl(ev.cardId) : null;
      const sp = mine ? handPoint() : seatPoint(ev.seat);
      if (!from) {
        const g = document.createElement('div');
        g.className = 'fly-card'; g.style.width = '36px'; g.style.height = '51px';
        g.innerHTML = cardSVG({ id: ev.cardId, r: ev.rank, s: '♥', j: false });
        $('#fly-layer').appendChild(g);
        g.style.left = sp.x + 'px'; g.style.top = sp.y + 'px';
        from = g;
      } else {
        const g = from.cloneNode(true); g.className = 'fly-card';
        g.style.width = '46px'; g.style.height = '65px';
        $('#fly-layer').appendChild(g);
        from.classList.add('dim');
        escapingId = ev.cardId;
        renderState();
        from = g;
      }
      flyMarks.add('land:' + ev.cardId);
      renderField();
      await flyTo(from, fieldPoint(), 560);
      from.remove();
      setTimeout(() => { flyMarks.delete('land:' + ev.cardId); renderField(); }, 520);
      break;
    }
    case 'eat': case 'jokerEat': {
      if (ev.jokers > 0 || ev.kind === 'jokerEat') { SFX.joker(); flashEl('gold-go'); } else SFX.eat();
      const tp = seatPoint(ev.seat, 55);
      if (ev.fieldN > 0) {
        const g = document.createElement('div');
        g.className = 'fly-card'; g.style.width = '30px'; g.style.height = '43px';
        g.innerHTML = cardSVG({ id: 'f', r: ev.rank, s: '♥', j: false });
        $('#fly-layer').appendChild(g);
        const fp = fieldPoint();
        g.style.left = fp.x + (Math.random() * 40 - 20) + 'px'; g.style.top = fp.y + 'px';
        await flyTo(g, tp, 520); g.remove();
      }
      if (ev.jokers > 0) {
        const jb = document.createElement('div');
        jb.className = 'fly-card'; jb.textContent = '🃏';
        jb.style.width = '36px'; jb.style.height = '36px'; jb.style.fontSize = '32px';
        jb.style.filter = 'drop-shadow(0 0 14px rgba(245,197,66,.9))';
        $('#fly-layer').appendChild(jb);
        const sp = ev.victims && ev.victims.length ? seatPoint(ev.victims[0]) : seatPoint(ev.seat);
        jb.style.left = sp.x + 'px'; jb.style.top = sp.y + 'px';
        await flyTo(jb, tp, 600, true); jb.remove();
      }
      for (const v of (ev.victims || [])) {
        const n = 2 + ((Math.random() * 2) | 0);
        for (let i = 0; i < n; i++) {
          const g = document.createElement('div');
          g.className = 'fly-card'; g.style.width = '28px'; g.style.height = '40px';
          g.innerHTML = cardSVG({ id: 'c' + i, r: ev.rank, s: '♥', j: false });
          $('#fly-layer').appendChild(g);
          const p = seatPoint(v);
          g.style.left = p.x + (Math.random() * 50 - 25) + 'px'; g.style.top = p.y + 'px';
          await flyTo(g, tp, 430 + Math.random() * 120); g.remove();
        }
      }
      let from = ev.seat === mySeat ? myCardEl(ev.cardId) : null;
      const sp0 = ev.seat === mySeat ? handPoint() : seatPoint(ev.seat);
      if (from) {
        const g = from.cloneNode(true); g.className = 'fly-card';
        g.style.width = '46px'; g.style.height = '65px';
        $('#fly-layer').appendChild(g);
        from.classList.add('dim');
        escapingId = ev.cardId; renderState();
        await flyTo(g, tp, 540); g.remove();
      } else {
        const g = document.createElement('div');
        g.className = 'fly-card'; g.style.width = '32px'; g.style.height = '45px';
        g.innerHTML = cardSVG({ id: ev.cardId || 'x', r: ev.rank, s: '♥', j: false });
        $('#fly-layer').appendChild(g);
        g.style.left = sp0.x + 'px'; g.style.top = sp0.y + 'px';
        await flyTo(g, tp, 500); g.remove();
      }
      ringFx(tp.x, tp.y, ev.jokers > 0 ? '#f5c542' : '#7fe6a8');
      spark(tp.x, tp.y, ev.jokers > 0 ? '#f5c542' : '#7fe6a8', 16, 1);
      break;
    }
    case 'stop': case 'jokerStop': {
      SFX.stop();
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 600);
      const tp = seatPoint(ev.seat, 55);
      let from = ev.seat === mySeat ? myCardEl(ev.cardId) : null;
      const sp0 = ev.seat === mySeat ? handPoint() : seatPoint(ev.prevOwner != null ? ev.prevOwner : ev.seat, 40);
      if (from) {
        const g = from.cloneNode(true); g.className = 'fly-card';
        g.style.width = '46px'; g.style.height = '65px';
        $('#fly-layer').appendChild(g);
        from.classList.add('dim');
        escapingId = ev.cardId; renderState();
        await flyTo(g, tp, 460); g.remove();
      } else {
        const g = document.createElement('div');
        g.className = 'fly-card'; g.style.width = '38px'; g.style.height = '54px';
        g.innerHTML = cardSVG({ id: ev.cardId || 's', r: ev.rank, s: '♥', j: ev.joker });
        $('#fly-layer').appendChild(g);
        g.style.left = sp0.x + 'px'; g.style.top = sp0.y + 'px';
        await flyTo(g, tp, 520); g.remove();
      }
      ringFx(tp.x, tp.y, '#ff6a5e');
      spark(tp.x, tp.y, '#ff6a5e', 20, 1.2);
      break;
    }
    case 'flip': {
      SFX.flip();
      const d = deckPoint(), fp = fieldPoint();
      const g = document.createElement('div');
      g.className = 'fly-card'; g.style.width = '30px'; g.style.height = '43px';
      g.innerHTML = CARD_BACK_SVG;
      $('#fly-layer').appendChild(g);
      g.style.left = d.x + 'px'; g.style.top = d.y + 'px';
      await flyTo(g, { x: fp.x + (Math.random() * 40 - 20), y: fp.y }, 560);
      g.innerHTML = cardSVG({ id: 'fl', r: ev.rank, s: '♥', j: false });
      await new Promise((r) => setTimeout(r, 220));
      g.remove();
      flyMarks.add('flip:' + ev.rank);
      renderField();
      setTimeout(() => { flyMarks.delete('flip:' + ev.rank); renderField(); }, 800);
      break;
    }
  }
}

/* ═══════════ العرض ═══════════ */
function myTurn() { return S && S.phase === 'acting' && S.turn === mySeat && !isSpec; }

function renderState() {
  if (!S) return;
  show('screen-game');
  const t = T();
  $('#deck-count').textContent = t.deckCount;
  $('#deck-count2').textContent = t.deckCount;
  $('#tb-round').textContent = 'الجولة ' + S.round;
  $('#tb-code').textContent = S.room;
  $('#tb-final').classList.toggle('hidden', !t.isFinal);
  document.body.classList.toggle('final', !!t.isFinal);
  document.body.classList.toggle('ffa', S.mode === 'ffa');
  document.body.classList.toggle('spec', !!S.isSpec);
  document.body.classList.remove('theme-1', 'theme-2', 'theme-3');
  document.body.classList.add('theme-' + (S.theme || 1));
  const tgt = $('#tb-target');
  if (S.target > 0) { tgt.textContent = '🏁 حتى ' + S.target; tgt.classList.remove('hidden'); }
  else if (S.mode === 'ffa') { tgt.textContent = '🎯 فردي ×4'; tgt.classList.remove('hidden'); }
  else tgt.classList.add('hidden');
  const sb = $('#spec-banner');
  if (S.isSpec) { $('#spec-name').textContent = '#' + S.room; sb.classList.remove('hidden'); } else sb.classList.add('hidden');
  // لافتة دورك
  const mt = myTurn();
  $('#my-turn').classList.toggle('hidden', !mt);
  if (mt && !wasMyTurn) SFX.turn();
  wasMyTurn = mt;
  // توزيع جديد؟
  if (S.round !== dealRound && !S.isSpec) { dealRound = S.round; dealAt = Date.now(); if (S.round > 1) SFX.deal(); }
  renderSeats();
  renderField();
  renderHand();
  renderActions();
  renderStopBanner();
  renderStopFab();
  endModalTick();
  updateTimers();
}

/* ───── المقاعد ───── */
function renderSeats() {
  const t = T();
  for (let i = 0; i < 4; i++) {
    const z = $('#seat-zone-' + i);
    const seat = S.seats && S.seats[i];
    const pile = t.piles[i];
    const isTurn = t.phase !== 'end' && S.turn === i;
    const me = i === mySeat;
    const myPending = t.pending && t.pending.owner === i && S.phase === 'stop';
    const thinking = seat && (seat.isBot || seat.bot) && isTurn && t.phase === 'acting';

    let pileInner = '';
    if ((pile.buriedCount || 0) > 0) {
      const backs = Math.min(pile.buriedCount, 3);
      let b = '';
      for (let k = 0; k < backs; k++) b += `<span class="card-back mini" style="display:inline-block">${CARD_BACK_SVG}</span>`;
      pileInner += `<div class="pile-col"><div class="buried-stack">${b}</div><div class="pile-label">مدفون ${pile.buriedCount}</div></div>`;
    }
    if (pile.chain) {
      const n = Math.min(pile.chain.count, 3);
      let faces = '';
      for (let k = 0; k < n; k++) faces += `<span class="card mini" style="display:inline-block">${cardSVG({ id: 'c', r: pile.chain.rank, s: '♥', j: false })}</span>`;
      pileInner += `<div class="pile-col"><div class="chain-stack" style="direction:ltr">${faces}</div><div class="jb-label">👑 جبيد ${pile.chain.rank} ×${pile.chain.count}</div></div>`;
    }
    if (myPending) {
      const n = Math.min(t.pending.count, 4);
      let ps = '';
      for (let k = 0; k < n; k++) ps += `<span class="card mini" style="display:inline-block">${cardSVG({ id: 'p', r: t.pending.rank, s: '♥', j: false })}</span>`;
      pileInner = `<div class="pending-stack"><div class="ps-cards" style="direction:ltr">${ps}</div><div class="ps-label">🍽️ ${t.pending.count} ورقة</div></div>` + pileInner;
    }

    const bubble = seat && seat.bubble && (Date.now() - (seat.bubble.at || 0) < 4200) && !me
      ? `<div class="bubble">${esc(seat.bubble.text)}</div>` : '';
    const colorCls = S.mode === 'ffa' ? 'ss' + i : 'team' + (i % 2);
    z.className = 'seat-zone s' + i;
    z.innerHTML = `
      ${bubble}
      <div class="player ${colorCls} ${isTurn ? 'turn' : ''} ${seat && !seat.isBot && seat.connected === false ? 'offline' : ''}">
        ${isTurn && t.phase === 'acting' ? `<span class="ring"><svg viewBox="0 0 60 60"><circle class="r-bg" cx="30" cy="30" r="24"/><circle class="r-fg" id="ring-fg-${i}" cx="30" cy="30" r="24"/></svg></span>` : ''}
        <div class="av-wrap"><span class="av">${seat ? avTag(seat.avatar) : '❓'}</span>
          ${me && myTurn() ? `<button class="ping-bell" data-ping="${i}" title="نادِ شريكك">🔔</button>` : ''}</div>
        <div class="nm">${seat ? (seat.rank ? `<span class="rank-em">${esc(seat.rank)}</span> ` : '') + esc(nm(seat)) + (seat.bot ? ' 🤖' : '') : '—'}</div>
        ${me ? '<div class="you-tag">⭐ أنت</div>' : ''}
        <div class="cnt ${(t.handCounts[i] || 0) === 0 ? 'empty' : ''}">🂠 ${(t.handCounts[i] || 0)}</div>
        ${thinking ? '<div class="think"><i></i><i></i><i></i></div>' : ''}
      </div>
      <div class="pile">${pileInner}</div>`;
    z.querySelectorAll('[data-ping]').forEach((b) => {
      b.onclick = () => {
        if (Date.now() - lastPing < 2500) return;
        lastPing = Date.now(); SFX.ping();
        send({ type: 'chat', text: '📣 جاوبني!' });
        z.classList.add('pinged');
        setTimeout(() => z.classList.remove('pinged'), 1600);
        spark(seatPoint(i).x, seatPoint(i).y, '#ffb02e', 14, 1);
      };
    });
  }
}

/* ───── الميدان ───── */
function renderField() {
  const t = T();
  const f = $('#field');
  const groups = new Map();
  for (const c of t.field) groups.set(c.r, (groups.get(c.r) || 0) + 1);
  let html = '';
  for (const r of RANK_ORDER) {
    const n = groups.get(r) || 0;
    if (!n) continue;
    const shown = Math.min(n, 3);
    let faces = '';
    const land = flyMarks.has('land:' + r) || flyMarks.has('flip:' + r);
    for (let k = 0; k < shown; k++)
      faces += `<span class="card mini" style="display:inline-block;${land && k === shown - 1 ? 'animation:dealIn .3s ease' : ''}">${cardSVG({ id: 'f', r, s: '♥', j: false })}</span>`;
    html += `<div class="field-group">${faces}<span class="cnt">×${n}</span></div>`;
  }
  f.innerHTML = html || '<div style="font-size:12px;color:#bfe0c8;opacity:.65">الميدان خالي</div>';
}

/* ───── اليد (مروحة) ───── */
function renderHand() {
  const h = $('#hand');
  const opts = S.myOptions || { cards: {}, discard: false, pass: false };
  const dealing = (Date.now() - dealAt) < 1500 && S.round === dealRound && S.phase === 'acting';
  let html = '';
  const eatable = [];
  for (const c of S.myHand) {
    if (c.id === escapingId) continue;
    const o = opts.cards[c.id];
    const canEat = o && (o.eats || []).length > 0;
    const canDisc = o && o.discard;
    if (canEat) eatable.push(c.id);
    const cls = (!canEat && !canDisc) ? 'dim' : (canEat ? 'playable' : '');
    html += `<div class="card ${cls} ${selected === c.id ? 'sel' : ''}" data-id="${c.id}" style="${dealing ? `animation:dealIn .42s cubic-bezier(.2,.9,.3,1.2) backwards; animation-delay:${Math.min(S.myHand.indexOf(c), 12) * 45}ms` : ''}">${cardSVG(c)}</div>`;
  }
  h.innerHTML = html;
  if (!selected || !S.myHand.some((c) => c.id === selected)) {
    if (myTurn()) {
      const c = S.myHand.find((x) => eatable.includes(x.id)) || S.myHand.find((x) => opts.cards[x.id] && opts.cards[x.id].discard) || S.myHand[0];
      selected = c ? c.id : null;
    } else selected = null;
  }
  layoutHand();
}
function layoutHand() {
  const h = $('#hand');
  const W = h.clientWidth;
  const cards = [...h.querySelectorAll('.card')];
  const n = cards.length;
  if (!n) return;
  const spacing = clamp((W - 30) / Math.max(1, n), 18, 46);
  const half = 26;
  cards.forEach((c, i) => {
    const mid = (n - 1) / 2;
    const x = W / 2 + (i - mid) * spacing - half;
    const arc = Math.pow(Math.abs(i - mid), 1.65) * (spacing > 30 ? 2.2 : 1.6);
    c.style.left = Math.round(x) + 'px';
    c.style.top = Math.round(arc) + 'px';
    c.style.zIndex = 10 + i;
    c.classList.toggle('sel', selected === c.dataset.id);
  });
}

/* ───── الإجراءات ───── */
function renderActions() {
  const a = $('#actions');
  const hint = $('#hand-hint');
  hint.className = 'hand-hint';
  if (!S || S.phase === 'end') { a.innerHTML = ''; hint.textContent = 'انتهت الجولة — النتائج مكشوفة 🏆'; return; }
  if (isSpec) { a.innerHTML = ''; hint.textContent = ''; return; }
  if (S.phase === 'stop') {
    a.innerHTML = '';
    if (S.canStop) { hint.className = 'hand-hint warn'; hint.textContent = '⛔ عندك الورقة — اضغط «وقّف!» واخطفها!'; }
    else if (S.pending.owner === mySeat) hint.textContent = '🍽️ أكلتك في الهواء... ترقّب النافذة';
    else hint.textContent = '⏳ نافذة «وقّف!» — لو عندك الرقم اصرخ!';
    return;
  }
  if (!myTurn()) {
    a.innerHTML = '';
    const who = S.seats && S.seats[S.turn];
    hint.textContent = `⏳ دور: ${nm(who)}`;
    return;
  }
  const opts = S.myOptions || {};
  const selCard = S.myHand.find((c) => c.id === selected);
  let html = '';
  if (selCard) {
    const o = opts.cards[selCard.id] || {};
    for (const r of (o.eats || [])) html += `<button class="chip-btn gold" data-act="eat" data-card="${selCard.id}" data-rank="${r}">🍽️ أكل ${r}${eatDetail(r)}</button>`;
    if (o.discard) html += `<button class="chip-btn" data-act="discard" data-card="${selCard.id}">🎯 ارمِ للميدان</button>`;
  }
  html += `<button class="chip-btn" data-act="pass">⏭️ تجاوز</button>`;
  a.innerHTML = html;
  a.querySelectorAll('button').forEach((b) => {
    b.onclick = () => {
      const act = b.dataset.act;
      SFX.ui();
      if (act === 'eat') send({ type: 'act', action: 'eat', card: b.dataset.card, rank: b.dataset.rank });
      else if (act === 'discard') send({ type: 'act', action: 'discard', card: b.dataset.card });
      else send({ type: 'act', action: 'pass' });
    };
  });
  if (opts.mustEat) { hint.className = 'hand-hint warn'; hint.textContent = '⚠️ كل أوراقك تأكل — الأكل إجباري!'; }
  else if (!selCard) hint.textContent = 'اضغط على ورقة من يدك';
  else hint.textContent = selCard.j ? '🃏 جوكر — يخترق أي أكلة!' : `اخترت: ${selCard.r} ${selCard.s}`;
}
function eatDetail(r) {
  const fieldN = S.field.filter((c) => c.r === r).length;
  let chainN = 0;
  for (const s of [1, 3, 2]) { const i = (mySeat + s) % 4; if (S.piles[i].chain && S.piles[i].chain.rank === r) chainN++; }
  let d = '';
  if (fieldN) d += ` (ميدان ${fieldN}`;
  if (chainN) d += (d ? ' • ' : ' (') + `كومات ${chainN}`;
  if (d) d += ')';
  return d;
}

/* ───── نافذة وقّف ───── */
function renderStopBanner() {
  const b = $('#stop-banner');
  if (!S || S.phase !== 'stop' || !S.pending) { b.classList.add('hidden'); return; }
  b.classList.remove('hidden');
  const p = S.pending;
  b.querySelector('.sb-title').textContent = `🍽️ ${nm(S.seats[p.owner])} أكل ${p.rank} (${p.count})`;
  b.querySelector('.sb-sub').textContent = S.canStop ? '⛔ عندك الورقة — اصرخ «وقّف!»!' : 'من عنده نفس الرقم أو جوكر يخطفها';
}
function renderStopFab() {
  const fab = $('#stop-fab');
  if (!S || S.phase !== 'stop' || !S.canStop) { fab.classList.add('hidden'); return; }
  fab.classList.remove('hidden');
  const match = S.myHand.find((c) => c.j || c.r === S.pending.rank);
  $('#stop-sub').textContent = match ? (match.j ? '🃏 بجوكرك!' : `عندك: ${match.r} ${match.s}`) : '';
  $('#btn-stop').onclick = () => {
    const c = match || S.myHand.find((x) => x.j) || S.myHand.find((x) => x.r === S.pending.rank);
    if (!c) return;
    SFX.stop();
    send({ type: 'act', action: 'stop', card: c.id });
  };
}

/* ───── المؤقتات ───── */
function updateTimers() {
  if (!S) return;
  const now = Date.now();
  const dl = S.deadline ? S.deadline + clockSkew : null;
  const f = S.phase === 'stop' ? 5000 : 20000;
  if (dl) {
    const frac = clamp((dl - now) / f, 0, 1);
    const off = RING_C * (1 - frac);
    if (S.phase === 'acting') { const el = $('#ring-fg-' + S.turn); if (el) el.style.strokeDashoffset = off; }
    const cnt = $('.sb-count');
    if (S.phase === 'stop' && cnt) cnt.textContent = Math.ceil((dl - now) / 1000);
  }
  if (S.phase !== 'stop' && $('.sb-count')) $('.sb-count').textContent = '5';
}
setInterval(() => { if (S && !$('#screen-game').classList.contains('hidden')) updateTimers(); }, 150);

/* ───── نهاية الجولة ───── */
function endModalTick() {
  if (!S || S.phase !== 'end' || !S.result || shownEndRound === S.round || isSpec) return;
  shownEndRound = S.round;
  const r = S.result;
  const ffa = r.mode === 'ffa';
  const wt = r.winnerTeam, ws2 = r.winnerSeat;
  const myTeam = mySeat >= 0 ? mySeat % 2 : -1;
  const matchOver = !!r.matchOver;
  const champName = ffa
    ? nm(S.seats[r.session.indexOf(Math.max(...r.session))])
    : (r.session[0] >= r.session[1] ? 'الفريق الأزرق 🔵' : 'الفريق الأحمر 🔴');
  const myWin = ffa ? ws2 === mySeat : (wt >= 0 && wt === myTeam);
  const cb = $('#champ-banner');
  if (matchOver) {
    cb.classList.remove('hidden');
    cb.innerHTML = `<div class="cb-title">👑 ${esc(champName)}</div><div class="cb-sub">بطل المباراة — بلغ ${r.target} نقطة</div>`;
  } else cb.classList.add('hidden');
  $('#end-title').textContent = matchOver ? '🏁 انتهت المباراة!' : ffa ? (ws2 >= 0 ? `فاز الجولة: ${nm(S.seats[ws2])}!` : 'تعادل!') : (wt >= 0 ? `فاز فريق ${TEAM_NAMES[wt]}!` : 'تعادل!');
  $('#end-trophy').textContent = matchOver ? '👑' : (myWin ? '🏆' : (wt >= 0 || ws2 >= 0 ? '🥈' : '🤝'));
  const body = $('#end-body');
  let html = '';
  if (ffa) {
    html = '<div class="end-grid-ffa">';
    for (let i = 0; i < 4; i++) {
      const sc = r.scores[i];
      const isW = ws2 === i || (matchOver && r.session[i] === Math.max(...r.session));
      html += `<div class="team-col ffc ss${i} ${isW ? 'winner' : ''}">
        <h3>${esc(nm(S.seats[i]))} ${isW ? '🏆' : ''}</h3>
        <div class="team-total">${sc.total}</div>
        <div class="p-row"><span class="pts">👑 ${sc.n}×10</span><span class="pts">🃏 ${sc.j}×50</span></div>
        <div class="p-tiny">جلسة: ${r.session[i]}</div></div>`;
    }
    html += '</div>';
  } else {
    html = '<div class="end-grid">';
    for (const team of [0, 1]) {
      const seats = [team, team + 2];
      html += `<div class="team-col t${team} ${wt === team ? 'winner' : ''}">
        <h3>${TEAM_NAMES[team]} ${wt === team ? '🏆' : ''}</h3>
        <div class="team-total">${r.teams[team]} نقطة</div>`;
      for (const i of seats) {
        const sc = r.scores[i];
        const s2 = S.seats[i];
        const isW = wt === team && sc.total === Math.max(...r.scores.map((x) => x.total));
        html += `<div class="p-row ${isW ? 'win' : ''}"><span class="av">${s2 ? avTag(s2.avatar) : '❓'}</span>
          <span class="nm">${esc(nm(s2))}</span>
          <span class="pts">👑 ${sc.n}×10</span><span class="pts big">= ${sc.total}</span>${isW ? ' <span class="mvp">⭐</span>' : ''}</div>`;
      }
      html += '</div>';
    }
    html += '</div>';
  }
  body.innerHTML = html;
  $('#end-progress').innerHTML = ffa
    ? `📊 الجلسة: ${r.session.map((v, i) => `${esc(nm(S.seats[i]))}: ${v}`).join(' · ')}${r.target > 0 ? ` / ${r.target}` : ''}`
    : `📊 الجلسة — أزرق ${r.session[0]} · أحمر ${r.session[1]}${r.target > 0 ? ` / ${r.target}` : ''} · الجولات: ${r.roundsWon[0]} - ${r.roundsWon[1]}`;
  $('#btn-next-round').classList.toggle('hidden', !!matchOver);
  $('#btn-rematch').classList.toggle('hidden', !matchOver);
  $('#modal-end').classList.remove('hidden');
  if (account && (r.deltas || []).length && mySeat >= 0) {
    const d = r.deltas[mySeat];
    if (d) toast(d > 0 ? `⚡ +${d} نقطة تنافسية` : `⚡ ${d} نقطة تنافسية`, d > 0);
    setTimeout(() => account && send({ type: 'profile' }), 700);
  }
  if (matchOver || myWin) { SFX.win(); confettiBurst(200); flashEl('gold-go'); }
  else if (wt >= 0 || ws2 >= 0) SFX.lose();
  else SFX.ui();
}

/* ═══════════ الرئيسية ═══════════ */
function initHome() {
  // ورقة الرزمة + خلفية البطاقات المنجرفة
  const df = $('#deck-face'); if (df) df.innerHTML = CARD_BACK_SVG;
  const bg = $('#bg-cards');
  const bgCols = ['#7a0f2b', '#0f2b55', '#17603a', '#5b3813'];
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('div');
    b.className = 'bc';
    const c = bgCols[i % bgCols.length];
    b.style.background = `linear-gradient(160deg, ${c}, #000 130%)`;
    b.style.left = (Math.random() * 94) + '%';
    b.style.animationDuration = (16 + Math.random() * 18) + 's';
    b.style.animationDelay = (-Math.random() * 20) + 's';
    b.style.opacity = (.18 + Math.random() * .3).toFixed(2);
    b.style.transform = `rotate(${Math.random() * 70 - 35}deg)`;
    bg.appendChild(b);
  }
  // بطاقات الهيرو
  const hero = [
    { r: 'K', s: '♥', j: false },
    { r: 'Q', s: '♠', j: false },
    { r: 'J', s: '♦', j: false },
  ];
  ['#hero-card1', '#hero-card2', '#hero-card3'].forEach((sel, i) => {
    const el = $(sel); if (el) el.innerHTML = cardSVG(hero[i]);
  });
  $('#inp-name').value = LS.get('majabid.name', '');
  const pk = $('#avatar-picker');
  AVATAR_KEYS.forEach((k) => {
    const b = document.createElement('div');
    b.className = 'av' + (LS.get('majabid.avatar', 'a1') === k ? ' sel' : '');
    b.dataset.a = k; b.innerHTML = avTag(k);
    pk.appendChild(b);
  });
  pk.addEventListener('click', (e) => {
    const b = e.target.closest('.av'); if (!b) return;
    LS.set('majabid.avatar', b.dataset.a);
    pk.querySelectorAll('.av').forEach((x) => x.classList.toggle('sel', x === b));
    updateHomeBar(); SFX.ui();
  });
  $('#inp-name').addEventListener('input', () => { LS.set('majabid.name', $('#inp-name').value.trim().slice(0, 16)); updateHomeBar(); });

  $('#btn-quick').onclick = () => { SFX.ui(); send({ type: 'quick' }); };
  $('#btn-create').onclick = () => { SFX.ui(); send({ type: 'create' }); };
  $('#btn-full').onclick = () => { SFX.ui(); send({ type: 'create' }); };
  $('#btn-rules').onclick = () => { SFX.ui(); $('#modal-rules').classList.remove('hidden'); };

  // الحساب
  $('#tab-login').onclick = () => { SFX.ui(); $('#tab-login').classList.add('on'); $('#tab-reg').classList.remove('on'); $('#form-login').classList.remove('hidden'); $('#form-reg').classList.add('hidden'); };
  $('#tab-reg').onclick = () => { SFX.ui(); $('#tab-reg').classList.add('on'); $('#tab-login').classList.remove('on'); $('#form-reg').classList.remove('hidden'); $('#form-login').classList.add('hidden'); };
  $('#btn-login').onclick = () => {
    const u = $('#auth-user').value.trim(), p = $('#auth-pass').value;
    if (!u || !p) return toast('أدخل اسم المستخدم وكلمة المرور', true);
    SFX.ui(); send({ type: 'login', username: u, password: p });
  };
  $('#btn-reg').onclick = () => {
    const u = $('#reg-user').value.trim(), p = $('#reg-pass').value;
    if (!u || !p) return toast('أدخل اسم المستخدم وكلمة المرور', true);
    SFX.ui();
    send({ type: 'register', username: u, password: p, name: $('#inp-name').value.trim() || u, avatar: LS.get('majabid.avatar', 'a1') });
  };
  $('#btn-logout').onclick = () => { SFX.ui(); send({ type: 'logout', token: authToken }); };

  // الصدارة / الجلسات / المتجر عبر الشريط السفلي
  document.querySelectorAll('.nav-item').forEach((b) => {
    b.onclick = () => {
      SFX.ui();
      document.querySelectorAll('.nav-item').forEach((x) => x.classList.toggle('on', x === b));
      const nav = b.dataset.nav;
      if (nav === 'home') { $('.home-scroll').scrollTo({ top: 0, behavior: 'smooth' }); }
      else if (nav === 'sessions') { send({ type: 'sessions' }); openSheet(); }
      else if (nav === 'leaderboard') { send({ type: 'leaderboard' }); $('#modal-lb').classList.remove('hidden'); }
      else if (nav === 'store') { $('#modal-store').classList.remove('hidden'); }
      else if (nav === 'rules') { $('#modal-rules').classList.remove('hidden'); }
    };
  });
  $('#sessions-row').onclick = () => { send({ type: 'sessions' }); openSheet(); };
  $('#sheet-close').onclick = () => $('#sheet-sessions').classList.add('hidden');
  $('#sheet-sessions').addEventListener('click', (e) => { if (e.target.id === 'sheet-sessions') $('#sheet-sessions').classList.add('hidden'); });

  // الصدارة / المتجر إغلاق
  $('#lb-close').onclick = () => $('#modal-lb').classList.add('hidden');
  $('#store-close').onclick = () => $('#modal-store').classList.add('hidden');
  document.querySelectorAll('.store-item').forEach((b) => {
    b.onclick = () => {
      const th = +b.dataset.theme;
      LS.set('majabid.themePref', th);
      document.body.classList.remove('theme-1', 'theme-2', 'theme-3');
      document.body.classList.add('theme-' + th);
      document.querySelectorAll('.store-item').forEach((x) => x.classList.toggle('on', x === b));
      toast('🎨 سيُستخدم هذا المظهر في طاولاتك الجديدة');
      SFX.ui();
    };
  });
  document.querySelectorAll('.store-item').forEach((x) => x.classList.toggle('on', +x.dataset.theme === LS.get('majabid.themePref', 1)));

  // استطلاع الجلسات
  setInterval(() => {
    if (!$('#screen-home').classList.contains('hidden') && ws && ws.readyState === 1 && Date.now() - lastSessReq > 6000) {
      lastSessReq = Date.now();
      send({ type: 'sessions' });
    }
  }, 6000);
  setTimeout(() => { LS.set('majabid.pid', LS.get('majabid.pid', '')) || send({ type: 'sessions' }); }, 2500);
  updateHomeBar();
}
function updateHomeBar() {
  const name = account ? account.name : ($('#inp-name').value.trim() || 'ضيف');
  $('#home-name').textContent = name;
  $('#home-rank').textContent = account ? `${account.rank.emblem} ${account.rank.name}` : '🃏 مبتدئ';
  $('#home-pts').textContent = account ? account.pts : 0;
  const av = account ? account.avatar : LS.get('majabid.avatar', 'a1');
  $('#home-avatar').innerHTML = avTag(av);
}
function openSheet() { $('#sheet-sessions').classList.remove('hidden'); }

function renderSheetList(list) {
  const items = (list || []).slice(0, 6);
  $('#sessions-count').textContent = items.length;
  $('#sessions-count').classList.toggle('hidden', items.length === 0);
  const box = $('#sheet-list');
  if (!items.length) { box.innerHTML = '<div class="sheet-empty">لا جلسات نشطة الآن — كن أول من يبدأ! 🃏</div>'; return; }
  box.innerHTML = '';
  items.forEach((s) => {
    const el = document.createElement('div');
    el.className = 'session-item';
    const avs = (s.players || []).filter(Boolean).slice(0, 4).map((p) => `<span class="si-av">${avTag(p.avatar)}</span>`).join('');
    const name = (s.players || []).filter(Boolean).map((p) => p.name).join(' · ') || 'طاولة مجهولة';
    const mode = s.mode === 'ffa' ? 'فردي ×4' : 'فريقي 2×2';
    const live = s.phase !== 'lobby';
    const btn = live
      ? `<button class="si-btn watch">👁️ شاهد</button>`
      : `<button class="si-btn">اقعد — متاح ${s.free || 1}</button>`;
    el.innerHTML = `<div class="si-avs">${avs}</div>
      <div class="si-main"><div class="si-name">${esc(name)}</div>
        <div class="si-meta"><span class="si-chip">${mode}</span><span class="si-t">${live ? `مباشر · جولة ${s.round}` : 'بالردهة · بانتظارك'}</span></div></div>
      ${btn}`;
    el.querySelector('button').onclick = () => {
      SFX.ui();
      if (live) send({ type: 'watch', code: s.code });
      else send({ type: 'join', code: s.code });
      $('#sheet-sessions').classList.add('hidden');
    };
    box.appendChild(el);
  });
}

/* ───── الصدارة (منصة) ───── */
function renderLeaderboard(list, my) {
  const podium = $('#lb-podium');
  const rows = $('#lb-list');
  if (!list || !list.length) {
    podium.innerHTML = '<div style="text-align:center;color:#9fd8ac;padding:20px">لا مصنّفين بعد — كن الأول! 🏆</div>';
    rows.innerHTML = ''; return;
  }
  const top = list.slice(0, 3);
  const order = [top[1], top[0], top[2]].filter(Boolean);
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const placeOf = (p) => list.indexOf(p) + 1;
  podium.innerHTML = '';
  for (const p of order) {
    const place = placeOf(p);
    const col = document.createElement('div');
    col.className = 'pod-col p' + place;
    col.innerHTML = `
      <div class="pod-medal">${medals[place]}</div>
      <div class="pod-av">${avTag(p.avatar)}</div>
      <div class="pod-name">${esc(p.name)}</div>
      <div class="pod-rank">${p.rank.emblem} ${p.rank.name}</div>
      <div class="pod-pts">${p.pts} ⚡</div>
      <div class="pod-base">${place}</div>`;
    podium.appendChild(col);
  }
  rows.innerHTML = '';
  list.slice(3).forEach((p, i) => {
    const me = my && p.username === my.username;
    const el = document.createElement('div');
    el.className = 'lb-row' + (me ? ' me' : '');
    el.innerHTML = `<span class="lb-pos">${i + 4}</span><span class="lb-av">${avTag(p.avatar)}</span>
      <span class="lb-name">${esc(p.name)}</span>
      <span class="lb-rank">${p.rank.emblem} ${p.rank.name}</span>
      <span class="lb-pts">${p.pts}</span>`;
    rows.appendChild(el);
  });
  if (my && !list.some((p) => p.username === my.username)) {
    const el = document.createElement('div');
    el.className = 'lb-row me';
    el.innerHTML = `<span class="lb-pos">—</span><span class="lb-av">${avTag(my.avatar)}</span>
      <span class="lb-name">${esc(my.name)} (أنت)</span>
      <span class="lb-rank">${my.rank.emblem} ${my.rank.name}</span>
      <span class="lb-pts">${my.pts}</span>`;
    rows.appendChild(el);
  }
}

/* ═══════════ الحساب ═══════════ */
function applyAccount(acc) {
  account = acc || null;
  const ab = $('#account-box'), au = $('#auth-box'), gf = $('#guest-fields');
  if (account) {
    ab.classList.remove('hidden'); au.classList.add('hidden'); gf.classList.add('hidden');
    $('#ac-av').innerHTML = avTag(account.avatar);
    $('#ac-name').textContent = account.name;
    $('#ac-rank').textContent = `${account.rank.emblem} ${account.rank.name}`;
    $('#rank-bar-i').style.width = Math.round((account.rank.progress || 0) * 100) + '%';
    $('#rank-next').textContent = account.rank.nxt ? `التالي: ${account.rank.nxt.name} عند ${account.rank.nxt.at} نقطة` : 'أعلى رتبة — أسطورة! 🌟';
    $('#ac-pts').textContent = account.pts;
    $('#ac-matches').textContent = account.matches;
    $('#ac-wins').textContent = account.wins;
    $('#ac-best').textContent = account.best || '—';
  } else {
    ab.classList.add('hidden'); au.classList.remove('hidden'); gf.classList.remove('hidden');
  }
}

/* ═══════════ الردهة ═══════════ */
function renderLobby(l) {
  const code = l ? l.code : roomCode;
  if (!code) return;
  if (l && l.config) lobbyCfg = l.config;
  $('#lobby-code').textContent = code;
  const grid = $('#lobby-seats');
  grid.innerHTML = '';
  const seats = l ? l.seats : [null, null, null, null];
  const mode = (lobbyCfg || {}).mode || 'teams';
  document.body.classList.toggle('ffa', mode === 'ffa');
  const th = (lobbyCfg || {}).theme || LS.get('majabid.themePref', 1);
  document.body.classList.remove('theme-1', 'theme-2', 'theme-3');
  document.body.classList.add('theme-' + th);
  seats.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'seat-slot seat-' + i + (s ? ' filled' : '') + (s && s.me ? ' current' : '');
    const tag = mode === 'ffa' ? `لاعب ${i + 1}` + (s && s.isBot ? ' 🤖' : '') : `فريق ${TEAM_NAMES[i % 2]}` + (s && s.isBot ? ' 🤖' : '');
    el.innerHTML = s
      ? `<span class="av">${avTag(s.avatar)}</span><div class="nm">${esc(nm(s))}</div><div class="team-tag">${tag}</div>${s.me ? '<div class="team-tag">⭐ أنت</div>' : ''}`
      : `<span class="av" style="opacity:.35;display:grid;place-items:center;border-style:dashed">➕</span><div class="nm" style="opacity:.45">مقعد فارغ</div><div class="team-tag">${tag}</div>`;
    el.onclick = () => { if (!s || s.me) { SFX.ui(); send({ type: 'seat', idx: i }); } };
    grid.appendChild(el);
  });
  if (l) mySeat = l.seats.findIndex((x) => x && x.me);
  document.querySelectorAll('.lobby-config [data-cfg]').forEach((b) => {
    const ok = String((lobbyCfg || {})[b.dataset.cfg]) === b.dataset.v;
    b.classList.toggle('on', ok);
  });
  $('#lobby-info').innerHTML = mode === 'ffa'
    ? '🎯 <b>فردي ×4:</b> كل واحد لنفسه — يأكل من الجميع. الفائز صاحب أعلى نقاط.'
    : 'شريكك مقابلك: المقعدان <b>0 و2</b> (🔵) ضد <b>1 و3</b> (🔴) · اضغط مقعداً فارغاً لتحجز مكانك';
}

/* ═══════════ أحداث عامة ═══════════ */
function bindGlobal() {
  $('#btn-sound').onclick = () => { muted = !muted; LS.set('majabid.muted', muted); $('#btn-sound').textContent = muted ? '🔇' : '🔊'; SFX.ui(); };
  $('#btn-sound').textContent = muted ? '🔇' : '🔊';
  $('#btn-leave').onclick = () => { send({ type: 'leave' }); roomCode = null; mySeat = -1; S = null; P = null; show('screen-home'); updateHomeBar(); };
  $('#btn-chat').onclick = () => {
    const cp = $('#chat-picker');
    chipOpen = !chipOpen;
    cp.classList.toggle('hidden', !chipOpen);
  };
  const cp = $('#chat-picker');
  CHAT_PHRASES.forEach((p) => {
    const b = document.createElement('div');
    b.className = 'cp-item'; b.textContent = p;
    b.onclick = () => { send({ type: 'chat', text: p }); SFX.chat(); chipOpen = false; cp.classList.add('hidden'); };
    cp.appendChild(b);
  });

  $('#hand').addEventListener('click', (e) => {
    const c = e.target.closest('[data-id]');
    if (!c || animLock) return;
    selected = c.dataset.id;
    SFX.pick();
    renderHand(); renderActions();
  });
  window.addEventListener('resize', () => { if (S) layoutHand(); });

  // إعدادات الردهة
  document.querySelectorAll('.lobby-config [data-cfg]').forEach((b) => {
    b.onclick = () => {
      SFX.ui();
      send({
        type: 'config',
        mode: b.dataset.cfg === 'mode' ? b.dataset.v : undefined,
        target: b.dataset.cfg === 'target' ? +b.dataset.v : undefined,
        theme: b.dataset.cfg === 'theme' ? +b.dataset.v : undefined,
      });
      document.querySelectorAll('.lobby-config [data-cfg="' + b.dataset.cfg + '"]').forEach((x) => x.classList.toggle('on', x === b));
      if (b.dataset.cfg === 'theme') {
        document.body.classList.remove('theme-1', 'theme-2', 'theme-3');
        document.body.classList.add('theme-' + b.dataset.v);
      } else {
        const mode = b.dataset.cfg === 'mode' ? b.dataset.v : (lobbyCfg || {}).mode;
        document.body.classList.toggle('ffa', mode === 'ffa');
      }
    };
  });

  // الانضمام بالكود
  $('#btn-join-code').onclick = () => {
    const code = $('#inp-code').value.trim().toUpperCase();
    if (!code) return toast('اكتب كود الطاولة أولاً', true);
    SFX.ui();
    send({ type: 'join', code });
  };
  $('#inp-code').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && $('#inp-code').value.trim()) $('#btn-join-code').click();
  });

  $('#btn-rules-close').onclick = () => { $('#modal-rules').classList.add('hidden'); SFX.ui(); };
  $('#btn-next-round').onclick = () => { SFX.ui(); send({ type: 'nextround' }); $('#modal-end').classList.add('hidden'); };
  $('#btn-rematch').onclick = () => { SFX.ui(); send({ type: 'rematch' }); $('#modal-end').classList.add('hidden'); };
  $('#btn-end-leave').onclick = () => { send({ type: 'leave' }); roomCode = null; mySeat = -1; S = null; show('screen-home'); updateHomeBar(); };
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#chat-picker') && !e.target.closest('#btn-chat')) { chipOpen = false; $('#chat-picker').classList.add('hidden'); }
  });
  ['#btn-copy', '#btn-share', '#btn-start', '#btn-leave-lobby'].forEach((sel) => {
    const el = $(sel);
    if (!el) return;
    if (sel === '#btn-copy') el.onclick = () => { const url = location.origin + '/?room=' + roomCode; (navigator.clipboard ? navigator.clipboard.writeText(url).then(() => toast('تم نسخ رابط الدعوة 📋')) : toast('الكود: ' + roomCode)); };
    else if (sel === '#btn-share') el.onclick = () => { const url = location.origin + '/?room=' + roomCode; if (navigator.share) navigator.share({ title: 'مجابيد', text: 'يلا نلعب مجابيد معي!', url }); else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('تم نسخ الرابط 📋')); };
    else if (sel === '#btn-start') el.onclick = () => { SFX.ui(); send({ type: 'start' }); };
    else if (sel === '#btn-leave-lobby') el.onclick = () => { send({ type: 'leave' }); roomCode = null; mySeat = -1; show('screen-home'); updateHomeBar(); };
  });
}

/* ═══════════ الإقلاع ═══════════ */
const prefTh = LS.get('majabid.themePref', 1);
document.body.classList.remove('theme-1', 'theme-2', 'theme-3');
document.body.classList.add('theme-' + prefTh);
initHome();
bindGlobal();
fxInit();
connect();
setTimeout(() => { send({ type: 'sessions' }); }, 1800);
