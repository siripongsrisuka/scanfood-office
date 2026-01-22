export default {
    question:'',
    answer:'',
    id:'',
    category:[],
    type:'', // question, problem
    status:'requested', // requested, approved, rejected
    createdAt:new Date(),
    profileId:'', // ผู้สร้างคำถาม
    profileName:'',
    adminId:'', // ผู้อนุมัติคำถาม
    adminName:'',
    retweetCount:0, // จำนวนครั้งที่มีคนเจอปัญหานี้
    lastRetweet:[], // รายชื่อผู้ที่เจอปัญหานี้
    imageUrls:[]
}