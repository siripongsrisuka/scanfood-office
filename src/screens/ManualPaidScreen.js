import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { db } from "../db/firestore";
import { fetchLicense, formatTime, toastSuccess } from "../Utility/function";
import { normalSort } from "../Utility/sort";
import { Modal_Loading, Modal_Quotation } from "../modal";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { OneButton } from "../components";
import { initialQuotation } from "../configs";
import { scanfoodAPI } from "../Utility/api";
import { deleteMessage, sendMessage, telegramDeleteQueue } from "../Utility/telegram";
import { v4 as uuidv4 } from 'uuid';


function ManualPaidScreen() {
    const { profile:{ admin  }  } = useSelector( state => state.profile );
    const { warehouse } = useSelector(state=>state.warehouse);
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [so_Modal, setSo_Modal] = useState(false);
    const [currentSo, setCurrentSo] = useState(initialQuotation);
    const [licenses, setLicenses] = useState([]);

    async function fetchManualPaidData(){
        const query = await db.collection('autoPayment')
            .where('process', '==', 'manual')
            .get();
        const data = query.docs.map(doc=>{
            const { createdAt, requestDate, ...rest } = doc.data();
            return { createdAt: formatTime(createdAt), requestDate: formatTime(requestDate), ...rest, id: doc.id,  };
        });
        const sortedData = normalSort('createdAt', data);
        return sortedData
    };


    useEffect(()=>{
        handleFetchAll();
    },[]);

    async function handleFetchAll(){
        setLoading(true);
        try {
            const [licenses, orders ] = await Promise.all([
                fetchLicense(),
                fetchManualPaidData(),
            ])
            setLicenses(licenses); // ราคา software
            setMasterData(orders);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    async function handleSo(payload){
        setSo_Modal(false);
        setLoading(true);
        const { message_id, message_id_saleManager, chat_id, chat_id_saleManager, manualApproveMessage = null } = currentSo;
        let name = '';
        try {
            const { id, action = 'approved' } = payload;
            if(action === 'approved'){
                const payload = {
                    ref2:'auto',
                    ref1:`sale:${id}`
                }
                const { status, data } = await scanfoodAPI.post(
                    "/gateway/webhook/posxpay/",
                    payload
                );
                name = 'อนุมัติเสร็จสิ้น';
               
                toastSuccess('อนุมัติแพ็กเกจเรียบร้อย');
                setMasterData(prev=>prev.filter(i=>i.id !== id));

            } else if(action === 'reverse'){
                await db.collection('autoPayment').doc(id).update({
                    process: 'preManual',
                    manualPaidImage:''
                    
                });
                name = 'คืนค่าเสร็จสิ้น';
                toastSuccess('คืนค่าแพ็กเกจเรียบร้อย');
                setMasterData(prev=>prev.filter(i=>i.id !== id));
            } else { //rejected
                  await db.collection('autoPayment').doc(id).update({
                    process: 'cancel',
                    
                });
                name = 'ปฏิเสธแพ็กเกจเสร็จสิ้น';
                toastSuccess('ปฏิเสธแพ็กเกจเรียบร้อย');
                setMasterData(prev=>prev.filter(i=>i.id !== id));
            };

            if(manualApproveMessage){
                const updatePromises = [];

                const { process = [] } = manualApproveMessage;
                const newProcess = [
                                        ...process, 
                                        { name:`${name}`, createdAt: `${stringDateTimeReceipt(new Date())}\n*ข้อความจะถูกลบอัตโนมัติใน 12 ชั่วโมง\n✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅`, id:uuidv4() }
                                    ]
                updatePromises.push(sendMessage({ chat_id, ...manualApproveMessage, process:newProcess }));
                if(message_id){ // ช่องของเซล
                    updatePromises.push(deleteMessage({ chat_id, message_id }));
                }
                if(message_id_saleManager){ // ช่องของผู้จัดการ
                    updatePromises.push(deleteMessage({ chat_id:chat_id_saleManager, message_id: message_id_saleManager }));
                }
                const results = await Promise.all(updatePromises);
                const newMessageId = results[0];
                // setTimeout(async()=>{
                //       await deleteMessage({ chat_id: chat_id, message_id: newMessageId });
                // }, 30000);
                await telegramDeleteQueue({ chat_id: chat_id, message_id: newMessageId });
            }

        } catch (error) {
            // alert(error.message);
            console.error("handleQuotation error:", error);
            console.error("error.message:", error?.message);
            console.error("error.code:", error?.code);
            console.error("error.response?.status:", error?.response?.status);
            console.error("error.response?.data:", error?.response?.data);
            console.error("error.stack:", error?.stack);

            alert(
                JSON.stringify(
                    {
                        message: error?.message,
                        code: error?.code,
                        status: error?.response?.status,
                        data: error?.response?.data,
                    },
                    null,
                    2
                )
            );
        } finally {
            setLoading(false);
        }
    };

    function openSoModal(item){
        if(!admin){
            alert('คุณไม่มีสิทธิ์อนุมัติแพ็กเกจ');
            return;
        }
        setCurrentSo(item);
        setSo_Modal(true);
    }


  return (
    <div style={styles.container} >
        <h1>อนุมัติแพ็กเกจ</h1>
        <Modal_Quotation
            show={so_Modal}
            onHide={()=>{setSo_Modal(false)}}
            current={currentSo}
            setCurrent={setCurrentSo}
            licenses={licenses}
            hardwares={warehouse}
            submit={handleSo}
            disabled={true} // ป้องกันหน้าอื่นแก้ข้อมูล so
            manualChecked={true}
        />
        <Modal_Loading show={loading} />
        <h4>ค้นพบ {masterData.length} รายการ</h4> 
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >No.</th>
                    <th style={styles.container3} >วันที่</th>
                    <th style={styles.container3} >เซล</th>
                    <th style={styles.container3} >ร้านค้า</th>
                    <th style={styles.container3} >จัดการ</th>

                </tr>
            </thead>
            <tbody  >
            {masterData.map((item, index) => {
                const { createdAt,  profileName, shopName } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>{stringDateTimeReceipt(createdAt)}</td>
                            <td style={styles.container4}>{profileName}</td>
                            <td style={styles.container4}>{shopName}</td>
                            <td style={styles.container4}>
                                <OneButton {...{ text: "จัดการ", submit: () => {openSoModal(item)} }} />
                            </td>
                        </tr>
            })}
            </tbody>
        </Table>
      
    </div>
  );
};

const styles = {
    container : {
    minHeight:'100vh'
  },
  container2 : {
    width:'5%', minWidth:'70px', textAlign:'center'
  },
  container3 : {
    width:'15%', minWidth:'150px', textAlign:'center'
  },
  container4 : {
    textAlign:'center'
  }
}

export default ManualPaidScreen;