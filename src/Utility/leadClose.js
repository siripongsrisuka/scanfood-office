// leadClose — กติกา "ปิดการขาย = ผูกบิล" + เปลี่ยนสถานะ lead ของจอ CRM เซล (DEV-1642 ② ①)
// ────────────────────────────────────────────────────────────────────────────────
// 📜 สัญญา lanes/dev/source/contract-channel-dashboard.md §2 (สถานะ) · §3 (ผูกบิล)
// ไฟล์นี้ pure ล้วน (ไม่แตะ Firestore) ⇒ จอเอาไปใช้ใน transaction · เทส = leadClose.test.js
//
// โครงข้อมูลที่เขียน (ย้ายไป scanoffice ได้ตรงตัว · จดใน progress-crm-lead-status-bill.md):
//   บิล (`packageOrder`/`hardwareOrder`) : + `leadId`  (id ของ doc ใน `leads` — ❌ ไม่ใช่ lead.id ในเนื้อ doc ซึ่งเป็นเลขของ Meta)
//   lead (`leads`)                        : `status:'closed'` · `billRefs:[{ collection, id, orderNumber }]`
//                                           · timeline + `{ type:'closed', timestamp, by, bills:['<collection>/<id>'] }`
//   ยอดขายของ lead = คำนวณสดจากบิล (leadRevenue) — ❌ ไม่เก็บตัวเลขยอดไว้ที่ lead (กันตัวเลขค้างเมื่อบิลถูกยกเลิกทีหลัง)
import { isPaidBill, billNet, normalizeStatus, isClosedWithBills, STATUS_KEYS, STATUS_LABEL } from './leadChannel';

export const BILL_COLLECTIONS = ['packageOrder', 'hardwareOrder'];
export const BILL_LABEL = { packageOrder: 'ซอฟต์แวร์', hardwareOrder: 'ฮาร์ดแวร์' };
export const billKey = (b) => `${b.collection}/${b.id}`;

/**
 * บิลนี้เลือกผูกกับ lead นี้ได้ไหม → null = ได้ · string = เหตุที่ไม่ได้ (โชว์บนจอ)
 * @param leadDocId id ของ doc lead
 * @param bill { collection, id, data }
 */
export function billBlockReason(leadDocId, bill) {
  if (!bill || !BILL_COLLECTIONS.includes(bill.collection)) return 'ไม่ใช่บิลซอฟต์แวร์/ฮาร์ดแวร์';
  const d = bill.data || {};
  if (d.status === 'cancel') return 'บิลถูกยกเลิกแล้ว';
  if (d.leadId && d.leadId !== leadDocId) return 'บิลนี้ผูกกับ lead อื่นแล้ว';
  return null;
}

/**
 * ตรวจก่อนปิดการขาย (ใช้ทั้งตอนกดบนจอ และซ้ำใน transaction กับค่าสดจากฐาน)
 * @returns { ok:true } | { ok:false, error }
 */
export function validateClose(leadDocId, bills) {
  if (!leadDocId) return { ok: false, error: 'ไม่พบ lead' };
  if (!Array.isArray(bills) || bills.length === 0) return { ok: false, error: 'ปิดการขายต้องผูกบิลอย่างน้อย 1 ใบ' };
  const seen = new Set();
  for (const b of bills) {
    const why = billBlockReason(leadDocId, b);
    if (why) return { ok: false, error: `${(b && b.data && b.data.orderNumber) || (b && b.id) || '?'}: ${why}` };
    if (seen.has(billKey(b))) return { ok: false, error: 'เลือกบิลซ้ำ' };
    seen.add(billKey(b));
  }
  return { ok: true };
}

/**
 * ของที่ต้องเขียนเมื่อปิดการขาย (pure) — จอเอาไปเขียนใน transaction เดียว
 * @param lead   ข้อมูล lead ปัจจุบัน (สดจากฐาน) · ใช้ timeline/billRefs เดิม
 * @param bills  [{ collection, id, data }] บิลที่เลือก (สดจากฐาน)
 */
export function planClose({ leadDocId, lead, bills, now, by }) {
  const v = validateClose(leadDocId, bills);
  if (!v.ok) return v;
  const prevRefs = Array.isArray(lead && lead.billRefs) ? lead.billRefs : [];
  const refs = [...prevRefs];
  for (const b of bills) {
    if (!refs.some((r) => r.collection === b.collection && r.id === b.id)) {
      refs.push({ collection: b.collection, id: b.id, orderNumber: (b.data && b.data.orderNumber) || '' });
    }
  }
  const timeline = [...(Array.isArray(lead && lead.timeline) ? lead.timeline : []),
    { type: 'closed', timestamp: now, by: by || '', bills: bills.map(billKey) }];
  return {
    ok: true,
    leadUpdate: { status: 'closed', billRefs: refs, timeline, updatedAt: now },
    billUpdates: bills.map((b) => ({ collection: b.collection, id: b.id, update: { leadId: leadDocId } })),
  };
}

