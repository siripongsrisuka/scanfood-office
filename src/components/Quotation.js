import React, { useState, useRef } from "react";
import {
  Row,
  Col,
} from "react-bootstrap";
import { formatCurrency, toastSuccess, wait } from "../Utility/function";
import { colors } from "../configs";
import { Modal_FlatlistSearchShop, Modal_FlatListTwoColumn } from "../modal";
import { scanfoodAPI } from "../Utility/api";
import { db, prepareFirebaseImage } from "../db/firestore";

const { softWhite } = colors;

const processMap = {
    'manual':{ name:'รออนุมัติ', color:'#FF914d'},
    'preManual':{ name:'รอแนบหลักฐาน', color:'#A6A6A6'},
    'request':{ name:'รอชำระ', color:'#FFE871'},
    'success':{ name:'เสร็จสมบูรณ์', color:'#66ff33'},
    'paid':{ name:'ชำระเงินแล้ว', color:'#5DC3FF'},
    'cancel':{ name:'ยกเลิก', color:'#ea6e6eff'},
    'checking':{ name:'กำลังตรวจสอบ', color:'rgb(225, 231, 238)'},
    'failed':{ name:'ไม่จ่ายใน 48 ชั่วโมง', color:'#ccb3ff'},
};

const quotationOptions = [
    { id:'1', name:'ผูกร้าน' },
    { id:'2', name:'ใบเสนอราคาอย่างย่อ' },
    { id:'2.1', name:'ใบเสนอราคา' },
    { id:'3', name:'รายละเอียด' },
    { id:'4', name:'ยกเลิกออเดอร์' },
    { id:'5', name:'แนบหลักฐานชำระเงิน' },
]


