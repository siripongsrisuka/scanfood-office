import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { CategoryRender, initialColors, OneButton, SearchControl, TimeControlUpgrade } from "../components";
import { formatCurrency, searchMultiFunction, summary, toastSuccess } from "../Utility/function";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { Modal_Loading, Modal_Payment } from "../modal";
import { db } from "../db/firestore";
import { updateNormalFieldUpgrade } from "../redux/upgradeSlice";

const options = [
    { id:'1', name:"ทั้งหมด" },
    { id:'2', name:"request", },
    { id:'3', name:"cancel", },
    { id:'4', name:"success", },
];


function UpgradeStoreSizeHistory() {
    const dispatch = useDispatch();
    const { selectedUpgrade } = useSelector(state=>state.upgrade);
    const { profile:{ id:profileId, name:profileName } } = useSelector(state=>state.profile);
    const [payment_Modal, setPayment_Modal] = useState(false);
    const [qrCode, setQrcode] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const [currentDisplay, setCurrentDisplay] = useState([]);
    const [search, setSearch] = useState('');
    const [option, setOption] = useState({ id:'1', name:"ทั้งหมด" });
    const { id:optionId, name } = option;

    useEffect(()=>{
        let arr = [];
        switch (optionId) {
          case '1':
            arr = selectedUpgrade;
            break;
          case '2':
            arr = selectedUpgrade.filter(a=>a.process === 'request')
            break;
          case '3':
            arr = selectedUpgrade.filter(a=>a.process === 'cancel')
            break;
           case '4':
            arr = selectedUpgrade.filter(a=>a.process === 'success')
            break;
        
          default:
            break;
        }
        if(search){
            arr = searchMultiFunction(selectedUpgrade,search,['orderNumber','profileName'])
        };
        setCurrentDisplay(arr);
    },[selectedUpgrade,search,optionId]);

    function openQRcode(item){
        const { qrCode, amount } = item;
        setQrcode(qrCode)
        setAmount(amount)
        setPayment_Modal(true);
    };

    async function cancelOrder(item){

      const { id, profileId:createdId, process } = item;
      if(process !=='request') return null;
      if(createdId !== profileId) return alert('ไม่มีสิทธิ์ไปยกเลิกของคนอื่น');

      const ok = window.confirm("ยืนยันการยกเลิกออเดอร์?");
      if (!ok) return;

      setLoading(true);
      try {
        await db.runTransaction( async (transaction)=>{
          const upgradeRef = db.collection('autoUpgradeSize').doc(id);
          const upgradeDoc = await transaction.get(upgradeRef);
          const { process } = upgradeDoc.data();
          if(process==='success') throw new Error(`Order นี้ เสร็จสมบูรณ์ไปแล้ว`);
          if(process==='cancel') throw new Error(`Order นี้ ยกเลิกไปแล้ว`);
          transaction.update(upgradeRef,{ process:'cancel', canceledAt:new Date(), cancelBy:profileId, cancelName:profileName })
        });
        dispatch(updateNormalFieldUpgrade({
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
    }

  return (
    <div style={styles.container} >
        <h1>ประวัติเพิ่มโต๊ะ</h1>
        <Modal_Loading show={loading} />
        <Modal_Payment
            show={payment_Modal}
            onHide={()=>{setPayment_Modal(false)}}
            qrCode={qrCode}
            amount={amount}
        />
        <TimeControlUpgrade/>
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อหรือเลขที่', search ,setSearch }} />
        <CategoryRender {...{ options, option:optionId, setOption }} />
        <h4>ค้นพบ : {currentDisplay.length} รายการ : {formatCurrency(summary(currentDisplay,'amount'))}</h4>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container2}>เลขที่</th>
                <th style={styles.container2}>เวลา</th>
                <th style={styles.container2}>ร้านค้า</th>
                <th style={styles.container2}>โต๊ะเดิม</th>
                <th style={styles.container2}>โต๊ะใหม่</th>
                <th style={styles.container2}>มูลค่า</th>
                <th style={styles.container2}>สถานะ</th>
                <th style={styles.container2}>ผู้ดำเนินการ</th>
                <th style={styles.container2}>QRCode</th>
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { orderNumber, createdAt, shopName, storeSize, nextStoreSize, process, amount, profileName } = item;
                
                return <tr  style={{cursor: 'pointer'}} key={index} >
                            <td style={styles.container3} >{orderNumber}</td>
                            <td style={styles.container3} >{stringDateTimeReceipt(createdAt)}</td>
                            <td style={styles.container3} >{shopName}</td>
                            <td style={styles.container3} >{storeSize}</td>
                            <td style={styles.container3} >{nextStoreSize}</td>
                            <td style={styles.container3} >{amount}</td>
                            <td onClick={()=>{cancelOrder(item)}} style={styles.container3} >
                              <button style={{ minWidth:'100px', borderRadius:20, backgroundColor:initialColors[process] }} >{process}</button>
                            </td>
                            <td style={styles.container3} >{profileName}</td>
                            <td style={styles.container3} >
                              {process==='cancel'
                                  ?<OneButton {...{ text:'เปิด QR Code', submit:()=>{}, variant:'secondary' }} />
                                  :<OneButton {...{ text:'เปิด QR Code', submit:()=>{openQRcode(item)} }} />
                              }
                                
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
    width:'15%', minWidth:'150px', textAlign:'center'
  },
  container3 : {
    textAlign:'center'
  }
}

export default UpgradeStoreSizeHistory;