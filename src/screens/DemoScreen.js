import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Modal_Loading, Modal_Quotation, Modal_Success, Modal_Requirement, Modal_Tax, Modal_FlatListTwoColumn, Modal_Delivery } from "../modal";
import { colors } from "../configs";
import { DemoPart1, DemoPart3 } from "../components";
import { updateDemo, updateFieldStore } from "../redux/careSlice";
import { Button } from "rsuite";
import DemoPart2 from "../components/DemoPart2";
import { db } from "../db/firestore";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';
import Modal_Postcode from "../modal/Modal_Postcode";
import { plusDays, stringDateTime3, stringReceiptNumber } from "../Utility/dateTime";


const initialSteps = [
  { id:'1', color:'red', name:'1. specification'},
  { id:'2', color:'orange',name:'2. presentation'},
  { id:'3', color:'green',name:'3. solution'},
];


const initialProcess = [
  { id:"demo", name:'demo'},
  { id:"payment", name:'payment'},
  { id:"implementation", name:'implementation'},
  { id:"training", name:'training'},
  { id:"softlaunch", name:'softlaunch'},
  { id:"done", name:'done'},
  { id:"failed", name:'failed'},
]

const { dark } = colors;

function DemoScreen() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { demo } = useSelector(state=>state.care);
    const { profile } = useSelector(state=>state.profile);
    const { name, tel } = profile;
    const [step, setStep] = useState('1');
    const [loading, setLoading] = useState(false)
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [requirement_Modal, setRequirement_Modal] = useState(false);
    const [quotation_Modal, setQuotation_Modal] = useState(false);
    const [postcode_Modal, setPostcode_Modal] = useState(false);
    const [delivery_Modal, setDelivery_Modal] = useState(false);
    const [tax_Modal, setTax_Modal] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [process_Modal, setProcess_Modal] = useState(false);
    const [currentQuotation, setCurrentQuotation] = useState({ currentPackage:[], currentHardware:[], vatQuotation:false,tax:{} })

    const { currentPackage, postcode, tax, vatQuotation, currentHardware, quoteNote, delivery } = demo;
    

    async function updateData(){
        setLoading(true)
        try {
          const { quotation, ...rest } = demo
          await dispatch(updateFieldStore({ doc:demo.id, field:rest }))
          setSuccess_Modal(true);
          setTimeout(()=>{
            setSuccess_Modal(false)
          },900)
        } catch (error) {
          
        } finally {
          setLoading(false)
          navigate(-1)
        }
    };

    function handleManual(){
      navigator.clipboard.writeText(`ขั้นตอนทดลองใช้งาน\n\nดาวน์โหลดแอปที่ลิ้งค์นี้\n👉🏻 https://onelink.to/ctzmrx 👈🏻\n\nจากนั้นทำตามวิดีโอต่อไปนี้ได้เลยนะคะ\n1. วิธีลงทะเบียนใช้งานฟรี 10 วัน ⬇️\nhttps://youtu.be/Z7_aT-Y2SLk\n2. วิธีเพิ่มเมนูอาหาร ⬇️\nhttps://youtu.be/R8GIMjiFL_k\n3. วิธีการสร้างโต๊ะและปริ้น QR code ⬇️\nhttps://youtu.be/8lE7mHQa3Rs\n4. วิธีเก็บเงินลูกค้า ⬇️\nhttps://youtu.be/8UIW2XDv8sQ`)
      .then(() => {
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 1000); // Hide popup after 2 seconds
      })
      .catch((error) => {
          console.error('Failed to copy text:', error);
      });
  
    };

    function handleSlide(){
      navigator.clipboard.writeText(`สไลด์ฟรีเซนต์ค่ะ\nhttps://www.canva.com/design/DAGWQPW7WOc/ZKd6s9IW-MoXCcYHTwz0-A/view?embed`)
      .then(() => {
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 1000); // Hide popup after 2 seconds
      })
      .catch((error) => {
          console.error('Failed to copy text:', error);
      });
  
    };

    function handleProcess(item){
        setProcess_Modal(false)
        dispatch(updateDemo({...demo,process:item.name}))
    };

    function createQuotation(){
      if(vatQuotation && !tax.name){
        alert('กรุณาใส่ ข้อมูลภาษี ')
      } else if(currentHardware.length>0 && !(postcode.name || delivery.name)){
        alert('กรุณาใส่ ที่อยู่การจัดส่ง ')
      } else if([...currentHardware,...currentPackage].length===0){
        alert('กรุณาใส่ เลือกรายการ')
      } else {
        var sfDocRef = db.collection("admin").doc('quotationNumber');
        db.runTransaction((transaction) => {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(sfDocRef).then((sfDoc) => {
                let orderNumber = stringReceiptNumber(1)
                if (sfDoc.exists) {
                    const { value } = sfDoc.data()
                    orderNumber = 'QT'+ stringReceiptNumber(value+100)
                    transaction.update(sfDocRef, { value: value+1, timestamp:new Date()});
                }
                return orderNumber
            });
        }).then((orderNumber)=>{
          let obj = {
            orderNumber,
            currentPackage,
            currentHardware,
            vatQuotation,
            tax,
            createdDate:stringDateTime3(new Date()),
            expireDate:stringDateTime3(plusDays(new Date(),30)),
            note:quoteNote,
            saleName:name,
            saleTel:tel,
            evident:''
          }
            dispatch(updateFieldStore({ 
              doc:demo.id, 
              field:{ 
                quotation:[
                  ...demo.quotation,
                  obj
                ] 
            }})).then(()=>{
              setCurrentQuotation(obj)
              setQuotation_Modal(true)
            })
        })
      }
      
    };


  function updatePostcode(){
    setPostcode_Modal(false)
    setLoading(true)
    dispatch(updateFieldStore({ doc:demo.id, field:{ postcode } })).then(()=>{
      setLoading(false)
      setSuccess_Modal(true)
      setTimeout(()=>{
        setSuccess_Modal(false)
      },900)
    })
  };

  function updateDelivery(){
    setDelivery_Modal(false)
    setLoading(true)
    dispatch(updateFieldStore({ doc:demo.id, field:{ delivery } })).then(()=>{
      setLoading(false)
      setSuccess_Modal(true)
      setTimeout(()=>{
        setSuccess_Modal(false)
      },900)
    })
  };

  function updateTax(){
    setTax_Modal(false)
    setLoading(true)
    dispatch(updateFieldStore({ doc:demo.id, field:{ tax } })).then(()=>{
      setLoading(false)
      setSuccess_Modal(true)
      setTimeout(()=>{
        setSuccess_Modal(false)
      },900)
    })
  }

  return (
    <div  style={{padding:'1rem'}} >
      <Modal_FlatListTwoColumn
          show={process_Modal}
          onHide={()=>{setProcess_Modal(false)}}
          header='เลือกขั้นตอน'
          onClick={handleProcess}
          value={initialProcess}
      />
      <Modal_Tax
        show={tax_Modal}
        onHide={()=>{setTax_Modal(false)}}
        currentTax={tax}
        submit={updateTax}
      />
      <Modal_Postcode
        show={postcode_Modal}
        onHide={()=>{setPostcode_Modal(false)}}
        current={postcode}
        submit={updatePostcode}
      />
      <Modal_Delivery
        show={delivery_Modal}
        onHide={()=>{setDelivery_Modal(false)}}
        current={delivery}
        submit={updateDelivery}
      />
      <Modal_Quotation 
          show={quotation_Modal} 
          onHide={()=>{setQuotation_Modal(false)}}
          currentQuotation={currentQuotation}
      />
      <Modal_Requirement 
          show={requirement_Modal} 
          onHide={()=>{setRequirement_Modal(false)}}
      />
      <Modal_Loading show={loading} />
      <Modal_Success show={success_Modal} />
      <div style={{display:'flex',justifyContent:'center'}} >
        {initialSteps.map(({ id, color, name })=>{
          let status = id===step
          return <Button key={id} color={color} appearance={status?"primary":"ghost"} style={{minWidth:'10rem',marginRight:'1rem'}} onClick={()=>{setStep(id)}}  >{name}</Button>
        })}
        
        <Button onClick={()=>{setRequirement_Modal(true)}} >ความต้องการ</Button>&emsp;
        <Button onClick={handleSlide} >สไลด์</Button>&emsp;
        <Button onClick={handleManual} >ทดลองใช้</Button>&emsp;
        <Button onClick={createQuotation} >ใบเสนอราคา</Button>&emsp;
        <Button onClick={()=>{setPostcode_Modal(true)}} >ไปรษณีย์</Button>&emsp;
        <Button onClick={()=>{setDelivery_Modal(true)}} >เดลิเวอรี่</Button>&emsp;
        <Button onClick={()=>{setTax_Modal(true)}} >ภาษี</Button>&emsp;
        <Button onClick={updateData} >Update</Button>&emsp;
      </div>
      
      {step==='1'
        ? <DemoPart1/>
        :step==='2'
        ?<DemoPart2/>
        :<DemoPart3/>
      }
      {showPopup && (
        <div style={styles.popupStyle}>
          Text copied successfully!
        </div>
      )}
    </div>
  );
}

const styles = {
  container : {
    borderRadius:20
  },
  popupStyle : {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '10px 20px',
    backgroundColor: dark,
    color: '#fff',
    borderRadius: '5px',
    zIndex: 1000,
    textAlign: 'center',
    fontSize: '16px',
},
}

export default DemoScreen;