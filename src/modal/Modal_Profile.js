import React from "react";
import {
  Modal,
} from "react-bootstrap";
import { DemoPart1, FooterButton } from "../components";

function Modal_Profile({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
}) {
 

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
        <h2><b>จัดการโปรไฟล์</b></h2>
      </Modal.Header>
      <Modal.Body style={{maxHeight:'70vh',overflowY:'auto'}} >
          <DemoPart1/>
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

export default Modal_Profile;
