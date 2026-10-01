// SalesReadOnly.js — หมวด "3. Sales" ดูได้อย่างเดียว (DEV-1664 · Pack เคาะ 2026-10-01)
//
// 3 ชิ้นในไฟล์เดียว:
//   ① <SalesReadOnly> — ห่อ route ของหมวด 3 ใน App.js · ให้ context + แถบ "ย้ายไป scanoffice แล้ว"
//   ② useSalesReadOnly() — จอ/คอมโพเนนต์อ่านว่าตัวเองอยู่ใต้หมวด 3 ที่ล็อกอยู่ไหม (นอก wrapper = false เสมอ)
//   ③ salesWriteBlocked(readOnly, what) — บรรทัดแรกของทุกฟังก์ชันเขียน: ล็อก = toast + คืน true ให้ return ทันที
//
// ทำไมต้องเป็น context ไม่ใช่ flag ตรง ๆ: คอมโพเนนต์/ยูทิลบางตัว (Modal_Quotation · telegram.js) ใช้ร่วมกับ
// หมวดอื่นที่ยังต้องเขียนได้ (ETax · คลัง) ⇒ ล็อกได้เฉพาะตอนถูก render ใต้หมวด 3 เท่านั้น
import React, { createContext, useContext } from 'react';
import { toast } from 'react-toastify';
import { LEGACY_SALES_READONLY, SCANOFFICE_SALES_URL } from '../configs/legacySales';

export const SalesReadOnlyContext = createContext(false);

export const SALES_READONLY_BANNER = 'หมวดนี้ย้ายไป scanoffice แล้ว — ดูได้อย่างเดียว';
export const SALES_READONLY_MESSAGE = 'หมวด 3. Sales ดูได้อย่างเดียว — สร้าง/แก้ข้อมูลที่ scanoffice';

/** pure: ล็อกก็ต่อเมื่อสวิตช์เปิด และ อยู่ใต้หมวด 3 (ครบทั้ง 2 ข้อ) */
export function isSalesReadOnly(flag, inSalesSection) {
  return Boolean(flag) && Boolean(inSalesSection);
}

export function useSalesReadOnly() {
  return useContext(SalesReadOnlyContext);
}

/**
 * ด่านของฟังก์ชันเขียน — ใช้เป็นบรรทัดแรก: `if (salesWriteBlocked(salesReadOnly, 'สร้าง lead')) return;`
 * คืน true = ถูกล็อก (toast แจ้งแล้ว) · false = เขียนต่อได้ตามปกติ
 */
export function salesWriteBlocked(readOnly, what) {
  if (!readOnly) return false;
  toast.warn(what ? `${SALES_READONLY_MESSAGE} (${what})` : SALES_READONLY_MESSAGE);
  return true;
}

export function SalesReadOnlyBanner() {
  return (
    <div
      data-testid="sales-readonly-banner"
      role="status"
      style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 1rem',
        padding: '10px 14px', margin: '0 0 12px 0',
        backgroundColor: '#fff3cd', color: '#664d03', border: '1px solid #ffe69c', borderRadius: 8,
      }}
    >
      <span><i className="bi bi-lock-fill" />&nbsp;<b>{SALES_READONLY_BANNER}</b></span>
      <a href={SCANOFFICE_SALES_URL} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
        เปิดงานเซลบน scanoffice
      </a>
      <span style={{ fontSize: 12, color: '#8a6d1a', wordBreak: 'break-all' }}>{SCANOFFICE_SALES_URL}</span>
    </div>
  );
}

/** ห่อ element ของ route หมวด 3 — `enabled` เปิดไว้ให้เทส · ของจริงอ่านจากสวิตช์ใน configs/legacySales.js */
export function SalesReadOnly({ children, enabled = LEGACY_SALES_READONLY }) {
  const readOnly = isSalesReadOnly(enabled, true);
  return (
    <SalesReadOnlyContext.Provider value={readOnly}>
      {readOnly ? <SalesReadOnlyBanner /> : null}
      {children}
    </SalesReadOnlyContext.Provider>
  );
}

export default SalesReadOnly;
