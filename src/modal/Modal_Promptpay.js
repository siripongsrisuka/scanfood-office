import React from "react";
import { Button, Modal } from "react-bootstrap";
import { FloatingText } from "../components";

function Modal_Promptpay({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  current,
  submit,
  setCurrent,
}) {
    const { promptpayId, promptpayName } = current;

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      className='loading-screen'
    //   size={size}
    >
      <Modal.Header closeButton>
        <h3>ข้อมูล พร้อมเพย์</h3>
      </Modal.Header>
      <Modal.Body style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',zIndex:999}}  >
        <FloatingText
            name='หมายเลขพร้อมเพย์'
            placeholder='หมายเลขพร้อมเพย์'
            onChange={(event)=>{setCurrent({...current,promptpayId:event.target.value})}}
            value={promptpayId}
        />
        <FloatingText
            name='ชื่อพร้อมเพย์'
            placeholder='ชื่อพร้อมเพย์'
            onChange={(event)=>{setCurrent({...current,promptpayName:event.target.value})}}
            value={promptpayName}
        />
      </Modal.Body>
      <Modal.Footer>
            <Button onClick={onHide} variant="secondary">ยกเลิก</Button>
            <Button onClick={submit} variant="danger">บันทึก</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Modal_Promptpay;