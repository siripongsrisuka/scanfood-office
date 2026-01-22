import React, { useEffect, useState } from "react";
import {
  Table,
} from "react-bootstrap";
import { SearchControl } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { formatTime, searchMultiFunction } from "../Utility/function";
import { Modal_Loading } from "../modal";
import { db } from "../db/firestore";


function OneMonthShopScreen() {
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [resultLength, setResultLength] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [packageOrders, setPackageOrders] = useState([]);

    useEffect(()=>{
        fetchPackageOrder();
    },[]);
    // 200%
    useEffect(()=>{
        let result = packageOrders;
        if(search){
          result = searchMultiFunction(result,search,['profileName','shopName']);
        }
        setCurrentDisplay(result);
        setResultLength(result.length)

    },[packageOrders,search]);

    async function fetchPackageOrder(){
        setLoading(true);
        try {
            const query = await db.collection('packageOrder')
                .where('oneMonth','==',true)
                .orderBy('timestamp','desc')
                .limit(100)
                .get();     
            let res = [];
            query.forEach((doc)=>{
                const { expire = null, timestamp, ...rest } = doc.data();
                res.push({ 
                    id:doc.id, 
                    ...rest, 
                    timestamp:formatTime(timestamp),
                    expire:expire?formatTime(expire):null
                })
            })
            setPackageOrders(res);
        } catch (error) {
            console.log(error)
        } finally{
            setLoading(false);
        }
    }


  return (
    <div style={styles.container} >
        <Modal_Loading show={loading} />
        <h1>ร้านค้า 1 เดือน</h1>
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อร้านหรือชื่อเซล', search, setSearch }} />
        <br/>
        <h4>ค้นพบ {resultLength} รายการ</h4> 
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >No.</th>
                    <th style={styles.container3} >วันที่</th>
                    <th style={styles.container3} >ร้าน</th>
                    <th style={styles.container3} >วันที่ หมดอายุ</th>
                    <th style={styles.container3} >สถานะ</th>
                    <th style={styles.container3} >เซล</th>

                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { timestamp,  profileName, shopName, status, expire } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>{stringDateTimeReceipt(timestamp)}</td>
                            <td style={styles.container4}>{shopName}</td>
                            <td style={styles.container4}>{expire?stringDateTimeReceipt(expire):'ยังไม่ activate'}</td>
                            <td style={styles.container4} >{status}</td>
                            <td style={styles.container4}>{profileName}</td>
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

export default OneMonthShopScreen;