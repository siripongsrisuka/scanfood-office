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
import { db, prepareFirebaseImage, webImageDelete } from "../db/firestore";
import { Modal_Note, Modal_OneInput } from "../modal";
import { OneButton } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { formatTime } from "../Utility/function";
import { colors, initialNote } from "../configs";
import { v4 as uuidv4 } from 'uuid';

const initialCustomerProfile = {
    code:'', // s00001
    createdAt:new Date(),
    shops:[], 
    hardware:[], // อุปกรณ์ที่ซื้อจากเรา
    notes:[],
    createdBy:'',
    shopCount:0,
    updatedAt:new Date(),
    updatedBy:'',
    updatedName:'',
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
};

const { softWhite, darkGray } = colors;

function CustomerProfileScreen() {
    const { office:{ humanRight = [] } } = useSelector(state=>state.office);
    const [search, setSearch] = useState('');
    const [currentCustomer, setCurrentCustomer] = useState(initialCustomerProfile);
    const { code:thisCode, createdAt, createdName, id:customerId, notes = [] } = currentCustomer;
    const [customer_Modal, setCustomer_Modal] = useState(false);
    const [code, setCode] = useState('');
    const { profile:{ id:profileId, name:profileName } } = useSelector(state=>state.profile);
    const [loading, setLoading] = useState(false);
    const [masterData, setMasterData] = useState([]); // ลูกค้าที่ยังไม่ผูก shop
    const [currentNote, setCurrentNote] = useState(initialNote);
    const { modifiedBy, modifiedName, modifiedAt, content, id:noteId, imageUrls = [] } = currentNote;
    const [note_Modal, setNote_Modal] = useState(false);
    const humanMaps = new Map(humanRight.map(a=>[a.id,a]));
    const [oldImageUrls, setOldImageUrls] = useState(null);

    // 200%
    async function handleCustomer(){
      setCustomer_Modal(false);
      if(!code) return alert('กรุณาใส่รหัสลูกค้า');
      setLoading(true);
      try {
        const customerRef = db.collection('customerProfile').doc(code);
        const customerDoc = await customerRef.get();
        if(!customerDoc.exists) return alert('ไม่พบรหัสลูกค้านี้ในระบบ');
        const { createdAt, updatedAt, notes, ...rest } = customerDoc.data();
        setCurrentCustomer({
          createdAt:formatTime(createdAt),
          updatedAt:formatTime(updatedAt),
          ...rest, 
          id:customerDoc.id,
          notes:notes.map(note=>({
            ...note,
            modifiedAt:formatTime(note.modifiedAt),
          })),
        });
      } catch (error) {
        alert(error)
      } finally {
        setLoading(false);
      }
    };

    async function addNewCustomer(){
      const ok = window.confirm('ต้องการเพิ่มลูกค้าใหม่ใช่หรือไม่ ?');
      if(!ok) return;
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
          setCurrentCustomer({...payload, id:newCode});
        });
      } catch (error) {
        alert(error)
      } finally {
        setLoading(false);
      }
    };

  function openNoteModal(item){
    if(item.id && item.modifiedBy !== profileId){
      return alert('คุณไม่มีสิทธิ์แก้ไขหมายเหตุนี้');
    }
    setNote_Modal(true);
    setCurrentNote({...initialNote,...item});
    setOldImageUrls(item.imageUrls || []);
  };

  async function saveNote(){
    setNote_Modal(false);
    if(!content) return alert('กรุณาใส่หมายเหตุ');
   
    setLoading(true);
    try {
      let images = imageUrls.filter(a=>!a?.startsWith('http')) || []
      if (images.length > 0) {
          images = await Promise.all(
              images.map(item => prepareFirebaseImage(item, '/note/', 'office'))
          );
      }
      const existingImages = imageUrls.filter(a=>a.startsWith('http')) || []
      images = [...existingImages,...images]

      const deleteImages = oldImageUrls.filter(a=>a.startsWith('http') && !images.includes(a)) || []
      for(const img of deleteImages){
          await webImageDelete(img);
      }
      const payload = {
        ...currentNote,
        modifiedBy:profileId,
        modifiedName:profileName,
        modifiedAt:new Date(),
        imageUrls:images
      };
      const customerData = await db.runTransaction(async (transaction) => {
        const customerRef = db.collection('customerProfile').doc(customerId);
        const customerDoc = await transaction.get(customerRef);
        if(!customerDoc.exists) throw 'ไม่พบรหัสลูกค้านี้ในระบบ';
        const { notes } = customerDoc.data();
        const modifiedNotes = notes.map(note=>({
          ...note,
          modifiedAt:note.modifiedAt && formatTime(note.modifiedAt),
        }));
        const updatedNotes = currentNote.id
          ? modifiedNotes.map(note=>note.id===currentNote.id ? payload : note)
          : [...modifiedNotes, { ...payload, id:uuidv4() }];
        transaction.update(customerRef, { notes:updatedNotes, updatedAt:new Date(), updatedBy:profileId, updatedName:profileName });
        return { ...customerDoc.data(), notes:updatedNotes };
      });
      const { createdAt, updatedAt, ...rest } = customerData;
      setCurrentCustomer(prev=>({
        ...prev,
        ...rest,
        updatedAt:new Date(),
        updatedBy:profileId,
        updatedName:profileName,
      }));
    } catch (error) {
      alert(error)
    } finally {
      setLoading(false);
      setCurrentNote(initialNote);
    }
  }



  return (
    <div style={styles.container} >
        <h1>ข้อมูลลูกค้า</h1>
        <Modal_Note
            show={note_Modal}
            onHide={()=>{setNote_Modal(false)}}
            current={currentNote}
            setCurrent={setCurrentNote}
            submit={saveNote}
        />
        {/* <Modal_OneInput  
            show={note_Modal}
            header={`ใส่โน๊ตลูกค้า`}
            onHide={()=>{setNote_Modal(false)}}
            value={content}
            onClick={saveNote}
            placeholder='ใส่โน๊ตลูกค้า'
            onChange={(value)=>{setCurrentNote(prev=>({ ...prev, content:value }))}}
            area={true}
        /> */}
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
        {customerId
          ?<div>
            <h3>Code : {thisCode}</h3>
            <h5>สร้างเมื่อ: {stringDateTimeReceipt(createdAt)}</h5>
            <h5>สร้างโดย: {createdName || '-'}</h5>
            <OneButton {...{ text:'+ เพิ่มโน๊ต', submit: ()=>{openNoteModal({})}, variant:'success' }} />
            {notes.map((item)=>{
                  const { content, modifiedBy, modifiedName, modifiedAt, id, imageUrls } = item;
                  const name = humanMaps.get(modifiedBy)?.name || modifiedName;
                  return <div key={id} style={{ border:`1px solid ${softWhite}`, margin:'10px 0px', padding:10, borderRadius:10 }} >
                      <p>
                        {content.split('\n').map((line, index) => (
                          <React.Fragment key={index}>
                              &emsp;&nbsp;{line}
                              <br />
                          </React.Fragment>
                        ))}
                      </p>
                      {imageUrls && imageUrls.length > 0
                        ? <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
                            {imageUrls.map((img, index) => (
                              <div key={index} style={{ margin: 10 }} >
                                <img
                                  src={img}
                                  alt={`note-upload-${index}`}
                                  style={{ width: 150, height: 150, objectFit:'contain' }}
                                />
                              </div>
                            ))}
                          </div>
                        : null
                      }
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }} >
                          <h6 style={{ color:darkGray }} >{stringDateTimeReceipt(modifiedAt)} {name} </h6>
                          <div>
                              <i style={{ cursor:'pointer' }} onClick={()=>{openNoteModal(item)}} class="bi bi-pencil"></i>&emsp;
                          </div>
                      </div>
                  </div>
              })}
          </div>
          :null
        }
        
      
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default CustomerProfileScreen;