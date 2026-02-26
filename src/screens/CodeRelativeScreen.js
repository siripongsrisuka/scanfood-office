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


function CodeRelativeScreen() {
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentDisplay, setCurrentDisplay] = useState([]);

    async function testData(){
        const snap = await db
            .collection('checkout')
              .where('shopId','==','cQpATdNiK697JkaqHg5k')
              .where('billDate','in',['20260225'])
            .count()
            .get();
        alert(snap.data().count);
    }


  return (
    <div style={styles.container} >
        <h1>ผูก Code กับร้านใหม่</h1>
        <Button onClick={testData} >Test</Button>
        <div>
        <h6>จำนวน : {currentDisplay.length} ร้านค้า</h6>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th  style={styles.container2}>No.</th>
                <th  style={styles.container3}>code</th>
                <th  style={styles.container5}>ร้านค้า</th>
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
                            <td >
                            </td>
                            <td style={styles.container4} ></td>
                            <td style={styles.container4} >{tel}</td>
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