import React, { useState, useEffect, useRef } from "react";

import { Row, Col } from "react-bootstrap";
import { Modal_Alert, Modal_Loading } from "../modal";
import { addMail, db } from "../db/firestore";
import { colors, initialAlert } from "../configs";
import { findDay, findInArray } from "../Utility/function";
import { pushByIdFilter, pushByOneFilter } from "../api/onesignal";
import { NumberYMD, plusDays } from "../Utility/dateTime";

const saleProfile = {
    performance:[],
    wallet:0,
    cumulative:0,
    grade:'sale',
};

const { one, five  } = colors; 


function SoftwareCheck() {
    const [masterData, setMasterData] = useState([]);
    const [display, setDisplay] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;


    function idToPrice(arr){ // แปลง package ที่ซื้อมาทั้งหมดให้เป็นราคา
        let price = 0
        for(const item of arr){ // item คือ package
            switch (item) {
                case '1': 
                    price += 350
                break;
                case '3': 
                   price += 3000
                break;
                case '4': 
                   price += 500
                break;
                case '6': 
                   price += 4800
                break;
                case '7': 
                   price += 600
                break;
                case '9': 
                   price += 6000
                break;
                case '10': 
                   price += 200
                break;
                case '12': 
                   price += 1200
                break;
                case '13': 
                   price += 400
                break;
                case '15': 
                   price += 2400
                break;
                case '16': 
                   price += 600
                break;
                case '18': 
                   price += 3600
                break;
                case '19': 
                   price += 400
                break;
                case '21': 
                   price += 2400
                break;
                case '22': 
                   price += 800
                break;
                case '24': 
                   price += 4800
                break;
                case '25': 
                   price += 1200
                break;
                case '27': 
                   price += 7200
                break;
                default:
                    price = 0
                    break;
            }
        }
        
        return price
    };

    const yearMonth = (today) => {
        const cDateTime =
            today.getFullYear().toString().padStart(4,"0")+
            parseInt(today.getMonth()+1).toString().padStart(2,"0") 
    
        return cDateTime;  // 202211
    }

    useEffect(()=>{
        db.collection('admin').doc('package').get().then((doc)=>{
            if(doc.exists){
                setDisplay(doc.data().value.filter(a=>a.status).flatMap(b=>b.price.map(c=>({...c,content:b.name+' '+c.day,type:b.type}))))
            }
        })
      },[])

    const imageRef = useRef(); // for unsubscribe

    useEffect(() => {
      Promise.all([listenerRealtimeImage()])
          .catch(err => console.log("Failed Promise.all Listen1 : ",err));      

    return () => {
      try{
        imageRef.current?.();
        console.log('Destroy_Component_and_Success_Listener_Remove for ApprovePackageScreen');
      }catch(err){
        console.log(err);
      }
    }
  }, []);
    async function listenerRealtimeImage() {
      imageRef.current = db
          .collection('packageOrder')
          .where('status','in',['order'])
          .onSnapshot({ includeQueryMetadataChanges: true },async docs => {
              const arr = [];  
              docs.forEach(doc => { 
                  arr.push({...doc.data(),id:doc.id,timestamp:doc.data().timestamp.toDate()})
              });
              setMasterData(arr);
          },err => {
      })
  }

    async function orderToPaid({ docId, shopId, profileId, packageId, suggestCode, net, content, shopName }){
        setLoading(true)
        // ถ้ามี suggessCode ถึงจะได้ใช้งาน package หลักฟรี 1 เดือน
        const { suggestType, suggestId, day } = await findSuggestId({ suggestCode })
        let value = [{ packageType:'qrcode', day}]
        for(const item of packageId){ // เป็น array of packageId
            if(['1','2','3','4','5','6','7','8','9'].includes(item)){ // qrcode ordering
                value.push({ packageType:'qrcode', day:findDay(item) })
            } else if(['10','11','12','13','14','15','16','17','18'].includes(item)){ // staff ordering
                value.push({ packageType:'staff', day:findDay(item) })
            } else if(['19','20','21','22','23','24','25','26','27'].includes(item)){
                value.push({ packageType:'language', day:findDay(item) })
            } else if(['28','29','30','31','32','33'].includes(item)){
                value.push({ packageType:'premium', day:findDay(item) })
            }  else { // translator
                value.push({ packageType:'member', day:findDay(item) })
            }
        }
     
        addPackage({ shopId, value, packageId, docId, profileId, net, suggestType, suggestId, content, shopName, suggestCode })
    };

    function manageSuggestor({ suggestType, suggestId, reOrder, net, shopName, docId, suggestCode }){
        if(suggestType==='restaurant'){
            db.collection('packageOrder').doc(docId).update({ status:'success', by:'restaurant'  });
            manageRewardShop({ shopId:suggestId, value:[{ packageType:'qrcode', day:30}] })
        } else {
            manageRewardSale({ profileId:suggestId, reOrder, net, shopName, docId, suggestCode })
        }
    };

    async function manageRewardSale({ profileId, reOrder, net, shopName, docId, suggestCode  }){
        const promise = await new Promise(async (resolve,reject)=>{
            const profileRef = db.collection("profile").doc(profileId);
            db.runTransaction(async transaction => { 
                return transaction.get(profileRef).then(async profileDoc =>{
                    // cumulative คือ ยอดขายตลอดชีวิตของเซล
                    const { performance, wallet, cumulative, grade } = {...saleProfile,...profileDoc.data()}
                    let newPerformance = performance.slice();
                    let newWallet = wallet;

                    let have = false // คือ มียอดของเดือนนี้หรือยัง
             
                    let current = { 
                        yearMonth:yearMonth(new Date()), 
                        softwareSale:0,  // ยอดขาย software
                        hardwareSale:0, // ยอดขาย hareware
                        normalRevenue:0, // คือ 30% ของเซล
                        bonusRevenue:0, // คือ 20% ของ Prosale
                        passiveIncome:0, // คือ 10% เมื่อลูกค้าซื้อซ้ำ
                        hardwareRevenue:0,
                        newLicense:0,
                        oldLicense:0,
                        totalLicense:0,
                        monthLicense:0, // license ของรายเดือน ทั้งใหม่และเก่า
                    }


                    let thisPerformance = findInArray(newPerformance,'yearMonth',yearMonth(new Date())) // performance ของเดือนนี้
                    if(thisPerformance && thisPerformance.yearMonth){
                        current = thisPerformance
                        have = true
                    }
                    const { newPackage, rePackage } = reOrder;

                    let baseSale = 0.3*idToPrice(newPackage)
                    let bonus = 0
                    let passive = 0.1*idToPrice(rePackage)
                    // *** จำนวนlicense
                    // 1. ยอดขายสะสมประจำเดือน
                    current.softwareSale += net
                    // 2. รายรับ 30%
                    current.normalRevenue += baseSale
                    // 3. โบนัส 20%
                    if(grade==='ProSale'){
                        bonus = 0.2*idToPrice(newPackage)
                        current.bonusRevenue += 0.2*idToPrice(newPackage)
                    }

                    // 4. passiveIncome 
                    current.passiveIncome += passive

                    // 5. คำนวณ license
                    if(newPackage.some(a=>['3','6','9'].includes(a))){ // ซื้อแพ็กเกจหลักรายปีครั้งแรก = 1 license
                        current.newLicense ++
                    }
                    if(rePackage.some(a=>['3','6','9'].includes(a))){ // ซื้อแพ็กเกจหลักรายปีครั้งถัดไป = 0.2 license
                        current.oldLicense += 0.2
                    }

                    // 6. sum license
                    current.totalLicense = current.newLicense + current.oldLicense

                    // 7. add wallet
                    newWallet = newWallet + baseSale + bonus + passive

                    // 8. คำนวณ monthLicense
                    if([...newPackage,...rePackage].some(a=>['1','4','7'].includes(a))){ // ซื้อแพ็กเกจหลักรายเดือน = 1 license
                        current.monthLicense ++
                    }
                   
                    if(have){ // แปลว่าเป็นก้อนข้อมูลเดิม
                        newPerformance = newPerformance.map((item)=>{
                            return item.yearMonth === current.yearMonth
                                ?current
                                :item
                        })
                    } else {
                        newPerformance = [...newPerformance,current]
                    }
                    transaction.update(profileRef,{
                        performance:newPerformance,
                        wallet:newWallet,
                        cumulative:cumulative+net
                    })
                    return { license:current.totalLicense, totalSale:current.softwareSale, baseSale, bonus, passive }
                })
            })
            .then(({ license, totalSale, baseSale, bonus, passive }) => {
                db.collection('packageOrder').doc(docId).update({ status:'success', license, totalSale, by:'sale', baseSale, bonus, passive, hardware:0, suggestCode:convertString(suggestCode) });
                pushByIdFilter({id:profileId,content:`จำนวน License : ${license}\nยอดขายสะสม :${totalSale}\nร้านล่าสุด :${shopName}`,heading:`อัปเดตความคืบหน้าเดือนนี้`,data:{ sound:'อัปเดตความคืบหน้าล่าสุด' }})

                setLoading(false)
                alert('success')
            })
            .catch(err => {
                setLoading(false)
                alert(err)
            })  
            });
        
            return promise
    };

    async function manageRewardShop({ shopId, value }){ // 100%
        const promise = await new Promise(async (resolve,reject)=>{
            const shopRef = db.collection("shop").doc(shopId);
            db.runTransaction(async transaction => { 
              return transaction.get(shopRef).then(async shopDoc =>{
                const { vip } = shopDoc.data()
                let newVip = vip.slice().map(a=>({...a,expire:a.expire.toDate()}))
                for(const item of value){
                    let find = findInArray(newVip,'type',item.packageType)
                    let nextDay = new Date()
                      if(find && find.type){
                          if(NumberYMD(new Date())> NumberYMD(find.expire)){ // แปลว่าหมดอายุไปก่อนหน้านี้แล้ว
                              nextDay = plusDays(new Date(),item.day)
                          } else { // ยังไม่หมดอายุ จึงต่อจากวันใช้งานเดิม
                              nextDay = plusDays(find.expire,item.day)
                          }
                      }
                      newVip = newVip.map(a=>{
                          return a.type===item.packageType
                              ?{type:item.packageType,expire:nextDay}
                              :a
                      })
                }
                  transaction.update(shopRef,{ vip:newVip })
              })
            })
            .then(res => {
              pushByOneFilter({shopId,content:'ทุกๆ 1 ร้านที่คุณแนะนำ จะได้แพ็กเกจหลักฟรี 1 เดือน',heading:`คุณได้รับ แพ็กแกจ สแกนสั่งอาหารฟรี 1 เดือน`,data : { sound:`คุณได้รับ แพ็กแกจ สแกนสั่งอาหารฟรี 1 เดือน` }})
                addMail({
                    content:`คุณได้รับ แพ็กแกจ สแกนสั่งอาหารฟรี 1 เดือน`,
                    scanfood:false,
                    timestamp:new Date(),
                    shopId
                })
              setLoading(false);
              alert('success')
            })
            .catch(err => {
              setLoading(false)
            })  
          });
        
          return promise
    };

    async function addPackage({ shopId, value, packageId, docId, profileId, net, suggestType, suggestId, content, shopName, suggestCode }){
        const promise = await new Promise(async (resolve,reject)=>{
            const shopRef = db.collection("shop").doc(shopId);
            db.runTransaction(async transaction => { 
              return transaction.get(shopRef).then(async shopDoc =>{

                const { vip, packageArray } = {packageArray:[],...shopDoc.data()}
                let newVip = vip.slice().map(a=>({...a,expire:a.expire.toDate()}))
                let newPackageArray = packageArray.slice();

                for(const item of value){
                    let find = findInArray(newVip,'type',item.packageType)
                    let nextDay = new Date()
                      if(find && find.type){
                          if(NumberYMD(new Date())> NumberYMD(find.expire)){
                              nextDay = plusDays(new Date(),item.day)
                          } else {
                              nextDay = plusDays(find.expire,item.day)
                          }
                      } 
                      newVip = newVip.map(a=>{
                          return a.type===item.packageType
                              ?{type:item.packageType,expire:nextDay}
                              :a
                      })
                };
                newPackageArray = [...newPackageArray,...packageId]
                let newPackage = packageId.filter(a=>!packageArray.includes(a))
                let rePackage = packageId.filter(a=>packageArray.includes(a))
                
                if(suggestId){ // เพิ่งใส่รหัสแนะนำ สามารถฝังเซลลงไปได้
                    transaction.update(shopRef,{vip:newVip,packageArray:newPackageArray,suggester:convertString(suggestCode)})
                } else {
                    transaction.update(shopRef,{vip:newVip,packageArray:newPackageArray})
                }
                  return { newPackage, rePackage }
              })
            })
            .then(reOrder => {
              let res = [
                pushByIdFilter({id:profileId,content:'กรุณาปัดแอพออก และเข้าใหม่อีกครั้งครับ/ค่ะ',heading:`อนุมัติ แพ็กเกจ เรียบร้อย`, data:{ sound:`อนุมัติ แพ็กเกจ เรียบร้อยค่ะ` }}),
                addMail({
                    content:`อนุมัติ ${content} เรียบร้อย`,
                    scanfood:false,
                    timestamp:new Date(),
                    shopId
                })
              ]
              
              
              if(suggestId){
                res.push(
                    addMail({
                        content:`คุณได้รับ แพ็กแกจ สแกนสั่งอาหารฟรี 1 เดือน`,
                        scanfood:false,
                        timestamp:new Date(),
                        shopId
                    })
                )
              }
              Promise.all(res).then(()=>{
                if(suggestId){ // แปลว่ามีรหัสแนะนำจริง
                    manageSuggestor({ suggestType, suggestId, reOrder, net, shopName, docId, suggestCode })
                  } else {
                    db.collection('packageOrder').doc(docId).update({ status:'success' });
                    setLoading(false)
                  }
              }).catch(()=>{alert('เพิ่มวันใช้งานไม่สำเร็จ กรุณาเรียกแพ็ค')})
              
            })
            .catch(err => {
                console.log(err)
              setLoading(false)
            })  
          });
          return promise
    }



    function convertString(s) {
        return s.split('').map(char => {
            if (char === char.toUpperCase()) {
                return char.toLowerCase();
            }else {
                return char; // Digits remain unchanged
            }
        }).join('');
    }
    


    const findSuggestId = async ({ suggestCode }) =>{
        const littleBoy = convertString(suggestCode)
        let suggestData = { suggestType:'', suggestId:'', day:0 }
        if(littleBoy){ // ต้องเช็คว่าใช่ suggestCode จริงมั้ย
            if(littleBoy.slice(0,1)==='s'){
                await db.collection('profile').where('yourCode','==',littleBoy).get()
                .then((qsnapshot)=>{
                    if (qsnapshot.docs.length > 0) {
                        qsnapshot.forEach(doc => { 
                            suggestData = { suggestType:'sale', suggestId:doc.id , day:30 }
                        });
                        
                    } else {
                        console.log('ไม่พบเซล')
                    }
                })
                .catch(()=>{
                    setLoading(false)
                })
            } else { // restaurant
                await db.collection('shop').where('yourCode','==',littleBoy).get()
                .then((qsnapshot)=>{
                    if (qsnapshot.docs.length > 0) {
                        qsnapshot.forEach(doc => { 
                            suggestData = { suggestType:'restaurant', suggestId:doc.id , day:30 }
                        });
                    }
                })
                .catch(()=>{
                    setLoading(false)
                })
            }
        }
        return suggestData
      };



    

    function cancelOrder({ id, profileId }){
        db.collection('packageOrder').doc(id).update({ status:'cancel' }).then(()=>{
            pushByIdFilter({id:profileId,content:'หลักฐานการชำระเงินไม่ถูกต้อง',heading:'ยกเลิกการซื้อแพ็กเกจ',data:{ sound:'ยกเลิกการซื้อแพ็กเกจ' }})
        })
    };




  return (
    <div>
        <Modal_Loading show={loading} />
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
        <Row>
            {masterData.map((item)=>{
                const { orderNumber, shopName, profileName, id, imageId, net, shopId, profileId, packageId, tel, suggestCode, yourCode, suggester  } = item;
                const content = display.filter(a=>packageId.includes(a.id)).map(b=>b.content).join('/\n')
                // ถ้าใส่ code ตัวเองจะไม่ได้
                let newSuggest = suggestCode===yourCode?'':suggestCode?suggestCode:suggester
                
                return <Col key={id} sm='12' md='6' lg='4'  >
                            <div style={styles.container} >
                                <h6>เลขที่ใบสั่งซื้อ : {orderNumber}</h6>
                                <h6>ร้าน : {shopName}</h6>
                                <h6>ชื่อผู้ชื่อ : {profileName}</h6>
                                <h6>tel : {tel}</h6>
                                <h6>รหัสแนะนำ : {newSuggest}</h6>
                                <h6>รายการสั่งซื้อ : {content}</h6>
                                <h6>ยอดชำระ : {net}</h6>
                                <Row>
                                    <Col md='6' >
                                        <div onClick={()=>{setAlert_Modal({ status:true, content:`ยืนยันการยกเลิก ${shopName}`, onClick:()=>{cancelOrder({ id, profileId });setAlert_Modal(initialAlert)}, variant:'danger' })}} style={styles.container2} >
                                            ยกเลิกรายการ
                                        </div>
                                    </Col>
                                    <Col md='6' >
                                        <div onClick={()=>{setAlert_Modal({ status:true, content:`ยืนยันการชำระเงิน ${shopName}`, onClick:()=>{orderToPaid({ docId:id, shopId, profileId, packageId, suggestCode:newSuggest, net, content, shopName });setAlert_Modal(initialAlert)}, variant:'success' })}} style={styles.container3} >
                                            ยืนยัน
                                        </div>
                                    </Col>
                                </Row>
                                <img style={{width:'90%'}} src={imageId}  />
                            </div>
                    </Col>
            })}
            
        </Row>
    </div>
  );
};

const styles = {
    container : {
        backgroundColor:'white',borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)',padding:10,margin:10
    },
    container2 : {
        padding:10,margin:10,backgroundColor:one,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'
    },
    container3 : {
        padding:10,margin:10,backgroundColor:five,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'
    }
}

export default SoftwareCheck;
