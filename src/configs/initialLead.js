export default { // lead ลูกค้าที่เข้ามา
    id:'',
    channel:'', // facebook, refer, line, community, callCenter, onsite, event
    name:'',
    tel:'',
    note:'',
    billDate:"",
    createdAt:new Date(),
    status:'waiting', // waiting, paid, cancel, manual(แนบหลักฐานการชำระเงิน)
    cancelId:'', // 0 คือ ghost
    reason:'', // ใช้ในเคส cancelId === 9 อื่นๆ
    process:'1', // ยังไม่ได้ติดต่อ, ยังติดต่อไม่ได้, ติดต่อแล้ว, กำลังทดลองใช้, 
    storeSize:'',
    province:'',
    contactPosition:'', // เจ้าของร้าน ผู้จัดการ owner, manager
    profileId:'',
    profileName:'',
    dueDate:'',
    dueDateAt:'',
    shopType:'',
    shopId:'', // บัญชีร้านจริงที่ผูก
    shopName:'', // ชื่อร้านจริงๆในระบบ
    newUser:'', // 1 ลูกค้าเดิม,2 ลูกค้าใหม่
    manualPaid:false, // true = ชำระเงินแบบแนบสลิป, false = ชำระเงินอัตโนมัติ
    manualPaidImage:'', // รูปสลิปที่แนบมา
};
