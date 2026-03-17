import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Button,
} from "react-bootstrap";

import { Modal_Lead, Modal_FlatlistSearchShop, Modal_Loading, Modal_Quotation, Modal_QuotationMini } from "../modal";
import { db } from "../db/firestore";
import { HardwareCheck, Lead, LicenseCheck, Memo, Quotation, SlideOptions } from "../components";
import { scanfoodAPI } from "../Utility/api";
import {  stringReceiptNumber, stringYMDHMS3 } from "../Utility/dateTime";
import { colors, initialLead, initialQuotation } from "../configs";
import { fetchCustomer, fetchHardware, fetchLicense, fetchMemo, fetchPayment, fetchSoftware, toastSuccess } from "../Utility/function";

const { greenSanta, blue } = colors;

const thisOptions = [
        {id:'1',name:'ลูกค้าใหม่', value:'1'},
        {id:'2',name:'ใบเสนอราคา', value:'2'},
        {id:'3',name:'แพ็กเกจ', value:'3'},
        {id:'4',name:'อุปกรณ์', value:'4'},
        {id:'5',name:'memo', value:'5'},
];

function SaleScreen() {
    const { profile } = useSelector(state=>state.profile);
    const { id:profileId, name:profileName, team = "A", chat_id = '', admin = false, saleManagerTeam = '' }  = profile;
    const { office:{ humanRight } } = useSelector(state=>state.office);
    const { warehouse } = useSelector(state=>state.warehouse);
    const [loading, setLoading] = useState(false);

    const [saleId, setSaleId] = useState(profileId);


    const sales = useMemo(()=>{
        return humanRight.filter(a=>a.team && !a.saleManagerTeam)
    },[humanRight]);

    const [licenses, setLicenses] = useState([]); // ราคา software

    //------------------------เกี่ยวกับ Lead ------------------------------
    const [leads, setLeads] = useState([]);// จำนวน lead ทั้งหมด
    const [currentLead, setCurrentLead] = useState(initialLead);
    const { id:leadId, shopId, shopName, name, status:leadStatus } = currentLead;
    const [lead_Modal, setLead_Modal] = useState(false);

    //------------------------เกี่ยวกับ ใบเสนอราคา ------------------------------
    const [quotations, setQuotations] = useState([]);
    const [quotation_Modal, setQuotation_Modal] = useState(false);
    const [currentQuotation, setCurrentQuotation] = useState(initialQuotation);

    // แสดงผล QR Code 
    const [qrCode_Modal, setQrcode_Modal] = useState(false);

    const [connect_Modal, setConnect_Modal] = useState(false);

    const [softwares, setSoftwares] = useState([]); // license เฉพาะที่ยังไม่ได้อนุมัติ
    const [hardwares, setHardwares] = useState([]); // hardware เฉพาะที่ยังไม่ได้จัดส่ง

    const [memo, setMemo] = useState([]);

    const [option, setOption] = useState({id:'1',name:'ลูกค้าใหม่', value:'1' });
    const { id:optionId, name:optinName, value } = option;

    const options = useMemo(()=>{
        return thisOptions.map(a=>({ id:a.id, name:a.name, value:a.value, length:
            a.id === '1' ? leads.length
            :a.id === '2' ? quotations.length
            :a.id === '3' ? softwares.length
            :a.id === '4' ? hardwares.length
            :memo.length
         }))
    },[thisOptions,leads,quotations,memo,softwares,hardwares]);

    useEffect(()=>{
        handleFetchAll()
    },[saleId]);

    async function handleFetchAll(){
        setLoading(true);
        try {
            const [licenses, hardwares, softwares, quotations, leads, memo ] = await Promise.all([
                fetchLicense(),
                fetchHardware(saleId), // เฉพาะร้านการที่ยังไม่จัดส่ง
                fetchSoftware(saleId),
                fetchPayment(saleId),
                fetchCustomer(saleId),
                fetchMemo(saleId)
            ])
            setLicenses(licenses); // ราคา software
            setHardwares(hardwares); // hardware ท่ีรอจัดส่ง
            setSoftwares(softwares); // software ที่รอ activate
            setQuotations(quotations); // quotations ย้อนหลัง 30 doc
            setLeads(leads); // Lead ลูกค้าทั้งหมดที่ยังไม่เลือกสถานะ
            setMemo(memo); // memo ย้อนหลัง 30 อัน
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

        // 200%
    async function handleLead(){
        setLead_Modal(false);
        if(leadStatus !=='waiting') return alert('แก้ไขไม่ได้')
        setLoading(true);
        try {
            if(leadId){
                const leadRef = db.collection('customer').doc(leadId);
                await leadRef.update(currentLead);
                setLeads(prev=>prev.map(item=>
                    item.id === leadId
                        ?currentLead
                        :item
                ));
                toastSuccess('อัปเดตสำเร็จ')
            } else {
                const leadRef = db.collection('customer').doc();
                const payload = {
                    ...currentLead,
                    id:leadRef.id,
                    profileId:saleId,
                    profileName,
                    team,
                    billDate:stringYMDHMS3(new Date()),
                    createdAt:new Date(),
                }
                await leadRef.set(payload);
                setLeads(prev=>[payload,...prev]);
                toastSuccess('เพิ่มสำเร็จ')
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    async function send({ chat_id, orderNumber, saleName, shopName, process }){
        const { status, data } = await scanfoodAPI.post(
            "/telegram/office/send/",
            {
                "channelType":"manualApprove",
                "chat_id":chat_id,
                orderNumber, 
                saleName, 
                shopName, 
                process
            }
        );
        return data
    }

    // 200%
    async function handleQuotation(payload){
        const { oneMonth, requestDate,
            card, taxStep, installments
         } = currentQuotation;
        setQuotation_Modal(false)

        if(!shopId && oneMonth) return alert('ยังไม่มี shopId');

        setLoading(true);
         // beamScanfood(VAT), beamShopchamp, kbank, posxpay
        const paymentType = ['2','3'].includes(taxStep)
            ?card
                ?'beamShopchamp(VAT)'
                :'kbank'
            :card
                ?'beamScanfood'
                :'posxpay';

        try {
            // const amount = isGodIt(profileId)
            //     ?1 // payload.net
            //     :payload.net
            const amount = payload.net;
  
      
            const autoPaymentRef = db.collection('autoPayment').doc();
            const timestamp = new Date();
            let chargeId = '';
            let qrCode = '';
            const base = {
                shopId:`sale:${autoPaymentRef.id}`,
                amount:Number(amount.toFixed(2)),
                ref2:'auto',
            }
            const body = paymentType === 'posxpay'
                ?{...base, channelType:'posxpay', serial:'WQRN002405000023', token:process.env.REACT_APP_API_TOKEN }
                :paymentType === 'kbank'
                ?{...base, channelType:'kbank', qrType:'3', merchantId:'KB000002246521' }
                :paymentType === 'beamScanfood'
                ?{...base, channelType:'beamLink', installments, paymentType:'beamScanfood' }
                :{...base, channelType:'beamLink', installments, paymentType:'beamShopchamp'  }
            const { status, data } = await scanfoodAPI.post(process.env.REACT_APP_API_URL,body);
            const { 
                chargeId:thisChargeId,
                qrCode:thisQrCode,
            } = data?.data;
            qrCode = thisQrCode;
            if(paymentType==='posxpay'){
                chargeId = thisChargeId;
            }

            const paymentData = {
                ...currentQuotation,
                ...payload,
                orderNumber:'', // ยังไม่ใช้ orderNumber จริง เพราะต้องเอาเลขจาก documentNumber มา ซึ่งอยู่ใน transaction ถัดไป
                createdAt:timestamp,
                chargeId,
                qrCode,
                shopId,
                shopName,
                billDate:stringYMDHMS3(timestamp),
                profileId:saleId,
                profileName,
                saleId,
                saleName:profileName,
                process:paymentType==='posxpay'?"request":"preManual", // request, cancel, success, paid
                team,
                customerId:leadId,
                name,
                id:autoPaymentRef.id,
                requestDate, 
                requestBillDate:stringYMDHMS3(requestDate),
                chat_id,
                chat_id_saleManager:-1003891934173, // หลุย 
                chat_id_taxManager:-1003871427406, // ต้น
                };

            const addOnData = await db.runTransaction(async (transaction) => {
                let orderNumber = '';
                let taxProcess = null;
                const docNumberRef = db.collection("admin").doc('documentNumber');
                const docNumberDoc = await transaction.get(docNumberRef);

                const { value } = docNumberDoc.data();
                const thisCurrentSo = value.find(a=>a.id==='qt')
                let newValue = [];
                const thisMonth = timestamp.getMonth() + 1;
                let receiptNumber = `QT${stringReceiptNumber(1)}`;
                if(thisCurrentSo){
                    const { month, run } = thisCurrentSo;
                    let newRun = run + 1;
                    receiptNumber = `QT${stringReceiptNumber(newRun)}`;
                    
                    if (thisMonth !== month) {
                        newRun = 1;
                        receiptNumber = `QT${stringReceiptNumber(newRun)}`;
                        newValue = value.map(a=>{
                        return a.id==='qt'
                            ?{ month: thisMonth, run: newRun, id:'qt' }
                            :a
                        })
                    } else {
                    newValue = value.map(a=>{
                        return a.id==='qt'
                            ?{ month, run: newRun, id:'qt' }
                            :a
                    })
                    }
                } else {
                    newValue = [...value,{ month: thisMonth, run: 1, id:'qt' }]
                };

                transaction.update(docNumberRef, { value:newValue, timestamp: new Date() });
           
                orderNumber = receiptNumber
                if(['2','3'].includes(taxStep)){
                    taxProcess = 'waiting';
                }
                transaction.set(autoPaymentRef,{
                    ...paymentData,
                    taxProcess,
                    orderNumber
                })
                return {
                    taxProcess,
                    orderNumber
                }
            });

            if(paymentType==='posxpay'){
                const [ data1, data2 ] = await Promise.all([
                    send({...paymentData, chat_id }),
                    send({...paymentData, chat_id:paymentData.chat_id_saleManager }),
                ])
                const { message_id } = data1
                const { message_id:message_id_saleManager } = data2
                await db.collection('autoPayment').doc(autoPaymentRef.id).update({
                    message_id,
                    message_id_saleManager
                });
                toastSuccess('สร้างบิลสำเร็จ รอชำระเงิน');
            }
            setQrcode_Modal(true);
            const current = {...paymentData,...addOnData}
            setCurrentQuotation(current)
       
            setQuotations(prev=>[current,...prev]);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    async function handleConnect(item){
        setConnect_Modal(false);
        const { id, name, storeSize } = item;

        // ป้องกันให้แพ็กเกจผิดขนาดร้าน
        if(optionId==='2' && storeSize !== currentQuotation.storeSize && currentQuotation.software.length>0) return alert('ขนาดร้านไม่ตรงกัน ไม่สามารถผูกกับใบเสนอราคานี้ได้ ต้องไปแจ้งไอทีให้ปรับขนาดโต๊ะให้');
        setLoading(true);
        
        try {
            if(optionId==='2'){ // ผูกที่ autoPayment และ customer พร้อมกัน จากนั้นอัปเดต process: success
                const response = await scanfoodAPI.post(
                    "/gateway/webhook/manualConnect",
                    {
                        shop:item,
                        currentPayment:currentQuotation
                    }
                );
         
                setLeads(prev=>prev.filter(a=>a.id !== currentQuotation.customerId));
                setQuotations(prev=>prev.map(item=>
                    item.id === currentQuotation.id
                        ?{
                            ...item,process:'success'
                        }
                        :item
                ))
            } else { // ผูกที่ Lead
                const updatedField = {
                    shopId:id, shopName:name, storeSize
                }
                const customerRef = db.collection('customer').doc(leadId);
                await customerRef.update(updatedField);
                setLeads(prev=>prev.map(item=>
                    item.id === leadId
                        ?{
                            ...item,...updatedField
                        }
                        :item
                ));
            };
            toastSuccess('ผูกร้านสำเร็จแล้ว');

        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (value) => {
      const option = options.find(a=>a.value === value)
        setOption(option);
    };

  return (
    <div style={styles.container} >
        {admin || saleManagerTeam
            ?<div style={{ display:'flex', padding:5, paddingBottom:0, overflowX:'auto' }} >
                {sales.map((item,index)=>{
                    const active = item.id === saleId;
                    return <div onClick={()=>{setSaleId(item.id)}} key={index} style={{ marginRight: '3px', textAlign: 'center', minWidth:'60px', cursor:'pointer' }} >
                        <img
                            style={{
                                width: '50px',
                                borderRadius: '50%',
                                filter: active ? 'grayscale(0%)' : 'grayscale(100%)'
                            }}
                            src={item.imageId}
                        />
                    </div>
                }
                )}
            </div>
            :null
        }
        
        
        <SlideOptions {...{ value, handleChange, options, show:true }} />
        <Modal_QuotationMini
            show={qrCode_Modal}
            payload={currentQuotation}
            onHide={()=>{setQrcode_Modal(false)}}
        />
        <Modal_Quotation
            show={quotation_Modal}
            onHide={()=>{setQuotation_Modal(false)}}
            current={currentQuotation}
            setCurrent={setCurrentQuotation}
            licenses={licenses}
            hardwares={warehouse}
            submit={handleQuotation}
            disabled={optionId!=='1'} // ป้องกันหน้าอื่นแก้ข้อมูล so
        />
        <Modal_FlatlistSearchShop
            show={connect_Modal}
            onHide={()=>{setConnect_Modal(false)}}
            onClick={handleConnect}
        />
        <Modal_Lead
            show={lead_Modal}
            onHide={()=>{setLead_Modal(false)}}
            current={currentLead}
            setCurrent={setCurrentLead}
            submit={handleLead}
            disabled={currentLead.status !=='waiting'}

        />
        <Modal_Loading show={loading} />
        {optionId==='1'
            ?<Lead 
                {...{
                    leads,
                    setCurrentQuotation,
                    setConnect_Modal,
                    setQuotation_Modal,
                    setLeads,
                    setLoading,
                    currentLead,
                    setCurrentLead,
                    setLead_Modal
                }}
            />
            :optionId==='2'
            ?<Quotation
                {...{
                    quotations,
                    setCurrentQuotation,
                    currentQuotation,
                    setQuotation_Modal,
                    setQrcode_Modal,
                    setQuotations,
                    currentLead,
                    optionId,
                    setLoading,
                    setLeads,
                    leads
                }}
            />
            :optionId ==='3'
            ?<LicenseCheck
                {...{
                    softwares,
                    setSoftwares,
                    setLoading
                }}
            />
            :optionId ==='4'
            ?<HardwareCheck
                {...{
                    hardwares,
                    setHardwares,
                    setLoading
                }}
            />
            :<Memo
                {...{
                    memo,
                    setMemo,
                    setLoading
                }}
            />
            
        }
      <div>
    </div>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh',
    position:'relative'
  }
}

export default SaleScreen;