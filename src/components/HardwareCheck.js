import React, { useState, useEffect, useRef, useMemo } from "react";

import { Button, Row, Table, Col, Form } from "react-bootstrap";
import { Modal_Confirm, Modal_Loading, Modal_OneInput } from "../modal";
import { addMail, db } from "../db/firestore";
import { colors } from "../configs";
import { pushByIdFilter, pushByOneFilter } from "../api/onesignal";
import { yearMonth } from "../Utility/dateTime";
import { findInArray } from "../Utility/function";

const saleProfile = {
    performance:[],
    wallet:0,
    cumulative:0,
    grade:'sale',
};

const { one, two, three, four, five, theme3  } = colors; 



function HardwareCheck() {
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cancle_Modal, setCancle_modal] = useState(false);
    const [cancelData, setCancelData] = useState({ id:'', profileId:'' })
    const { id, profileId } = cancelData;
    const [process, setProcess] = useState('order');
    const [confirmData, setConfirmData] = useState({ id:'', shopId:'', product:[], profileId:'', shopName:'' });
    const [confirm_Modal, setConfirm_Modal] = useState(false);
    const [tracking, setTracking] = useState('');
    const [tracking_Modal, setTracking_modal] = useState(false)

    const { display, orderLength, prepareLength } = useMemo(()=>{
        let orderDisplay = masterData.filter(a=>a.status==='order') 
        let prepareDisplay = masterData.filter(a=>a.status==='prepare') 
        return {
            display:process==='order'?orderDisplay:prepareDisplay,
            orderLength:orderDisplay.length,
            prepareLength:prepareDisplay.length,
        }
    },[masterData, process]);

    function idToPrice(arr){
        let commission = 0
        for(const item of arr){
            switch (item.id) {
                case 1:  // tablet
                commission += 345
                    break;
                case 2: // bluetooth printer black
                commission += 65
                    break;
                case 3: // bluetooth printer orange
                commission += 130
                    break;
                case 4: // barigan printer white
                commission += 200
                    break;
                case 5: // cash drawer 
                commission += 200
                    break;
                case 6: // paper 58 x 10 
                commission += 0
                    break;
                case 7: // paper 80 x 5
                commission += 0
                    break;
                default:
                    commission = 0
                    break;
            }
        }
        
        return commission
    }
  

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
          .collection('hardwareOrder')
          .where('status','in',['order','prepare'])
          .onSnapshot({ includeQueryMetadataChanges: true },async docs => {
              const arr = [];  
              docs.forEach(doc => { 
                  arr.push({...doc.data(),id:doc.id,timestamp:doc.data().timestamp.toDate()})
              });
              setMasterData(arr);
          },err => {
      })
    };

    async function confirmPay(){
        setConfirm_Modal(false)
        const { shopId, id:purchaseId, product, profileId, shopName } = confirmData;
        let hardWareCommission = idToPrice(product)
        addMail({
            content:`อนุมัติ การซื้ออุปกรณ์เรียบร้อย`,
            scanfood:false,
            timestamp:new Date(),
            shopId
        })
        db.collection('hardwareOrder').doc(id).update({ status:'prepare' });
        pushByIdFilter({id:profileId,content:'กำลังจัดเตรียมสินค้า',heading:`อนุมัติ การซื้ออุปกรณ์เรียบร้อย`, data:{ sound:`อนุมัติ การซื้ออุปกรณ์เรียบร้อยค่ะ` }})
        db.collection('shop').doc(shopId).get().then((doc)=>{
            const { suggester } = doc.data()
            if(suggester){ // แปลว่าซื้อผ่านเซล
                db.collection('profile').where('yourCode','==',suggester).get().then((docs)=>{
                    let docId = ''
                    docs.forEach((doc)=>{
                        docId = doc.id
                    })
                    manageRewardSale({ profileId, hardWareCommission, purchaseId, shopName })
                })
            } else {
                alert('success')
            }
        })
    };

    async function manageRewardSale({ profileId, hardWareCommission, purchaseId, shopName }){
        const promise = await new Promise(async (resolve,reject)=>{
            const profileRef = db.collection("profile").doc(profileId);
            db.runTransaction(async transaction => { 
                return transaction.get(profileRef).then(async profileDoc =>{
                    // cumulative คือ ยอดขายตลอดชีวิตของเซล
                    const { performance, wallet,  } = {...saleProfile,...profileDoc.data()}
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
         
                    // 1. ยอด hardware
                    current.hardwareRevenue += hardWareCommission
               

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
                    })
                })
            })
            .then(() => {
                db.collection('packageOrder').doc(purchaseId).update({ status:'success', license:0, totalSale:0, baseSale:0, passive:0, hardware:hardWareCommission, bonus:0, by:'sale' });
                pushByIdFilter({id:profileId,content:`ร้าน :${shopName} \n `,heading:`อนุมัติอุปกรณ์`,data:{ sound:'อนุมัติอุปกรณ์' }})
                setLoading(false)
                alert('success')
            })
            .catch(err => {
                setLoading(false)
            })  
            });
        
            return promise
    };


    function cancelOrder({ id, profileId }){
        setCancle_modal(true)
        setCancelData({ id, profileId })
        
    };

    function cancelCommand(){
        db.collection('hardwareOrder').doc(id).update({ status:'cancel' }).then(()=>{
            pushByIdFilter({id:profileId,content:'หลักฐานการชำระเงินไม่ถูกต้อง',heading:'ยกเลิกการซื้ออุปกรณ์',data:{ sound:'ยกเลิกการซื้ออุปกรณ์' }})
        })
        setCancle_modal(false)
    };

    function confirmPrepare(){
        const { shopId, id } = confirmData;
        if(tracking){
            db.collection('hardwareOrder').doc(id).update({ status:'sending', tracking })
            setTracking('')
            setTracking_modal(false)
            pushByOneFilter({shopId,content:'',heading:`เลขพัสดุของคุณคือ ${tracking}`,data : { sound:`อัปเดตเลขพัสดุ` }})

        } else {
            alert('กรุณาใส่ Tracking')
        }
    };



  return (
    <div>
        <Modal_Loading show={loading} />
        <Modal_OneInput
            show={tracking_Modal}
            onHide={()=>{setTracking_modal(false)}}
            placeholder='เลข tracking'
            color='success'
            onChange={(value)=>{setTracking(value)}}
            value={tracking}
            onClick={confirmPrepare}
        />
        <Modal_Confirm
            show={cancle_Modal}
            onHide={()=>{setCancle_modal(false)}}
            content='ยกเลิกใบคำสั่งซื้อนี้'
            onClick={cancelCommand}
        />
        <Modal_Confirm
            show={confirm_Modal}
            onHide={()=>{setConfirm_Modal(false)}}
            content='ยืนยันใบคำสั่งซื้อนี้'
            onClick={confirmPay}
            color='success'
        />
        <Row>
            <Col md='6' sm='12' >
                <div onClick={()=>{setProcess('order')}} style={{display:'flex',justifyContent:'center',alignItems:'center',padding:10,margin:10,borderRadius:20,backgroundColor:process==='order'?one:theme3}} >
                    รออนุมัติ({orderLength})
                </div>
            </Col>
            <Col md='6' sm='12' >
                <div onClick={()=>{setProcess('prepare')}} style={{display:'flex',justifyContent:'center',alignItems:'center',padding:10,margin:10,borderRadius:20,backgroundColor:process==='prepare'?one:theme3}} >
                    กำลังจัดส่ง({prepareLength})
                </div>
            </Col>
        </Row>
        <Row>
            {display.map((item)=>{
                const { orderNumber, shopName, profileName, id, imageId, net, shopId, profileId, product, vat, vatDetail  } = item;
                
                return <Col key={id} sm='12' md='6' lg='4'  >
                            <div style={{backgroundColor:'white',borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)',padding:10,margin:10}} >
                                <h6>เลขที่ใบสั่งซื้อ : {orderNumber}</h6>
                                <h6>ร้าน : {shopName}</h6>
                                <h6>ชื่อผู้ชื่อ : {profileName}</h6>
                                {vat
                                    ?<h6>ใบกำกับภาษี : {vatDetail}</h6>
                                    :null
                                }
                                <h6>รายการสั่งซื้อ : </h6>
                                {product.map((item,index)=>{
                                    return <div key={index} style={{display:'flex',justifyContent:'space-between',paddingLeft:'3rem'}} >
                                                <h6 key={index} >{index+1}. {item.name} x{item.qty}</h6>
                                                <h6 key={index} >{item.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</h6>
                                            </div>
                                })}
                                
                                <h6>ยอดชำระ : {net.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</h6>
                                {process==='order'
                                    ? <Row>
                                        <Col md='6' >
                                            <div onClick={()=>{cancelOrder({ id, profileId })}} style={{padding:10,margin:10,backgroundColor:one,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}} >
                                                ยกเลิกรายการ
                                            </div>
                                        </Col>
                                        <Col md='6' >
                                            <div onClick={()=>{setConfirmData({ id, shopId, product, profileId, shopName });setConfirm_Modal(true)}} style={{padding:10,margin:10,backgroundColor:five,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}} >
                                                ยืนยัน
                                            </div>
                                        </Col>
                                    </Row>
                                    :<div onClick={()=>{setConfirmData({ id, shopId, product, profileId, shopName });setTracking_modal(true)}} style={{padding:10,margin:10,backgroundColor:five,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}} >
                                        ใส่ Tracking
                                    </div>
                                }
                               
                                <img style={{width:'90%'}} src={imageId}  />
                            </div>
                    </Col>
            })}
            
        </Row>
    </div>
  );
}

export default HardwareCheck;
