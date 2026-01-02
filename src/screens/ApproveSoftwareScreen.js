import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Table
} from "react-bootstrap";

import { initialAlert } from "../configs";
import { db } from "../db/firestore";
import { findDay, findInArray, formatCurrency, formatTime, summary, toastSuccess } from "../Utility/function";
import { pushByIdFilter } from "../api/onesignal";
import { Modal_Alert, Modal_ApproveSoftware, Modal_Loading } from "../modal";
import { reverseSort } from "../Utility/sort";
import { NumberYMD, plusDays, stringDateTimeReceipt } from "../Utility/dateTime";
import { Card } from "../components";


const initialPackage = {
    orderNumber:'', 
    shopName:'', 
    profileName:'', 
    id:'', 
    imageId:'', 
    net:'',  
    packageId:[], 
    tel:'', 
    timestamp:new Date()
};

function ApproveSoftwareScreen() {
    const { profile:{ id:adminId, name:adminName } } = useSelector(state=>state.profile)
    const [masterData, setMasterData] = useState([]);
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;
    const [loading, setLoading] = useState(false)
    const [masterPackage, setMasterPackage] = useState([]);

    const [software_Modal, setSoftware_Modal] = useState(false);
    const [currentSoftware, setCurrentSoftware] = useState(initialPackage);

    function openSoftware(item){
        setCurrentSoftware(item);
        setSoftware_Modal(true);
    };


    const { net, length } = useMemo(()=>{
        const net = summary(masterData,'net');
        const length = masterData.length;
        return {
            net,
            length
        }
    },[masterData])


    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchSoftware(),
            fetchPackage()
        ])
        .then(()=>{
            setLoading(false);
        }) 
   
    }, []);

    async function fetchSoftware(){
        try {
            const query = await db.collection('packageOrder').where('status','==','order').get();
            const results = query.docs.map(doc=>{
                const { timestamp, ...rest } = doc.data();
                return {
                    timestamp:formatTime(timestamp),
                    ...rest,
                    id:doc.id
                }
            });
            setMasterData(reverseSort('timestamp',results));
        } catch (error) {
            alert(error);
        }
    }

    async function fetchPackage(){
        try {
            const packageDoc = await db.collection('admin').doc('package').get();
            const { value } = packageDoc.data();
            setMasterPackage(value.filter(a=>a.status).flatMap(b=>b.price.map(c=>({...c,content:b.name+' '+c.day,type:b.type}))))
        } catch (error) {
            alert(error)
        } 
    }


    // 200%
    async function handleCancelSoftware({ id, profileId, noti=true }){
        setSoftware_Modal(false);
        try {
            setLoading(true)
            await db.collection('packageOrder').doc(id).update({ status:'cancel', adminId, adminName })
            if(profileId && noti){
                pushByIdFilter({id:profileId,content:'หลักฐานการชำระเงินไม่ถูกต้อง',heading:'ยกเลิกการซื้อแพ็กเกจ',data:{ sound:'ยกเลิกการซื้อแพ็กเกจ' }})
            };
            setMasterData(prev=>prev.filter(item=>item.id !== id))
            toastSuccess('ยกเลิกรายการสำเร็จ');
         
        } catch (error) {
            console.error('Error cancel software:', error);
        } finally{
            setLoading(false);
        }
    };

    async function handleApproveSoftware(currentOrder) {
        setSoftware_Modal(false);
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
                    expire: formatTime(entry.expire),
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
    
            });
    
            pushByIdFilter({
                id: profileId,
                content: 'กรุณากดอัปเดตข้อมูล 1 ครั้งค่ะ',
                heading: `อนุมัติ แพ็กเกจ เรียบร้อย`,
                data: { sound: `อนุมัติ แพ็กเกจ เรียบร้อยค่ะ` },
            });
            toastSuccess('อนุมัติแพ็กเกจสำเร็จ');
            setMasterData(prev=>prev.filter(item=>item.id !== id))
  
        } catch (error) {
            alert(error);
        } finally{
            setLoading(false);
        }
    };


    return (
        <div  >
            <Modal_ApproveSoftware
                show={software_Modal}
                onHide={()=>{setSoftware_Modal(false)}}
                masterPackage={masterPackage}
                handleCancelSoftware={handleCancelSoftware}
                handleApproveSoftware={handleApproveSoftware}
                currentSoftware={currentSoftware}
            />
            <Modal_Loading show={loading} />
            <Modal_Alert
                show={status}
                onHide={()=>{setAlert_Modal(initialAlert)}}
                content={content}
                onClick={onClick}
                variant={variant}
            />
            <div style={{ position:'sticky',top:0 }} >
                <Card>
                    <h4>รอตรวจสอบ {length} รายการ</h4>
                    <h4>{formatCurrency(net)} บาท </h4>
                </Card>
            </div>
            <Table  bordered   variant="light"   >
                <thead  >
                <tr>
                    <th style={styles.text2}>เลขที่ใบสั่งซื้อ</th>
                    <th style={styles.text2}>ลูกค้า</th>
                    <th style={styles.text2}>ยอดซื้อ</th>
                </tr>
                </thead>
                <tbody  >
                {masterData.map((item, index) => {
                    const { orderNumber, shopName, profileName, net, tel, timestamp } = item;
                        return <tr  style={{cursor: 'pointer'}} key={index} onClick={()=>{openSoftware(item)}} >
                                <td  style={styles.text3}>
                                    <h6>{orderNumber}</h6>
                                    {stringDateTimeReceipt(timestamp)}
                                </td>
                                <td  style={styles.text3}>
                                    <p>ร้าน : {shopName}</p>
                                    <p>ผู้ติดต่อ : {profileName}</p>
                                    <p>เบอร์ : {tel}</p>
                                </td>
                                <td  style={styles.text3}>{net}</td>
                            </tr>
                    }
                )}
                </tbody>
            </Table>
        </div>
    );
};

const styles = {
    text2 : {
        textAlign:'center'
    }
}

export default ApproveSoftwareScreen;