#!/usr/bin/env node
// check-live-parity.mjs — กันไม่ให้ build ทับของที่ live ด้วยซอร์สที่ตามหลัง (OFFICE-0024 · 2026-08-11)
//
// 🧨 เรื่องที่ทำให้ต้องมีตัวนี้ (10 ส.ค. 2026):
//    ซอร์สของเว็บนี้ถูกเขียนต่อจากเครื่องคนเขียนเดิม **แล้วไม่เคยถูก push ขึ้น GitHub**
//    เมื่อ clone จาก GitHub มา build แล้วปล่อยขึ้น = ทับของที่พนักงานใช้อยู่ด้วยของที่เก่ากว่า 5 สัปดาห์
//    ⇒ หาย 24 ไฟล์ · เมนูหาย 7 รายการ (พนักงานทักว่า "ข้อ 3.10 หายไป")
//    ตอนนั้น **ไม่มีอะไรส่งเสียงเลยสักจุด** — build เขียว เทสเขียว ปล่อยขึ้นเรียบร้อย
//
// 🔍 ตัวนี้ถามคำถามเดียว: **"ของที่ live อยู่ มีอะไรที่ในเครื่องเราไม่มีบ้าง"**
//    ตอบได้เพราะ build ที่ปล่อยขึ้นแนบ source map (`sourcesContent`) = ซอร์สต้นฉบับของจริง
//
// 🚦 เกณฑ์ปัด (เลือกเฉพาะสัญญาณที่บอก "ทิศ" ได้ — ไม่ใช่แค่ "ต่างกัน"):
//    🔴 ไฟล์ที่ live มี แต่ในเครื่องไม่มีไฟล์นั้นเลย        → ปัด (ของกำลังจะหาย)
//    🔴 รายการเมนูที่ live มี แต่ในเครื่องไม่มี             → ปัด (จอกำลังจะหายจากสายตาพนักงาน)
//    🔴 ไฟล์ static ที่ live มี แต่ `public/` ไม่มี         → ปัด (รูป/ไฟล์แนบกำลังจะหาย — เพิ่ม 2026-08-13)
//    ⚪ ไฟล์ที่มีทั้งคู่แต่เนื้อต่าง                        → แค่รายงาน (แก้โค้ดปกติก็ต่าง — บอกทิศไม่ได้)
//
// 🧨 ทำไมต้องเพิ่มแกน static (13 ส.ค. 2026 — ด่านตัวนี้เองมีรู):
//    รอบ 11 ส.ค. ด่านนี้ขึ้นเขียวแล้วปล่อยผ่าน **แต่ไฟล์รูปหายไป 13 ไฟล์จริง ๆ**
//    (`kshop.jpg` = QR กสิกรบนใบเสนอราคา · `signature.png` = ลายเซ็นบนใบกำกับภาษี · รูป lead อีก 11)
//    เพราะด่านอ่านจาก **source map** ซึ่งมีแต่ไฟล์ `.js` — รูปใน `public/` ไม่เคยอยู่ในสายตามันเลย
//    ⇒ ประชากรที่ด่านวัด (ไฟล์ js) ≠ ประชากรที่ deploy ทับ (ทุกไฟล์บน hosting)
//    ❌ ท่าที่ดูเหมือนพอแต่ไม่พอ: ไล่หาชื่อรูปที่ถูกอ้างในซอร์ส — 6 ใน 13 ไฟล์ถูกอ้างแบบ `src={`/${item.id}.png`}`
//       (ประกอบชื่อตอนรัน) ⇒ ค้นด้วยชื่อไฟล์ไม่มีวันเจอ · ต้องถามรายชื่อไฟล์จริงจาก Hosting เท่านั้น
//
// 🔒 อ่านของที่ live ไม่ได้ = **ปัด ไม่ใช่ปล่อยผ่าน**
//    "อ่านไม่ได้" ไม่เท่ากับ "ไม่มีอะไรหาย" — ปล่อยผ่านตอนไม่รู้ = ด่านที่เงียบตอนที่ต้องดังที่สุด
//    ตั้งใจจะข้ามจริง (ออฟไลน์ · เน็ตล่ม) = `SKIP_LIVE_PARITY=1 npm run build`
//
// รัน: npm run check:live            (หรือวิ่งเองอัตโนมัติทุกครั้งที่ `npm run build` — ดู `prebuild`)
//      node scripts/check-live-parity.mjs <path/ไป/main.js.map>   ← เทียบกับ map ในเครื่อง (ใช้ตอนทดสอบตัวด่านเอง)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const LIVE = 'https://scanfoodoffice.web.app';
const MENU_FILE = path.join(SRC, 'configs/initialOffice.js');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SITE = 'scanfoodOffice';
const PROJECT = 'shopchamp-restaurant';

