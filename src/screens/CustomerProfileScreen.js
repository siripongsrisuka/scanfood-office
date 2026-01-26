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

const initialCustomerProfile = {
    code:'', // s00001
    lineName:'',
    createdAt:new Date(),
    shops:[], 
    hardware:[], // อุปกรณ์ที่ซื้อจากเรา
    notes:[],
    createdBy:'',

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
        lineName:'',
        createdAt:new Date(),
        shops:[],
        hardware:[], // อุปกรณ์ที่ซื้อจากเรา
        notes:[],
        createdBy:profileId,
        createdName:profileName,
      };
      setLoading(true);
      try {
        const query = await db.collection('customerProfile')
          .where('createdBy','==',profileId)
          .where()
          .limit(1)
          .get();
        const numberRef = db.collection('admin').doc('customerProfileNumber');
        await db.runTransaction(async (transaction) => {
          const numberDoc = await transaction.get(numberRef);
 
          let { code } = numberDoc.data();
          code += 1;
          const newCode = `s${String(code).padStart(5,'0')}`;

          transaction.update(numberRef, { code, timestamp:new Date() });

          const customerRef = db.collection('customerProfile').doc(newCode);
          transaction.set(customerRef, payload);
          setExistCustomer()
          setCurrentCustomer({ ...payload, id:newCode });
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

    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default CustomerProfileScreen;