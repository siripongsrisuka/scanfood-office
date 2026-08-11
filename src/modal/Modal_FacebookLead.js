import React, { useState, useMemo } from "react";
import {
  Modal,
  Form,
} from "react-bootstrap";
import { FloatingText, FooterButton } from "../components";
import { initialStoreSize } from "../configs";


function Modal_FacebookLead({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='xl',
  submit,
  setCurrent,
  current,
}) {
    const { fullName = '', phone = '', contactPeriod = '', businessSize = '', email = '', source = '' } = current;

    function handleSubmit(){
        if(!fullName || !phone || !email || !contactPeriod || !businessSize || !source){
            alert('กรุณากรอกข้อมูลให้ครบถ้วน')
            return;
        }
        submit();
    }


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      size={size}
      fullscreen={true}
    >

      <Modal.Header closeButton>
        <h2><b>จัดการ ลูกค้า</b></h2>
      </Modal.Header>

      <Modal.Body style={{maxHeight:'70vh',overflow:'auto'}} >
            <FloatingText
                name={'fullName'}
                placeholder="ชื่อลูกค้า"
                value={fullName}
                onChange={(event)=>{setCurrent(prev=>({...prev,fullName:event.target.value}))}}
            />
            <FloatingText
                name={'phone'}
                placeholder="เบอร์ติดต่อ"
                value={phone}
                onChange={(event)=>{setCurrent(prev=>({...prev,phone:event.target.value}))}}
            />
            <FloatingText
                name={'email'}
                placeholder="อีเมล"
                value={email}
                onChange={(event)=>{setCurrent(prev=>({...prev,email:event.target.value}))}}
            />
            <FloatingText
                name={'เวลาที่สะดวกใช้ติดต่อ'}
                placeholder="เวลาที่สะดวกใช้ติดต่อ"
                value={contactPeriod}
                onChange={(event)=>{setCurrent(prev=>({...prev,contactPeriod:event.target.value}))}}
            />
            
            <Form.Select 
                aria-label="Default select example" 
                value={source} 
                onChange={(event)=>{
                event.preventDefault()
                    setCurrent({
                        ...current,
                        source:event.target.value,
                    })
                }}
                style={styles.container} 
            >
                <option value="" disabled>เลือกแหล่งที่มา</option>  
                <option value="facebook_engagement">Facebook ทักแชท</option>
                <option value="line_engagement">Line ทักแชท</option>
                <option value="app_engagement">App โหลดใช้เอง</option>
                <option value="facebook_call">Facebook โทรเข้าส่วนกลาง</option>
           
            </Form.Select>
                <br/>
            <Form.Select 
                aria-label="Default select example" 
                value={businessSize} 
                onChange={(event)=>{
                event.preventDefault()
                if(event.target.value!==businessSize){
                    setCurrent({
                        ...current,
                        businessSize:event.target.value,
                    })
                }
                }}
                style={styles.container} 
            >
                <option value="" disabled>เลือกขนาดโต๊ะ</option>
                {initialStoreSize.map((item,index)=>{
                    return <option  key={index} value={item.value}>โต๊ะ : {item.value}</option>
                })}
            </Form.Select>
   
      
      </Modal.Body>
      <FooterButton {...{ onHide, submit: handleSubmit }} />
      
    </Modal>
  );
};

const styles = {
    container : {
        minWidth:'200px'
    },
}

export default Modal_FacebookLead;
