// leadChannel — ช่องทางที่มา + สถานะ 5 ค่า + นิยาม "ติดต่อได้" + "บิลจ่ายแล้ว" ของ lead ใน CRM เซล (DEV-1642)
// ──────────────────────────────────────────────────────────────────────────────────────────────
// 📜 สัญญา (single source ของ "ความหมาย") = lanes/dev/source/contract-channel-dashboard.md §1 · §2 · §3
//    ❌ ห้ามแก้กติกาที่นี่ก่อนแก้สัญญา — ไฟล์นี้คือ "สูตรเดียว" ที่สัญญาสั่ง (`channelOf(lead)` ใช้ร่วม)
//
// 🧬 ไฟล์นี้มี 2 สำเนาที่ต้องตรงกันทุกไบต์ (CommonJS ล้วน · ไม่ require อะไรเลย · ไม่แตะฐาน):
//    ① scanfood_server/functions/claude/marketingExport/leadChannel.js   ← ต้นฉบับ (เส้น hub §4 ใช้)
//    ② scanfood-office/src/Utility/leadChannel.js                        ← จอ CRM เซลใช้ (CRA import CJS ได้)
//    เหตุที่ต้องมีสำเนา: 2 repo คนละ build ไม่มีแพ็กเกจกลางร่วมกัน (scanfood-office ไม่ได้ vendor @scanfood/logic)
//    ⇒ แก้ = แก้ ① แล้ว `cp` ทับ ② · เทสของทั้ง 2 ฝั่งรันเคสชุดเดียวกัน (leadChannel.cases.json วางคู่กันทั้ง 2 ที่)
//    ทางถาวร = ย้ายเข้า @scanfood/logic (เสนอไว้ใน progress-crm-lead-status-bill.md)
'use strict';

// ── §1 ช่องทาง (ลำดับ = ลำดับแถวบนจอ) ─────────────────────────────────────────────────────────
const CHANNEL_KEYS = Object.freeze([
  'facebook', 'google-search', 'google-app', 'apple-search', 'chatgpt', 'line', 'tiktok', 'website', 'unknown',
]);
const CHANNEL_LABEL = Object.freeze({
  facebook: 'Facebook / Instagram',
  'google-search': 'Google Search',
  'google-app': 'Google App (Play Store)',
  'apple-search': 'Apple Search Ads',
  chatgpt: 'ChatGPT Ads',
  line: 'LINE Ads',
  tiktok: 'TikTok Ads',
  website: 'เว็บไซต์ / SEO + AI (ไม่จ่ายเงิน)',
  unknown: 'ไม่รู้ที่มา',
});

// §1 ข้อ 3 — utm_source (ตัวเล็ก) → ช่อง
const UTM_MAP = Object.freeze({
  google: 'google-search',
  chatgpt: 'chatgpt',
  openai: 'chatgpt',
  line: 'line',
  tiktok: 'tiktok',
  facebook: 'facebook',
  meta: 'facebook', // สัญญา §1 ข้อ 3 (commit 9fb7c50)
  fb: 'facebook',
  instagram: 'facebook',
  ig: 'facebook',
  apple: 'apple-search',
  play: 'google-app',
  googleplay: 'google-app',
});

const nonEmpty = (v) => (typeof v === 'string' ? v.trim().length > 0 : typeof v === 'number' && Number.isFinite(v));
const lower = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

/** อ่านสัญญาณ attribution จากทั้งชั้นบนสุดของ lead และก้อน `attribution` (รูปฟอร์มเว็บ OFFICE-0071) */
function attr(lead, key) {
  const top = lead[key];
  if (nonEmpty(top)) return top;
  const a = lead.attribution && typeof lead.attribution === 'object' ? lead.attribution : null;
  return a && nonEmpty(a[key]) ? a[key] : '';
}

/**
 * มาจากฟอร์มเว็บไหม (§1 ข้อ 4) — ป้ายที่ของจริงในฐานมี (ground 2026-09-25):
 *   · ฟอร์มขอคำปรึกษา scanfood.co → `leads`@scanfood-ops: `createdBy:'web-form'` + ก้อน `attribution`
 *   · ฟอร์มเก่า `/meta/tracking/registerLead` → `lead`@shopchamp: `event_source_url` + `meta.completeRegistrationEventId`
 */
function isWebForm(lead) {
  if (lead.createdBy === 'web-form') return true;
  if (lead.attribution && typeof lead.attribution === 'object') return true;
  if (nonEmpty(lead.event_source_url)) return true;
  return !!(lead.meta && nonEmpty(lead.meta.completeRegistrationEventId));
}

