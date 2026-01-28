import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { db } from "../db/firestore";
import { fetchLicense, formatTime, toastSuccess } from "../Utility/function";
import { normalSort } from "../Utility/sort";
import { Modal_Loading, Modal_So } from "../modal";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { OneButton } from "../components";
import { initialSo } from "../configs";
import { scanfoodAPI } from "../Utility/api";


function ManualPaidScreen() {
    const { profile:{ admin  }  } = useSelector( state => state.profile );
    const { warehouse } = useSelector(state=>state.warehouse);
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [so_Modal, setSo_Modal] = useState(false);
    const [currentSo, setCurrentSo] = useState(initialSo);
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
    }


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
                toastSuccess('อนุมัติแพ็กเกจเรียบร้อย');
                setMasterData(prev=>prev.filter(i=>i.id !== id));

                return;
            }
            if(action === 'rejected'){
                await db.collection('autoPayment').doc(id).update({
                    process: 'cancel',
                    
                });
                toastSuccess('ปฏิเสธแพ็กเกจเรียบร้อย');
                setMasterData(prev=>prev.filter(i=>i.id !== id));

                return;
            }
        } catch (error) {
            alert(error);
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
        <Modal_So
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