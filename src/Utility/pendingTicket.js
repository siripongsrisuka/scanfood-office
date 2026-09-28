// Utility/pendingTicket — ด่าน "ห้ามออก QT ซ้ำให้ร้านที่มีใบแพ็กเกจค้าง" **ตอนออกใบ** (Pack เคาะเมนู 3 · 2026-09-28)
// ─────────────────────────────────────────────────────────────────────────────
// 🩸 เคสเฮงปังปั๊ว: ใบแรก (QT…182) ค้าง `packageOrder.status='request'` → เซลออก QT ใหม่ 2 ใบ (…304 · …388)
//    ให้แพ็กเกจเดียวกัน → ทั้งคู่จ่าย+เปิด = ร้านได้สิทธิ์ 2 รอบ
// 🔴 หลัก Pack: "เมื่อชำระเงินแล้ว ลูกค้าต้องได้ของจริง" ⇒ ด่านต้องอยู่ **ก่อนเงินเข้า** เท่านั้น
//    = ตอนเซลกดเปิดบิลบนจอนี้ (ก่อนขอ QR/สร้าง autoPayment) · ❌ ห้ามมีด่านที่ webhook/cron/applyPackageOrderTxn
//    (ของเดิมที่เคยวางไว้ตรงนั้นถูกถอนแล้ว — scanfood_server `b3755e7`)
//
// 🔑 ไฟล์นี้ **ไม่ import อะไรเลย** — ตรรกะล้วน (เทสด้วย jest ตรง ๆ) · ส่วนที่คุยกับ Firestore อยู่ที่ SaleScreen
//    ตรรกะ overlap ยกมาจาก `findPendingTicket` ที่เทสแล้ว (scanfood_server `00924c2` · เทียบ packageId เป็นสตริง)
//
// ขอบเขต (Pack): บล็อกเฉพาะ **ร้านเดียวกัน + แพ็กเกจซ้อนกัน** และ
//   ① มีใบ `packageOrder` สถานะ `request` (ลูกค้าจ่ายแล้ว รอเปิดสิทธิ์) — ให้ **เปิดใช้งาน/ยกเลิกใบเดิม** ก่อน
//   ② มี QT (`autoPayment`) ของร้านเดียวกันที่ **ยังไม่จ่าย** และแพ็กเกจซ้อนกัน — ให้ **ยกเลิก QT เดิม** ก่อน
//      (ถ้าปล่อยผ่าน ลูกค้าจ่ายทั้ง 2 ใบ = ได้สิทธิ์ 2 รอบเหมือนเดิม — ไม่ต่างจากข้อ ①)
//   ✅ ไม่บล็อก: ฮาร์ดแวร์ล้วน · โหมด 1 เดือน (software ว่าง) · แพ็กเกจคนละชุด · ร้านอื่น · ใบเดิม success/cancel/failed

/** สถานะ `autoPayment.process` ที่ยังนับว่า "ยังไม่จ่าย" (ground จากโค้ดจริง — ห้ามเดา):
 *   request    = ขอ QR แล้ว รอลูกค้าจ่าย (SaleScreen.js `process:'request'` สาย posxpay)
 *   checking   = cron กำลังถาม provider (scanfood_server `claude/admin/package.js` PENDING_PROCESSES)
 *   preManual  = สาย kbank/beam รอลูกค้าอัปสลิป (SaleScreen.js `process:'preManual'` · ManualPaidScreen reverse)
 *   manual     = อัปสลิปแล้ว รอทีมงานตรวจ (components/Quotation.js `process:'manual'`)
 *  ⚠️ Firestore `in` รับได้ไม่เกิน 10 ค่า — ตอนนี้ 4 */
export const UNPAID_PROCESSES = ['request', 'checking', 'preManual', 'manual'];

/** สถานะใบแพ็กเกจที่ "จ่ายแล้ว รอเปิดสิทธิ์" = ใบที่ต้องถูกเปิด/ยกเลิกก่อนออกใบใหม่ */
export const PENDING_TICKET_STATUS = 'request';

const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));

/** รหัสแพ็กเกจของ QT ที่กำลังจะออก = `software[].id` (ตรงกับที่ server ใช้สร้าง `packageOrder.packageId`
 *  · scanfood_server `applyPackageOrderTxn`: `packageId = software.map(a => a.id)`) · เทียบเป็นสตริงเสมอ */
export function softwareIdsOf(quotation) {
  const sw = quotation && Array.isArray(quotation.software) ? quotation.software : [];
  return sw.map((a) => (a && a.id != null ? String(a.id) : '')).filter(Boolean);
}

function overlapOf(ids, candidateIds) {
  const want = new Set(ids.map(String));
  return (Array.isArray(candidateIds) ? candidateIds : []).map(String).filter((id) => want.has(id));
}

/**
 * หาใบ `packageOrder` ค้างที่แพ็กเกจซ้อนกับที่กำลังจะออก (ตรรกะเดียวกับ `findPendingTicket` ฝั่ง server)
 * @param {Array<{id:string,status?:string,packageId?:any[],orderNumber?:string,requestBillDate?:string}>} tickets ใบของร้านนี้ (คิวรีมาแล้ว)
 * @param {string[]} ids รหัสแพ็กเกจของ QT ใหม่
 * @returns {null | {id, orderNumber, requestBillDate, packageId, overlap}}
 */
