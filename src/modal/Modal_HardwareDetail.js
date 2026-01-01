import React from "react";
import { Modal } from "react-bootstrap";
import '../styles/ShopListScreen.css';
import { FooterButton } from "../components";
import { colors, initialHardware } from "../configs";

const { softWhite } = colors;

function Modal_HardwareDetail({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  current
}) {
    const { orderNumber, product } = {...initialHardware,...current};

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      // centered={centered}
      className='loading-screen'
    //   size={size}
    >
        <Modal.Header closeButton>
            <h2>คำสั่งซื้อ : {orderNumber}</h2>
        </Modal.Header>
      <Modal.Body   >
          {product.map((item,index)=>{
            return <div key={index} style={{padding:10,margin:5,borderRadius:20,backgroundColor:softWhite}} >
                        <h6>{item.qty} x {item.name}</h6>
                    </div>
          })}
      </Modal.Body>
      <FooterButton {...{ onHide, submit:onHide }} />
      
   
    </Modal>
  );
}

export default Modal_HardwareDetail;

