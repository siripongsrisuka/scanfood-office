import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { SearchControl, TimeControlExtra } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { searchMultiFunction } from "../Utility/function";
import { Modal_Loading } from "../modal";


function OneMonthShopScreen() {
    const { displayExtraDays, modal_ExtraDay } = useSelector((state)=> state.extra);
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [resultLength, setResultLength] = useState(0);
    const [search, setSearch] = useState('');

    // 200%
    useEffect(()=>{
        let result = displayExtraDays;
        if(search){
          result = searchMultiFunction(result,search,['profileName','shopName']);
        }
        setCurrentDisplay(result);
        setResultLength(result.length)

    },[displayExtraDays,search]);


  return (
    <div style={styles.container} >
        <Modal_Loading show={modal_ExtraDay} />
        <h1>ร้านค้า 1 เดือน</h1>

        <TimeControlExtra />
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อร้านหรือชื่อเซล', search, setSearch }} />
        <br/>
        <h4>ค้นพบ {resultLength} รายการ</h4> 
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >No.</th>
                    <th style={styles.container3} >วันที่</th>
                    <th style={styles.container3} >ร้าน</th>
                    <th style={styles.container3} >วันใช้งานสุดท้าย</th>
                    <th style={styles.container3} >เซล</th>

                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { createdAt,  profileName, days, shopName, reason, status } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>{stringDateTimeReceipt(createdAt)}</td>
                            <td style={styles.container4}>{profileName}</td>
                            <td style={styles.container4}>{shopName}</td>
                            <td style={styles.container4}>{days}</td>
                            <td >{reason}</td>
                            <td style={styles.container4}>{status}</td>
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