function Quotation({
    quotations,
    setCurrentQuotation,
    currentQuotation,
    setQuotation_Modal,
    setQrcode_Modal,
    setQuotations,
    currentLead,
    optionId = '2',
    setLoading,
    setLeads,
    leads,
    setFull_Modal
}) {
    const {  id:customerId,   } = currentLead;
    const { id:quotationId, withholdingTax = 0, hardware = []  } = currentQuotation;
    const [paymentAction_Modal, setPaymentAction_Modal] = useState(false);
    const [connect_Modal, setConnect_Modal] = useState(false);
    const [options, setOptions] = useState(quotationOptions);

    const fileInputRef = useRef(null);
    const handleImageChange = (e) => {
        const file = e.target.files[0]; // Get the selected file

        if (file) {

        // Create a FileReader to read the file
        const reader = new FileReader();
        reader.onloadend = async () => {
            // setImage(reader.result); // Set the image data as the result of FileReader
            // console.log(reader.result)
            handleAddEvident(reader.result)
        };

        reader.readAsDataURL(file); // Convert file to a base64 string
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    function openOptions(item){
        setCurrentQuotation(item)
        setPaymentAction_Modal(true);
        const { process } = item;
        let options = [];
   
        switch (process) {
            case 'success':
                // จ่ายเงินแล้ว ผูกร้านแล้ว
                options = quotationOptions.filter(a=>['2','2.1','3'].includes(a.id))
                break;
            case 'paid':
                // จ่ายเงินแล้ว แต่ยังไม่ได้ผูกร้าน
                options = quotationOptions.filter(a=>['1','2','2.1','3'].includes(a.id))
                break;
            case 'cancel':
                // ยกเลิกแล้ว ดูได้เฉยๆ
                options = quotationOptions.filter(a=>['2','2.1','3'].includes(a.id))
                break;

            case 'preManual':
                // ก่อนแนบหลักฐาน
                options = quotationOptions.filter(a=>['2','2.1','3','4','5'].includes(a.id))
                break;
        
            default:
                // request and manual 
                options = quotationOptions.filter(a=>['2','2.1','3','4'].includes(a.id))
                break;
        };
        setOptions(options)
    
    };

    async function handlePaymentAction(item){
        setPaymentAction_Modal(false);
        await wait(500);
        const { qrCode, net } = currentQuotation;
        switch (item.id) {
            case '1':
                openPaidOrder()
                break;
            case '2': // 100%
                setQrcode_Modal(true);
                break;
            case '2.1': // 100%
                setFull_Modal(true);
                break;
            case '3': // 100%
                setCurrentQuotation(currentQuotation);
                setQuotation_Modal(true);
                break;
            case '4':
                const ok = window.confirm('ยืนยันการยกเลิกออเดอร์')
                if(ok){
                    handleCancelPayment()
                }
                break;
            case '5':
                handleButtonClick()
                break;
            default:
                break;
        }
    };

    async function openPaidOrder(){
        const { shopId } = currentQuotation;
        if(shopId) return alert('ผูก shop ไว้อยู่แล้ว');
        setConnect_Modal(true);
    };

    async function handleConnect(item){
        setConnect_Modal(false);
        const { id, name, storeSize } = item;

        // ป้องกันให้แพ็กเกจผิดขนาดร้าน
        if(optionId==='2' && storeSize !== currentQuotation.storeSize && currentQuotation.software.length>0) return alert('ขนาดร้านไม่ตรงกัน')
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
                const customerRef = db.collection('customer').doc(customerId);
                await customerRef.update(updatedField);
                setLeads(prev=>prev.map(item=>
                    item.id === customerId
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

    // 300%
    async function handleCancelPayment(){
        setLoading(true);
        try {
            await db.runTransaction( async (transaction)=>{
                const orderRef = db.collection('autoPayment').doc(currentQuotation.id);
                const orderDoc = await transaction.get(orderRef);
                const { process } = orderDoc.data();
                if(!['request','manual','preManual'].includes(process)) throw new Error(`ยกเลิกสถานะนี้ไม่ได้นะ : ${process}`);
                transaction.update(orderRef,{ process:'cancel' })
            });
            setQuotations(prev=>prev.map(item=>
                item.id === currentQuotation.id
                    ?{ ...item, process:'cancel' }
                    :item
            ));
            toastSuccess('ยกเลิกใบเสนอราคาสำเร็จ')
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    // 300%
    async function  handleAddEvident(imageId){
        const { id } = currentQuotation;
        setLoading(true);
        try {
            const  manualPaidImage = await prepareFirebaseImage(imageId,'/saleEvident/','evident');
            await db.runTransaction( async (transaction)=>{
                const autoPaymentRef = db.collection('autoPayment').doc(id);
                const autoPaymentDoc = await transaction.get(autoPaymentRef);
                const { process,  } = autoPaymentDoc.data();
                if(process !=='preManual') throw new Error('รายการนี้ไม่ใช่ preManual แล้ว ไม่สามรถแนบได้อีก');
                transaction.update(autoPaymentRef,{ manualPaidImage, process:'manual' })
            });
            setQuotations(prev=>prev.map(item=>
                item.id === id
                    ?{ ...item, manualPaidImage, process:'manual' }
                    :item
            ));
            toastSuccess('เพิ่มหลักฐานชะระเงินสำเร็จ')
            // อัปเดต state ตรงนี้
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
        
    }

  return (
    <div>
        <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }} // Hide the default file input
        />
        <Modal_FlatListTwoColumn
            header={'ข้อมูลบิล'}
            show={paymentAction_Modal}
            onHide={()=>{setPaymentAction_Modal(false)}}
            value={options}
            onClick={handlePaymentAction}
        />
        <Modal_FlatlistSearchShop
            show={connect_Modal}
            onHide={()=>{setConnect_Modal(false)}}
            onClick={handleConnect}
        />
        <h4>ทั้งหมด : {quotations.length} บิล</h4>
        {quotations.map((item)=>{
            const { name, shopName, net, process } = item;
            const { name:processName, color } = processMap[process]??'ไม่ระบุสถานะ';
            return <Row onClick={()=>{openOptions(item)}} key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                        <Col xs='12' sm='6'  >{name}[{shopName}]</Col>
                        <Col xs='6' sm='3'  >{formatCurrency(net)}</Col>
                        <Col xs='6' sm='3'  ><button style={{backgroundColor:color, padding:5, minWidth:'150px', borderRadius:20}} >{processName}</button></Col>
                    </Row>
        })}
    </div>
  );
}

export default Quotation;
