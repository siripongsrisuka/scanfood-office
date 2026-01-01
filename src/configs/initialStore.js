export default {
    ownerName:'', 
    province:'', 
    tel:'', 
    storeName:'',
    staffNationality:[], // ไทย เมียนม่า ลาว เวียดนาม
    customerNationality:[], // ไทย อังกฤษ ฝรั่งเศษ 
    staffTakeOrder:false,
    staffRight:false,
    kitchenAmount:'',
    shift:false,
    vat:false,
    channels:[],
    promotions:[],
    payments:[],
    journey:'กินก่อนจ่าย',
    table:"ไม่มีหน้าร้าน",
    tableAmount:'',
    endDate:new Date(),
    posUsed:false,
    oldPos:'',
    posDevice:'',
    printerDevice:'',
    workingTime:'',
    network:'',
    shopType:'',
    currentPackage:[],
    currentHardware:[],
    demoDate:new Date(),
    paymentDate:new Date(),
    trainingDate:new Date(),
    launchDate:new Date(),
    process:'demo',
    expireDate:new Date(), // วันหมดอายุ แพ็กเกจหลัก
    note:'',
    shopId:'',
    googleSheet:'',
    trackingNumber:'',
    trainingLink:'',
    postcode:{
      name:'',
      address:"",
      tel:"",
      email:"",
      map:''
    },
    tax:{
      name:"",
      tel:"",
      address:"",
      taxNumber:"",
      branch:"",
      fax:"",
    },
    delivery:{
      map:'',
      name:'',
      tel:''
    },
    vatQuotation:false,
    quotation:[],
    quoteNote:'',
    hardwareOrder:[], // เก็บออเดอร์ของ hardware
    softwareOrder:[], // เก็บออเดอร์ของ software

}