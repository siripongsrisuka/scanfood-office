import React from "react";
import { Row, Col, Button, Modal } from "react-bootstrap";
import '../App.css'
import { FooterButton } from "../components";

function Modal_FlatlistSelected({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  header='เลือกรายการ',
  onClick,
  selected,
  display,
  submit
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
        <h4><b>{header}</b></h4>
      </Modal.Header>
      <Modal.Body style={styles.container3} >
        <h4>ค้นพบ {display.length} รายการ</h4>
        <Row style={styles.container4} >
            {display?.map((item,index)=>{
                const status = selected.includes(item)
                return(
                  <Col key={index} sm='12' md='6'  style={styles.container} >
                    <Button onClick={()=>{onClick(item)}} variant={status?'dark':'light'} style={styles.container2} >
                      {item}
                    </Button>
                  </Col>
                )
            })}
        </Row>
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

const styles = {
    container : {
      display:'flex',justifyContent:'center',cursor:'pointer'
    },
    container2 : {
      margin:'0.5rem',padding:'1rem',borderRadius:'1rem',width:'100%'
    },
    container3 : {
      minHeight:'55vh',maxHeight:'55vh'
    },
    container4 : {
      overflowY: 'auto',maxHeight:'45vh'
    }
}

export default Modal_FlatlistSelected;
