import React from "react";
import { Button, Modal, Row, Col } from "react-bootstrap";
import { FloatingText, FooterButton } from "../components";
import { stringDateTimeReceipt, stringYMDHMS3 } from "../Utility/dateTime";
import { colors } from "../configs";
import { summary } from "../Utility/function";

const { softWhite, white } = colors;

function Modal_Information({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  info,
  setInfo,
  submit,
}) {
    const { name, tel, note, shopTel} = info;

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      className='loading-screen'
      // fullscreen={true}
      size={'lg'}
    >
      <Modal.Header closeButton>
        <h3>ข้อมูลติดต่อ</h3>
      </Modal.Header>
      <Modal.Body   >
        <h6>เบอร์โทรร้าน : {shopTel}</h6>
        <FloatingText
            name='ชื่อผู้ติดต่อ'
            placeholder='ชื่อผู้ติดต่อ'
            onChange={(event)=>{setInfo({...info,name:event.target.value})}}
            value={name}
        />
        <FloatingText
            name='เบอร์โทร'
            placeholder='เบอร์โทร'
            onChange={(event)=>{setInfo({...info,tel:event.target.value})}}
            value={tel}
        />
        <FloatingText
            name='โน๊ต'
            placeholder='โน๊ต'
            onChange={(event)=>{setInfo({...info,note:event.target.value})}}
            value={note}
        />
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

const styles = {
  container : {
    backgroundColor:white
  }
}

export default Modal_Information;