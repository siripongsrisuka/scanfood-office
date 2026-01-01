import React from "react";
import { Modal, Image } from "react-bootstrap";
import '../styles/ShopListScreen.css';


function Modal_Picture({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  picture
}) {


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
            <h2>หลักฐานชำระเงิน</h2>
        </Modal.Header>
      <Modal.Body style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',zIndex:999}}  >
          <Image style={{width:'100%'}} src={picture} />
      </Modal.Body>
      
   
    </Modal>
  );
}

export default Modal_Picture;

