import React from "react";

// หน้าแจ้งย้าย — เมนู 6.1-6.6 ปิดบนเว็บนี้แล้ว (OFFICE-0044..0047 · DEV-1632 ③ · Pack เคาะ 4a 2026-09-24)
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
};

const SCANOFFICE = "https://scanoffice.web.app/admin/configs/";

function MovedToScanofficeScreen({ from }) {
  const m = MOVED_TO_SCANOFFICE[from];
  if (!m) return null;
  const url = SCANOFFICE + m.route;
  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <h4 style={{ marginBottom: 12 }}>เมนู "{m.topic}" ย้ายไปแล้ว</h4>
      <p style={{ marginBottom: 8 }}>
        ย้ายไป <b>scanoffice › ทีม Tech › {m.tab}</b>
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
