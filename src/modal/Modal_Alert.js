import React from "react";
import { Modal } from "react-bootstrap";
import { OneButton } from "../components";

function Modal_Alert({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=false,
  size='md',
  onClick,
  content,
  header='คำเตือน',
  variant='success'
}) {

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      size={size}
      className="loading-screen"
    >
      <Modal.Header closeButton>
        <b>{header}</b>
      </Modal.Header>
      <Modal.Body >
        {content}
      </Modal.Body>
      <Modal.Footer>
          <OneButton {...{ text:'ยกเลิก', variant:"secondary", submit:onHide }} />
          <OneButton {...{ text:'ยืนยัน/บันทึก', variant, submit:()=>{onHide();onClick()} }} />
      </Modal.Footer>
    </Modal>
  );
}

export default Modal_Alert;
