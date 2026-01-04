
export default {
    POSs:[],  // สำหรับกำหนดเครื่องที่จะขาย
    address:'',
    branch:1,
    category:[],
    channel:[
      {
        id:1,
        name:'ราคาปกติ'
      }
    ],
    createdDate:new Date(),
    cutOff:new Date(2011, 0, 1, 0, 0, 0, 0),
    host:'',
    humanResource:[
      {
          email:'',
          name:'',
          notification:true,
          position:['001'],
          status:'active',
          tel:''
      }
    ],
    imageId:'',
    imageUrl:[],
    location:{latotude:"",longtitude:''},
    name:'',
    receipt:{
      footer:'Thank you & See you again:)',
      footerImage:{imageId:'',status:false},
      header:`บริษัท สแกนฟู้ด จำกัด
      444 Siam Aquare Soi 7, Rama 1 Road, 
      Pathumwan,Bangkok, 10330 Thailand
      TAX ID : 0105569384059 
      ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ`,
      headerImage:{imageId:'',status:true},
    },
    scShopId:'', // ร้านที่มีหลายสาขาจะมี scShopId ตรงกัน
    shift:false, // เปิดใช้งานระบบกะหรือไม่
    smartChef:[],
    smartCategory:[],
    smartKitchen:[],
    smartOption:[],

    smartTable:[],
    tel:'',
    vat:{status:false,amount:'7',type:'Include'},
    vip:[
      // {
      //   type:'pos',
      //   expire:new Date()
      // }
    ],
    zone:[],
    notiShift:[],
    notiCancelBill:[],
    notiSummary:[],
    notiMoveTable:[],
    notiBackOrder:[],
    notiCancelOrder:[],
    notiMoveOrder:[],
    staffNoti:[],
    
    receiptType:{id:1,name:'สินค้าแยกเมนู'},
    receiptCancel:{id:1,name:'แสดงใน Invoiceและใบเสร็จ'},
    receiptSubMemu:{id:1,name:'แสดงใน Invoiceและใบเสร็จ'},
    receiptAddOn:{id:1,name:'แสดงใน Invoiceและใบเสร็จ'},
    receiptVatShow:{id:1,name:'แสดงใน Invoiceและใบเสร็จ'},
    receiptVatShot:false,

    smartTask:[],
    smartBuffet:[],
    smartReward:[],
    smartFine:[],
    bomNoti:[],
    BOMCategory:[], // หมวดหมู่ bom
    taxCustomer:[],
    kitchenType:'category',
    storeSize:20,
    smartTopSale:{
      name:'เมนูเด็ด คนสั่งเยอะ',
      status:false,
      value:[],
      nameLanguage:[]
    },
    smartRecommend:{
      name:'เมนูแนะนำ',
      status:false,
      value:[],
      nameLanguage:[]
    },
    smartPromotion:{
      name:'โปรโมชั่น',
      status:false,
      value:[],
      nameLanguage:[]
    },
    smartCheckout:{
      promptpayId:'',
      promptpayStatus:false,
      textBottom:"",
      textBottomStatus:false,
      imageStatus:false,
      imageId:'',
      logoStatus:false,
      logo:'',
      contentHeaderStatus:false,
      contentHeader:'',
    },
    smartQrcode:{
      textBottom:"",
      textBottomStatus:false
    },
    suggester:'', // รหัสผู้แนะนำ เพื่อปีถัดๆไป แต่คงไม่ใช้แล้ว ไปสร้างผู้ติดตาม การใช้งานแทน
    packageArray:[], // package ทั้งหมดที่ซื้อ
    yourCode:'',
    smartQue:{
      status:true,
      queType:[
        {
          id:'111',
          brev:'A',
          type:'1 - 2 คน'
        },
        {
          id:'222',
          brev:'B',
          type:'3 - 4 คน'
        },
      ],
      content:'เพื่มให้ได้อาหารรวดเร็วทันใจ\nลูกค้าสามารถสั่งอาหารได้จาก QR Code นี้เลยนะค้าา'

    },
    // ทำปริ้นเตอร์ไวไฟ
    ipAddress:'',
    smartCooking:[],
    autoKitchen:false,
    hostName:'',
    scanFoodPayment:[
      {
        id:1,
        name:'เงินสด',
        mortal:true,//ลบไม่ได้
        status:true
      },
      {
        id:2,
        name:'พร้อมเพย์',
        mortal:true,//ลบไม่ได้
        status:true
      }
    ],
    scanFoodVat:{
      status:false,
      value:{
        type:'Include',
        amount:'7'
      },
    },
    scanFoodServiceCharge:{
      status:false,
      amount:'10'
    },
    rounding:{
      status:false,
      type:'down'
    },
    repeatItem:false,
    temptClose:false,
    schedule: {
      dynamicStatus:true,
      staticStatus:true,
      day:[
        { day:0, id:1, startTime:'6:00', endTime:'20:00', allTime:true, type:'dynamic', status:true },
        { day:1, id:2, startTime:'6:00', endTime:'20:00', allTime:true, type:'dynamic', status:true },
        { day:2, id:3, startTime:'6:00', endTime:'20:00', allTime:true, type:'dynamic', status:true },
        { day:3, id:4, startTime:'6:00', endTime:'20:00', allTime:true, type:'dynamic', status:true },
        { day:4, id:5, startTime:'6:00', endTime:'20:00', allTime:true, type:'dynamic', status:true },
        { day:5, id:6, startTime:'6:00', endTime:'20:00', allTime:true, type:'dynamic', status:true },
        { day:6, id:7, startTime:'6:00', endTime:'20:00', allTime:true, type:'dynamic', status:true },
        { day:0, id:8, startTime:'6:00', endTime:'20:00', allTime:true, type:'static', status:true },
        { day:1, id:9, startTime:'6:00', endTime:'20:00', allTime:true, type:'static', status:true },
        { day:2, id:10, startTime:'6:00', endTime:'20:00', allTime:true, type:'static', status:true },
        { day:3, id:11, startTime:'6:00', endTime:'20:00', allTime:true, type:'static', status:true },
        { day:4, id:12, startTime:'6:00', endTime:'20:00', allTime:true, type:'static', status:true },
        { day:5, id:13, startTime:'6:00', endTime:'20:00', allTime:true, type:'static', status:true },
        { day:6, id:14, startTime:'6:00', endTime:'20:00', allTime:true, type:'static', status:true },
      ]
    },
    follower:{
      status:false,
      link:''
    },
    advertising:{
      status:false,
      imageId:''
    },
    pickup:{
      status:false,
      paymentJourney:'after', // ชำระเงินก่อนหรือหลัง,
      paymentDetail:{
          id:'promptpay',
          promptpayId:'',
          promptpayName:'',
      },
      information:[
          {
              id:'name',
              name:'ชื่อ',
              showOnReceipt:true,
          }
      ]
    },
    delivery:{
        status:false,
        information:[
            {
                id:'name',
                name:'ชื่อ',
                showOnReceipt:true,
            }
        ],
        paymentDetails:[
            {
                id:'payLater',
                status:false,
                name:'เก็บเงินปลายทาง'
            },
            {
                id:'promptpay',
                status:false,
                name:'พร้อมเพย์',
                promptpayId:'',
                promptpayName:''
            },
            {
                id:'bank',
                status:false,
                name:'บัญชีธนาคาร',
                accountName:'',
                bankName:'',
                bankNumber:'',
            },
            {
                id:'manee',
                status:false,
                name:'รูป QrCode เช่น QR Code แม่มณี',
                imageId:''
            },
        ],
        delivery:{
            status:false,
            pattern:'cost', // ส่งตรมระยะทาง ส่งเหมา
            cost:'', // ค่าส่งแบบเหมา
            stepCost:'', // ค่าส่งตามระยะทาง
            latitude:'', // ที่อยู่เจ้าของร้าน
            longitude:'', // ที่อยู่เจ้าของร้าน
            freeStatus:false, // มีส่งฟรีมั้ย
            freeTarget:'', // ซื้อเท่าไรได้ส่งฟรี
        },
        minimumSale:1, // ขั้นต่ำในการสั่งซื้อ
    
    },
    banner:{
      status:false,
      imageId:''
    },
    village:false,
    fastMenu:[], // เก็บไอดีของ product
    promptpayCheckout:false,
    posId:'',
    takeOrder:{
      bottomStyle:1,
      icon:[],
    },
    journeyStyle:1,
    franchiseId:'',
    franchiseRights:[],
    franchiseRoute:'',
    franchisePayment:[], // ช่องทางชำระเงินที่ ซอร์ อนุญาติ
    franchiseShopType:'',
    taxInfo:{
      name:'', tel:'', address:'', taxNumber:'', branch:''
    },
    notiCount:[],
    scanAndPay:{
      status:false,
      paymentDetail:{
          id:'promptpay',
          promptpayId:'',
          promptpayName:'',
      },
    },
    currency:[],
    dayDeposit:14,
    sunmiPrintOrder:false,
    lineNotify:[],
    playlist:false,
    defaultLanguage:'',
    happyHour:{
      status:false,
      imageId:'',
      startTime:new Date(),
      endTime:new Date()
    },
    sunmiOrderSize:1,
    tip:false,
    payConfig:false,
    providerId:'', // เพื่อเชื่อมกับระบบสมาชิก
    lineRichMenu:'',
    linePickupAds:[], // เอาไว้โฆษณาสำหรับ pickup
    setEnable:false, // เปิดสิทธิ์การใช้งาน set
    tableControl:false, // ควบคุมการเปิด - ปิดโต๊ะได้
    timerEnable:false, // เปิดแถบเรียงเวลาที่สั่งออเดอร์ แต่ละโต๊ะ
    bonusEnable:false, // เปิดใช้งานโบนัสในหน้าสั่งอาหาร
    bonusId:'', // เป็น id ของ promotion
    hot:{
      status:false,
      imageStatus:false,
      imageId:'',
      header:'เมนูยอดนิยม',
      product:[],
      backgroundColor:'#FA8D94'
    },
    buffetOnly:false, // ขายบุฟเฟ่ต์อย่างเดียว หรือมี alacart ด้วย
    bomEnable:false, // เปิดใช้งาน โหมดสูตรวัตถุดิบ
    barcodeEnable:false, // เปิดใช้งานระบบสแกนบาร์โค้ดไหม
    boxEnable:false,
    boxPattern:'none', // none, all / onlyOption
    multiLanguage:[
      // { brev:'', content:'' }
    ], //ภาษาหลายช่องทาง
    multiLanguageEnable:false,
    earnestEnable:false,
    holdEnable:false,
    checkInEnable:false,
    dynamicDisplayEnable:false,
    printCancelItem:true, //
    printMoveItem:true, //
    printMoveTable:false,
    receiptPattern:'month', // ประเภทใบเสร็จ เรียงตามวัน หรือ เรียงตามเดือน
    customerAds:[],
    displayView:false,
    managerLock:false,
    staffEntrance:false, // ให้พนักงานใส่รหัสเพื่อเข้าร้าน
    paperMode:'graphic',
    multiZone:false, // แยกราคาขายตามโซนหรือไม่
    printStickerStatus:false,
    cancelBillWithReverse:false, // ยกเลิกบิลพร้อมคืนสต๊อก
    stickerMenu:[], // เก็บไอดีของ product
    stickerEnable:false, // หากเปิดใช้งานจะเลือกรายการที่ปริ้นสติกเกอร์ผ่าน stickerMenu
    skuEnable:false,
    noteEnable:false, // โน๊ตเป็นข้อความท้ายใบเสร็จได้
    autoCheckout:false, // เปิดการใช้งานปิดบิล invoice อัตโนมัติหรือไม่
    notiAuto:[], // 
    marketplaceFranchiseEnable:false, 
  }