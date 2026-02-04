import React from "react";
import {
  Modal,
  Row,
  Col,
  Image
} from "react-bootstrap";
import { FloatingArea, FloatingText } from "../components";

function Modal_Question({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  current,
  submit
}) {
    const { question, answer, imageUrls = [], guideline } = current;

    function handleSubmit(){
        const ok = window.confirm('คุณแน่ใจหรือไม่ที่จะคัดลอกและดันการเจอปัญหานี้?');
        if(!ok) return;
        submit(current);
    }

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
            disabled={true}
        />
        <FloatingArea
            name="คำตอบ"
            placeholder="คำตอบ"
            value={answer}
            disabled={true} 
            height='150px'
        />
        {guideline && <div style={{ border:'1px solid black', padding:10 , borderRadius:5 }} onClick={handleSubmit} >
          {guideline.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
          </div>}
        <Row>
            {imageUrls.map((url,index)=>(
                <Col key={index} xs={12} sm={6} md={4} lg={3} style={{marginBottom:10}}>
                    {/* <img src={url} alt="question" style={styles.image} /> */}
                    <Image style={styles.image} src={url} />
                </Col>
            ))}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

const styles = {
    image : {
      width: '250px',
        objectFit:'contain',
      borderRadius: 10,
      border: '1px solid #ccc',
      cursor: 'pointer'
    },
}

export default Modal_Question;