export function findPendingTicket(tickets, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return null;
  for (const t of Array.isArray(tickets) ? tickets : []) {
    if (!t || t.status !== PENDING_TICKET_STATUS) continue; // กันกรณีผู้เรียกส่งใบทุกสถานะมา
    const overlap = overlapOf(ids, t.packageId);
    if (overlap.length > 0) {
      return { id: str(t.id), orderNumber: str(t.orderNumber), requestBillDate: str(t.requestBillDate), packageId: Array.isArray(t.packageId) ? t.packageId.map(String) : [], overlap };
    }
  }
  return null;
}

/**
 * หา QT ของร้านนี้ที่ **ยังไม่จ่าย** และแพ็กเกจซ้อนกัน
 * @param {Array<{id:string,process?:string,software?:any[],orderNumber?:string,requestBillDate?:string,saleName?:string}>} quotations
 * @param {string[]} ids
 */
export function findUnpaidQuotation(quotations, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return null;
  for (const q of Array.isArray(quotations) ? quotations : []) {
    if (!q || !UNPAID_PROCESSES.includes(q.process)) continue;
    const overlap = overlapOf(ids, softwareIdsOf(q));
    if (overlap.length > 0) {
      return { id: str(q.id), orderNumber: str(q.orderNumber), requestBillDate: str(q.requestBillDate), process: str(q.process), saleName: str(q.saleName), overlap };
    }
  }
  return null;
}

/** แปลรหัสแพ็กเกจเป็นชื่อให้คนอ่าน (licenses = ราคา software ที่จอโหลดไว้แล้ว) · ไม่รู้จัก = โชว์รหัสตรง ๆ */
export function describePackages(ids, licenses) {
  const byId = new Map((Array.isArray(licenses) ? licenses : []).map((l) => [String(l && l.id), l]));
  return (Array.isArray(ids) ? ids : []).map((id) => {
    const l = byId.get(String(id));
    const name = l ? [l.content, l.name, l.day].filter((x) => x != null && x !== '').join(' ').trim() : '';
    return name ? `${name} (${id})` : String(id);
  }).join(', ');
}

export function pendingTicketMessage(p, licenses) {
  return `❌ ออกใบใหม่ไม่ได้ — ร้านนี้มีใบแพ็กเกจ ${p.orderNumber || p.id} ที่ลูกค้าจ่ายแล้วและ**ยังรอเปิดใช้งานอยู่**\n`
    + `แพ็กเกจ: ${describePackages(p.overlap, licenses)}`
    + (p.requestBillDate ? `\nวันเริ่มใช้ที่ตั้งไว้: ${p.requestBillDate}` : '')
    + '\n\nให้ยกเลิกหรือเปิดใบเดิมก่อน (จอ scanoffice › อนุมัติแพ็กเกจ) แล้วค่อยออกใบใหม่ '
    + '— ออกซ้ำแล้วลูกค้าจ่ายทั้ง 2 ใบ = ร้านได้สิทธิ์ 2 รอบ';
}

export function unpaidQuotationMessage(q, licenses) {
  return `❌ ออกใบใหม่ไม่ได้ — ร้านนี้มีใบเสนอราคา ${q.orderNumber || q.id} แพ็กเกจเดียวกันที่**ยังไม่ได้จ่าย** (สถานะ ${q.process}`
    + (q.saleName ? ` · เซล ${q.saleName}` : '') + ')\n'
    + `แพ็กเกจ: ${describePackages(q.overlap, licenses)}`
    + (q.requestBillDate ? `\nวันเริ่มใช้ที่ตั้งไว้: ${q.requestBillDate}` : '')
    + '\n\nให้ยกเลิกใบเดิมก่อน (แท็บ "ใบเสนอราคา" ของจอนี้ › เลือกใบ › ยกเลิก · หรือแจ้งผู้ออกใบ) แล้วค่อยออกใบใหม่ '
    + '— ปล่อยไว้ 2 ใบ ลูกค้าจ่ายทั้งคู่ = ร้านได้สิทธิ์ 2 รอบ';
}

/**
 * ตัดสินก่อนออก QT — pure: ผู้เรียกคิวรี `tickets` (packageOrder ของร้าน · status request) และ
 * `quotations` (autoPayment ของร้าน · process ยังไม่จ่าย) มาให้
 * @returns {{ok:true}|{ok:false, kind:'pending-ticket'|'unpaid-quotation', message:string, detail:object}}
 */
export function checkBeforeIssue({ quotation, tickets, quotations, licenses }) {
  const ids = softwareIdsOf(quotation);
  if (ids.length === 0) return { ok: true }; // ฮาร์ดแวร์ล้วน / โหมด 1 เดือน = ไม่มีแพ็กเกจให้ซ้อน
  const pending = findPendingTicket(tickets, ids);
  if (pending) return { ok: false, kind: 'pending-ticket', message: pendingTicketMessage(pending, licenses), detail: pending };
  const unpaid = findUnpaidQuotation(quotations, ids);
  if (unpaid) return { ok: false, kind: 'unpaid-quotation', message: unpaidQuotationMessage(unpaid, licenses), detail: unpaid };
  return { ok: true };
}
