import React from "react";
import {
  Modal,
} from "react-bootstrap";
import { FloatingArea, FloatingText, FooterButton } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { updateDemo } from "../redux/careSlice";

function Modal_Postcode({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
}) {
    const dispatch = useDispatch()
    const { demo } = useSelector(state=>state.care)
    const { postcode } = demo;
    const { name, tel, address, email, map } = postcode;

    function handleChange(event){
        event.preventDefault();
        const { name, value } = event.target;
        const newDemo = {...demo,postcode:{...postcode,[name]:value}}
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
    >
   
      <Modal.Header closeButton>
        <h2><b>ที่อยู่จัดส่ง</b></h2>
      </Modal.Header>

      <Modal.Body >
            <FloatingText
              name='name'
              placeholder="name"
              value={name}
              onChange={handleChange}
            />
            <FloatingText
              name='tel'
              placeholder="เบอร์ติดต่อ"
              value={tel}
              onChange={handleChange}
            />
            <FloatingArea
              name='address'
              placeholder="ที่อยู่"
              value={address}
              onChange={handleChange}
            />
            <FloatingText
              name='email'
              placeholder="email"
              value={email}
              onChange={handleChange}
            />
            {/* <FloatingText
              name='map'
              placeholder="map"
              value={map}
              onChange={handleChange}
            /> */}
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

export default Modal_Postcode;
