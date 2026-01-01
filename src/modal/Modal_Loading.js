import React from "react";
import { Modal } from "react-bootstrap";
import * as loadingData from "../loading.json";

import Lottie from "react-lottie";
import '../App.css'

function Modal_Loading({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
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
    // <Modal
    //   backdrop={backdrop}
    //   animation={animation}
    //   show={show}
    //   onHide={onHide}
    //   centered={centered}
    //   className='loading-screen'
    // //   size={size}
    // >
    //   <Modal.Body style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',zIndex:999}}  >
    //       <Lottie options={defaultOptions} height={140} width={140} />
    //       Loading...
    //   </Modal.Body>
      
   
    // </Modal>
    <Modal
  backdrop={backdrop}
  animation={animation}
  show={show}
  onHide={onHide}
  centered={centered}
  className="loading-screen-transparent"
  fullscreen={true}
>
  <Modal.Body
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      // zIndex: 999,
      // backgroundColor: 'transparent',
      // padding: 0,            // Remove padding
      // margin: 0,             // Remove margin
      // minHeight: '100vh',       // Ensure full height
      // minWidth: '100vw',        // Ensure full width
    }}
  >
    <Lottie options={defaultOptions} height={200} width={200} />
    {/* <img style={{width:'200px'}} src='https://media.tenor.com/ObHyxniPeZ4AAAAM/inkwaruntorn.gif' /> */}
  </Modal.Body>
</Modal>
  );
}

export default Modal_Loading;