/**
 * เปลี่ยนสถานะที่ไม่ต้องผูกบิล (ยังไม่ติดต่อ · ติดต่ออยู่ · ติดต่อไม่ได้ · ปฏิเสธ)
 * ❌ `closed` ต้องไป planClose เท่านั้น — ทางนี้ปัด (กันปิดการขายโดยไม่มีบิล)
 */
export function planStatus({ lead, next, now, by }) {
  if (!STATUS_KEYS.includes(next)) return { ok: false, error: `สถานะไม่รู้จัก: ${next}` };
  if (next === 'closed') return { ok: false, error: 'ปิดการขายต้องผูกบิลอย่างน้อย 1 ใบ' };
  if (normalizeStatus(lead && lead.status) === next) return { ok: false, error: 'สถานะเดิมอยู่แล้ว' };
  const timeline = [...(Array.isArray(lead && lead.timeline) ? lead.timeline : []), { type: next, timestamp: now, by: by || '' }];
  return { ok: true, leadUpdate: { status: next, timeline, updatedAt: now } };
}

/** ยอดขายจริงของ lead = ผลรวม net ของบิลที่จ่ายแล้ว (§3) · bills = [{ collection, id, data }] */
export function leadRevenue(bills) {
  const seen = new Set();
  let sum = 0;
  for (const b of bills || []) {
    if (!b || seen.has(billKey(b))) continue;
    seen.add(billKey(b));
    if (isPaidBill(b.collection, b.data)) sum += billNet(b.data);
  }
  return Math.round(sum * 100) / 100;
}

// ── จอเซลนับ "ปิดการขาย" ตัวเดียวกับ dashboard (สัญญา §3 แม่ตัดสิน 2026-09-26 · leadChannel.isClosedWithBills) ──
/**
 * รวมบิลของ lead เป็นก้อนเดียว (pure) — ทาง ก (billRefs) ∪ ทาง ข (autoPayment.leadId → reference) · บิลละครั้ง
 * @param leads     [{ id, billRefs? }]
 * @param apDocs    [{ leadId, reference:[billId] }] (autoPayment ที่อ่านมาเป็นก้อน)
 * @param billsById Map<'<collection>/<id>', { collection, id, data }> (บิลที่อ่านมาเป็นก้อน)
 * @returns Map<leadId, { revenue, hasPaidBill }> — มีเฉพาะ lead ที่เจอบิลอย่างน้อย 1 ใบ
 */
export function billSummaryByLead({ leads, apDocs, billsById }) {
  const refsOf = new Map((leads || []).map((l) => [l.id, new Set((l.billRefs || []).map((r) => `${r.collection}/${r.id}`))]));
  for (const ap of apDocs || []) {
    const set = refsOf.get(ap.leadId);
    if (!set) continue;
    for (const ref of Array.isArray(ap.reference) ? ap.reference : []) {
      for (const c of BILL_COLLECTIONS) set.add(`${c}/${ref}`); // id ไม่บอก collection — ตัวที่ไม่มีจริงจะไม่อยู่ใน billsById
    }
  }
  const out = new Map();
  for (const [leadId, keys] of refsOf) {
    const bills = [...keys].map((k) => billsById.get(k)).filter(Boolean);
    if (!bills.length) continue;
    out.set(leadId, { revenue: leadRevenue(bills), hasPaidBill: bills.some((b) => isPaidBill(b.collection, b.data)) });
  }
  return out;
}

export const CLOSED_BY_BILL_LABEL = 'ปิดการขายแล้ว (มีบิลจ่าย)';
/** สถานะที่จอโชว์/นับ = ตัวเดียวกับ dashboard · ไม่เขียนลงฐาน → { key, label, byBill } */
export function effectiveStatus(lead, hasPaidBill) {
  const raw = normalizeStatus(lead && lead.status);
  if (isClosedWithBills(lead, hasPaidBill)) {
    return raw === 'closed' ? { key: 'closed', label: STATUS_LABEL.closed, byBill: false }
      : { key: 'closed', label: CLOSED_BY_BILL_LABEL, byBill: true };
  }
  return { key: raw, label: raw ? STATUS_LABEL[raw] : null, byBill: false };
}
