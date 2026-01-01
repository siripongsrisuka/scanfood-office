import React from "react";
import { Modal } from "react-bootstrap";
import * as loadingData from "../loading.json";

import Lottie from "react-lottie";
import '../App.css'

function Modal_Splash({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
}) {

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingData.default,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };


  return (
    <Modal
        backdrop={backdrop}
        animation={animation}
        show={show}
        onHide={onHide}
        centered={centered}
        fullscreen={true}
    >
  <Modal.Body
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Lottie options={defaultOptions} height={200} width={200} />
  </Modal.Body>
</Modal>
  );
}

export default Modal_Splash;

