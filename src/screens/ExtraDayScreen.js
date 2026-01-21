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


function ExtraDayScreen() {
    const [extraDay_Modal, setExtraDay_Modal] = useState(false);
    const { profile:{ id:profileId, name:profileName, saleManagerTeam } } = useSelector(state=>state.profile);
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
                billDate:stringYMDHMS3(new Date())
            }
            await extraDayRef.set(payload)
            setMasterData(prev=>[...prev,payload])
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
        setLoading(true);
        try {
            const { status, data } = await scanfoodAPI.post(
                "/office/extraDay/",
                item
            );
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
            const extraDayRef = db.collection('extraDay').doc(item.id);
            await extraDayRef.update({
                status:'rejected',
                rejectedAt:new Date(),
            });
            setMasterData(prev=>prev.filter(a=>a.id!==item.id) );
            toastSuccess('ปฏิเสธคำขอวันใช้งานสำเร็จ');
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการปฏิเสธคำขอวันใช้งาน')
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
    }

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