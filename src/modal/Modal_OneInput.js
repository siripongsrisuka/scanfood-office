import React from "react";
import { Button, Modal } from "react-bootstrap";
import { FloatingArea, FloatingText, FooterButton } from "../components";

function Modal_OneInput({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  header,
  onChange,
  value,
  placeholder='ตั้งชื่อหมวดหมู่สินค้า',
  onClick,
  color='danger',
  area = false
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
        <h3>{header}</h3>
      </Modal.Header>
      <Modal.Body style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',zIndex:999}}  >
        
        {area
          ?<FloatingArea
              name={placeholder}
              placeholder={placeholder}
              onChange={(event)=>{onChange(event.target.value)}}
              value={value}
          />
          :<FloatingText
            name={placeholder}
            placeholder={placeholder}
            onChange={(event)=>{onChange(event.target.value)}}
            value={value}
        />
        }
        
      </Modal.Body>
      <FooterButton {...{ onHide, submit:onClick }} />
    </Modal>
  );
}

export default Modal_OneInput;