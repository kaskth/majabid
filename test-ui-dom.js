'use strict';
/* اختبار الواجهة الجديدة 1.4 في DOM حقيقي (jsdom) متصلاً بالسيرفر الفعلي */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const WebSocket = require('ws');

let passed = 0, failed = 0;
const say = (ok, msg) => { console.log((ok ? '✅' : '❌') + ' ' + msg); ok ? passed++ : failed++; };

const html = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
const errors = [];
const dom = new JSDOM(html, {
  url: 'http://127.0.0.1:3001/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});
const { window } = dom;
const { document } = window;
window.WebSocket = WebSocket; // اتصال حقيقي بالسيرفر
window.HTMLCanvasElement.prototype.getContext = () => null;
window.scrollTo = () => { };
if (!window.Element.prototype.scrollTo) window.Element.prototype.scrollTo = () => { };

// تحميل السكربتات بنفس ترتيب الصفحة (في نطاق واحد حتى تترابط الثوابت)
const bundle = ['cards.js', 'app.js'].map((s) => fs.readFileSync(path.join(__dirname, 'public', s), 'utf8')).join('\n;\n');
try { window.eval(bundle); } catch (e) { errors.push(e.message); }

const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 8000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(120); }
  return false;
};

(async () => {
  await sleep(600);

  // ── الرئيسية ──
  say(!errors.length, 'السكربتات أُقلعت بلا أخطاء' + (errors.length ? ' — ' + errors.join('; ') : ''));
  say(!!$('#hero-card1 svg') && !!$('#hero-card2 svg') && !!$('#hero-card3 svg'), 'بطاقات الهيرو الثلاث مرسومة SVG');
  say($('#avatar-picker').children.length === 6 && !!$('#avatar-picker img[src="/avatars/a3.png"]'), 'منتقي الأفاتارات: 6 صور PNG');
  say(!!$('#deck-face svg'), 'ورقة الرزمة (الظهر) مرسومة');
  say(document.querySelectorAll('.nav-item').length === 5, 'شريط التنقل: 5 عناصر');
  // الحساب: صندوق الضيف ظاهر
  say(!$('#guest-fields').classList.contains('hidden') && $('#auth-box') && !$('#auth-box').classList.contains('hidden'), 'واجهة الضيف + الدخول ظاهرة');
  // المحاكاة: انتظر هوية الخادم
  const okId = await until(() => $('#home-rank').textContent.length > 0);
  say(okId, 'استلمنا الهوية: ' + $('#home-rank').textContent);

  // ── المتجر عبر الشريط ──
  document.querySelector('.nav-item[data-nav="store"]').click();
  await sleep(250);
  say(!$('#modal-store').classList.contains('hidden'), 'فتح المتجر (المظهر) يعمل');
  document.querySelector('.store-item[data-theme="2"]').click();
  await sleep(150);
  say(document.body.classList.contains('theme-2'), 'اختيار المظهر يغيّر الثيم');
  $('#store-close').click();
  await sleep(150);
  say($('#modal-store').classList.contains('hidden'), 'إغلاق المتجر');

  // ── لعب سريع ──
  $('#btn-quick').click();
  const inLobby = await until(() => !$('#screen-lobby').classList.contains('hidden'));
  say(inLobby, 'زر «لعب سريع» → شاشة الردهة');
  const code = $('#lobby-code').textContent;
  say(/^[A-Z0-9]{4,6}$/.test(code), 'كود الطاولة ظاهر: ' + code);
  say(document.querySelectorAll('#lobby-seats .seat-slot').length === 4, '4 مقاعد في الردهة');
  await sleep(400);
  say($('#lobby-seats .seat-slot.filled') != null, 'مقعدي محجوز (filled)');

  // ── إعدادات الردهة ──
  document.querySelector('.lobby-config [data-cfg="mode"][data-v="ffa"]').click();
  const ffaOk = await until(() => $('#lobby-info').textContent.includes('فردي ×4'));
  say(ffaOk, 'تفعيل وضع «فردي ×4» في الردهة');
  document.querySelector('.lobby-config [data-cfg="target"][data-v="1000"]').click();
  document.querySelector('.lobby-config [data-cfg="theme"][data-v="3"]').click();
  await sleep(400);

  // ── بدء اللعب ──
  $('#btn-start').click();
  const inGame = await until(() => !$('#screen-game').classList.contains('hidden'), 12000);
  say(inGame, 'بدء اللعب → شاشة الطاولة');
  const deckOk = await until(() => parseInt($('#deck-count').textContent, 10) > 300, 8000);
  say(deckOk, 'عداد الرزمة: ' + $('#deck-count').textContent);
  const handOk = await until(() => document.querySelectorAll('.hand .card').length >= 10, 8000);
  say(handOk, `اليد ظاهرة: ${document.querySelectorAll('.hand .card').length} بطاقة`);
  say($('#seat-zone-0 .player') != null && $('#seat-zone-1 .player') != null, 'المقاعد الأربعة مرسومة على الطاولة');
  say(/theme-3/.test(document.body.className), 'ثيم 3 مطبق على الطاولة');

  // لا undefined في أي نص
  await sleep(400);
  say(!document.body.innerHTML.includes('undefined'), 'لا كلمة undefined في أي مكان بالواجهة');

  // ── شريط السجل ──
  const logOk = await until(() => $('#log').children.length > 0, 12000);
  say(logOk, 'شريط السجل ينسدل بالأحداث');

  // ── الدور: إن كان دوري العب ورقة ──
  const myTurnOk = await until(() => !$('#my-turn').classList.contains('hidden'), 30000);
  const actionsN = $('#actions').children.length;
  if (myTurnOk && actionsN > 0) {
    const eatBtn = $('#actions .chip-btn.gold');
    const discBtn = [...$('#actions').children].find((b) => b.textContent.includes('ارمي'));
    const btn = eatBtn || discBtn;
    btn.click();
    await sleep(1200);
    say(true, 'لعبت حركة (زر ' + (eatBtn ? 'أكل' : 'رمي') + ') من الواجهة');
  } else {
    say(false, 'لم يصل دوري خلال 30 ثانية (أزرار: ' + actionsN + ')');
  }

  // ── الصدارة ──
  document.querySelectorAll('.nav-item[data-nav="leaderboard"]')[0]?.click();
  await sleep(400);
  say(!$('#modal-lb').classList.contains('hidden'), 'فتح الصدارة يعمل');
  // تسجيل حساب سريع ثم فحص فتح اللوحة مجدداً
  const user = 'flash' + (Date.now() % 100000);
  $('#tab-reg').click();
  $('#reg-user').value = user;
  $('#reg-pass').value = 'pass1234';
  $('#btn-reg').click();
  const acctOk = await until(() => !$('#account-box').classList.contains('hidden'), 6000);
  say(acctOk, 'إنشاء حساب من الواجهة → صندوق الحساب (' + $('#ac-name').textContent + ')');
  say(/مبتدئ/.test($('#ac-rank').textContent), 'رتبة مبتدئ معروضة: ' + $('#ac-rank').textContent);

  console.log(`\n===== نتيجة UI DOM: ${passed} ✅ / ${failed} ❌ =====`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
