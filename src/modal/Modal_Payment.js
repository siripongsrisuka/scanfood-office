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

const { white, softWhite, five, one } = colors;

const ThaiQrCard = ({ promptPayQrString, amount = 6000 }) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>THAI QR PAYMENT</div>

      <div style={styles.body}>

        {/* === IMAGE BACKGROUND + QR OVERLAY === */}
        <div style={styles.imageWrapper}>
          {/* background image */}
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT96xu3mYue2a_kgRf3Z66OVHmKNaaKeG6Mjg&s"
            style={styles.image}
            alt="bg"
          />

          {/* QR overlay */}
          <div style={styles.qrOverlay}>
            <QRCodeSVG
              value={promptPayQrString}
              size={160}
              level="M"
              bgColor="transparent"
            />
          </div>
        </div>

        {/* amount */}
        <h6 style={styles.amount}>
          {Number(amount).toLocaleString("th-TH")} บาท
        </h6>
      </div>
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
}) {
    const cardRef = useRef(null);
    const promptPayQrString = '1319800140196';

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
        <h2><b>อนุมัติแพ็กเกจ</b></h2>
      </Modal.Header>

      <Modal.Body >
        <div ref={cardRef}>
            <ThaiQrCard
            promptPayQrString="000201010212..."
            amount={6000}
            />
        </div>
        <OneButton {...{ text:'บันทึก', submit:()=>{captureImage()} }} />
      </Modal.Body>
    </Modal>
  );
};

const styles = {
  wrapper: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    fontFamily: "sans-serif",
  },

  header: {
    backgroundColor: "#0B4C82",
    color: "#fff",
    padding: 12,
    textAlign: "center",
    fontWeight: "bold",
  },

  body: {
    padding: 16,
    textAlign: "center",
  },

  imageWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: 300,
    margin: "0 auto",
  },

  image: {
    width: "100%",
    aspectRatio: "3 / 4",
    objectFit: "contain",
    display: "block",
  },

  qrOverlay: {
    position: "absolute",
    top: "32%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 8,
  },

  amount: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "bold",
  },
};

export default Modal_Payment;
