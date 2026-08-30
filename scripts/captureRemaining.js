import http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.resolve(__dirname, '../UI Screenshots');

const browserExe = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9223;

const browserProc = spawn(browserExe, [
  '--headless',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1920,1080',
  '--hide-scrollbars'
], { detached: true });

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }
  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      });
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function run() {
  await wait(2500);
  const targets = await fetchJson(`http://localhost:${PORT}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await wait(4000);

  // 1. Scrolled Command Center Bottom (Security Analysis & Event Timeline)
  console.log('Capturing 08_Command_Center_Scrolled_Analytics_Timeline.png...');
  await client.send('Runtime.evaluate', { expression: `window.scrollTo(0, 650);` });
  await wait(1500);
  let res = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, '08_Command_Center_Scrolled_Analytics_Timeline.png'), Buffer.from(res.data, 'base64'));

  // 2. Forensic Log Inspector Modal (Click first row in table)
  console.log('Capturing 09_Event_Forensics_Payload_Inspector_Modal.png...');
  await client.send('Runtime.evaluate', {
    expression: `
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      if (rows.length > 0) rows[0].click();
    `
  });
  await wait(1500);
  res = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, '09_Event_Forensics_Payload_Inspector_Modal.png'), Buffer.from(res.data, 'base64'));

  console.log('Finished capturing additional views!');
  browserProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  if (browserProc) browserProc.kill();
  process.exit(1);
});
