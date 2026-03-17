import React, { useState, useMemo } from "react";
import {
  Modal,
  Row,
  Col,
  Form,
  Table
} from "react-bootstrap";
import { DeleteButton, FloatingArea, FloatingText, FooterButton, InputArea, InputText, OneButton, RedStar } from "../components";
import { colors, initialAlert, initialChannel, initialNote, initialProcess, initialProvince, initialStoreSize } from "../configs";
import Modal_Alert from "./Modal_Alert";
import { onlyNumberValue2 } from "../Utility/function";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import Modal_FlatListTwoColumn from "./Modal_FlatListTwoColumn";
import initialShopType from "../configs/initialShopType";

const { softWhite, darkGray, dark } = colors;


const positionOptions = ['owner','manager']

function Modal_Lead({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='xl',
  submit,
  setCurrent,
  current,
  disabled=false,
}) {
    const { id, name, tel, province, note = [], channel, storeSize, contactPosition, shopType, process, shopId } = current;
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;


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
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />

      <Modal.Header closeButton>
        <h2><b>จัดการ ลูกค้า</b></h2>
      </Modal.Header>

      <Modal.Body style={{maxHeight:'70vh',overflow:'auto'}} >
            <FloatingText
                name={'name'}
                placeholder="Contact"
                value={name}
                onChange={(event)=>{setCurrent(prev=>({...prev,name:event.target.value}))}}
            />
             <FloatingText
                name={'tel'}
                placeholder="เบอร์ติดต่อ"
                value={tel}
                onChange={(event)=>{setCurrent(prev=>({...prev,tel:event.target.value}))}}
            />
            <FloatingArea
                name="note"
                placeholder="โน๊ต"
                value={note}
                onChange={(event)=>{setCurrent(prev=>({...prev,note:event.target.value}))}}
            />
            <Form.Select 
                aria-label="Default select example" 
                value={process} 
                onChange={(event)=>{
                event.preventDefault()
                if(event.target.value!==process){
                    setCurrent({
                        ...current,
                        process:event.target.value,
                    })
                }
                }}
                style={styles.container} 
            >
                <option value="" disabled>ความคืบหน้า</option>
                {initialProcess.map((item,index)=>{
                    return <option key={index} value={item.id}>{item.name}</option>
                })}
            </Form.Select>
            <br/>
            <Form.Select 
                aria-label="Default select example" 
                value={storeSize} 
                onChange={(event)=>{
                event.preventDefault()
                if(event.target.value!==storeSize){
                    if(shopId){
                        alert('ผูก ShopId ไปแล้ว แก่จำนวนโต๊ะไม่ได้')
                    } else {
                        setCurrent({
                            ...current,
                            storeSize:event.target.value,
                        })
                    }
                }
                }}
                style={styles.container} 
            >
                <option value="" disabled>เลือกขนาดโต๊ะ</option>
                {initialStoreSize.map((item,index)=>{
                    return <option disabled={Boolean(shopId)} key={index} value={item.value}>โต๊ะ : {item.value}</option>
                })}
            </Form.Select>
            <br/>
            <Form.Select 
                aria-label="Default select example" 
                value={shopType} 
                onChange={(event)=>{
                event.preventDefault()
                if(event.target.value!==shopType){
                    setCurrent({
                        ...current,
                        shopType:event.target.value,
                    })
                }
                }}
                style={styles.container} 
            >
                <option value="" disabled>ประเภทร้าน</option>
                {initialShopType.map((item,index)=>{
                    return <option key={index} value={item.id}>{item.name}</option>
                })}
            </Form.Select>
            <br/>
            <Form.Select 
                aria-label="Default select example" 
                value={province} 
                onChange={(event)=>{
                event.preventDefault()
                if(event.target.value!==province){
                    setCurrent({
                        ...current,
                        province:event.target.value,
                    })
                }
                }}
                style={styles.container} 
            >
                <option value="" disabled>เลือกจังหวัด</option>
                {initialProvince.map((item,index)=>{
                    return <option key={index} value={item.id}>{item.name_th}</option>
                })}
            </Form.Select>
            <br/>
            <Form.Select 
                aria-label="Default select example" 
                value={channel} 
                onChange={(event)=>{
                event.preventDefault()
                if(event.target.value!==channel){
                    setCurrent({
                        ...current,
                        channel:event.target.value,
                    })
                }
                }}
                style={styles.container} 
            >
                <option value="" disabled>เลือกช่องทางได้ Lead</option>
                {initialChannel.map((item,index)=>{
                    return <option key={index} value={item}>{item}</option>
                })}
            </Form.Select>
            <br/>
            <Form.Select 
                aria-label="Default select example" 
                value={contactPosition} 
                onChange={(event)=>{
                event.preventDefault()
                if(event.target.value!==contactPosition){
                    setCurrent({
                        ...current,
                        contactPosition:event.target.value,
                    })
                }
                }}
                style={styles.container} 
            >
                <option value="" disabled>ตำแหน่งผู้ติดต่อ</option>
                {positionOptions.map((item,index)=>{
                    return <option key={index} value={item}>{item}</option>
                })}
            </Form.Select>
      </Modal.Body>
      {disabled
        ?<Modal.Footer>
            <OneButton
                text={'ปิด'}
                variant={'secondary'}
                submit={onHide}
            />
        </Modal.Footer>
        :<FooterButton {...{ onHide, submit }} />
        }
        
      
    </Modal>
  );
};

const styles = {
    container : {
        minWidth:'200px'
    },
    container2 : {
        width:'10%', minWidth:'80px', textAlign:'center'
    },
    container3 : {
        width:'30%', minWidth:'120px', textAlign:'center'
    }
}

export default Modal_Lead;