// ไฟล์บน hosting ที่ build สร้างเอง/Firebase ใส่ให้ — ไม่ได้มาจาก public/ ⇒ ไม่ต้องมีคู่ในเครื่อง
const GENERATED = (p) =>
  p.startsWith('/static/') ||        // ผลลัพธ์ของ webpack (ชื่อมี hash · เปลี่ยนทุก build)
  p.startsWith('/__/') ||            // Firebase Hosting ใส่ให้เอง (init.js / init.json)
  p === '/asset-manifest.json' ||    // CRA สร้าง
  p === '/index.html';               // CRA สร้างจาก public/index.html (เป็น template)

if (process.env.SKIP_LIVE_PARITY === '1') {
  console.log('⏭️  ข้ามด่านเทียบกับของที่ live (SKIP_LIVE_PARITY=1)');
  process.exit(0);
}

const die = (msg) => { console.error(`\n🚫 ${msg}\n   ตั้งใจข้าม = SKIP_LIVE_PARITY=1 npm run build\n`); process.exit(1); };

/** โหลด source map ของ bundle ที่ live อยู่ (หรือจากไฟล์ในเครื่องถ้าส่ง argv มา) */
async function loadLiveMap() {
  const local = process.argv[2];
  if (local) {
    if (!fs.existsSync(local)) die(`ไม่พบไฟล์ map ที่ระบุ: ${local}`);
    return { map: JSON.parse(fs.readFileSync(local, 'utf8')), from: local };
  }
  let html;
  try {
    const r = await fetch(`${LIVE}/`);
    if (!r.ok) die(`เปิดหน้า live ไม่สำเร็จ (http ${r.status}) — ยังไม่รู้ว่าของที่ live มีอะไร`);
    html = await r.text();
  } catch (e) {
    die(`ต่อ ${LIVE} ไม่ได้ (${e.message}) — ยังไม่รู้ว่าของที่ live มีอะไร`);
  }
  const m = html.match(/static\/js\/main\.[A-Za-z0-9]+\.js/);
  if (!m) die('หา bundle ในหน้า live ไม่เจอ — รูปหน้าเปลี่ยนไปจากที่ด่านนี้รู้จัก');
  const r = await fetch(`${LIVE}/${m[0]}.map`);
  if (!r.ok) die(`bundle ที่ live ไม่มี source map (http ${r.status}) — เทียบไม่ได้ว่ามีอะไรจะหายไหม`);
  return { map: JSON.parse(await r.text()), from: `${LIVE}/${m[0]}` };
}

/** หา firebase-tools ที่ติดตั้งอยู่บนเครื่อง (ไม่ได้เป็น dependency ของ repo นี้) */
function findFirebaseTools() {
  const cands = [];
  const npx = path.join(process.env.HOME || '', '.npm/_npx');
  if (fs.existsSync(npx)) {
    for (const d of fs.readdirSync(npx)) cands.push(path.join(npx, d, 'node_modules/firebase-tools'));
  }
  cands.push('/opt/homebrew/lib/node_modules/firebase-tools', '/usr/local/lib/node_modules/firebase-tools');
  cands.push(path.join(ROOT, 'node_modules/firebase-tools'));
  return cands.find((c) => fs.existsSync(path.join(c, 'lib/hosting/api.js'))) || null;
}

