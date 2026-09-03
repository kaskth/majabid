const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\kaskth\\.gemini\\antigravity\\brain\\9a937fe3-979a-46dd-bf3e-f3554f7acecc';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

async function run() {
  const tabs = await getJson('http://127.0.0.1:9222/json');
  const tab = tabs.find(t => t.type === 'page');
  if (!tab) {
    console.error('No page tab found');
    process.exit(1);
  }

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.on('message', (raw) => {
    const data = JSON.parse(raw);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data.result);
      callbacks.delete(data.id);
    }
  });

  async function capture(url, w, h, isMobile, filename, waitMs = 3500) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: isMobile ? 2 : 1,
      mobile: isMobile,
    });
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, waitMs));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(targetDir, filename), Buffer.from(shot.data, 'base64'));
    console.log(`Saved ${filename}`);
  }

  ws.on('open', async () => {
    console.log('Connected to Chrome DevTools Protocol');
    await send('Page.enable');

    // 1. Mobile Home Page (Clean, real, no fake options)
    await capture('http://localhost:3005/', 390, 844, true, 'screenshot_mobile_home.png', 2000);

    // 2. Mobile In-Game Portrait (390x844) - All 4 players clearly visible
    await capture('http://localhost:3005/?quick=1&theme=1', 390, 844, true, 'screenshot_mobile_game_portrait.png', 4000);

    // 3. Mobile In-Game Landscape (844x390) - Horizontal layout
    await capture('http://localhost:3005/?quick=1&theme=1', 844, 390, true, 'screenshot_mobile_game_landscape.png', 3500);

    // 4. Desktop In-Game (1280x800)
    await capture('http://localhost:3005/?quick=1&theme=1', 1280, 800, false, 'screenshot_desktop_game.png', 3500);

    ws.close();
    process.exit(0);
  });
}

run().catch(console.error);
