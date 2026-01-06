import React, { useRef } from "react";
import {
  Modal,
  Row,
  Col
} from "react-bootstrap";
import { colors, initialAlert } from "../configs";
import Modal_Alert from "./Modal_Alert";
import { OneButton } from "../components";
import QRCode, { QRCodeSVG } from 'qrcode.react';
import html2canvas from "html2canvas";
import { formatCurrency } from "../Utility/function";

const { white, softWhite, five, one } = colors;

const ThaiQrCard = ({ promptPayQrString, amount = 6000 }) => {
  return (
     <div style={styles.imageWrapper}>
          {/* background image */}
          <img
            src="/frame.jpg" 
            style={styles.image}
            alt="bg"
          />

          {/* QR overlay */}
          <div style={styles.qrOverlay}>
            <QRCodeSVG
              value={promptPayQrString}
              size={140}
              level="M"
              bgColor="transparent"
            />
          </div>
           <h6 style={styles.amount}>
            {formatCurrency(Number(amount))}
            </h6>
        </div>
  );
};

function Modal_Payment({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  qrCode,
  amount
}) {
    const cardRef = useRef(null);

    const captureImage = async () => {
        const canvas = await html2canvas(cardRef.current, {
            scale: 3,              // สำคัญมาก: ความคม
            useCORS: true,
            backgroundColor: null, // โปร่งใส (ถ้าต้องการ)
        });

        // === แบบที่ 1: download เป็นไฟล์ ===
        const link = document.createElement("a");
        link.download = "thai-qr.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

        // === แบบที่ 2: เอา base64 ไปใช้ต่อ ===
        const base64 = canvas.toDataURL("image/png");
        console.log(base64);
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
        <h2><b>QRCode ชำระเงิน</b></h2>
      </Modal.Header>

      <Modal.Body style={{ display:'flex', flexDirection:'column', alignItems:'center' }} >
        <div ref={cardRef}>
            <ThaiQrCard
            promptPayQrString={qrCode}
            amount={amount}
            />
        </div>
        <OneButton {...{ text:'บันทึก', submit:()=>{captureImage()} }} />
      </Modal.Body>
    </Modal>
  );
};

const styles = {
  imageWrapper: {
    position: "relative",
    // width: "100%",
    // maxWidth: 300,
    margin: "0 auto",
    width:'300px'
  },

  image: {
    width: "100%",
    aspectRatio: "3 / 4",
    objectFit: "contain",
    display: "block",
  },

  qrOverlay: {
    position: "absolute",
    top: "42%",
    // top: "32%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 8,
  },

  amount: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "bold",
    position: "absolute",
    top: "59%",
    // top: "32%",
    right: "14%",
    // left: "75%",

    // transform: "translate(-50%, -50%)",
  },
};

export default Modal_Payment;
