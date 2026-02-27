import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { db } from "../db/firestore";
import { formatTime } from "../Utility/function";
import { scanfoodAPI } from "../Utility/api";


function CodeRelativeScreen() {
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentDisplay, setCurrentDisplay] = useState([]);

    useEffect(()=>{

    },[])


    async function fetchMasterData() {
        setLoading(true);
        try {
            const response = await scanfoodAPI.post(
                "/office/newCustomer/",
                {
                    
                }
            );
            const { status, data } = response;
            const { shops } = data;
            const sortedShops = shops.map(doc=>{
                const { createdDate, ...rest } = doc.data();
                return {
                    ...rest,
                    createdDate: formatTime(createdDate),
                    id:doc.id
                }
            })
        
            setMasterData(sortedShops);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };


  return (
    <div style={styles.container} >
        <h1>ผูก Code กับบัญชีร้านใหม่</h1>
        <div>
        <h6>จำนวน : {currentDisplay.length} ร้านค้า</h6>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th  style={styles.container2}>No.</th>
                <th  style={styles.container3}>code</th>
                <th  style={styles.container5}>ร้านค้า</th>
                <th  style={styles.container5}>เบอร์โทร</th>
                <th  style={styles.container5}>วันที่สมัคร</th>
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { id, name, vip, vipExpire, tel, code } = item;
                return <tr   key={id} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td >{code}</td>
                            <td >{name}</td>
                            <td >{tel}</td>
                            <td >{vip}</td>
                            <td style={styles.container4} >{vipExpire}</td>
                        </tr>
            })}
            </tbody>
        </Table>
    </div>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default CodeRelativeScreen;