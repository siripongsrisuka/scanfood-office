// legacySales.js — สวิตช์เดียวของหมวด "3. Sales" บนเว็บเก่า (DEV-1664 · Pack เคาะ 2026-10-01)
//
// Pack: "ไม่ใช่การย้าย แต่เป็นการคัดลอกสำเนา ตัวจริงยังเปิดดูได้ที่ scanfoodoffice
//        แค่สร้างหรือเปลี่ยนแปลงข้อมูลอะไรไม่ได้อีก"
// ⇒ ทุกจอหมวด 3 ยังเปิดดูได้ · ปุ่ม/ช่องที่เขียนข้อมูลถูกซ่อน · และฟังก์ชันเขียนทุกตัวถูกกันซ้ำอีกชั้น
//    (ปุ่มหลุดมาก็เขียนไม่ได้) — เครื่องบังคับ = `components/SalesReadOnly.js`
//
// ปิดสวิตช์ (กลับไปเขียนได้) = เปลี่ยนค่าเดียวนี้เป็น false แล้ว build ใหม่ · ❌ อย่าไปแก้ทีละจอ
export const LEGACY_SALES_READONLY = true;

// ที่ใหม่ของงานเซล — แถบบนทุกจอหมวด 3 พาไปที่นี่
export const SCANOFFICE_SALES_URL = 'https://scanoffice.web.app/sales/leads';

// route ใต้ /office ที่อยู่ในหมวด 3 (จาก configs/initialOffice.js 3.1-3.11)
// ⚠️ newShop (2.2) · packageHistory (1.2) · hardwareHistory (1.3) ใช้จอเดียวกันกับหมวด 1-2 ⇒ ล็อกไปด้วย
//    (ข้อมูลที่จอเหล่านี้เขียน = ข้อมูลเซลชุดเดียวกัน) · lead = index route ของ /office ด้วย
export const LEGACY_SALES_ROUTES = [
  'saleManager',
  'sale',
  'commission',
  'executiveSalesLeaderboard',
  'commissionHistory',
  'newShop',
  'extraDay',
  'extraDayHistory',
  'oneMonthShop',
  'manualPaid',
  'packageHistory',
  'hardwareHistory',
  'lead',
  'reportLinkCodeFalse',
];
