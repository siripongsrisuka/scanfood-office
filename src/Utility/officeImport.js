// Utility/officeImport — ของใช้ร่วมของ 3 จอ "อัปโหลด Excel" (DEV-1266)
// ──────────────────────────────────────────────────────────────────────────────
// 3 จอนี้เคย `db.batch().set(...)` เขียน Firestore ตรงจากเบราว์เซอร์ (ไม่มี validate · ไม่มี
// idempotency · ไม่มี ledger) — ตอนนี้ยิงเข้าเส้น server แทน · ไฟล์นี้เก็บของที่ทั้ง 3 จอใช้เหมือนกัน
// ⚠️ UI/ปุ่ม/รูปแบบไฟล์ Excel **ไม่เปลี่ยนสักช่อง** — ที่เปลี่ยนคือเส้นทางข้อมูลหลังบ้าน

// path ของเส้น server (baseURL ของ `scanfoodAPI` = ราก cloudfunctions)
//   ก้อน `claude_agent` = ก้อนงาน ops ภายใน (ดู `functions/claude/workloads.js` แถว `/office-import`)
export const OFFICE_IMPORT = {
  bomShop: "/claude_agent/office-import/bom-shop",
  bomFranchise: "/claude_agent/office-import/bom-franchise",
  warehouseItem: "/claude_agent/office-import/warehouse-item",
};

// 🪤 ExcelJS คืนค่าเป็น **object** ได้หลายทรง — ของเดิมยัดทั้งก้อนลง Firestore ตรง ๆ
//    (`{richText:[…]}` จากช่องที่จัดรูปแบบ · `{result}` จากสูตร · `{text,hyperlink}` จากลิงก์)
//    ⇒ แปลงเป็นค่าพื้นฐานก่อนส่งเสมอ · แปลงไม่ได้ = ส่งของเดิมไป ให้ server ปัดพร้อมบอกเลขแถว
//    (❌ ไม่กลืนเงียบเป็นค่าว่าง — ผู้ใช้ต้องรู้ว่าช่องไหนในไฟล์มีปัญหา)
export function cellValue(v) {
  if (v === undefined || v === null) return "";
  if (typeof v === "string" || typeof v === "number") return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if (Array.isArray(v.richText)) return v.richText.map((r) => (r && r.text) || "").join("");
    if (v.result !== undefined) return cellValue(v.result);          // ช่องสูตร
    if (typeof v.text === "string") return v.text;                    // ไฮเปอร์ลิงก์
    if (v.error) return v;                                            // #REF! ฯลฯ = ปล่อยให้ server ปัด
  }
  return v;
}

// ข้อความ error ที่คนอัปโหลดอ่านแล้วรู้ว่าต้องไปแก้แถวไหนในไฟล์
//   server ตอบรูป D4 `{ ok:false, error, message }` — `message` ของเส้นนี้บอกเลขแถวใน Excel มาแล้ว
export function importErrorText(err) {
  const data = (err && err.response && err.response.data) || null;
  if (data && (data.message || data.error)) return data.message || data.error;
  if (err && err.message) return err.message;
  return "อัปโหลดไม่สำเร็จ";
}
