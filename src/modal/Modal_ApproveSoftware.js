import React, { useState } from "react";
import {
  Modal,
  Row,
  Col
} from "react-bootstrap";
import { colors, initialAlert } from "../configs";
import Modal_Alert from "./Modal_Alert";
import { OneButton } from "../components";

const { white, softWhite, five, one } = colors;

function Modal_ApproveSoftware({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  masterPackage,
  handleCancelSoftware,
  handleApproveSoftware,
  currentSoftware
}) {
    const { orderNumber, shopName, profileName, imageId, net,  packageId, tel, timestamp } = currentSoftware;
    const packageName = masterPackage.filter(a=>packageId.includes(a.id)).map(b=>b.content).join('/\n');
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      size={size}
    >
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
      <Modal.Header closeButton>
        <h2><b>อนุมัติแพ็กเกจ</b></h2>
      </Modal.Header>

      <Modal.Body >
            <div style={{backgroundColor:white,borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)',padding:10,margin:10}} >
                <h6>เลขที่ใบสั่งซื้อ : {orderNumber}</h6>
                <h6>ร้าน : {shopName}</h6>
                <h6>ชื่อผู้ชื่อ : {profileName}</h6>
                <h6>tel : {tel}</h6>
                <div style={{minHeight:'70px',padding:10,backgroundColor:softWhite,borderRadius:10}} >
                    <h6>รายการสั่งซื้อ : {packageName}</h6>
                </div>
                <h6>ยอดชำระ : {net}</h6>
                <Row>
                    <Col md='4' >
                        <OneButton {...{ text:'ยกเลิกออเดอร์', submit:()=>{setAlert_Modal({ status:true, content:`ยกเลิกออเดอร์`, onClick:()=>{setAlert_Modal(initialAlert);handleCancelSoftware(currentSoftware)}, variant:'danger' })}, variant:'danger' }} />
                    </Col>
                    <Col md='4' >
                        <OneButton {...{ text:'ยกเลิกไม่แจ้งเตือน', submit:()=>{setAlert_Modal({ status:true, content:`ยกเลิกออเดอร์`, onClick:()=>{setAlert_Modal(initialAlert);handleCancelSoftware({...currentSoftware, noti:false })}, variant:'warning' })}, variant:'warning' }} />
                    </Col>
                    <Col md='4' >
                        <OneButton {...{ text:'อนุมัติออเดอร์', submit:()=>{setAlert_Modal({ status:true, content:`อนุมัติออเดอร์`, onClick:()=>{setAlert_Modal(initialAlert);handleApproveSoftware(currentSoftware)}, variant:'success' })}, variant:'success' }} />
                    </Col>
                </Row>
                <div style={{display:'flex',justifyContent:'center'}} >
                    <img style={{width:'90%',height:undefined,aspectRatio:3/4, maxWidth:'250px'}} src={imageId}  />
                </div>
            </div>
      </Modal.Body>
    </Modal>
  );
};

export default Modal_ApproveSoftware;
