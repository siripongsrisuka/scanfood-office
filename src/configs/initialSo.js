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
    marketplaceFranchiseEnable:false,
    taxEnable:false, // ใบกำกับภาษี
    etaxEnable:false, // ขอ E-Tax
    hardCopyTaxEnable:false, // ใบกำกับภาษีแบบกระดาษ
    receiptEnable:false, // ใบเสร็จรับเงิน
    // taxImageId:'', // รูปภาพใบกำกับภาษี
    taxAddress:'', // ที่อยู่สำหรับจัดส่งใบกำกับภาษี
    taxEmail:'', // อีเมลสำหรับจัดส่งใบกำกับภาษี
    taxStep:'0', // 0 = ไม่ต้องการ 1 = ต้องการใบเสร็จรับเงิน 2 = ต้องการใบกำกับภาษีแบบอิเล็กทรอนิกส์(E-Tax) 3 = ต้องการใบกำกับภาษีแบบอิเล็กทรอนิกส์(E-Tax)และแบบกระดาษ
    card:false, //  0 = ไม่จ่ายผ่านบัตรเครดิต 1 = จ่ายผ่านบัตรเครดิต
    installments:'0', // 0 = จ่ายเต็มจำนวน 3 = ผ่อน 3 เดือน 4 = ผ่อน 4 เดือน 6 = ผ่อน 6 เดือน 10 = ผ่อน 10 เดือน
    juristic:'0', // 0 = บุคคลธรรมดา 1 = นิติบุคคล
    vatInfo:{
        name:'',
        address:'',
        postcode:'',
        taxId:'',
        branch:'สำนักงานใหญ่',
        email:'',
        tel:'',
        contactName:'',
    },
    process:'request',
    vat:0,
    withholdingTax:0,
    installmentFee:0,
    subtotal:0,
};