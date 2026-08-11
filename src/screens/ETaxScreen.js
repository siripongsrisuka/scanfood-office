import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { OneButton, SearchControl } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { fetchLicense, formatTime, searchMultiFunction, toastSuccess } from "../Utility/function";
import { Modal_Loading, Modal_Quotation } from "../modal";
import { db } from "../db/firestore";
import { initialQuotation } from "../configs";
import { deleteMessage, sendMessage, telegramDeleteQueue } from "../Utility/telegram";
import { reverseSort } from "../Utility/sort";
import { v4 as uuidv4 } from 'uuid';

function ETaxScreen() {
    const { warehouse } = useSelector(state=>state.warehouse);

    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [resultLength, setResultLength] = useState(0);
    const [search, setSearch] = useState('');
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [so_Modal, setSo_Modal] = useState(false);
    const [currentSo, setCurrentSo] = useState(initialQuotation);
    const [licenses, setLicenses] = useState([]);

    // 200%
    useEffect(()=>{
        let result = masterData;
        if(search){
          result = searchMultiFunction(result,search,['saleName','shopName']);
        }
        setCurrentDisplay(result);
        setResultLength(result.length)

    },[masterData,search]);

    useEffect(()=>{
        handleFetchAll();
    },[]);

    async function handleFetchAll(){
        setLoading(true);
        try {
            const [licenses, orders ] = await Promise.all([
                fetchLicense(),
                fetchData(),
            ])
            setLicenses(licenses); // ราคา software
            setMasterData(reverseSort('createdAt', orders)); // ข้อมูลใบสั่งขายที่มีการขอใบกำกับภาษี
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    async function fetchData(){
        try {
          const query = await db.collection('autoPayment')
              .where('taxProcess','==','waiting')
              .get();
          return query.docs.map(doc=>{
            const { createdAt, requestDate, ...rest } = doc.data();
            return {
              id: doc.id,
              createdAt: formatTime(createdAt),
              requestDate: formatTime(requestDate),
              ...rest
            }
          });
        } catch (error) {
          console.log(error)
        }
    }

    function openSoModal(item){
     
        setCurrentSo(item);
        setSo_Modal(true);
    };

    async function handleEtax(item){
      const ok = window.confirm('ยืนยันการเปลี่ยนสถานะเป็น ส่งใบกำกับภาษี')
      if(!ok) return;
      setLoading(true);
      try {
        const autoPaymentData = await db.runTransaction( async (transaction)=>{
          const soRef = db.collection('autoPayment').doc(item.id);
          const soDoc = await transaction.get(soRef);
          if(!soDoc.exists) throw new Error('ไม่พบข้อมูลใบสั่งขาย');
          const { taxProcess } = soDoc.data();
          if(taxProcess !== 'waiting') throw new Error('สถานะใบกำกับภาษีไม่ถูกต้อง');
          transaction.update(soRef,{
            taxProcess:'sent'
          });
          return soDoc.data()
        });

        const { telegram = [], chat_id_taxManager, message_id_eTax, message_id_eTax_manager, chat_id } = autoPaymentData;

        const etaxPayload = telegram.find(a=>a.type === 'E-TAX');
        if(etaxPayload){
          const updatePromises = [];

          const { process = [] } = etaxPayload;
          const newProcess = [
                                  ...process, 
                                  { name:`ดำเนินการเสร็จสิ้น`, createdAt: `${stringDateTimeReceipt(new Date())}\n*ข้อความจะถูกลบอัตโนมัติใน 12 ชั่วโมง\n✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅`, id:uuidv4() }
                              ]
          updatePromises.push(sendMessage({ chat_id, ...etaxPayload, process:newProcess }));
          if(message_id_eTax){ // ช่องของเซล
              updatePromises.push(deleteMessage({ chat_id, message_id: message_id_eTax }));
          }
          if(message_id_eTax_manager){ // ช่องของผู้จัดการ
              updatePromises.push(deleteMessage({ chat_id:chat_id_taxManager, message_id: message_id_eTax_manager }));
          }
          const results = await Promise.all(updatePromises);
          const newMessageId = results[0];
          await telegramDeleteQueue({ chat_id: chat_id, message_id: newMessageId });
        }
        
   
        toastSuccess('เปลี่ยนสถานะเป็น ส่งใบกำกับภาษีเรียบร้อย');
        setMasterData(prev=>prev.filter(i=>i.id !== item.id));
      } catch (error) {
        alert(error);
      } finally {
        setLoading(false);
      }
    }

  return (
    <div style={styles.container} >
        <h1>ขอ E-Tax</h1>

        <Modal_Quotation
            show={so_Modal}
            onHide={()=>{setSo_Modal(false)}}
            current={currentSo}
            setCurrent={setCurrentSo}
            licenses={licenses}
            hardwares={warehouse}
            submit={()=>{setSo_Modal(false)}}
            disabled={true} // ป้องกันหน้าอื่นแก้ข้อมูล so
        />
        <Modal_Loading show={loading} />

        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อร้านหรือชื่อเซล', search, setSearch }} />
        <br/>
        <h4>ค้นพบ {resultLength} รายการ</h4> 
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >OrderNumber</th>
                    <th style={styles.container3} >วันที่</th>
                    <th style={styles.container3} >เซล</th>
                    <th style={styles.container3} >อีเมล</th>
                    <th style={styles.container3} >สถานะ</th>

                    <th style={styles.container3} >รายละเอียด</th>
                    <th style={styles.container3} >จัดการ</th>
                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { createdAt,  saleName, taxEmail, taxProcess, orderNumber } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{orderNumber}</td>
                            <td >{stringDateTimeReceipt(createdAt)}</td>
                            <td style={styles.container4}>{saleName}</td>
                            <td >{taxEmail}</td>
                            <td style={styles.container4}>{taxProcess}</td>
                            <td style={styles.container4}>
                              <OneButton {...{ text:'รายละเอียด', submit:()=>{openSoModal(item)} }} />
                            </td>
                            <td style={styles.container4}>
                              <OneButton {...{ text:'จบงาน', submit:()=>{handleEtax(item)} }} />
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

export default ETaxScreen;