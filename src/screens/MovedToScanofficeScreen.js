import React from "react";

// หน้าแจ้งย้าย — เมนู 6.1-6.7 · 6.9-6.12 ปิดบนเว็บนี้แล้ว (OFFICE-0044..0047 · OFFICE-0055..0059 · DEV-1632 ③ · Pack เคาะ 4a 2026-09-24)
// route เดิมยังเปิดได้ (bookmark/ลิงก์เก่า) แต่พาไปแท็บใหม่บน scanoffice ทีม Tech แทนจอเก่า
// จอเก่า (CloneScreen.js · Import*.js) ยังอยู่ในโค้ด แต่ไม่มี route ไหนพาไปแล้ว
// — 6.1 เดิมยิง legacy `/shop/cloneShop` ที่ปิดแล้ว (ตอบ 410)
export const MOVED_TO_SCANOFFICE = {
  clone: { topic: "6.1 คัดลอกร้าน", tab: "คัดลอกร้าน", route: "shop-clone" },
  importItem: { topic: "6.2 อัปโหลดสินค้าร้านเดี่ยว", tab: "อัปสินค้าร้านเดี่ยว", route: "product-shop" },
  importBomShop: { topic: "6.3 อัปโหลดวัตถุดิบร้านเดี่ยว", tab: "อัปวัตถุดิบร้านเดี่ยว", route: "bom-shop" },
  importItemFranchise: { topic: "6.4 อัปโหลดสินค้าแฟรนไชส์", tab: "อัปสินค้าแฟรนไชส์", route: "product-franchise" },
  importBomFranchise: { topic: "6.5 อัปโหลดวัตถุดิบแฟรนไชส์", tab: "อัปวัตถุดิบแฟรนไชส์", route: "bom-franchise" },
  importMarketPlaceFranchise: { topic: "6.6 อัปโหลด Marketplace", tab: "อัปสินค้า Marketplace แฟรนไชส์", route: "marketplace" },
  // 6.7 · 6.9-6.12 (OFFICE-0055..0059 · 2026-09-24) — 6.8 ไม่ย้าย (Pack 3b)
  transferExpire: { topic: "6.7 ย้ายวันใช้งาน", tab: "ย้ายวันใช้งาน", route: "shop-days-move" },
  transferOwner: { topic: "6.9 เปลี่ยนสิทธิ์ Owner", tab: "เปลี่ยนเจ้าของร้าน", route: "shop-owner" },
  changeTable: { topic: "6.10 เปลี่ยนโต๊ะ", tab: "เปลี่ยนจำนวนโต๊ะ", route: "store-size" },
  uploadStaff: { topic: "6.11 อัปโหลดพนักงาน", tab: "สร้างบัญชีพนักงาน", route: "staff-account" },
  resetPassword: { topic: "6.12 รีเซ็ตรหัสผ่าน", tab: "เปลี่ยนรหัสผ่าน", route: "password-reset" },
  // 7.1-7.3 (2026-09-24 · Pack สั่งย้ายกลุ่ม 7) — ไปกลุ่ม CS ไม่ใช่ทีม Tech ⇒ ระบุ group + url เต็ม
  emailKbank: { topic: "7.1 ส่งอีเมล Kbank", group: "CS", tab: "ส่งเมลให้ร้าน (เนื้อเมล Kbank)", url: "https://scanoffice.web.app/cs/email-send" },
  emailTax: { topic: "7.2 ส่งอีเมล ขอหมายเลขเครื่อง POS", group: "CS", tab: "ส่งเมลให้ร้าน (เนื้อเมลสรรพากร)", url: "https://scanoffice.web.app/cs/email-send" },
  emailPrinter: { topic: "7.3 ส่งอีเมล เครื่องปริ้น", group: "CS", tab: "ส่งเมลให้ร้าน (เมนูนี้เลิกใช้แล้ว — เลือกเนื้อเมลที่ต้องการแทน)", url: "https://scanoffice.web.app/cs/email-send" },
  // 7.4-7.7 + 6.99 (2026-09-25 · Pack สั่งย้ายกลุ่ม 7 ทั้งแถบ)
  upgrade: { topic: "7.4 เพิ่มโต๊ะ", group: "ทีม Tech", tab: "ปรับขนาดร้าน (เพิ่มโต๊ะ)", url: "https://scanoffice.web.app/admin/configs/store-size-upgrade" },
  upgradeHistory: { topic: "7.5 ประวัติเพิ่มโต๊ะ", group: "ทีม Tech", tab: "ประวัติปรับขนาดร้าน", url: "https://scanoffice.web.app/admin/configs/store-size-upgrade-history" },
  kbank: { topic: "7.6 kbank", group: "CS", tab: "เคส KBank", url: "https://scanoffice.web.app/cs/kbank-cases" },
  source: { topic: "7.7 สื่อต่างๆ", group: "เมนูหลัก", tab: "สื่อต่างๆ", url: "https://scanoffice.web.app/media" },
  kbankReport: { topic: "6.99 kbankReport", group: "ทีม Tech", tab: "รายงาน KBank", url: "https://scanoffice.web.app/admin/configs/kbank-report" },
  // 3.10 Leads + 6.13 CRM Lead (DEV-1642 · สัญญา v2 §6 · 2026-09-26) — CRM เซลย้ายไป scanoffice · lead เก่าไม่ย้าย (Pack A3)
  lead: { topic: "3.10 Leads", group: "CRM", tab: "Lead", url: "https://scanoffice.web.app/crm/leads" },
  crmLead: { topic: "6.13 CRM Lead", group: "CRM", tab: "Lead", url: "https://scanoffice.web.app/crm/leads" },
};

const SCANOFFICE = "https://scanoffice.web.app/admin/configs/";

function MovedToScanofficeScreen({ from }) {
  const m = MOVED_TO_SCANOFFICE[from];
  if (!m) return null;
  const url = m.url || SCANOFFICE + m.route;
  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <h4 style={{ marginBottom: 12 }}>เมนู "{m.topic}" ย้ายไปแล้ว</h4>
      <p style={{ marginBottom: 8 }}>
        ย้ายไป <b>scanoffice › {m.group || "ทีม Tech"} › {m.tab}</b>
      </p>
      <p style={{ marginBottom: 16, color: "#666" }}>
        เว็บนี้ปิดเมนูนี้แล้ว — ของใหม่มีพรีวิวก่อนทำจริง กันกดซ้ำ และเก็บประวัติทุกครั้ง
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
        เปิด {m.tab} บน scanoffice
      </a>
      <p style={{ marginTop: 12, fontSize: 13, color: "#888", wordBreak: "break-all" }}>{url}</p>
    </div>
  );
}

export default MovedToScanofficeScreen;
