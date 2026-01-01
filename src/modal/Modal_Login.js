import React from "react";
import {
  Modal,
  Form,
} from "react-bootstrap";
import { FooterButton } from "../components";

function Modal_Login({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  handleFormChange,
  formData,
  checkRegisterUser
}) {

    function check(){
        if(formData.email&&formData.password){
            checkRegisterUser()
        } else {
            alert('กรุณาใส่ข้อมูลให้ครบถ้วน')
        }
    }


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
        <h2><b>เข้าสู่ระบบ</b></h2>
      </Modal.Header>

      <Modal.Body >
            <Form.Floating className="mb-3" style={{width:'100%'}} >
                <Form.Control
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    onChange={handleFormChange}
                />
                <label >อีเมล</label>
            </Form.Floating>
            <Form.Floating className="mb-3" style={{width:'100%'}} >
                <Form.Control
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleFormChange}
                />
                <label >รหัสผ่าน</label>
            </Form.Floating>
      </Modal.Body>
      <FooterButton {...{ onHide, submit:check }} />
    </Modal>
  );
};

export default Modal_Login;
