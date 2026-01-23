import React from "react";
import {
  Modal,
} from "react-bootstrap";
import { FloatingText, FooterButton } from "../components";

function Modal_Email({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='md',
  submit,
  current,
  setCurrent
}) {
    const { shopName, email } = current;

    function confirm(){
      if(!shopName) return alert('กรุณาเลือกร้านค้า');
      if(!email) return alert('กรุณาใส่อีเมล');
      const ok = window.confirm(`ยืนยันการส่งอีเมล ใช่หรือไม่ ?`);
      if(!ok) return;
      submit();
      close()
    };

    function close(){
      onHide()
    };


    function handleChange(e){
        const { name, value } = e.target;
        setCurrent({ ...current, [name]:value })
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
      <Modal.Header closeButton>
        <h2><b>ส่งอีเมล</b></h2>
      </Modal.Header>

      <Modal.Body  >
            <FloatingText
                name='shopName'
                placeholder="ชื่อร้านค้า"
                value={shopName}
                onChange={handleChange}
            />
            <FloatingText
                name='email'
                placeholder="อีเมล"
                value={email}
                onChange={handleChange}
            />
     
           
      </Modal.Body>
      <FooterButton {...{ onHide: close, submit: confirm }} />
    </Modal>
  );
};

export default Modal_Email;
