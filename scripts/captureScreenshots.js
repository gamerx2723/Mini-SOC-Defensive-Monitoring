import http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../UI Screenshots');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Locate Chrome / Edge
const browserPaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

const browserExe = browserPaths.find(p => fs.existsSync(p));
if (!browserExe) {
  console.error('No Edge or Chrome executable found.');
  process.exit(1);
}

console.log('Using browser executable:', browserExe);

const PORT = 9222;
const browserProc = spawn(browserExe, [
  '--headless',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1920,1080',
  '--hide-scrollbars'
], { detached: true });

async function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    // Dynamic import WebSocket
    const { WebSocket } = await import('node:http').then(() => {
      return import('ws').catch(() => null);
    });

    if (WebSocket) {
      this.ws = new WebSocket(this.wsUrl);
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
  await wait(2500); // Wait for browser to bind port

  console.log('Fetching targets from debugger...');
  const targets = await fetchJson(`http://localhost:${PORT}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  if (!pageTarget) {
    console.error('No page target available.');
    browserProc.kill();
    process.exit(1);
  }

  const { default: WebSocket } = await import('ws').catch(async () => {
    // If ws module not found, install or use simple ws
    return { default: null };
  });

  if (!WebSocket) {
    console.log('ws package not installed. Will capture via Edge CLI screenshot.');
    browserProc.kill();
    captureViaCli();
    return;
  }

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();

  console.log('Connected to CDP! Navigating to http://localhost:3000/ ...');
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await wait(4000); // Wait for Three.js and particles to load

  const screens = [
    {
      name: '01_SOC_X_Command_Center_Overview.png',
      action: async () => {
        await client.send('Runtime.evaluate', { expression: `window.scrollTo(0,0)` });
        await wait(1500);
      }
    },
    {
      name: '02_Live_Event_Timeline_Stream.png',
      action: async () => {
        await client.send('Runtime.evaluate', {
          expression: `
            const tabs = Array.from(document.querySelectorAll('.soc-nav-tab'));
            const timelineTab = tabs.find(t => t.textContent.includes('EVENT STREAM'));
            if (timelineTab) timelineTab.click();
          `
        });
        await wait(1500);
      }
    },
    {
      name: '03_HTTP_and_DNS_Security_Forensics.png',
      action: async () => {
        await client.send('Runtime.evaluate', {
          expression: `
            const tabs = Array.from(document.querySelectorAll('.soc-nav-tab'));
            const httpTab = tabs.find(t => t.textContent.includes('HTTP / DNS'));
            if (httpTab) httpTab.click();
          `
        });
        await wait(1500);
      }
    },
    {
      name: '04_Asset_Defense_Grid_Topology.png',
      action: async () => {
        await client.send('Runtime.evaluate', {
          expression: `
            const tabs = Array.from(document.querySelectorAll('.soc-nav-tab'));
            const topoTab = tabs.find(t => t.textContent.includes('TOPOLOGY'));
            if (topoTab) topoTab.click();
          `
        });
        await wait(1500);
      }
    },
    {
      name: '05_Kali_RedTeam_Attack_Simulator_Modal.png',
      action: async () => {
        // Return to command center then click simulator
        await client.send('Runtime.evaluate', {
          expression: `
            const tabs = Array.from(document.querySelectorAll('.soc-nav-tab'));
            if (tabs[0]) tabs[0].click();
            const btns = Array.from(document.querySelectorAll('button'));
            const simBtn = btns.find(b => b.textContent.includes('ATTACK SIMULATOR'));
            if (simBtn) simBtn.click();
          `
        });
        await wait(1500);
      }
    },
    {
      name: '06_Raw_Log_Ingestion_Universal_Parser_Modal.png',
      action: async () => {
        await client.send('Runtime.evaluate', {
          expression: `
            const closeBtn = document.querySelector('.soc-card button');
            if (closeBtn) closeBtn.click();
            const btns = Array.from(document.querySelectorAll('button'));
            const ingBtn = btns.find(b => b.textContent.includes('INGEST LOGS'));
            if (ingBtn) ingBtn.click();
          `
        });
        await wait(1500);
      }
    },
    {
      name: '07_Incident_Response_Containment_Playbook_Modal.png',
      action: async () => {
        await client.send('Runtime.evaluate', {
          expression: `
            const closeBtn = document.querySelector('.soc-card button');
            if (closeBtn) closeBtn.click();
            const playbookBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('CONTAINMENT'));
            if (playbookBtns.length > 0) playbookBtns[0].click();
          `
        });
        await wait(1500);
      }
    }
  ];

  for (const screen of screens) {
    console.log(`Capturing ${screen.name}...`);
    await screen.action();
    const { data } = await client.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    const filePath = path.join(targetDir, screen.name);
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    console.log(`Saved: ${filePath}`);
  }

  console.log('All screenshots captured successfully!');
  browserProc.kill();
  process.exit(0);
}

function captureViaCli() {
  const cliScreens = [
    { name: '01_SOC_X_Command_Center.png', url: 'http://localhost:3000/' }
  ];

  for (const item of cliScreens) {
    const outPath = path.join(targetDir, item.name);
    const proc = spawn(browserExe, [
      '--headless',
      `--screenshot=${outPath}`,
      '--window-size=1920,1080',
      '--hide-scrollbars',
      item.url
    ]);
    proc.on('close', () => {
      console.log(`Saved via CLI: ${outPath}`);
    });
  }
}

run().catch(err => {
  console.error('Error in capture script:', err);
  if (browserProc) browserProc.kill();
  process.exit(1);
});
