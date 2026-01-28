import { db } from '../db/firestore';
import axios from 'axios';
const TELEGRAM_BOT_TOKEN = '8553214555:AAHHyEm6Rumi9b_12ZEkfQRQiTDqYAoI-Iw'
export async function telegramDeleteQueue({ chat_id, message_id }){
  await db.collection("telegramDeleteQueue").add({
      chat_id,
      message_id:message_id,
      deleteAt: Date.now() + 2 * 1000 // 2 วินาที
      // deleteAt: Date.now() + 12 * 60 * 60 * 1000
  });
}

// 200%
export async function telegramDelete({ chat_id, message_id }){
  const result = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`,
        {
          chat_id,
          message_id
        }
      );
}

export async function sendWarehouse({ chat_id}){
    const body = {
        chat_id,
        parse_mode: "HTML",
        text:`🚀 <b>ScanFoodOffice</b>\nมีคำสั่งงานใหม่เข้ามา`,
//         text:`<b>${orderNumber}</b>
// ลูกค้า : ${shopName}
// รายการ : ${product.map(a=>`${a.qty} ${a.name}`).join('/')}
// รายละเอียด : ${note}
// เซล : ${saleName}
// รูปแบบจัดส่ง : ${deliveryType}
// สถานะ : ${status}`
      }

    const result = await axios.post(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    body
    
    );
    return result.data.result.message_id;
};

export async function sendExtraDay({ chat_id, shopName, reason, profileName, status, days }){
    const body = {
        chat_id,
        parse_mode: "HTML",
        text:`<b>ขอวันใช้งานเพิ่ม</b>
ลูกค้า : ${shopName}
days : ${days}
เหตุผล : ${reason}
เซล : ${profileName}
สถานะ : ${status}`
      }

    const result = await axios.post(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    body
    
    );
    return result.data.result.message_id;
};

export async function replyExtraDay({ chat_id, message_id, status }){
    const body = {
        reply_to_message_id:message_id,
        chat_id,
        parse_mode: "HTML",
        text:`<b>สถานะ : ${status}</b>`
      }

      const result = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        // body
        {
          ...body,
          chat_id,
         
        }
      );
    return result.data.result.message_id;
}


