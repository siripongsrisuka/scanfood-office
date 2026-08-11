// telegram.js — ยิงผ่าน server เสมอ · ❌ ห้ามมี bot token ในไฟล์นี้อีก (OFFICE-0020 · พอร์ตใหม่ OFFICE-0024)
//
// 🔒 ทำไมห้ามมี token ที่นี่: ไฟล์นี้ถูกรวมเข้า bundle ที่ทุกคนที่เปิดเว็บโหลดได้
//    ของเดิมแปะ token ไว้ตรง ๆ แล้ว **รั่วจริง** (บอทถูกยึดไปเปลี่ยนชื่อเป็นโฆษณาคาสิโน)
//    ⇒ token อยู่ฝั่ง server เท่านั้น · ฝั่งนี้ส่งแค่ "เนื้อหา" ไป
//
// 🧩 signature ของทั้ง 3 ฟังก์ชัน = เหมือนเดิมเป๊ะ ⇒ จุดเรียก 5 จอไม่ต้องแก้สักบรรทัด
//    (`ExtraDayScreen` · `ETaxScreen` · `ManualPaidScreen` · `WarehouseJobScreen` · `components/Quotation`)
//
// 🖼️ เทมเพลตข้อความย้ายไปอยู่ฝั่ง server (`telegram/providers/generic.js`) โดยตั้งใจ —
//    ถ้าปล่อยให้ฝั่งนี้ส่ง `text` ดิบ server จะกลายเป็นท่อส่งข้อความอะไรก็ได้ไปห้องไหนก็ได้
import { db } from '../db/firestore';
import { scanfoodAPI } from './api';

export async function telegramDeleteQueue({ chat_id, message_id }){
  await db.collection("telegramDeleteQueue").add({
      chat_id,
      message_id:message_id,
      // deleteAt: Date.now() + 2 * 1000, // 2 วินาที
      deleteAt: Date.now() + 12 * 60 * 60 * 1000, // 12 ชั่วโมง
      timestamp: new Date(),
  });
}

/** ส่งข้อความงานเข้าห้อง · คืน message_id (ผู้เรียกเอาไปเก็บไว้ลบ/แทนที่ทีหลัง) */
export async function sendMessage(payload){
  const { chat_id, header, body, process } = payload;
  const res = await scanfoodAPI.post(
    "/telegram/office/send/",
    {
      channelType:'generic',
      chat_id,
      header,
      body,
      process
    }
  );
  return res.data.message_id;
};

export async function deleteMessage({ chat_id, message_id }){
  try {
    await scanfoodAPI.post(
      "/telegram/office/delete/",
      {
        chat_id,
        message_id
      }
    );
  } catch (error) {
    console.log(error)
  }
}
