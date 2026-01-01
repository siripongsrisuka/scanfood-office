import React from "react";
import { Button, Modal } from "react-bootstrap";

function Modal_Confirm({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=false,
  size='md',
  onClick,
  content='ยืนยัน',
  color='danger'
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
        <h2>Confirm</h2>
      </Modal.Header>
      <Modal.Body >
        {content}
      </Modal.Body>
      <Modal.Footer>
          <Button onClick={onHide} variant="secondary">Cancel</Button>
          <Button onClick={onClick} variant={color}>Confirm</Button>
    </Modal.Footer>
    </Modal>
  );
}

export default Modal_Confirm;