/**
 * รายชื่อไฟล์ทั้งหมดของเวอร์ชันที่ปล่อยอยู่จริง (ผ่าน Hosting API — ต้องล็อกอิน firebase CLI ไว้)
 * 🔒 ถามไม่ได้ = ปัด ไม่ใช่ปล่อยผ่าน (หลักเดียวกับ loadLiveMap ข้างบน)
 */
async function loadLiveStaticFiles() {
  const FT = findFirebaseTools();
  if (!FT) die('หา firebase-tools บนเครื่องไม่เจอ — ถามรายชื่อไฟล์ที่ live ไม่ได้ ⇒ ไม่รู้ว่ามีรูปจะหายไหม');
  let auth, requireAuth, hostingApi, Client;
  try {
    auth = await import(`${FT}/lib/auth.js`);
    ({ requireAuth } = await import(`${FT}/lib/requireAuth.js`));
    hostingApi = await import(`${FT}/lib/hosting/api.js`);
    ({ Client } = await import(`${FT}/lib/apiv2.js`));
  } catch (e) {
    die(`โหลด firebase-tools ไม่สำเร็จ (${e.message}) — ถามรายชื่อไฟล์ที่ live ไม่ได้`);
  }
  const options = { project: PROJECT };
  const account = auth.getGlobalDefaultAccount();
  if (!account) die('firebase CLI ยังไม่ได้ล็อกอิน (`npx firebase login`) — ถามรายชื่อไฟล์ที่ live ไม่ได้');
  auth.setActiveAccount(options, account);
  try {
    await requireAuth(options);
  } catch (e) {
    die(`ยืนยันตัวตนกับ Firebase ไม่ผ่าน (${e.message})`);
  }
  const versions = await hostingApi.listVersions(SITE);
  const latest = versions
    .map((v) => ({ id: v.name.split('/').pop(), created: v.createTime }))
    .sort((a, b) => String(b.created).localeCompare(String(a.created)))[0];
  if (!latest) die(`ไม่พบเวอร์ชันใด ๆ ของ site ${SITE}`);

  const client = new Client({ urlPrefix: 'https://firebasehosting.googleapis.com', apiVersion: 'v1beta1', auth: true });
  const files = [];
  let pageToken;
  do {
    const res = await client.get(`/sites/${SITE}/versions/${latest.id}/files`, {
      queryParams: { pageSize: 1000, ...(pageToken ? { pageToken } : {}) },
    });
    for (const f of res.body.files || []) files.push(f.path);
    pageToken = res.body.nextPageToken;
  } while (pageToken);
  if (!files.length) die(`เวอร์ชัน ${latest.id} ตอบรายชื่อไฟล์มา 0 ไฟล์ — เทียบไม่ได้`);
  return { files, versionId: latest.id, created: latest.created };
}

