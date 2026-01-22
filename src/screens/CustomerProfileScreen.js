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

const initialCustomerProfile = {
    code:'', // s00001
    lineName:'',
    createdAt:new Date(),
    shops:[], 
    hardware:[], // อุปกรณ์ที่ซื้อจากเรา

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
    


  return (
    <div style={styles.container} >
        <h1>ข้อมูลลูกค้า</h1>

    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default CustomerProfileScreen;