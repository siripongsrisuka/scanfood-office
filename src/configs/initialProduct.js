export default {
    shopId:'',
    branch:'',
    externalId:[],
    imageId:'',
    name:'',
    detail:'',
    option:[],
    price:[
        // {
        //     type:'dineId', // ประเภททานที่ร้าน
        //     price:'',
        //     promotionStatus:false,
        //     promotion:{
        //         price:'',
        //         startDate:'',
        //         endDate:'',
        //         status:true
        //     },
        //     status:true, // แปลว่าขายบนช่องทางนี้
        // },
    ],
    status:'available',// available/out/notsale
    BOM:[],
    incentive:0,
    timestamp:new Date(),
    category:[],
    other:[],
    set:[], // เซตของสินค้าเพื่อปริ้นแยกครัว
    setStatus:false, // เป็นเซตหรือสินค้าเดี่ยว
    promotion:{
        type:'bath',
        value:'',
        status:false
    },
    extraCategory:[],
    stockCount:false,
    stockAlert:'', // แจ้งเตือนเมื่อสินค้าใกล้หมด
    stock:0,
    unit:'ขวด',
    priceBySize:false,
    stockSet:[], // คือผูกการตัดสต๊อกร่วมกัน
    onlyStaff:false,
    rootId:'',
    happyHour:'',
    happyHourStatus:false,
    tipStatus:false,
    pointStatus:false,
    productLinkId:'', // เอาไว้เชื่อมกับ buffet, tip หรือ อื่นๆในอนาคต
    barcode:'', // รหัสบาร์โค้ด
    boxs:[
        // {
        //     boxId:'',
        //     name:'',
        //     maxQty:'',
        //     products:[
        //         {
        //             productId:'',
        //             maxQty:'',
        //             price:0
        //         }

        //     ]

        // }
    ],
    boxStatus:false, // การเปิดใช้งานเซตเมนูขั้นสูง
    boxCart:[], // รายการสินค้าที่ถูกเลือก
    nameLanguage:{},
    detailLanguage:{}
}