/** §1 — lead → key ช่องทาง 1 ใน 9 (ไม่มีทางคืนค่านอก CHANNEL_KEYS) */
function channelOf(lead) {
  const l = lead && typeof lead === 'object' ? lead : {};
  // 1. Meta instant form
  if (nonEmpty(l.adId) || nonEmpty(l.campaignId) || nonEmpty(l.formId)) return 'facebook';
  if (['fb', 'ig'].includes(lower(l.platform))) return 'facebook';
  // 2. click id
  if (nonEmpty(attr(l, 'gclid')) || nonEmpty(attr(l, 'gbraid')) || nonEmpty(attr(l, 'wbraid'))) return 'google-search';
  if (nonEmpty(attr(l, 'fbclid'))) return 'facebook';
  // 3. utm_source
  const utm = lower(attr(l, 'utm_source'));
  if (utm && UTM_MAP[utm]) return UTM_MAP[utm];
  // 3.5 lead ที่เซลคีย์มือ / แหล่งภายใน (แม่ตัดสิน 2026-09-26) — `source` ขึ้นต้น facebook_ → facebook · line_ → line
  //     app_engagement → unknown (แยก Play/App Store ไม่ได้) · facebook_instant_form ที่ formId ว่างก็เข้าข้อนี้
  const src = lower(l.source);
  if (src.startsWith('facebook_')) return 'facebook';
  if (src.startsWith('line_')) return 'line';
  if (src === 'app_engagement') return 'unknown';
  // 4. ฟอร์มเว็บที่ไม่มีสัญญาณข้างบน
  if (isWebForm(l)) return 'website';
  // 5.
  return 'unknown';
}

// ── §2 สถานะ 5 ค่า ──────────────────────────────────────────────────────────────────────────
const STATUS_KEYS = Object.freeze(['not_contacted', 'contacting', 'unreachable', 'rejected', 'closed']);
const STATUS_LABEL = Object.freeze({
  not_contacted: 'ยังไม่ติดต่อ',
  contacting: 'ติดต่ออยู่',
  unreachable: 'ติดต่อไม่ได้',
  rejected: 'ปฏิเสธ',
  closed: 'ปิดการขาย',
});
// ค่าเดิมที่จอเก่า/server ยังเขียนอยู่ (contactLead เขียน 'contacted' · runSendPurchaseEvent เขียน 'purchased')
const LEGACY_STATUS = Object.freeze({
  registered: 'not_contacted',
  waiting: 'not_contacted',
  in_progress: 'contacting',
  contacted: 'contacting',
  not_interested: 'rejected',
  purchased: 'closed',
});

/** ค่าในฐาน (เก่าหรือใหม่) → 1 ใน 5 · ค่าที่ไม่รู้จัก = null (ให้ผู้เรียกโชว์ว่าผิดปกติ ❌ ไม่เดาเป็นค่าไหน) */
function normalizeStatus(raw) {
  if (typeof raw !== 'string') return null;
  if (STATUS_KEYS.includes(raw)) return raw;
  return Object.prototype.hasOwnProperty.call(LEGACY_STATUS, raw) ? LEGACY_STATUS[raw] : null;
}

/** §2 นิยาม "ติดต่อได้" — timeline มี contact/contacted หรือสถานะปัจจุบัน rejected/closed · unreachable ไม่นับ */
function isContacted(lead) {
  const l = lead && typeof lead === 'object' ? lead : {};
  const tl = Array.isArray(l.timeline) ? l.timeline : [];
  if (tl.some((e) => e && (e.type === 'contact' || e.type === 'contacted'))) return true;
  const s = normalizeStatus(l.status);
  return s === 'rejected' || s === 'closed';
}

const isClosed = (lead) => normalizeStatus(lead && lead.status) === 'closed';

/**
 * §3 (แม่ตัดสิน 2026-09-26) — นับ "ปิดการขาย" = สถานะ closed/purchased **หรือ** มีบิลจ่ายแล้วผูกอยู่ (ทาง ก ∪ ข)
 * ⇒ closed กับ revenue นับประชากรเดียวกันเสมอ · `hasPaidBill` = ผู้เรียกหาเองจากบิล (ไฟล์นี้ไม่แตะฐาน)
 */
const isClosedWithBills = (lead, hasPaidBill) => isClosed(lead) || hasPaidBill === true;

// ── §3 บิลจ่ายแล้ว (ground 2026-09-25 · ดูสัญญา §3 ส่วน "dev ground") ─────────────────────────
//   packageOrder: `success` (เปิดใช้แล้ว) · `request` (จ่ายแล้ว รอถึงวันเปิดใช้ — cron 07:00 ดึงไปเปิด)
//   hardwareOrder: ใบเกิดหลังจ่ายเงินเท่านั้น (`billing/autoPayment.js`) → `prepare`→`packed`→`sending`→`sent`/`success`
//   ❌ ไม่นับ: `cancel` (ยกเลิก) · `order` (คิวตรวจสลิปยุคเก่า — ไม่มีโค้ดเขียนแล้ว) · ค่าอื่นที่ไม่รู้จัก (fail-closed)
const PAID_STATUS = Object.freeze({
  packageOrder: Object.freeze(['success', 'request']),
  hardwareOrder: Object.freeze(['prepare', 'packed', 'sending', 'sent', 'success']),
});
function isPaidBill(collection, bill) {
  const list = PAID_STATUS[collection];
  return !!(list && bill && list.includes(bill.status));
}
/** ยอดบิล = `net` (ตัวเลข) · อ่านไม่ได้ = 0 */
function billNet(bill) {
  const n = bill && (typeof bill.net === 'number' ? bill.net : Number(bill.net));
  return Number.isFinite(n) ? n : 0;
}

module.exports = {
  CHANNEL_KEYS, CHANNEL_LABEL, UTM_MAP, channelOf, isWebForm,
  STATUS_KEYS, STATUS_LABEL, LEGACY_STATUS, normalizeStatus, isContacted, isClosed, isClosedWithBills,
  PAID_STATUS, isPaidBill, billNet,
};
