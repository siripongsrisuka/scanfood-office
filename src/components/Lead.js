import React, { useMemo, useState } from "react";
import { colors, initialLead, initialProcess, initialQuotation, initialShopType } from "../configs";
import { Col, Row } from "react-bootstrap";
import { Modal_Cancel, Modal_FlatListTwoColumn } from "../modal";
import { toastSuccess, wait } from "../Utility/function";
import { yearMonth } from "../Utility/dateTime";
import { db } from "../db/firestore";
import OneButton from "./OneButton";

const { softWhite, softGray } = colors;

const leadOptions = [
    { id:'1', name:'เปิดบิล'},
    { id:'2', name:'โทร'},
    { id:'3', name:'แก้ไขโปรไฟล์'},
    { id:'4', name:'ผูกบัญชีร้านค้า'},
    { id:'5', name:'ย้ายไปถังขยะ'},
];

const initialCancel = { cancelId:'', reason:'' };

function Lead({
    leads,
    setCurrentQuotation,
    setConnect_Modal,
    setQuotation_Modal,
    setLeads,
    setLoading,
    currentLead,
    setCurrentLead,
    setLead_Modal
}) {
    
    const { tel, storeSize, id:leadId } = currentLead;
    const [leadOption_Modal, setLeadOption_Modal] = useState(false);
    const [cancel_Modal, setCancel_Modal] = useState(false);
    const [currentCancel, setCurrentCancel] = useState(initialCancel);

    const colorMap = useMemo(
        () => new Map(initialProcess.map(a=>[a.id,a.color]))
    ,[])

    const shopTypeMap = useMemo(
        ()=> new Map(initialShopType.map(a=>[a.id,a.name]))
    ,[])

    function openLeadOption(item){
        setCurrentLead(item);
        setLeadOption_Modal(true);
    };

    async function handleLeadAction(item){
        setLeadOption_Modal(false);
        await wait(500)
        switch (item.id) {
            case '1': // เปิดบิล
                if(!storeSize) return alert('ไม่มี storeSize ต้องเลือกขนาดร้าน ถึงจะเปิดบิลได้')
                setCurrentQuotation({...initialQuotation, storeSize:Number(storeSize) })
                setQuotation_Modal(true)
                break;
            case '2': // 100%
                if(!tel) return alert('ไม่มีเบอร์ให้ติดต่อ')
                window.location.href = `tel:${tel}`;
                break;
            case '3': // 100%
                setLead_Modal(true);
                break;
            case '4': // 100%
                setConnect_Modal(true);
                break;
            case '5':
                setCancel_Modal(true);
                setCurrentCancel(initialCancel);
                break;
        
            default:
                break;
        };
    };

    // 200%
    async function handleCancel(){
        const { cancelId, reason } = currentCancel;
        setCancel_Modal(false);
        setLoading(true);
        try {
            const customerRef = db.collection('customer').doc(leadId);
            const updatedField = {
                cancelId, 
                reason, 
                status:'cancel',
                yearMonth:yearMonth(new Date()) 
            }
            await customerRef.update(updatedField);
            setLeads(prev=>prev.filter(a=>a.id !== leadId));
            toastSuccess('อัปเดตสำเร็จ');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

  return <div>
            <Modal_Cancel
                show={cancel_Modal}
                onHide={()=>{setCancel_Modal(false)}}
                currentCancel={currentCancel}
                setCurrentCancel={setCurrentCancel}
                current={currentLead}
                submit={handleCancel}
            />
            <Modal_FlatListTwoColumn
                header={'Lead Options'}
                show={leadOption_Modal}
                onHide={()=>{setLeadOption_Modal(false)}}
                value={leadOptions}
                onClick={handleLeadAction}
            />
            <OneButton {...{ text: '+ เพิ่ม Lead', submit: ()=>{setLead_Modal(true);setCurrentLead(initialLead)}, variant:'dark' }} />
            <h4>ทั้งหมด : {leads.length} lead</h4>
            {leads.map((item)=>{
                const { name, storeSize, shopType, note, process, day, shopId } = item;
                const color = colorMap.get(process);
                const shopTypeName = shopTypeMap.get(shopType);
                return <Row onClick={()=>{openLeadOption(item)}} key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                            <Col xs='12' sm='4'md='3'lg='3' ><i style={{ color }} class="bi bi-circle-fill"></i>&nbsp;<span style={{ color:softGray }} >({day})</span><span  >({storeSize})</span>{name}{shopId?<span><button style={{ backgroundColor:'rgba(247,199,77,0.9)'}} >ผูกบัญชีแล้ว</button></span>:null}</Col>
                            <Col xs='6' sm='4'md='3'lg='3'  >{shopTypeName}</Col>
                            <Col md='12' lg='6'  >Note : {note}</Col>
                        </Row>
            })}
  </div>
}

export default Lead;
