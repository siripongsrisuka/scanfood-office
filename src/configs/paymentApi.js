// ค่าคงที่ของเส้นขอ QR ชำระเงิน (ผ่าน scanfoodAPI · baseURL อยู่ที่ src/Utility/api.js)
//
// 🧨 ทำไมเป็นค่าคงที่ ไม่ใช่ process.env.REACT_APP_* (แก้ 2026-08-13)
//    เดิม 3 จอเรียก `scanfoodAPI.post(process.env.REACT_APP_API_URL, ...)` ซึ่งอ่านจาก `.env`
//    แต่ `.env` อยู่ใน .gitignore ⇒ ใครก็ตามที่ clone มา build จะได้ค่า **undefined**
//    → axios ยิงไปที่ baseURL เปล่า ๆ → พนักงานเห็น `{"message":"Network Error","code":"ERR_NETWORK"}`
//    ตอนกดเปิดบิลแบบอนุมัติอัตโนมัติ (หลักฐาน: bundle ที่ live คอมไพล์เป็น `RR.post({NODE_ENV:...}.REACT_APP_API_URL, v)`)
//    ⇒ CRA ฝังค่า REACT_APP_* ลง bundle ตอน build อยู่แล้ว = **ไม่ใช่ความลับ** (เปิดดูได้จากหน้าเว็บ)
//      เก็บไว้ในไฟล์ที่ commit จริง = build จากเครื่องไหนก็ได้ค่าเดียวกัน ไม่พังเงียบอีก
//    ค่าทั้งสองตัวถอดจากประวัติ git ของจุดเรียกเดิม (ก่อนถูกเปลี่ยนเป็น env) และตรงกับที่อีก 3 ไฟล์ hardcode ไว้อยู่แล้ว
//    (PaymentFailedScreen.js · UpgradeStoreSizeHistory.js · components/Quotation.js)
//
// 🔭 หนี้ที่ยังเหลือ: token ของ PosXPay ถูกส่งจากหน้าเว็บ ⇒ ใครเปิด bundle ก็เห็น
//    ที่ถูกคือให้ scanfood_server ถือ token เอง (functions/gateway/providers/posxpay.js › createQR)
//    = ของ dev ต้องเปิดใบแยก · ไฟล์นี้แค่ทำให้ของที่พังอยู่กลับมาทำงานเหมือนเดิม ไม่ได้เพิ่มการเปิดเผยใหม่

// ปลายทาง: functions/gateway/routes/payment.routes.js › router.post("/requestQr", requestQR)
export const PAYMENT_REQUEST_QR_PATH = '/gateway/payment/requestQr';

// merchantId 10473 (ตรงกับ serial WQRN002405000023 ที่ทุกจอส่งคู่กัน)
export const POSXPAY_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudElkIjoxMDQ3M30.P42rmcK6gLFCcf6x88rgpMx4hRGPPgDh4hgbreuCTaw';
