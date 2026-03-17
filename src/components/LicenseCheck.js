import React, { useState } from "react";
import { colors, initialSoftware } from "../configs";
import { Col, Row } from "react-bootstrap";
import { formatCurrency, toastSuccess, wait } from "../Utility/function";
import { stringFullDate, stringYMDHMS3 } from "../Utility/dateTime";
import { Modal_DatePicker, Modal_FlatListTwoColumn } from "../modal";
import { scanfoodAPI } from "../Utility/api";
import { db } from "../db/firestore";

const { softWhite } = colors;

const softwareOptions = [
    { id:'1', name:'อนุมัติทันที'},
    { id:'2', name:'แก้ไขวันอนุมัติ'},
];


function LicenseCheck({
    softwares,
    setSoftwares,
    setLoading
}) {
    const [currentSoftware, setCurrentSoftware] = useState(initialSoftware);
    const [softwareAction_Modal, setSoftwareAction_Modal] = useState(false);
    const { requestDate } = currentSoftware;
     const [request_Modal, setRequest_Modal] = useState(false);

    function openSoftware(item){
        setCurrentSoftware(item);
        setSoftwareAction_Modal(true);
    };

    async function handleSoftwareAction(item){
        setSoftwareAction_Modal(false);
        await wait(500);
        switch (item.id) {
            case '1': // เปิดใช้งานทันที
                activateSoftware(currentSoftware.id)
                break;
            case '2': // แก้ไขวันเปิดใช้งาน
                setRequest_Modal(true)
                break;
            default:
                break;
        }
    };
    
    // 300%
    async function activateSoftware(docId){
        setLoading(true);
        try {
            const response = await scanfoodAPI.post(
                "/gateway/webhook/manualApprove",
                {
                    docId
                }
            );
            setSoftwares(prev=>prev.filter(a=>a.id !== docId));
            toastSuccess('เปิดการใช้งานแพ็กเกจแล้ว')
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    // 300%
    async function handleRequestDate(date){
        setRequest_Modal(false);
        setLoading(true);
        const { id } = currentSoftware;
        try {
            await db.runTransaction( async (transaction)=>{
                const packageRef = db.collection('packageOrder').doc(id);
                const packageDoc = await transaction.get(packageRef);
                const { status } = packageDoc.data();
                if(status!=='request') throw new Error(`อัปเดตสถานะนี้ไม่ได้นะ : ${process}`);
                transaction.update(packageRef,{ 
                    requestDate:date,
                    requestBillDate:stringYMDHMS3(date)
                })

            });
            setSoftwares(prev=>prev.map(item=>
                item.id === id
                    ?{...item, requestDate:date, requestBillDate:stringYMDHMS3(date)}
                    :item
            ))
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };
        


  return <div>
            <Modal_FlatListTwoColumn
                header={'Software Action'}
                show={softwareAction_Modal}
                onHide={()=>{setSoftwareAction_Modal(false)}}
                value={softwareOptions}
                onClick={handleSoftwareAction}
            />
            <Modal_DatePicker
                show={request_Modal}
                onHide={()=>{setRequest_Modal(false)}}
                requestDate={requestDate}
                submit={handleRequestDate}
            />
            <h4>ทั้งหมด : {softwares.length} รายการ</h4>
            {softwares.map((item)=>{
                const { name, shopName, net, requestDate } = item;
                return <Row onClick={()=>{openSoftware(item)}}  key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                            <Col>{name}[{shopName}]</Col>
                            <Col xs='6' sm='3'  >{formatCurrency(net)}</Col>
                            <Col xs='6' sm='3'  >วันอนุมัติ : {stringFullDate(requestDate)}</Col>
                        </Row>
            })}
        </div>
}

export default LicenseCheck;
