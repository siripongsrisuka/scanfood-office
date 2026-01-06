export default { // lead ลูกค้าที่เข้ามา
    id:'',
    channel:'', // facebook, refer, line, community, callCenter, onsite, event
    name:'',
    tel:'',
    note:'',
    billDate:"",
    createdAt:new Date(),
    status:'waiting', // waiting, paid, cancel, ghost
    storeSize:'',
    province:'',
    contactPosition:'', // เจ้าของร้าน ผู้จัดการ owner, manager
    profileId:'',
    profileName:'',
    shopId:'',
    dueDate:'',
    dueDateAt:'',
    shopType:'',
    shopId:'', // บัญชีร้านจริงที่ผูก
    shopName:'', // ชื่อร้านจริงๆในระบบ
};

const performance = {
    id:'', // profileId
    yearMonth:'',
    lead:'',

}