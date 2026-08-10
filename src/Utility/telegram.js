import { db } from '../db/firestore';
import { scanfoodAPI } from './api';

export async function telegramDeleteQueue({ chat_id, message_id }){
  await db.collection("telegramDeleteQueue").add({
      chat_id,
      message_id:message_id,
    //   deleteAt: Date.now() + 2 * 1000 // 2 วินาที
      deleteAt: Date.now() + 12 * 60 * 60 * 1000,
      timestamp: new Date(),
  });
}

// 200%
export async function telegramDelete({ chat_id, message_id }){
  await scanfoodAPI.post(
        "/telegram/office/delete/",
        {
          channelType:'warehouse',
          chat_id,
          message_id
        }
      );
}

export async function sendWarehouse({ chat_id}){
    const res = await scanfoodAPI.post(
    "/telegram/office/send/",
    {
        channelType:'notify',
        chat_id
    }
    );
    return res.data.message_id;
};

export async function sendExtraDay({ chat_id, shopName, reason, profileName, status, days }){
    const res = await scanfoodAPI.post(
    "/telegram/office/send/",
    {
        channelType:'extraDay',
        chat_id,
        shopName,
        reason,
        profileName,
        status,
        days
    }
    );
    return res.data.message_id;
};

export async function replyExtraDay({ chat_id, message_id, status }){
    const res = await scanfoodAPI.post(
        "/telegram/office/reply/",
        {
          channelType:'extraDay',
          chat_id,
          message_id,
          status
        }
      );
    return res.data.message_id;
};

export async function sendEtax({ chat_id, orderNumber, etaxEnable, receiptEnable, hardCopyTaxEnable }){
    const res = await scanfoodAPI.post(
    "/telegram/office/send/",
    {
        channelType:'etax',
        chat_id,
        orderNumber,
        etaxEnable,
        receiptEnable,
        hardCopyTaxEnable
    }
    );
    return res.data.message_id;
};
