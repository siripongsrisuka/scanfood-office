// เว็บนี้ปิดแล้ว — ทุกคนย้ายไปใช้ scanoffice (Pack เคาะ 2026-10-25 · เมนู 1 "หน้าชี้ทาง")
// ทุก path ของ scanfoodoffice.web.app จะเห็นหน้านี้แล้วพาไป office.scanfood.co เอง
// ⚠️ โค้ดเดิมทั้งเว็บยังอยู่ใน repo (App.js ฯลฯ) — ต้องการเปิดกลับ = คืนไฟล์นี้จาก commit ก่อนหน้า แล้ว deploy
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const TARGET = 'https://office.scanfood.co';
const WAIT_SECONDS = 5;

function MovedPage() {
  const [left, setLeft] = useState(WAIT_SECONDS);

  useEffect(() => {
    if (left <= 0) {
      window.location.replace(TARGET);
      return undefined;
    }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6f8', padding: 16, fontFamily: 'system-ui, -apple-system, "Sukhumvit Set", "Noto Sans Thai", sans-serif' }}>
      <div style={{ maxWidth: 440, width: '100%', background: '#fff', borderRadius: 16, padding: '32px 24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: 22, margin: '0 0 12px', color: '#1f2937' }}>เว็บนี้ย้ายไป ScanOffice แล้ว</h1>
        <p style={{ fontSize: 16, color: '#4b5563', margin: '0 0 24px', lineHeight: 1.6 }}>
          scanfoodoffice ปิดใช้งานแล้ว · งานทุกอย่างทำต่อได้ที่ ScanOffice
        </p>
        <a href={TARGET} style={{ display: 'inline-block', background: '#f97316', color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 600, padding: '12px 28px', borderRadius: 10 }}>
          ไปที่ ScanOffice
        </a>
        <p style={{ fontSize: 14, color: '#9ca3af', margin: '20px 0 0' }}>
          {left > 0 ? `จะพาไปให้อัตโนมัติใน ${left} วินาที` : 'กำลังพาไป…'}
        </p>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '8px 0 0' }}>office.scanfood.co</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MovedPage />);
