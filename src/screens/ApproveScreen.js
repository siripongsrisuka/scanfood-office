import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
} from "react-bootstrap";

import { colors, initialAlert } from "../configs";
import { Button } from "rsuite";
import { addMail, db } from "../db/firestore";
import { findDay, findInArray, formatCurrency, summary } from "../Utility/function";
import { pushByIdFilter } from "../api/onesignal";
import { Modal_Alert, Modal_Loading, Modal_Success } from "../modal";
import { reverseSort } from "../Utility/sort";
import { NumberYMD, plusDays } from "../Utility/dateTime";

const { one, five, white, softWhite } = colors;

const types = [
    { id:'software', color:'red'},
    { id:'hardware', color:'orange'},
    ]

function ApproveScreen() {
    const { profile:{ id:adminId, name:adminName } } = useSelector(state=>state.profile)
    const [type, setType] = useState('software');
    const [masterSoftware, setMasterSoftware] = useState([]);
    const [masterHardware, setMasterHardware] = useState([]);
    const [onProcess, setOnProcess] = useState({ list:0, net:'' })
    const { list, net } = onProcess;
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;
    const [loading, setLoading] = useState(false)
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [masterPackage, setMasterPackage] = useState([])

    useEffect(()=>{
        let display = []
        if(type==='software'){
            display = masterSoftware
        } else {
            display = masterHardware
        }
        let all = [...masterHardware,...masterSoftware]
        setOnProcess({ list:all.length, net:summary(all,'net')})
    },[type,masterSoftware,masterHardware])



    const hardwareRef = useRef(); // for unsubscribe
    const softwareRef = useRef(); // for unsubscribe

    useEffect(() => {
      Promise.all([listenerRealtimeHardware(),listenerRealtimeSoftware(),fetchPackage()])
          .catch(err => console.log("Failed Promise.all Listen1 : ",err));      

    return () => {
      try{
        hardwareRef.current?.();
        softwareRef.current?.();
        console.log('Destroy_Component_and_Success_Listener_Remove for ApprovePackageScreen');
      }catch(err){
        console.log(err);
      }
    }
  }, []);
    async function listenerRealtimeHardware() {
      hardwareRef.current = db
          .collection('hardwareOrder')
        //   .where('status','in',['order','prepare'])
          .where('status','==','order')
          .onSnapshot({ includeQueryMetadataChanges: true },async docs => {
              const arr = [];  
              docs.forEach(doc => { 
                  arr.push({...doc.data(),id:doc.id,timestamp:doc.data().timestamp.toDate()})
              });
              setMasterHardware(reverseSort('timestamp',arr));
          },err => {
      })
    };

    async function listenerRealtimeSoftware() {
        softwareRef.current = db
            .collection('packageOrder')
            .where('status','in',['order'])
            .onSnapshot({ includeQueryMetadataChanges: true },async docs => {
                const arr = [];  
                docs.forEach(doc => { 
                    arr.push({...doc.data(),id:doc.id,timestamp:doc.data().timestamp.toDate()})
                });
                setMasterSoftware(reverseSort('timestamp',arr));
            },err => {
        })
    }

    async function fetchPackage(){
        db.collection('admin').doc('package').get().then((doc)=>{
            if(doc.exists){
                setMasterPackage(doc.data().value.filter(a=>a.status).flatMap(b=>b.price.map(c=>({...c,content:b.name+' '+c.day,type:b.type}))))
            }
        })
    }


    async function handleCancelHardware({ id, profileId }) {
        try {
            setLoading(true);
            // Update the hardware order status to "cancel"
            await db.collection('hardwareOrder').doc(id).update({ status: 'cancel' });
            // Notify if profileId exists
            if (profileId) {
                pushByIdFilter({
                    id: profileId,
                    content: 'หลักฐานการชำระเงินไม่ถูกต้อง',
                    heading: 'ยกเลิกการซื้ออุปกรณ์',
                    data: { sound: 'ยกเลิกการซื้ออุปกรณ์' },
                });
            }
            // Show success modal
            setSuccess_Modal(true);
            setTimeout(() => {
                setSuccess_Modal(false);
            }, 900);
        } catch (error) {
            console.error('Error cancelling hardware:', error);
        } finally {
            setLoading(false);
        }
    };

    async function handleApproveHardware(currentOrder){
        const { shopId, id:purchaseId, profileId } = currentOrder;
        try {
            setLoading(true)
            await db.collection('hardwareOrder').doc(purchaseId).update({ status:'prepare', adminId, adminName });

            addMail({
                content:`อนุมัติ การซื้ออุปกรณ์เรียบร้อย`,
                scanfood:false,
                timestamp:new Date(),
                shopId
            })
            if(profileId){
                pushByIdFilter({id:profileId,content:'กำลังจัดเตรียมสินค้า',heading:`อนุมัติ การซื้ออุปกรณ์เรียบร้อย`, data:{ sound:`อนุมัติ การซื้ออุปกรณ์เรียบร้อยค่ะ` }})
            }

            setSuccess_Modal(true);
            setTimeout(() => {
                setSuccess_Modal(false);
            }, 900);
        } catch (error) {
            console.error('Error approve hardware:', error);
        } finally {
            setLoading(false);
        }
        
    };

    async function handleCancelSoftware({ id, profileId, noti=true }){
        try {
            setLoading(true)
            await db.collection('packageOrder').doc(id).update({ status:'cancel', adminId, adminName })
            if(profileId && noti){
                alert('a')
                pushByIdFilter({id:profileId,content:'หลักฐานการชำระเงินไม่ถูกต้อง',heading:'ยกเลิกการซื้อแพ็กเกจ',data:{ sound:'ยกเลิกการซื้อแพ็กเกจ' }})
            }
            setSuccess_Modal(true);
            setTimeout(() => {
                setSuccess_Modal(false);
            }, 900);
        } catch (error) {
            console.error('Error cancel software:', error);
        } finally{
            setLoading(false);
        }
    };

    async function handleApproveSoftware(currentOrder) {
        const { packageId, shopId, id, profileId } = currentOrder;
 
        setLoading(true);
    
        try {
             // array of packageId
            const value = packageId.map((item) => (findDay(item)));
        
            
            const shopRef = db.collection("shop").doc(shopId);
            const mailboxRef = db.collection('mailbox').doc();
            const packageRef = db.collection('packageOrder').doc(id)
    
            await db.runTransaction(async (transaction) => {
                const shopDoc = await transaction.get(shopRef);
                const { vip = [], packageArray = [] } = shopDoc.data();
    
                const newVip = vip.map((entry) => ({
                    ...entry,
                    expire: entry.expire.toDate(),
                }));
    
                const newPackageArray = [...packageArray];
                for (const item of value) {
                    const existing = findInArray(newVip, 'type', item.packageType);
                    const currentDate = new Date();
                    const expireDate = existing && existing.type ? new Date(existing.expire) : null;
    
                    const nextExpireDate = expireDate && NumberYMD(currentDate) > NumberYMD(expireDate)
                        ? plusDays(currentDate, item.day)
                        : plusDays(expireDate || currentDate, item.day);
    
                    if (existing) {
                        existing.expire = nextExpireDate;
                    } else {
                        newVip.push({ type: item.packageType, expire: nextExpireDate });
                    }
                }
    
                const newPackages = packageId.filter((id) => !packageArray.includes(id));
                const rePackages = packageId.filter((id) => packageArray.includes(id));
         
                transaction.update(shopRef, {
                    vip: newVip,
                    packageArray: [...newPackageArray, ...newPackages],
                });
                transaction.set(mailboxRef,{
                    content: `อนุมัติ ${content} เรียบร้อย`,
                    scanfood: false,
                    timestamp: new Date(),
                    shopId,
                })
                transaction.update(packageRef,{ status: 'success', adminId, adminName })
    
                return { newPackages, rePackages };
            });
    
            pushByIdFilter({
                id: profileId,
                content: 'กรุณากดอัปเดตข้อมูล 1 ครั้งค่ะ',
                heading: `อนุมัติ แพ็กเกจ เรียบร้อย`,
                data: { sound: `อนุมัติ แพ็กเกจ เรียบร้อยค่ะ` },
            });
         
   
            setSuccess_Modal(true);
            setTimeout(() => {
                setSuccess_Modal(false);
            }, 900);
        } catch (error) {
            console.error(error);
        } finally{
            setLoading(false);
        }
    }

    return (
        <div style={{padding:10}} >
            <Modal_Loading show={loading} />
            <Modal_Success show={success_Modal} />
            <Modal_Alert
                show={status}
                onHide={()=>{setAlert_Modal(initialAlert)}}
                content={content}
                onClick={onClick}
                variant={variant}
            />
            <div style={{paddingLeft:'1rem',paddingRight:'1rem',overflowX:'auto',position:'sticky',top:0,backgroundColor:white}} >
            <h4>รอตรวจสอบ {list} รายการ &nbsp; = &nbsp; {formatCurrency(net)} บาท </h4>

                {types.map((item)=>{
                    const { id, color } = item;
                    let status = type === id 
                    let length = id==='software'?masterSoftware.length:masterHardware.length
                    return <Button  onClick={()=>{setType(id)}} key={id} color={color} appearance={status?"primary":"ghost"} style={{minWidth:'140px',marginRight:'1rem',marginBottom:'1rem'}}  >{id} ({length})</Button>
                })}
            </div>
            {type=='software'
                ?<Row>
                    {masterSoftware.map((item)=>{
                        const { orderNumber, shopName, profileName, id, imageId, net,  packageId, tel } = item;
                        const content = masterPackage.filter(a=>packageId.includes(a.id)).map(b=>b.content).join('/\n')
                        // ถ้าใส่ code ตัวเองจะไม่ได้
                        
                        return <Col key={id} sm='12' md='6' lg='4' style={{padding:0}} >
                                    <div style={{backgroundColor:white,borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)',padding:10,margin:10}} >
                                        <h6>เลขที่ใบสั่งซื้อ : {orderNumber}</h6>
                                        <h6>ร้าน : {shopName}</h6>
                                        <h6>ชื่อผู้ชื่อ : {profileName}</h6>
                                        <h6>tel : {tel}</h6>
                                        <div style={{minHeight:'70px',padding:10,backgroundColor:softWhite,borderRadius:10}} >
                                            <h6>รายการสั่งซื้อ : {content}</h6>
                                        </div>
                                        <h6>ยอดชำระ : {net}</h6>
                                        <Row>
                                            <Col md='6' >
                                                <div onClick={()=>{setAlert_Modal({ status:true, content:`ยกเลิกออเดอร์`, onClick:()=>{setAlert_Modal(initialAlert);handleCancelSoftware({...item, noti:false })}, variant:'danger' })}} style={{padding:10,margin:10,backgroundColor:one,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}}  >
                                                    ยกเลิกไม่แจ้งเตือน
                                                </div>
                                            </Col>
                                            <Col md='6' >
                                                <div onClick={()=>{setAlert_Modal({ status:true, content:`ยกเลิกออเดอร์`, onClick:()=>{setAlert_Modal(initialAlert);handleCancelSoftware(item)}, variant:'danger' })}} style={{padding:10,margin:10,backgroundColor:one,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}}  >
                                                    ยกเลิกออเดอร์
                                                </div>
                                            </Col>
                                            <Col md='6' >
                                                <div onClick={()=>{setAlert_Modal({ status:true, content:`อนุมัติออเดอร์`, onClick:()=>{setAlert_Modal(initialAlert);handleApproveSoftware(item)}, variant:'success' })}} style={{padding:10,margin:10,backgroundColor:five,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}} >
                                                    อนุมัติออเดอร์
                                                </div>
                                            </Col>
                                        </Row>
                                        <div style={{display:'flex',justifyContent:'center'}} >
                                            <img style={{width:'90%',height:undefined,aspectRatio:3/4}} src={imageId}  />
                                        </div>
                                    </div>
                            </Col>
                    })}
                    
                </Row>
                :<Row>
                    {masterHardware.map((item)=>{
                        const { orderNumber, shopName, profileName, id, imageId, net, product, vat, vatDetail  } = item;
                        
                        return <Col key={id} sm='12' md='6' lg='4'  style={{padding:0}}  >
                                    <div style={{backgroundColor:white,borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)',padding:10,margin:10}} >
                                        <h6>เลขที่ใบสั่งซื้อ : {orderNumber}</h6>
                                        <h6>ร้าน : {shopName}</h6>
                                        <h6>ชื่อผู้ชื่อ : {profileName}</h6>
                                        {vat
                                            ?<h6>ใบกำกับภาษี : {vatDetail}</h6>
                                            :null
                                        }
                                        <div style={{minHeight:'120px',padding:10,backgroundColor:softWhite,borderRadius:10}} >
                                            <h6>รายการสั่งซื้อ : </h6>
                                            {product.map((item,index)=>{
                                                return <div key={index} style={{display:'flex',justifyContent:'space-between',paddingLeft:'2rem'}} >
                                                            <h6  >{index+1}. {item.name} x{item.qty}</h6>
                                                            <h6 >{item.totalPrice?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</h6>
                                                        </div>
                                            })}
                                        </div>
                                        
                                        <h6>ยอดชำระ : {net.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</h6>
                                        <Row>
                                            <Col md='6' >
                                                <div onClick={()=>{setAlert_Modal({ status:true, content:`ยกเลิกออเดอร์`, onClick:()=>{setAlert_Modal(initialAlert);handleCancelHardware(item)}, variant:'danger' })}} style={{padding:10,margin:10,backgroundColor:one,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}} >
                                                ยกเลิกออเดอร์
                                                </div>
                                            </Col>
                                            <Col md='6' >
                                                <div onClick={()=>{setAlert_Modal({ status:true, content:`อนุมัติออเดอร์`, onClick:()=>{setAlert_Modal(initialAlert);handleApproveHardware(item);}, variant:'success' })}} style={{padding:10,margin:10,backgroundColor:five,justifyContent:'center',alignItems:'center',display:'flex',borderRadius:20,cursor:'pointer'}} >
                                                    อนุมัติออเดอร์
                                                </div>
                                            </Col>
                                        </Row>
                                        <div style={{display:'flex',justifyContent:'center'}} >
                                            <img style={{width:'90%',height:undefined,aspectRatio:3/4}} src={imageId}  />
                                        </div>
                                    </div>
                            </Col>
                    })}
                </Row>
            }
            
       
        <div>

        </div>
        </div>
    );
}

export default ApproveScreen;