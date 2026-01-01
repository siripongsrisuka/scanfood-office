import React from "react";
import { Modal } from "react-bootstrap";
// import '../styles/ShopListScreen.css'
import * as checksymbol from '../checksymbol.json'
import '../App.css'


import Lottie from "react-lottie";

function Modal_Success({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  content='บันทึกสำเร็จ'
}) {

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: checksymbol.default,
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
      className="loading-screen-transparent"
      fullscreen={true}
    >
      <Modal.Body style={styles.container}  >
          <Lottie options={defaultOptions} height={200} width={200} />
          {content}
      </Modal.Body>
      
   
    </Modal>
  );
};

const styles = {
    container : {
      // display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',zIndex:999
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }
}

export default Modal_Success;

