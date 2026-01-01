import React, { useState } from "react";
import {
  Modal,
  Form
} from "react-bootstrap";
import { DeleteButton, FloatingArea, FloatingText, FooterButton } from "../components";
import Modal_Alert from "./Modal_Alert";
import { initialAlert } from "../configs";

function Modal_Card({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
  current,
  setCurrent,
  deleteItem
}) {
    const {  id, name, content:cardContent, type = 'sequence', link } = current;


    function handleChange(event){
        event.preventDefault();
        const { name, value } = event.target;
        const newCurrent = {...current,[name]:value}
        setCurrent(newCurrent)
    };

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
    >
   
      <Modal.Header closeButton>
        <h2><b>จัดการ Card</b></h2>
      </Modal.Header>

      <Modal.Body >
            <Modal_Alert
                show={status}
                onHide={()=>{setAlert_Modal(initialAlert)}}
                content={content}
                onClick={onClick}
                variant={variant}
            />
            <FloatingText
              name='name'
              placeholder="name"
              value={name}
              onChange={handleChange}
            />
            <FloatingArea
              name='content'
              placeholder="รายละเอียด"
              value={cardContent}
              onChange={handleChange}
            />
            <Form.Select 
                aria-label="Default select example" 
                value={type} 
                onChange={(event)=>{setCurrent(prev=>({...prev,type:event.target.value}))}}
                style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
            >
                <option value='' disabled >เลือก type</option>
                <option  value='problem' >ปัญหา</option>
                <option  value='sequence' >ตัวเลือก</option>
                <option  value='question' >คำถาม</option>
                <option  value='answer' >คำตอบ</option>
                <option  value='solution' >ทางออก</option>
     
            
            </Form.Select>
            <FloatingText
                name='link'
                placeholder="link"
                value={link}
                onChange={handleChange}
            />
            {id
                ?<DeleteButton {...{ text:'ลบรายการ', submit:()=>{setAlert_Modal({ status:true, content:`ลบ ${name}`, onClick:()=>{setAlert_Modal(initialAlert);deleteItem(id)}, variant:'danger'})} }} />
                :null
            }
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

export default Modal_Card;
