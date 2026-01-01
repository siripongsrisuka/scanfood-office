import React from "react";
import {
  Col,
  Modal,
} from "react-bootstrap";
import { FooterButton, InputArea, InputText } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { updateDemo } from "../redux/careSlice";

function Modal_Tax({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit
}) {
    const dispatch = useDispatch()
    const { demo } = useSelector(state=>state.care)
    const { tax } = demo;
    const { name, tel, address, taxNumber, branch, fax } = tax;

    function handleChange(event){
        event.preventDefault();
        const { name, value } = event.target;
        const newDemo = {...demo,tax:{...tax,[name]:value}}
        dispatch(updateDemo(newDemo))
    };

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      size={size}
    //   fullscreen={true}
    >
    
      <Modal.Header closeButton>
        <h2><b>ข้อมูลภาษี</b></h2>
      </Modal.Header>

      <Modal.Body >
        <Col sm='12'>
            <InputText
              name='name'
              placeholder="name"
              onChange={handleChange}
              value={name}
              strict={true}
            />
        </Col>
        <Col sm='12'>
            <InputArea
              name='address'
              placeholder="address"
              onChange={handleChange}
              value={address}
              strict={true}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='tel'
              placeholder="tel"
              onChange={handleChange}
              value={tel}
              strict={true}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='fax'
              placeholder="fax"
              onChange={handleChange}
              value={fax}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='taxNumber'
              placeholder="taxNumber"
              onChange={handleChange}
              value={taxNumber}
              strict={true}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='branch'
              placeholder="branch"
              onChange={handleChange}
              value={branch}
              strict={true}
            />
        </Col>
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

const styles = {
    container : {
        marginBottom:'1rem'
    },
}
export default Modal_Tax;
