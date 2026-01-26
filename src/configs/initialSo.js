import { stringYMDHMS3 } from "../Utility/dateTime";

export default {
    storeSize:20, 
    software:[], 
    requestDate:new Date(), 
    requestBillDate:stringYMDHMS3(new Date()),
    hardware:[], 
    note:'', 
    deliveryType:'normal',
    customerId:'',
    oneMonth:false, // ใช้ทดลอง 1 เดือน
    manualPaidImage:'',
    manualPaid:false,
    marketplaceFranchiseEnable:false

};