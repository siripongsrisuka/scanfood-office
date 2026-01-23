import React from "react";
import {
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { FloatingArea, FloatingText } from "../components";

function Modal_Question({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  current,
}) {
    const { question, answer, imageUrls = [] } = current;

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
       className="loading-screen"
       fullscreen
    >
      <Modal.Header closeButton>
        <h2><b>ชุดคำถาม - คำตอบ</b></h2>
      </Modal.Header>
      <Modal.Body  >
        <FloatingText
            text="คำถามที่พบบ่อย (FAQ)"
            placeholder="คำถามที่พบบ่อย (FAQ)"
            value={question}
        />
        <FloatingArea
            name="คำตอบ"
            placeholder="คำตอบ"
            value={answer}
        />
        <Row>
            {imageUrls.map((url,index)=>(
                <Col key={index} xs={12} sm={6} md={4} lg={3} style={{marginBottom:10}}>
                    <img src={url} alt="question" style={styles.image} />
                </Col>
            ))}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

const styles = {
    image : {
      width:'100%',maxWidth:300,minWidth:150,height:undefined,aspectRatio:1 , objectFit: 'cover'
    },
}

export default Modal_Question;
