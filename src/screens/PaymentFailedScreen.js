import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { CategoryRender, initialColors, OneButton, SearchControl, TimeControlAutoPayment } from "../components";
import { formatCurrency, isGodIt, searchMultiFunction, summary, toastSuccess } from "../Utility/function";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { Modal_Loading, Modal_Qrcode } from "../modal";
import { db } from "../db/firestore";
import { scanfoodAPI } from "../Utility/api";
import { updateNormalFieldAutoPayment } from "../redux/autoPaymentSlice";

const thisOptions = [
    { id:'1', name:"ทั้งหมด" },
    { id:'2', name:"request", },
    { id:'3', name:"cancel", },
    { id:'4', name:"success", },
    { id:'5', name:"failed", },
];


function PaymentFailedScreen() {
    const dispatch = useDispatch();
    const { selectedAutoPayment } = useSelector(state=>state.autoPayment);
    const { profile:{ id:profileId, name:profileName } } = useSelector(state=>state.profile);
    const [payment_Modal, setPayment_Modal] = useState(false);
    const [qrCode, setQrcode] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const [currentDisplay, setCurrentDisplay] = useState([]);
    const [search, setSearch] = useState('');
    const [option, setOption] = useState({ id:'1', name:"ทั้งหมด" });
    const { id:optionId, name } = option;

    const options = useMemo(()=>{
        return thisOptions.map(a=>({ id:a.id, name:a.name, value:
            a.id === '1' ? selectedAutoPayment.length
            :a.id === '2' ? selectedAutoPayment.filter(a=>a.process === 'request').length
            :a.id === '3' ? selectedAutoPayment.filter(a=>a.process === 'cancel').length
            :a.id === '4' ? selectedAutoPayment.filter(a=>a.process === 'success').length
            :selectedAutoPayment.filter(a=>a.process === 'failed').length
            }))
    },[thisOptions,selectedAutoPayment]);

    useEffect(()=>{
        let arr = [];
        switch (optionId) {
          case '1':
            arr = selectedAutoPayment;
            break;
          case '2':
            arr = selectedAutoPayment.filter(a=>a.process === 'request')
            break;
          case '3':
            arr = selectedAutoPayment.filter(a=>a.process === 'cancel')
            break;
           case '4':
            arr = selectedAutoPayment.filter(a=>a.process === 'success')
            break;
          case '5':
            arr = selectedAutoPayment.filter(a=>a.process === 'failed')
            break;
          default:
            break;
        }
        if(search){
            arr = searchMultiFunction(selectedAutoPayment,search,['orderNumber','profileName','shopName'])
        };
        setCurrentDisplay(arr);
    },[selectedAutoPayment,search,optionId]);
    function openQRcode(item){
        const { qrCode, amount } = item;
        setQrcode(qrCode)
        setAmount(amount)
        setPayment_Modal(true);
    };

    async function cancelOrder(item){

      const { id, profileId:createdId, process } = item;
      if(process !=='request') return null;
      if(createdId !== profileId && !isGodIt(profileId)) return alert('ไม่มีสิทธิ์ไปยกเลิกของคนอื่น');

      const ok = window.confirm("ยืนยันการยกเลิกออเดอร์?");
      if (!ok) return;

      setLoading(true);
      try {
        await db.runTransaction( async (transaction)=>{
          const autoPaymentRef = db.collection('autoPayment').doc(id);
          const autoPaymentDoc = await transaction.get(autoPaymentRef);
          const { process } = autoPaymentDoc.data();
          if(process==='success') throw new Error(`Order นี้ เสร็จสมบูรณ์ไปแล้ว`);
          if(process==='cancel') throw new Error(`Order นี้ ยกเลิกไปแล้ว`);
          transaction.update(autoPaymentRef,{ process:'cancel', canceledAt:new Date(), cancelBy:profileId, cancelName:profileName })
        });
        dispatch(updateNormalFieldAutoPayment({
          id,
          updatedField:{
            process:'cancel'
          }
        }));
        toastSuccess('ยกเลิกออเดอร์สำเร็จ')
      } catch (error) {
        alert(error)
      } finally {
        setLoading(false);
      }
    };

    // 200%
    // 1. ตรวจสอบสถานะออเดอร์อีกครั้งผ่าน API ของสแกนฟู้ด
    // 2. ถ้าออเดอร์ยังคงสถานะ failed ให้แจ้งเตือนผู้ใช้ว่าออเดอร์นี้ไม่สำเร็จและไม่สามารถอนุมัติได้
    // 3. ถ้าออเดอร์เปลี่ยนเป็น success ให้แจ้งเตือนผู้ใช้ว่าออเดอร์นี้สำเร็จแล้วและจะถูกอนุมัติทันที และอัพเดตสถานะในระบบเป็น success
  async function checkFailedOrder(item){
    const ok = window.confirm("ต้องการตรวจสอบสถานะออเดอร์นี้อีกครั้งหรือไม่?");
    if (!ok) return;
    const { id, process, chargeId } = item;
    if(process !=='failed') return null;
    setLoading(true);
    try {
          const response = await scanfoodAPI.post('/gateway/payment/inquireQr',
            {
              chargeId,  // for inquiry
              channelType:'posxpay',
              token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudElkIjoxMDQ3M30.P42rmcK6gLFCcf6x88rgpMx4hRGPPgDh4hgbreuCTaw', // for webhook 
            }
          );
          if(response?.data?.success){
              const { status, data } = await scanfoodAPI.post(
                  "/gateway/webhook/posxpay/",
                  {
                      "test":"pack",
                      "ref2":"auto",
                      "ref1":`sale:${id}`
                  }
              );
              if(status===200 && data?.success){
                  toastSuccess('ตรวจสอบออเดอร์สำเร็จ ออเดอร์นี้จะถูกอนุมัติทันที ');
                  dispatch(updateNormalFieldAutoPayment({
                    id,
                    updatedField:{
                      process:'success'
                    }
                  }));
              }
          } 
    } catch (error) {
      alert(error?.response?.data?.message || error.message || error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} >
        <h1>ประวัติเปิดออเดอร์อัตโนมัติ</h1>
        <Modal_Loading show={loading} />
        <Modal_Qrcode
            show={payment_Modal}
            onHide={()=>{setPayment_Modal(false)}}
            qrCode={qrCode}
            amount={amount}
        />
        <TimeControlAutoPayment/>
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อผู้ดำเนินการหรือเลขที่ออเดอร์หรือชื่อร้านค้า', search ,setSearch }} />
        <CategoryRender {...{ options, option:optionId, setOption }} />
        <h4>ค้นพบ : {currentDisplay.length} รายการ : {formatCurrency(summary(currentDisplay,'net'))}</h4>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container2}>เลขที่</th>
                <th style={styles.container2}>เวลา</th>
                <th style={styles.container2}>ร้านค้า</th>
                <th style={styles.container2}>มูลค่า</th>
                <th style={styles.container2}>สถานะ</th>
                <th style={styles.container2}>ผู้ดำเนินการ</th>
                <th style={styles.container2}>เซล</th>
                <th style={styles.container2}>จำนวนตรวจสอบ</th>
                {/* <th style={styles.container2}>QRCode</th> */}
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { orderNumber, createdAt, shopName, 
                    process, profileName, attemptCount = 0, saleName = '', net } = item;
                
                return <tr  style={{cursor: 'pointer'}} key={index} >
                            <td style={styles.container3} >{orderNumber}</td>
                            <td >{stringDateTimeReceipt(createdAt)}</td>
                            <td >{shopName}</td>
                            <td style={styles.container3} >{net}</td>
                            <td onClick={()=>{cancelOrder(item)}} style={styles.container3} >
                              <button style={{ minWidth:'100px', borderRadius:20, backgroundColor:initialColors[process] }} >{process}</button>
                              {process==='failed'
                                  ?<OneButton {...{ text:'ตรวจสอบอีกครั้ง', submit:()=>{checkFailedOrder(item)}, variant:'secondary' }} />
                                  :null
                              }
                            </td>
                            <td style={styles.container3} >{profileName}</td>
                            <td style={styles.container3} >{saleName}</td>
                            <td style={styles.container3} >{attemptCount}</td>
                            {/* <td style={styles.container3} >
                              {process==='cancel'
                                  ?<OneButton {...{ text:'เปิด QR Code', submit:()=>{}, variant:'secondary' }} />
                                  :<OneButton {...{ text:'เปิด QR Code', submit:()=>{openQRcode(item)} }} />
                              }
                                
                            </td> */}
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
    width:'15%', minWidth:'150px', textAlign:'center'
  },
  container3 : {
    textAlign:'center'
  }
}

export default PaymentFailedScreen;