const live = await loadLiveStaticFiles();
const missingAssets = live.files
  .filter((p) => !GENERATED(p))
  .filter((p) => !fs.existsSync(path.join(PUBLIC_DIR, p.replace(/^\//, ''))));

const { map, from } = await loadLiveMap();
const sources = map.sources || [];
const contents = map.sourcesContent || [];

// ไฟล์ของแอปเอง: path ใน map เป็น relative ต่อ src/ (ของนอก src ขึ้นต้นด้วย '../')
const liveFiles = [];
for (let i = 0; i < sources.length; i++) {
  const s = sources[i];
  if (s.startsWith('../') || s.includes('node_modules')) continue;
  if (!/\.(js|jsx|ts|tsx|css|json)$/.test(s)) continue;
  liveFiles.push({ rel: 'src/' + s, content: contents[i] });
}
if (!liveFiles.length) die('อ่านรายชื่อไฟล์จาก source map ของ live ไม่ได้สักไฟล์ — เทียบไม่ได้');

const norm = (t) => (t == null ? '' : t.replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim());
const missingFiles = [];
const changedFiles = [];
for (const f of liveFiles) {
  const p = path.join(ROOT, f.rel);
  if (!fs.existsSync(p)) missingFiles.push(f.rel);
  else if (norm(fs.readFileSync(p, 'utf8')) !== norm(f.content)) changedFiles.push(f.rel);
}

// รายการเมนู: ดึงจาก bundle ที่ live (ผ่าน sourcesContent ของ configs/initialOffice.js) เทียบกับในเครื่อง
const topics = (text) => {
  const out = new Set();
  for (const m2 of text.matchAll(/topic:\s*['"]([0-9]+(?:\.[0-9]+)+)\s/g)) out.add(m2[1]);
  return out;
};
const liveMenuSrc = liveFiles.find((f) => f.rel.endsWith('configs/initialOffice.js'));
let missingMenu = [];
if (!liveMenuSrc) die('ไม่พบไฟล์เมนูใน source map ของ live — เทียบรายการเมนูไม่ได้');
if (!fs.existsSync(MENU_FILE)) die('ไม่พบไฟล์เมนูในเครื่อง');
{
  const here = topics(fs.readFileSync(MENU_FILE, 'utf8'));
  missingMenu = [...topics(liveMenuSrc.content)].filter((t) => !here.has(t));
}

console.log(`\n🔍 เทียบกับของที่ปล่อยอยู่จริง: ${from}`);
console.log(`   ซอร์ส: ไฟล์ที่ live มี ${liveFiles.length} · ในเครื่องไม่มี ${missingFiles.length} · เนื้อต่าง ${changedFiles.length}`);
console.log(`   static: เวอร์ชัน ${live.versionId} (${live.created}) มี ${live.files.length} ไฟล์ · public/ ไม่มี ${missingAssets.length}`);
if (changedFiles.length) console.log(`   ⚪ เนื้อต่าง (ปกติถ้ากำลังแก้โค้ดอยู่): ${changedFiles.slice(0, 5).join(', ')}${changedFiles.length > 5 ? ` … อีก ${changedFiles.length - 5}` : ''}`);

if (missingFiles.length || missingMenu.length || missingAssets.length) {
  console.error('\n🔴 ของที่ live อยู่ มีของที่ซอร์สในเครื่องไม่มี — build แล้วปล่อยขึ้นตอนนี้ = ทับของพนักงานหาย');
  if (missingFiles.length) {
    console.error(`\n   ไฟล์ที่จะหาย (${missingFiles.length}):`);
    missingFiles.forEach((r) => console.error('     · ' + r));
  }
  if (missingAssets.length) {
    console.error(`\n   ไฟล์ static ที่จะหาย (${missingAssets.length}) — live มี แต่ public/ ไม่มี:`);
    missingAssets.forEach((r) => console.error('     · ' + r));
    console.error('     👉 กู้: ให้ Pack โคลนเวอร์ชันที่มีของไปช่องทดสอบ แล้วดึงไฟล์กลับเข้า public/ + commit');
  }
  if (missingMenu.length) {
    console.error(`\n   รายการเมนูที่จะหาย (${missingMenu.length}): ${missingMenu.join(' · ')}`);
  }
  console.error('\n   👉 ก่อนไปต่อ: ดึงซอร์สของ build ที่ live กลับมาก่อน');
  console.error('      วิธีที่ใช้ได้จริง (OFFICE-0024): โคลนเวอร์ชันที่ต้องการไปช่องทดสอบแล้วอ่าน source map ของมัน');
  console.error('      (รายละเอียด: lanes/dev/source/progress-office-0024-scanfoodoffice-regression.md)\n');
  process.exit(1);
}

console.log(`\n✅ ซอร์สในเครื่องครอบของที่ live ครบ — ไม่มีไฟล์ซอร์ส · ไฟล์ static และรายการเมนูที่จะหาย\n`);
