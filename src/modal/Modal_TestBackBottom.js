import React from "react";
import { Button, Modal } from "react-bootstrap";



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
    >
      <Modal.Header closeButton>
        <b>{header}</b>
      </Modal.Header>
      <Modal.Body >
        {content}
      </Modal.Body>
      <Modal.Footer>
          <Button onClick={onHide} variant="secondary">Cancel</Button>
          <Button onClick={()=>{onHide();onClick()}} variant={variant}>Confirm</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Modal_Alert;
