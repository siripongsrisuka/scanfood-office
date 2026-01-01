// import React, { useContext } from "react";
// import { Container, Row, Col, Button, Modal, Card } from "react-bootstrap";
// import CropImage from "../components/CropImage";



// function Modal_NewCrop({
//   backdrop='static', // true/false/static
//   animation=true,
//   show,
//   onHide,
//   centered=false,
//   size='lg',
//   onClick,
//   name,
//   ratio=4/1
// }) {


//   return (
//     <Modal
//       backdrop={backdrop}
//       animation={animation}
//       show={show}
//       onHide={onHide}
//       centered={centered}
//       size={size}
//     >
//       <Modal.Header closeButton>
//         ครอปรูปที่ต้องการ
//       </Modal.Header>
//       <Modal.Body >
//         <CropImage onClick={onClick} onHide={onHide} ratio={ratio} />
//       </Modal.Body>
//     </Modal>
//   );
// }

// export default Modal_NewCrop;


import React, { useContext } from "react";
import { Container, Row, Col, Button, Modal, Card } from "react-bootstrap";
import CropImage from "../components/CropImage";



function Modal_NewCrop({
  backdrop='static', // true/false/static
  animation=true,
  show,
  onHide,
  centered=false,
  size='lg',
  onClick,
  name,
  ratio=1,
  imgSrc
}) {


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
        ครอปรูปที่ต้องการ
      </Modal.Header>
      <Modal.Body >
        <CropImage onClick={onClick} onHide={onHide} ratio={ratio} imgSrc={imgSrc} />
      </Modal.Body>
    </Modal>
  );
}

export default Modal_NewCrop;

