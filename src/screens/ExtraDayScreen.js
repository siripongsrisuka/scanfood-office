import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { SearchAndBottom } from "../components";
import { stringDateTimeReceipt, stringYMDHMS3 } from "../Utility/dateTime";
import { formatTime, searchMultiFunction, toastSuccess } from "../Utility/function";
import { Modal_ExtraDay, Modal_FlatListTwoColumn, Modal_Loading } from "../modal";
import { db } from "../db/firestore";
import { reverseSort } from "../Utility/sort";
import { scanfoodAPI } from "../Utility/api";
import { initialExtraDay } from "../configs";
import { deleteMessage, sendMessage, telegramDeleteQueue } from "../Utility/telegram";
import { v4 as uuidv4 } from 'uuid';

function ExtraDayScreen() {
    const [extraDay_Modal, setExtraDay_Modal] = useState(false);
    const { profile:{ id:profileId, name:profileName, saleManagerTeam, chat_id } } = useSelector(state=>state.profile);
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [resultLength, setResultLength] = useState(0);
    const [search, setSearch] = useState('');

    useEffect(()=>{
        const fetchData = async()=>{
            setLoading(true)
            const snapshot = await db.collection('extraDay')
                .where('status','==','pending')
                .get();
            const data = snapshot.docs.map(doc=>{
                const { createdAt, ...rest } = doc.data();
                return({
                    ...rest,
                    id:doc.id,
                    createdAt:formatTime(createdAt),
                })

            });
            setMasterData(reverseSort('createdAt',data));
            setLoading(false);
        }
        fetchData();
    },[]);

    // 200%
    useEffect(()=>{
        let result = masterData;
        if(search){
          result = searchMultiFunction(result,search,['profileName','shopName']);
        }
        setCurrentDisplay(result);
        setResultLength(result.length)

    },[masterData,search]);

    async function handleExtraDaySubmit(data){
        setExtraDay_Modal(false);
        setLoading(true);
        try {
            const extraDayRef = db.collection('extraDay').doc();    
            const payload = {
                ...data, 
                id:extraDayRef.id,
                createdAt:new Date(),
                profileId,
                profileName,
                status:'pending',
                billDate:stringYMDHMS3(new Date()),
                chat_id,
                chat_id_saleManager:-1003211008949 // พี่หลุย
            }
            await extraDayRef.set(payload);
            const extraDayMessage = {
                        type:'extraDay',
                        header:'4)  ขอวันใช้งาน',
                        body:`
ลูกค้า : ${payload.shopName}
days : ${payload.days}
เหตุผล : ${payload.reason}
เซล : ${profileName}`,
                        process:[
                            {
                            id:uuidv4(),
                            name:'สถานะ : รออนุมัติ',
                            createdAt:stringDateTimeReceipt(new Date()),
                            }
                        ]
            }
            const results = await Promise.all([
                sendMessage({...extraDayMessage, chat_id }),
                sendMessage({...extraDayMessage, chat_id:payload.chat_id_saleManager }),
            ])
            const newMessageId = results[0];
            const newMessageIdSaleManager = results[1];
            await extraDayRef.update({ message_id:newMessageId, message_id_saleManager:newMessageIdSaleManager, extraDayMessage });
            setMasterData(prev=>[...prev,{...payload, message_id:newMessageId, message_id_saleManager:newMessageIdSaleManager, extraDayMessage },] );
            toastSuccess('ยื่นคำขอวันใช้งานสำเร็จ')
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการยื่นคำขอวันใช้งาน')
        } finally {
            setLoading(false);
        }

        // submit data to firestore
    };

    async function approvedExtraDay(item){
        const { shopId, days, id } = item;
        const { chat_id, chat_id_saleManager, message_id_saleManager, message_id, extraDayMessage = null } = current;
        setLoading(true);
        try {
            const { status, data } = await scanfoodAPI.post(
                "/office/extraDay/",
                item
            );

            if(extraDayMessage){
                const updatePromises = [];

                const { process = [] } = extraDayMessage;
                const newProcess = [
                                        ...process, 
                                        { name:`อนุมัติวันใช้งานเสร็จสิ้น`, createdAt: `${stringDateTimeReceipt(new Date())}\n*ข้อความจะถูกลบอัตโนมัติใน 12 ชั่วโมง\n✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅`, id:uuidv4() }
                                    ]
                updatePromises.push(sendMessage({ chat_id, ...extraDayMessage, process:newProcess }));
                if(message_id){ // ช่องของเซล
                    updatePromises.push(deleteMessage({ chat_id, message_id }));
                }
                if(message_id_saleManager){ // ช่องของผู้จัดการ
                    updatePromises.push(deleteMessage({ chat_id:chat_id_saleManager, message_id: message_id_saleManager }));
                }
                const results = await Promise.all(updatePromises);
                const newMessageId = results[0];
               
                await telegramDeleteQueue({ chat_id: chat_id, message_id: newMessageId });
            }
            setMasterData(prev=>prev.filter(a=>a.id!==id) );
            toastSuccess('อนุมัติวันใช้งานสำเร็จ');

        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    async function handleRejectExtraDay(item){
        setLoading(true);
        try {
            const { chat_id, chat_id_saleManager, message_id_saleManager, message_id, extraDayMessage = null } = current;
            const extraDayRef = db.collection('extraDay').doc(item.id);
            await extraDayRef.update({
                status:'rejected',
                rejectedAt:new Date(),
            });
        
            if(extraDayMessage){
                const updatePromises = [];

                const { process = [] } = extraDayMessage;
                const newProcess = [
                                        ...process, 
                                        { name:`ปฏิเสธคำขอวันใช้งาน`, createdAt: `${stringDateTimeReceipt(new Date())}\n*ข้อความจะถูกลบอัตโนมัติใน 12 ชั่วโมง\n✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅`, id:uuidv4() }
                                    ]
                updatePromises.push(sendMessage({ chat_id, ...extraDayMessage, process:newProcess }));
                if(message_id){ // ช่องของเซล
                    updatePromises.push(deleteMessage({ chat_id, message_id }));
                }
                if(message_id_saleManager){ // ช่องของผู้จัดการ
                    updatePromises.push(deleteMessage({ chat_id:chat_id_saleManager, message_id: message_id_saleManager }));
                }
                const results = await Promise.all(updatePromises);
                const newMessageId = results[0];
          
                await telegramDeleteQueue({ chat_id: chat_id, message_id: newMessageId });
            }
            setMasterData(prev=>prev.filter(a=>a.id!==item.id) );
            toastSuccess('ปฏิเสธคำขอวันใช้งานสำเร็จ');
        } catch (error) {
            // alert('เกิดข้อผิดพลาดในการปฏิเสธคำขอวันใช้งาน')
              console.error("handleRejectExtraDay error:", error);
    console.error("handleRejectExtraDay error.response:", error?.response);
    console.error("handleRejectExtraDay error.response.data:", error?.response?.data);
    console.error("handleRejectExtraDay error.message:", error?.message);
    console.error("handleRejectExtraDay error.stack:", error?.stack);

    alert(
      error?.response?.data?.message ||
      error?.message ||
      JSON.stringify(error, null, 2) ||
      "เกิดข้อผิดพลาดในการปฏิเสธคำขอวันใช้งาน"
    );
        } finally {
            setLoading(false);
        }
    }

    const [current, setCurrent] = useState(initialExtraDay);
    const [action_Modal, setAction_Modal] = useState(false);
    const actionOptions = [
        { name:'อนุมัติ', action:approvedExtraDay },
        { name:'ปฏิเสธ', action:handleRejectExtraDay },
    ];

    function handleAction(item){
        const { action } = item;
        action(current);
        setAction_Modal(false);
    }

    function handleCurrent(item){
        if(!saleManagerTeam) return;
        setCurrent(item);
        setAction_Modal(true);
    };

  return (
    <div style={styles.container} >
        <Modal_Loading show={loading} />
        <Modal_ExtraDay
            show={extraDay_Modal}
            onHide={()=>{setExtraDay_Modal(false)}}
            submit={handleExtraDaySubmit}
        />
        <Modal_FlatListTwoColumn
            show={action_Modal}
            onHide={()=>{setAction_Modal(false)}}
            header='เลือก การกระทำ'
            onClick={handleAction}
            value={actionOptions}
        />
        
        <h1>ขอวันใช้งาน</h1>
        <h5>เงื่อนไขการขอวันใช้งาน</h5>
        <h6>- Prepaid ขอได้ 2 ครั้ง ครั้งละ 3 วัน</h6>
        <h6>- Postpaid ขอได้ 1 ครั้ง (7,14,30 วัน)</h6>
        <SearchAndBottom {...{ placeholder:'ค้นหาด้วยชื่อร้านหรือชื่อเซล', search, setSearch, text:'ยื่นคำขอ', exportToXlsx:()=>{setExtraDay_Modal(true)} }} />
        <br/>
        <h4>ค้นพบ {resultLength} รายการ</h4> 
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >No.</th>
                    <th style={styles.container3} >วันที่</th>
                    <th style={styles.container3} >เซล</th>
                    <th style={styles.container3} >ร้านค้า</th>
                    <th style={styles.container3} >จำนวนวัน</th>
                    <th style={styles.container3} >เหตุผล</th>

                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { createdAt,  profileName, days, shopName, reason } = item;
                return <tr onClick={()=>{handleCurrent(item)}} key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>{stringDateTimeReceipt(createdAt)}</td>
                            <td style={styles.container4}>{profileName}</td>
                            <td style={styles.container4}>{shopName}</td>
                            <td style={styles.container4}>{days}</td>
                            <td >{reason}</td>
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

export default ExtraDayScreen;