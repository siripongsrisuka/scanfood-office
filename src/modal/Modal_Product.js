import React from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { OneButton } from "../components";

function Modal_Product({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  size='lg',
  value
}) {


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      // centered={centered}
      className='loading-screen'
      size={size}
    >
      <Modal.Header closeButton>
        <h3>รายการอาหาร</h3>
      </Modal.Header>
      <Modal.Body style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',zIndex:999}}  >
        <h4>รายการอาหาร : {value.length}</h4>
        <Row style={{height:'50vh',overflow: 'auto'}} >
            {value.map((item)=>{
                return <Col  md='4' xs='6' >
                    <img style={{width:'100%'}} src={item.imageId} />
                    {item.name}
                    {item.price[0].price}
                </Col>
            })}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <OneButton {...{ text: "ยืนยัน", submit:onHide, variant:'secondary' }} />
      </Modal.Footer>
    </Modal>
  );
}

export default Modal_Product;