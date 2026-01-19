import React from "react";
import {
  Col,
  Modal,
} from "react-bootstrap";
import { FooterButton, InputText } from "../components";
import { twoDigitNumber, } from "../Utility/function";

function Modal_Stock({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
  current,
  setCurrent,
}) {
    const { name, safetyStock, stock } = current;

    function confirm(){
        if(!stock){
            alert('กรุณาใส่สต๊อกคงเหลือ')
        } {
            submit()
        }
    }




  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      fullscreen='lg'
    //   fullscreen={true}
      size={size}
    >

      <Modal.Header closeButton>
        <h2><b>{name}</b></h2>
      </Modal.Header>
      <Modal.Body  >
    
        <Col sm='12'>
            <InputText
              name='1. สต๊อกคงเหลือ'
              placeholder="จำนวน"
              onChange={(event)=>{setCurrent({...current,stock:twoDigitNumber(event.target.value)})}}
              value={stock}
              style={{maxWidth:'400px'}}
            />
        </Col>
       
        <Col sm='12'>
            <InputText
              name='2. สต็อกปลอดภัย'
              placeholder="จำนวน"
              onChange={(event)=>{setCurrent({...current,safetyStock:twoDigitNumber(event.target.value)})}}
              value={safetyStock}
              style={{maxWidth:'400px'}}
            />
        </Col>
      </Modal.Body>
      <FooterButton {...{ onHide, submit:confirm }} />
    </Modal>
  );
};

export default Modal_Stock;
