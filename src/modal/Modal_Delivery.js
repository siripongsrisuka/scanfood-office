import React from "react";
import {
  Modal,
} from "react-bootstrap";
import { FloatingText, FooterButton } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { updateDemo } from "../redux/careSlice";

function Modal_Delivery({
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
    const { delivery } = demo;
    const { name, tel, map } = delivery;

    function handleChange(event){
        event.preventDefault();
        const { name, value } = event.target;
        const newDemo = {...demo,delivery:{...delivery,[name]:value}}
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
        <h2><b>ส่ง delivery</b></h2>
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
            <FloatingText
              name='map'
              placeholder="map"
              value={map}
              onChange={handleChange}
            />
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

export default Modal_Delivery;
