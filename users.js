'use strict';
/* ============================================================
   مجابيد — حساب المستخدمين (تخزين ملفي + Scrypt + جلسات)
   - تسجيل/دخول بكلمة مرور مشفّرة
   - نقطة تنافسية + مباريات/فوز/أفضل جولة
   - رتب رمزية (مبتدئ → أسطورة)
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FILE = path.join(__dirname, 'users.json');
let db = { users: {}, byId: {}, sessions: {} };
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { /* أول تشغيل */ }

function save() {
  try { fs.writeFileSync(FILE, JSON.stringify(db)); } catch (e) { console.error('users save:', e.message); }
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/;
const hash = (pw, salt) => crypto.scryptSync(String(pw), salt, 32).toString('hex');

/* ---------- الرتب ---------- */
const RANKS = [
  { name: 'مبتدئ', at: 0, emblem: '🃏' },
  { name: 'متمرّس', at: 100, emblem: '🎯' },
  { name: 'صيّاد', at: 250, emblem: '🗡️' },
  { name: 'مَجابِد', at: 500, emblem: '👑' },
  { name: 'شيخ الطاولة', at: 1000, emblem: '🕌' },
  { name: 'أسطورة', at: 2000, emblem: '🌟' },
];
function rankOf(pts) {
  let cur = RANKS[0], nxt = null;
  for (const r of RANKS) { if (pts >= r.at) cur = r; else { nxt = r; break; } }
  let progress = 1;
  if (nxt) progress = Math.min(1, (pts - cur.at) / (nxt.at - cur.at));
  return { cur, nxt, progress };
}

/* ---------- API ---------- */
function pub(u) {
  return {
    username: u.username, name: u.name, avatar: u.avatar,
    pts: u.pts, matches: u.matches || 0, wins: u.wins || 0, best: u.best || 0,
    games: (u.games || []).slice(0, 5),
  };
}
function pubFull(u) {
  const p = pub(u);
  const r = rankOf(p.pts);
  return { ...p, rank: { name: r.cur.name, emblem: r.cur.emblem, at: r.cur.at, nxt: r.nxt ? { name: r.nxt.name, at: r.nxt.at } : null, progress: r.progress } };
}

function newSession(username) {
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = { username, at: Date.now() };
  if (Object.keys(db.sessions).length > 3000)
    for (const k of Object.keys(db.sessions))
      if (Date.now() - db.sessions[k].at > 30 * 864e5) delete db.sessions[k];
  return token;
}

function register(username, password, name, avatar) {
  username = String(username || '').toLowerCase().trim();
  if (!USERNAME_RE.test(username)) return { ok: false, err: 'اسم المستخدم: 3–16 حرفاً إنجليزياً أو أرقاماً أو _' };
  if (String(password || '').length < 4) return { ok: false, err: 'كلمة المرور 4 أحرف على الأقل' };
  if (db.users[username]) return { ok: false, err: 'اسم المستخدم محجوز — جرّب غيره' };
  const salt = crypto.randomBytes(12).toString('hex');
  const u = {
    id: 'u-' + crypto.randomBytes(8).toString('hex'), username,
    name: String(name || username).slice(0, 16), avatar: avatar || 'a1',
    salt, pass: hash(password, salt),
    pts: 0, matches: 0, wins: 0, best: 0, games: [],
    created: Date.now(),
  };
  db.users[username] = u;
  db.byId[u.id] = username;
  const token = newSession(username);
  save();
  return { ok: true, token, user: pubFull(u) };
}

function login(username, password) {
  username = String(username || '').toLowerCase().trim();
  const u = db.users[username];
  if (!u) return { ok: false, err: 'لا يوجد حساب بهذا الاسم' };
  if (hash(String(password || ''), u.salt) !== u.pass) return { ok: false, err: 'كلمة المرور غير صحيحة' };
  const token = newSession(username);
  save();
  return { ok: true, token, user: pubFull(u) };
}

function logout(token) {
  if (token && db.sessions[token]) { delete db.sessions[token]; save(); }
}

function byToken(token) {
  if (!token || typeof token !== 'string') return null;
  const s = db.sessions[token];
  if (!s) return null;
  return db.users[s.username] || null;
}
function getByPid(pid) {
  const username = db.byId[pid];
  return username ? db.users[username] || null : null;
}

/* تعديل نقاط/إحصاءات مع حفظ */
function apply(username, fn) {
  const u = db.users[username];
  if (!u) return null;
  fn(u);
  save();
  return u;
}

function leaderboard(limit = 10) {
  const list = Object.values(db.users)
    .map((u) => ({ ...pub(u), rank: rankOf(u.pts).cur }))
    .sort((a, b) => b.pts - a.pts || b.wins - a.wins)
    .slice(0, limit);
  return list;
}

module.exports = { register, login, logout, byToken, getByPid, apply, leaderboard, pubFull, rankOf, RANKS };
