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
import { Modal_OneInput } from "../modal";
import { OneButton } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { formatTime } from "../Utility/function";

const initialCustomerProfile = {
    code:'', // s00001
    lineName:'',
    createdAt:new Date(),
    shops:[], 
    hardware:[], // อุปกรณ์ที่ซื้อจากเรา
    notes:[],
    createdBy:'',
    shopCount:0,
};

const initialShop = {
    shopName:'',
    storeSize:'',
    package:'',
    notes:[],
    paymentGateway:[], // kbank, posxpay, beam
    ethernetSystem:{
        cashiers:[
            {
                name:'',
                equipment:'', // pos, tablet
                network:'', // lan, wifi
                host:true, // true = server , false = client
                printer:'', // lan, wifi, usb, bluetooth, inner
                printerName:'', // ชื่อเครื่องปริ้นท์
                printerMode:'', // text, picture
            }
        ],
        kitchens:[
            {
                name:'',
                equipment:'', // pos, tablet
                network:'', // lan, wifi
                printer:'', // lan, wifi, 
                printerName:'', // ชื่อเครื่องปริ้นท์
                printerMode:'', // text, picture
                ipAddress:'', // ใส่เฉพาะเครื่องลูก
                thaiCharacter:'', // รองรับตัวอักษรไทยหรือไม่ can or cannot or undetected
                note:'', // หมายเหตุ เช่น เครื่องนี้ ช่องเสียบแลนไม่ค่อยดี

            }
        ],
        router:'',

    }
}

function CustomerProfileScreen() {
    const [search, setSearch] = useState('');
    const [currentCustomer, setCurrentCustomer] = useState(initialCustomerProfile);
    const [customer_Modal, setCustomer_Modal] = useState(false);
    const [code, setCode] = useState('');
    const { profile:{ id:profileId, name:profileName } } = useSelector(state=>state.profile);
    const [loading, setLoading] = useState(false);
    const [existCustomer, setExistCustomer] = useState([]);
    const [masterData, setMasterData] = useState([]); // ลูกค้าที่ยังไม่ผูก shop

    useEffect(()=>{
      fetchCustomerData();
    },[]);
    
    async function fetchCustomerData(){
      setLoading(true);
      try {
        const snapshot = await db.collection('customerProfile')
          .where('shopCount','==',0)
          .get();
        const data = snapshot.docs.map(doc=>{
          const { createdAt, ...rest } = doc.data();
          return({
            ...rest,
            createdAt:formatTime(createdAt),
            id:doc.id
          })
        });
        setMasterData(data);
      } catch (error) {
        alert(error)
      } finally {
        setLoading(false);
      }
    }

    async function handleCustomer(){
      setCustomer_Modal(false);
      if(!code) return alert('กรุณาใส่รหัสลูกค้า');
      setLoading(true);
      try {
        const customerRef = db.collection('customerProfile').doc(code);
        const customerDoc = await customerRef.get();
        if(!customerDoc.exists) return alert('ไม่พบรหัสลูกค้านี้ในระบบ');
        const customerData = customerDoc.data();
        setCurrentCustomer({...customerData, id:customerDoc.id});
      } catch (error) {
        alert(error)
      } finally {
        setLoading(false);
      }
    };

    async function addNewCustomer(){
      const payload = {
        ...initialCustomerProfile,
        createdBy:profileId,
        createdName:profileName,
        createdAt:new Date(),
      };
      setLoading(true);
      try {
   
        const numberRef = db.collection('admin').doc('customerProfileNumber');
        await db.runTransaction(async (transaction) => {
          const numberDoc = await transaction.get(numberRef);
 
          let { code } = numberDoc.data();
          code += 1;
          const newCode = `s${String(code).padStart(5,'0')}`;
          payload.code = newCode;
          transaction.update(numberRef, { code, timestamp:new Date() });

          const customerRef = db.collection('customerProfile').doc(newCode);
          transaction.set(customerRef, payload);
          setMasterData(prev=>[...prev,{ ...payload, id:newCode }])
        });
      } catch (error) {
        alert(error)
      } finally {
        setLoading(false);
      }
    }
    


  return (
    <div style={styles.container} >
        <h1>ข้อมูลลูกค้า</h1>
        <Modal_OneInput  
            show={customer_Modal}
            header={`ใส่รหัสลูกค้า`}
            onHide={()=>{setCustomer_Modal(false)}}
            value={code}
            onClick={handleCustomer}
            placeholder='ใส่รหัสลูกค้า'
            onChange={(value)=>{setCode(value)}}
        />
        <OneButton {...{ text: "ค้นหา", submit: ()=>{setCustomer_Modal(true);setCode('')} }} />
        <OneButton {...{ text: "เพิ่มลูกค้าใหม่", submit: addNewCustomer }} />
        <Row>
          {masterData.map((item,index)=>{
            const { code, lineName, createdAt, createdName } = item;
            return <Col xs='12' sm='6' md='4'  key={index} >
                      <Card style={{ margin:10, cursor:'pointer' }} onClick={()=>{setCurrentCustomer(item)}}>
                        <Card.Body>
                          <Card.Title>{lineName || '-'}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">รหัส: {code}</Card.Subtitle>
                          <Card.Text>สร้างเมื่อ: {stringDateTimeReceipt(createdAt)}</Card.Text>
                          <Card.Text>สร้างโดย: {createdName || '-'}</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
          })}
        </Row>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default CustomerProfileScreen;