import React, { useState, useEffect, useRef } from "react";

import { Button, Row, Table, Col, Form } from "react-bootstrap";
import { Modal_Loading, Modal_Product } from "../modal";
import { addMail, db } from "../db/firestore";
import { colors, initialProduct } from "../configs";
import { v4 as uuidv4 } from 'uuid';
import { findDay, findInArray, useToDate } from "../Utility/function";
import { pushByIdFilter, pushByOneFilter } from "../api/onesignal";
import { NumberYMD, plusDays } from "../Utility/dateTime";

const saleProfile = {
    performance:[],
    wallet:0,
    cumulative:0,
    grade:'sale',
};

const { one, two, three, four, five  } = colors; 



function SoftwareCheck() {
    const [masterData, setMasterData] = useState([]);
    const [display, setDisplay] = useState([]);
    const [loading, setLoading] = useState(false);

    const yearMonth = (today) => {
        // const today = new Date();
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
        const { suggestType, suggestId, day } = await findSuggestId({ suggestCode })

        let packageType  = ''
        if(['1','2','3','4','5','6','7','8','9'].includes(packageId)){ // qrcode ordering
            packageType = 'qrcode'
        } else if(['10','11','12','13','14','15','16','17','18'].includes(packageId)){ // staff ordering
            packageType = 'staff'
        } else { // translator
            packageType = 'language'
        }
        let value = [{ packageType, day:findDay(packageId) },{ packageType:'qrcode', day}]
        // console.log({ shopId, value, packageId, docId, profileId, net, suggestType, suggestId })
        addPackage({ shopId, value, packageId, docId, profileId, net, suggestType, suggestId, content, shopName, suggestCode })
    };

    function manageSuggestor({ suggestType, suggestId, reOrder, net, shopName, content, docId }){
        if(suggestType==='restaurant'){
            db.collection('packageOrder').doc(docId).update({ status:'success', by:'restaurant'  });
            manageRewardShop({ shopId:suggestId, value:[{ packageType:'qrcode', day:30}] })
        } else {
            manageRewardSale({ profileId:suggestId, reOrder, net, shopName, packageName:content, docId })
        }
    };

    async function manageRewardSale({ profileId, reOrder, net, shopName, packageName, docId  }){
        const promise = await new Promise(async (resolve,reject)=>{
            const profileRef = db.collection("profile").doc(profileId);
            db.runTransaction(async transaction => { 
                return transaction.get(profileRef).then(async profileDoc =>{
                    
                    const { performance, wallet, cumulative, grade } = {...saleProfile,...profileDoc.data()}
                    let newPerformance = performance.slice();
                    let newWallet = wallet;

                    let have = false // คือ มียอดของเดือนนี้หรือยัง
                    let currentPerformance = { 
                        yearMonth:yearMonth(new Date()), 
                        newRevenue:0, 
                        bonus:0,
                        passiveIncome:0,
                        rawPassiveIncome:0, 
                        thisMonthSale:0, // ถ้าถึง 100,000 เปลี่ยน rawPassive เป็น passive และโอน rawOldMonth ไปเดือนถัดไป
                        rawOldMonthSale:0, 
                        oldMonthSale:0,
                    }

                    let thisPerformance = findInArray(newPerformance,'yearMonth',yearMonth(new Date())) // performance ของเดือนนี้
                    if(thisPerformance && thisPerformance.yearMonth){
                        currentPerformance = thisPerformance
                        have = true
                    }
                    let field = {}
                    const { 
                        newRevenue,  
                        rawPassiveIncome, 
                        thisMonthSale, 
                        rawOldMonthSale, 
                        bonus, 
                    } = currentPerformance;

                    let revenue = 0; //  ค่าคอม ที่ได้เลยทันที เมื่อทำการปิดยอดได้
                    let newBonus = 0; // โบนัส ที่เกิดขึ้นหลังปิดยอดได้ 300,000
                    let target = 0; // ยอดที่ขาด ก่อนได้ โบนัส
                    let newRaw = 0; // รายได้แบบ passive รอสิ้นเดือน
                    if(reOrder){ // แปลว่าซื้อซ้ำในแพ็กเกจเดิม
                        newRaw = rawPassiveIncome + (net*0.1)
                        let newOld = rawOldMonthSale + net
                        field = { rawPassiveIncome:newRaw, rawOldMonthSale:newOld}
                    } else { // package ที่ไม่เคยซื้อมาก่อน
                        revenue = net*0.3;
                        let newThisMonthSale = thisMonthSale + net
                        if(newThisMonthSale > 100000){ // ยอดที่มากกว่า 300,000 จะถูกคิดโบนัส
                            if(thisMonthSale >100000){ // แปลว่ามากกว่า 300,000 ตั้งแต่แรก
                                newBonus = net*0.2
                            } else { // เพิ่งมากกว่า 300,000
                                newBonus = (newThisMonthSale - 100000)*0.2
                            }
                        } else {
                            target = 100000 - newThisMonthSale
                        }
                        newWallet = wallet +revenue 
                        field = {
                            newRevenue:newRevenue+revenue,
                            bonus:bonus + newBonus,
                            thisMonthSale:newThisMonthSale,
                        }
                    }
                    if(have){ // แปลว่าเป็นก้อนข้อมูลเดิม
                        newPerformance = newPerformance.map((item)=>{
                            return item.yearMonth === currentPerformance.yearMonth
                                ?{...currentPerformance,...field}
                                :item
                        })
                    } else {
                        newPerformance = [...newPerformance,{...currentPerformance,...field}]
                    }
                    transaction.update(profileRef,{performance:newPerformance,wallet:newWallet,cumulative:cumulative+net})
                    return { revenue, newBonus, target, newRaw }
                })
            })
            .then(({ revenue, newBonus, target, newRaw }) => {
                db.collection('packageOrder').doc(docId).update({ status:'success', revenue, newBonus, newRaw, by:'sale' });
                // if(!reOrder){
                //     let content = `${packageName}\nค่าคอม ${revenue} บาท\nโบนัส ${newBonus} บาท`
                //     if(target>0){
                //         content += `\nขาดยอดอีกเพียง ${target} เพื่อรับโบนัสเพิ่ม 20% จากยอดขาย`
                //     }
                //     pushByIdFilter({id:profileId,content,heading:`${shopName} ชำระเงินแล้ว`})
                // } else {
                //     pushByIdFilter({id:profileId,content:`${packageName} \npassive income รวม ${newRaw} บาท `,heading:`${shopName} ซื้อซ้ำ`})
                // }
                setLoading(false)
                alert('success')
            })
            .catch(err => {
                setLoading(false)
            })  
            });
        
            return promise
    }

    async function addPackage({ shopId, value, packageId, docId, profileId, net, suggestType, suggestId, content, shopName, suggestCode }){
        const promise = await new Promise(async (resolve,reject)=>{
            const shopRef = db.collection("shop").doc(shopId);
            db.runTransaction(async transaction => { 
              return transaction.get(shopRef).then(async shopDoc =>{
                let reOrder = true

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
                newPackageArray = [...newPackageArray,packageId]

                if(!packageArray.includes(packageId)){
                    reOrder = false
                }
                if(suggestId){ // เพิ่งใส่รหัสแนะนำ สามารถฝังเซลลงไปได้
                    transaction.update(shopRef,{vip:newVip,packageArray:newPackageArray,suggester:suggestCode})
                } else {
                    transaction.update(shopRef,{vip:newVip,packageArray:newPackageArray})
                }
                  return reOrder
              })
            })
            .then(reOrder => {
              
              pushByIdFilter({id:profileId,content:'กรุณาปัดแอพออก และเข้าใหม่อีกครั้งครับ/ค่ะ',heading:`อนุมัติ ${content} เรียบร้อย`})
              addMail({
                  content:`อนุมัติ ${content} เรียบร้อย`,
                  scanfood:false,
                  timestamp:new Date(),
                  shopId
              })
              if(suggestId){
                addMail({
                    content:`คุณได้รับ แพ็กแกจ สแกนสั่งอาหารฟรี 1 เดือน`,
                    scanfood:false,
                    timestamp:new Date(),
                    shopId
                })
              }
              if(suggestId){ // แปลว่ามีรหัสแนะนำจริง
                manageSuggestor({ suggestType, suggestId, reOrder, net, shopName, content, docId })
              } else {
                db.collection('packageOrder').doc(docId).update({ status:'success' });
                setLoading(false)
              }
            })
            .catch(err => {
                console.log(err)
              setLoading(false)
            })  
          });
          return promise
    }

    async function manageRewardShop({ shopId, value }){ // 100%
        const promise = await new Promise(async (resolve,reject)=>{
            const shopRef = db.collection("shop").doc(shopId);
            db.runTransaction(async transaction => { 
              return transaction.get(shopRef).then(async shopDoc =>{
                const { vip } = shopDoc.data()
                let newVip = vip.slice()
                for(const item of value){
                    let find = findInArray(newVip,'type',item.packageType)
                    let nextDay = new Date()
                      if(find && find.type){
                          if(NumberYMD(new Date())> NumberYMD(find.expire)){ // แปลว่าหมดอายุไปก่อนหน้านี้แล้ว
                              nextDay = plusDays(new Date(),item.day)
                          } else { // ยังไม่หมดอายุ จึงต่อจากวันใช้งานเดิม
                              nextDay = plusDays(find.expire,item.packageType)
                          }
                      }
                      newVip = newVip.map(a=>{
                          return a.type===item.packageType
                              ?{type:item.packageType,expire:nextDay}
                              :a
                      })
                }
                  transaction.update(shopRef,{vip:newVip})
              })
            })
            .then(res => {
              pushByOneFilter({shopId,content:'',heading:`คุณได้รับ แพ็กแกจ สแกนสั่งอาหารฟรี 1 เดือน`})
                addMail({
                    content:`คุณได้รับ แพ็กแกจ สแกนสั่งอาหารฟรี 1 เดือน`,
                    scanfood:false,
                    timestamp:new Date(),
                    shopId
                })
              setLoading(false)
            })
            .catch(err => {
              setLoading(false)
            })  
          });
        
          return promise
    };

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
            // pushByIdFilter({id:'saleID',content:'กรุณาปัดแอพออก และเข้าใหม่อีกครั้งครับ/ค่ะ',heading:`ลูกค้าชำระเงินแล้ว\nร้านตำกระด้ง\nแพ็กเกจ ...\nค่าคอม ... บาท\nโบนัส ... บาท ขาดยอดอีกเพียง ... เพื่อรับโบนัสเพิ่ม 20% จากยอดขาย`})
        }
        return suggestData
      };



    

    function cancelOrder({ id, profileId }){
        db.collection('packageOrder').doc(id).update({ status:'cancel' }).then(()=>{
            pushByIdFilter({id:profileId,content:'หลักฐานการชำระเงินไม่ถูกต้อง',heading:'ยกเลิกการซื้อพื้นที่เก็บไฟล์'})
        })
    };




  return (
    <div>
        <Modal_Loading show={loading} />
        <Row>
            {masterData.map((item)=>{
                const { orderNumber, shopName, profileName, id, imageId, net, shopId, profileId, packageId, tel, suggestCode, yourCode  } = item;
                const { content } = findInArray(display,'id',packageId)||{ content:''}
                let newSuggest = suggestCode===yourCode?'':suggestCode
                
                return <Col key={id} sm='12' md='6' lg='4'  >
                            <div style={{backgroundColor:'white',borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)',padding:10,margin:10}} >
                                <h6>เลขที่ใบสั่งซื้อ : {orderNumber}</h6>
                                <h6>ร้าน : {shopName}</h6>
                                <h6>ชื่อผู้ชื่อ : {profileName}</h6>
                                <h6>tel : {tel}</h6>
                                <h6>รหัสแนะนำ : {suggestCode}</h6>
                                <h6>รายการสั่งซื้อ : {content}</h6>
                                <h6>ยอดชำระ : {net}</h6>
                                <Row>
                                    <Col md='6' >
                                        <div onClick={()=>{cancelOrder({ id, profileId })}} style={{padding:10,margin:10,backgroundColor:one,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}} >
                                            ยกเลิกรายการ
                                        </div>
                                    </Col>
                                    <Col md='6' >
                                        <div onClick={()=>{orderToPaid({ docId:id, shopId, profileId, packageId, suggestCode:newSuggest, net, content, shopName })}} style={{padding:10,margin:10,backgroundColor:five,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}} >
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
}

export default SoftwareCheck;
