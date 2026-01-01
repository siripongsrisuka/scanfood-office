import React, { useState } from "react";
import {
  Col,
  Modal,
} from "react-bootstrap";
import { DeleteButton, FooterButton, InputText } from "../components";
import Modal_Alert from "./Modal_Alert";
import { initialAlert } from "../configs";

function Modal_Sbs({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
  current,
  setCurrent,
  deleteSbs
}) {
    const { name, link, leftText, rightText, id } = current;
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
    //   fullscreen={true}
    >
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
      <Modal.Header closeButton>
        <h2><b>จัดการหัวข้อ</b></h2>
      </Modal.Header>

      <Modal.Body >
        <Col sm='12'>
            <InputText
              name='ชื่อหัวข้อ'
              placeholder="ชื่อหัวข้อ"
              onChange={(event)=>{setCurrent({...current,name:event.target.value})}}
              value={name}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='ข้อความด้านซ้าย'
              placeholder="ข้อความด้านซ้าย"
              onChange={(event)=>{setCurrent({...current,leftText:event.target.value})}}
              value={leftText}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='ข้อความด้านขวา'
              placeholder="ข้อความด้านขวา"
              onChange={(event)=>{setCurrent({...current,rightText:event.target.value})}}
              value={rightText}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='Link Youtube'
              placeholder=""
              onChange={(event)=>{setCurrent({...current,link:event.target.value})}}
              value={link}
            />
        </Col>
        {id
            ?<DeleteButton {...{ text:'ลบหัวข้อ', submit:()=>{setAlert_Modal({ status:true, content:`ลบ ${name}`, onClick:()=>{setAlert_Modal(initialAlert);deleteSbs(id)}, variant:'danger' })} }} />
            :null
        }
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

export default Modal_Sbs;
