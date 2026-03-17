import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { OneButton, SearchControl, TimeControlEtax } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { fetchLicense, searchMultiFunction } from "../Utility/function";
import { Modal_Loading, Modal_Quotation } from "../modal";
import { initialQuotation } from "../configs";


function ETaxHistoryScreen() {
    const { warehouse } = useSelector(state=>state.warehouse);
    const { displayEtax } = useSelector((state)=> state.etax);
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [resultLength, setResultLength] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [so_Modal, setSo_Modal] = useState(false);
    const [currentSo, setCurrentSo] = useState(initialQuotation);
    const [licenses, setLicenses] = useState([]);

    // 200%
    useEffect(()=>{
        let result = displayEtax;
        if(search){
          result = searchMultiFunction(result,search,['saleName','shopName']);
        }
        setCurrentDisplay(result);
        setResultLength(result.length)

    },[displayEtax,search]);

    useEffect(()=>{
        handleFetchAll();
    },[]);

    async function handleFetchAll(){
        setLoading(true);
        try {
            const [licenses, orders ] = await Promise.all([
                fetchLicense(),
            ])
            setLicenses(licenses); // ราคา software
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };


    function openSoModal(item){
     
        setCurrentSo(item);
        setSo_Modal(true);
    };


  return (
    <div style={styles.container} >
        <h1>ประวัติ E-Tax</h1>
        <TimeControlEtax/>
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

export default ETaxHistoryScreen;