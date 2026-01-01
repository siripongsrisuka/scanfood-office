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

import { initialAlert, initialStore } from "../configs";
import { db } from "../db/firestore";
import { Modal_Alert, Modal_Loading, Modal_Success } from "../modal";
import { OneButton, SearchControl } from "../components";

function TransformTable() {
    const [shops, setShops] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status:alertStatus, content:alertContent, onClick, variant } = alert_Modal;


    async function fetchShops(){
        const shopDocs = await db.collection('shop').where('tel','==',search).get();
        const shops = shopDocs.docs.map(doc=>{
            return {
                ...doc.data(),
                id:doc.id
            }
        })
        setShops(shops)
    };

    function transformNow(shopId){
        setLoading(true)
        try {
            db.collection('shop').doc(shopId).update({
                village:false,
                storeSize:20
            })
            setSuccess_Modal(true);
            setTimeout(()=>{
                setSuccess_Modal(false);
            },900)
            setShops(prev=>prev.filter(a=>a.id !== shopId))
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }



  return (
    <div id="google_translate_element" >
        <Modal_Alert
            show={alertStatus}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={alertContent}
            onClick={onClick}
            variant={variant}
        />
        <Modal_Loading show={loading} />
        <Modal_Success show={success_Modal} />
        <h1>เปลี่ยนไม่มีโต๊ะ ให้เป็น 1- 20 โต๊ะ</h1>
        <div style={{ display:'flex', margin:10}} >
            <SearchControl {...{ placeholder:'เบอร์โทร', search, setSearch }} />&emsp;
            <OneButton {...{ text:'ค้นหา', submit:fetchShops }} />
        </div>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.text}>No.</th>
                <th style={styles.text}>ชื่อร้าน</th>
                <th style={styles.text}>จำนวนโต๊ะ</th>
                <th style={styles.text}>ประเภท</th>
                <th style={styles.text}>จัดการ</th>
            </tr>
            </thead>
            <tbody  >
            {shops.map((item, index) => {
                const { name, storeSize, village, id } = item;
                return  <tr  style={styles.container} key={index} >
                        <td style={styles.text2}>{index+1}.</td>
                        <td style={styles.text2} >{name}</td>
                        <td style={styles.text2} >{storeSize}</td>
                        <td style={styles.text2} >{village?'ไม่มีโต๊ะ':'มีโต๊ะ'}</td>
                        <td style={styles.text2}>
                            <Button variant="warning" onClick={()=>{setAlert_Modal({ status:true, content:`เปลี่ยนประเภท`, onClick:()=>{transformNow(id);setAlert_Modal(initialAlert)}, variant:'danger' })}} >อนุมัติ</Button>
                        </td>
                        </tr>
            }
            )}
            </tbody>
        </Table>
    </div>
  );
};

const styles = {

}

export default TransformTable;