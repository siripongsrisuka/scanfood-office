import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { db, prepareFirebaseImage, webImageDelete } from "../db/firestore";
import { Modal_Loading, Modal_Note, Modal_OneInput, Modal_Shop } from "../modal";
import { OneButton } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { formatTime } from "../Utility/function";
import { cashiersEquipment, colors, distanceOptions, hostedSystems, initialNote, networkSystems, printerModes, printers, printPatterns, routerSystems, shopTypeOptions } from "../configs";
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
    features:[], // qrCode, member, point, coupon
    shopType:'', // restaurant, cafe, bakery, retail, grocery, other
    notes:[],
    paymentGateway:[], // kbank, posxpay, beam, creditOrcode
    cashiersPos:[
     
    ],
    kitchenPrinters:[
          
    ],
    router:'',
};

const { softWhite, darkGray } = colors;

function CustomerProfileScreen() {
    const { office:{ humanRight = [] } } = useSelector(state=>state.office);
    const [currentCustomer, setCurrentCustomer] = useState(initialCustomerProfile);
    const { code:thisCode, createdAt, createdName, id:customerId, notes = [], shops } = currentCustomer;
    const [customer_Modal, setCustomer_Modal] = useState(false);
    const [code, setCode] = useState('');
    const { profile:{ id:profileId, name:profileName, admin } } = useSelector(state=>state.profile);
    const [loading, setLoading] = useState(false);
    const [currentNote, setCurrentNote] = useState(initialNote);
    const { content, imageUrls = [] } = currentNote;
    const [note_Modal, setNote_Modal] = useState(false);
    const humanMaps = new Map(humanRight.map(a=>[a.id,a]));
    const [oldImageUrls, setOldImageUrls] = useState(null);
    const [currentShop, setCurrentShop] = useState(initialShop);
    const [shop_Modal, setShop_Modal] = useState(false);
    const cashierEquipmentMap = useMemo(
      ()=> new Map(cashiersEquipment.map(item=>[item.id, item])),[]
    );

    const networkSystemMap = useMemo(
      ()=> new Map(networkSystems.map(item=>[item.id, item])),[]
    );

    const printerModeMap = useMemo(
      ()=> new Map(printerModes.map(item=>[item.id, item])),[]
    );

    const routerSystemMap = useMemo(
      ()=> new Map(routerSystems.map(item=>[item.id, item])),[]
    );

    const hostedSystemMap = useMemo(
      ()=> new Map(hostedSystems.map(item=>[item.id, item])),[]
    );

    const printerMap = useMemo(
      ()=> new Map(printers.map(item=>[item.id, item])),[]
    );  

    const printPatternMap = useMemo(
      ()=> new Map(printPatterns.map(item=>[item.id, item])),[]
    );

    const distanceOptionMap = useMemo(
      ()=> new Map(distanceOptions.map(item=>[item.id, item])),[]
    );

    const shopTypeOptionMap = useMemo(
      ()=> new Map(shopTypeOptions.map(item=>[item.id, item])),[]
    );



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
    if(item.id && item.modifiedBy !== profileId && !admin){
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
      const { createdAt, updatedAt, notes, ...rest } = customerData;
      setCurrentCustomer(prev=>({
        ...prev,
        ...rest,
        updatedAt:new Date(),
        updatedBy:profileId,
        updatedName:profileName,
        notes:notes.map(note=>({
          ...note,
          modifiedAt:formatTime(note.modifiedAt),
        })),
      }));
    } catch (error) {
      alert(error)
    } finally {
      setLoading(false);
      setCurrentNote(initialNote);
    }
  };

  function openShop(item){
    setCurrentShop({...initialShop,...item});
    setShop_Modal(true);
  };

  async function saveShop(){
    setShop_Modal(false);
    setLoading(true);
    try {
      const payload = {
        ...currentShop,
      };
      const customerData = await db.runTransaction(async (transaction) => {
        const customerRef = db.collection('customerProfile').doc(customerId);
        const customerDoc = await transaction.get(customerRef);
        if(!customerDoc.exists) throw 'ไม่พบรหัสลูกค้านี้ในระบบ';
        const { shops } = customerDoc.data();
        const updatedShops = currentShop.id
          ? shops.map(shop=>shop.id===currentShop.id ? payload : shop)
          : [...shops, { ...payload, id:uuidv4() }];
        transaction.update(customerRef, { shops:updatedShops, shopCount:updatedShops.length, updatedAt:new Date(), updatedBy:profileId, updatedName:profileName });
        return { ...customerDoc.data(), shops:updatedShops };
      });
      const { createdAt, updatedAt, notes, ...rest } = customerData;
      setCurrentCustomer(prev=>({
        ...prev,
        ...rest,
        updatedAt:new Date(),
        updatedBy:profileId,
        updatedName:profileName,
        notes:notes.map(note=>({
          ...note,
          modifiedAt:formatTime(note.modifiedAt),
        })),
      }));
    } catch (error) {
      alert(error)
    } finally {
      setLoading(false);
      setCurrentShop(initialShop);
    } 
  }



  return (
    <div style={styles.container} >
        <h1>ข้อมูลลูกค้า</h1>
        <Modal_Loading show={loading} />
        <Modal_Shop
          show={shop_Modal}
          onHide={()=>{setShop_Modal(false)}}
          current={currentShop}
          setCurrent={setCurrentShop}
          submit={saveShop}
        />
        <Modal_Note
            show={note_Modal}
            onHide={()=>{setNote_Modal(false)}}
            current={currentNote}
            setCurrent={setCurrentNote}
            submit={saveNote}
        />
 
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
            <OneButton {...{ text:'+ ร้าน', submit: ()=>{openShop({})}, variant:'success' }} />
            {shops.map((shop,index)=>{
              const { shopName, storeSize, features, shopType, paymentGateway, router, cashiersPos, kitchenPrinters } = shop;
              return <Row onClick={()=>{openShop(shop)}} key={index} style={{ border:`1px solid ${softWhite}`, margin:'10px 0px', padding:10, borderRadius:10, backgroundColor:softWhite }} >
                      <Col sm='12' md='6' lg='4'  >
                        <Card  style={{ padding: '1rem', marginTop: 10, minHeight:'400px' }}>
                            <h6>ร้าน : {shopName}</h6>
                            <h6>โต๊ะ : {storeSize}</h6>
                            <h6>package : {features.join(', ')}</h6>
                            <h6>ประเภทร้าน : {shopTypeOptionMap.get(shopType)?.label || '-'}</h6>
                            <h6>paymentGateway : {paymentGateway.join(', ')}</h6>
                            <h6>router :{routerSystemMap.get(router)?.label || '-'}</h6>
                        </Card>
                      </Col>
                      {cashiersPos.map((cashier,index2)=>{
                        const { equipment, printerMode, hostedSystem, networkSystem, distance, host, innerPrinter, printer, printerPattern, note } = cashier;
                        return <Col sm='12' md='6' lg='4' key={index2} >
                                  <Card  style={{ padding: '1rem', marginTop: 10, minHeight:'400px' }}>

                                      <h6 style={{ backgroundColor:'#C0CDFF', padding:5}} >เครื่องคิดเงิน {index2 + 1}</h6>
                                      <h6>รุ่น : {cashierEquipmentMap.get(equipment)?.label || '-'}</h6>
                                      <h6>ระบบเน็ตเวิร์ค : {networkSystemMap.get(networkSystem)?.label || '-'}</h6>
                                      <h6>เครื่องแม่ : {host ? 'ใช่' : 'ไม่ใช่'}</h6>
                                      <h6>ระบบโฮสท์ : {hostedSystemMap.get(hostedSystem)?.label || '-'}</h6>
                                      <h6>ปริ้นเตอร์ในตัว : {innerPrinter ? 'มี' : 'ไม่มี'}</h6>
                                      <h6>ยี่ห้อปริ้นเตอร์ : {printerMap.get(printer)?.label || '-'}</h6>
                                      <h6>โหมดปริ้นเตอร์ : {printerModeMap.get(printerMode)?.label || '-'}</h6>
                                      <h6>รูปแบบการปริ้น : {printPatternMap.get(printerPattern)?.label || '-'}</h6>
                                      <h6>หมายเหตุ : {note || '-'}</h6>
                                  </Card>
                                </Col>
                      })}
                      {kitchenPrinters.map((kitchenPrinter,index3)=>{
                        const { printer, printerPattern, name, printerMode, distance, ipAddress, note } = kitchenPrinter;
                        return <Col sm='12' md='6' lg='4' key={index3} >
                                  <Card  style={{ padding: '1rem', marginTop: 10, minHeight:'400px' }}>
                                      <h6 style={{ backgroundColor:'#FA8D94', padding:5}} >ปริ้นเตอร์ครัว {index3 + 1}</h6>
                                      <h6>{name}</h6>
                                      <h6>ยี่ห้อ : {printerMap.get(printer)?.label || '-'}</h6>
                                      <h6>โหมดปริ้นเตอร์ : {printerModeMap.get(printerMode)?.label || '-'}</h6>
                                      <h6>รูปแบบการปริ้น : {printPatternMap.get(printerPattern)?.label || '-'}</h6>
                                      <h6>ระยะห่างจากเราเตอร์ : {distanceOptionMap.get(distance)?.label || '-'}</h6>
                                      <h6>IP Address : {ipAddress || '-'}</h6>
                                      <h6>หมายเหตุ : {note || '-'}</h6>
                                  </Card>
                                </Col>
                      })}
                             
                    </Row>
            })}
              
              <Row>
                {notes.map((item)=>{
                  const { content, modifiedBy, modifiedName, modifiedAt, id, imageUrls } = item;
                  const name = humanMaps.get(modifiedBy)?.name || modifiedName;
                  return <Col sm='12' md='6' lg='4' key={id} >
                            <div key={id} style={{ border:`1px solid ${softWhite}`, margin:'10px 0px', padding:10, borderRadius:10, backgroundColor:softWhite }} >
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }} >
                                  <h6 style={{ color:darkGray }} >{stringDateTimeReceipt(modifiedAt)} {name} </h6>
                                  <div>
                                      <i style={{ cursor:'pointer' }} onClick={()=>{openNoteModal(item)}} class="bi bi-pencil"></i>&emsp;
                                  </div>
                              </div>
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
                          </div>
                        </Col>
                })}
              </Row>
            
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