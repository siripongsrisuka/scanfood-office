import React, { useState } from "react";
import {
  Modal,
  Form
} from "react-bootstrap";
import { initialShop } from "../configs";
import { FooterButton, OneButton } from "../components";
import Modal_FlatlistSearchShop from "./Modal_FlatlistSearchShop";

const reasonOptions = [
    { label:'ขอเพิ่ม 3 วัน (ลูกค้าทดลองใช้งานแล้ว แต่ยังไม่ครบ)'},
    { label:'ขอเพิ่ม 3 วัน (ลูกค้าติดธุระ แต่รับปากว่า 3 วันนี้จะซื้อ)' },
    { label:'เร่งปิดในสาย'},
    { label:'ขอแถม 1 เดือน' },
    { label:'caseRefer' },
];

function Modal_ExtraDay({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
}) {
    const [search_Modal, setSearch_Modal] = useState(false);
    const [shop, setShop] = useState(initialShop)
    const { id:shopId, name, packageArray = [], storeSize } = shop;
    const [days, setDays] = useState('');
    const [reason, setReason] = useState('');

    function confirm(){
      if(!shopId) return alert('กรุณาเลือกร้านค้า');
      if(!days) return alert('กรุณาเลือกจำนวนวัน');
      const ok = window.confirm(`ยืนยันการขอวันใช้งานเพิ่ม ${days} วัน สำหรับร้าน ${name} ?`)
      if(!ok) return;
      submit({
        shopId,
        shopName:name,
        days:Number(days),
        packageArray,
        storeSize,
        reason,
      });
      close()
    };

    function close(){
      onHide()
      setShop(initialShop)
      setDays('')
        setReason('')
    };

    function handleShop(item){
        setSearch_Modal(false)
        setShop(item)
    }



  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={close}
      centered={centered}
      size={size}
    >
  
        <Modal_FlatlistSearchShop
            show={search_Modal}
            onHide={()=>{setSearch_Modal(false)}}
            onClick={handleShop}
        />
      <Modal.Header closeButton>
        <h2><b>ขอวันใช้งานเพิ่ม</b></h2>
      </Modal.Header>

      <Modal.Body style={styles.container4} >
            <OneButton {...{ text:'เลือกร้านค้า', submit:()=>{setSearch_Modal(true)} }} />
            <h4 style={{ marginTop:'1rem' }} >{name || 'ยังไม่เลือกร้านค้า'}</h4>

            <Form.Select 
                aria-label="Default select example" 
                value={days} 
                onChange={(event)=>{setDays(event.target.value)}}
                style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
            >
              <option value='' disabled >เลือกจำนวนวัน</option>
              {packageArray.length>0
                ?[7,14,30].map((item,index)=>{
                    return <option key={index} value={item} >{item} วัน</option>
                  })
                :[3].map((item,index)=>{
                    return <option key={index} value={item} >{item} วัน</option>
                  })
              }
              
            </Form.Select>
            <Form.Select 
                aria-label="Default select example" 
                value={reason} 
                onChange={(event)=>{setReason(event.target.value)}}
                style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
            >
              <option value='' disabled >เหตุผลที่สมควร</option>
                {reasonOptions.map((item,index)=>{
                    return <option key={index} value={item.label} >{item.label}</option>
                  })
                }
              
            </Form.Select>
     
            <br/>
           
      </Modal.Body>
      <FooterButton {...{ onHide: close, submit: confirm }} />
    </Modal>
  );
};

const styles = {
    container4 : {
      maxHeight:'70vh',minHeight:'70vh', overflowY:'auto',  margin:0, paddingTop:0
    },
}
export default Modal_ExtraDay;
