import React, { useMemo, useRef } from "react";
import { Modal } from "react-bootstrap";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { OneButton } from "../components";
import { summary } from "../Utility/function";

const numberFormat = (value) => {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const RowText = ({ label, value, bold = false, color }) => {
  return (
    <div
      style={{
        ...styles.summaryRow,
        fontWeight: bold ? 700 : 400,
        color: color || "#222",
      }}
    >
      <span>{label}</span>
      <span>{numberFormat(value)}</span>
    </div>
  );
};

const ItemRow = ({ index, name, price }) => {
  return (
    <div style={styles.itemRow}>
      <div style={styles.itemIndex}>{index}</div>
      <div style={styles.itemName}>{name}</div>
      <div style={styles.itemPrice}>{numberFormat(price)}</div>
    </div>
  );
};

function formatDate(date = new Date()) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  return `${d}-${m}-${y}`;
}

const ThaiQrQuotationCard = ({
  data
}) => {
    const { logo, companyName, docNo, subtotal = 0 ,installmentFee = 0,
        card = false, deliveryFee = 0, installments = '0', vat = 0, withholdingTax = 0,
        net = 0, grandTotal = 0, date, qrCode = '', items = []
     } = data
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <img src={logo} alt="logo" style={styles.logo} />
        <div style={styles.companyName}>{companyName}</div>
        <div style={styles.docText}>
          {date} <span style={{ margin: "0 8px" }}>/</span> {docNo}
        </div>
      </div>

      <div style={styles.itemSection}>
        {items.map((item, index) => (
          <ItemRow
            key={index}
            index={index + 1}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>

      <div style={styles.divider} />

      <div style={styles.summarySection}>
        <RowText label="รวมเป็นเงิน" value={subtotal} />
        {/* <RowText label="ส่วนลด" value={discount} /> */}
        {/* <RowText label="จำนวนเงินหลังหักส่วนลด" value={afterDiscount} /> */}
        {deliveryFee>0 && <RowText label="ค่าจัดส่ง" value={deliveryFee} />}
        {card && installments ==='0' && <RowText label="ค่าบริการบัตรเครดิต" value={installmentFee} />}
        {card && installments !=='0' && <RowText label="ค่าบริการผ่อนชำระ" value={installmentFee} />}
        {vat >0 && <RowText label="ภาษีมูลค่าเพิ่ม 7%" value={vat} />}
        
        {grandTotal !==subtotal
            ?<React.Fragment>
                <div style={styles.divider} />
                <RowText label="รวมทั้งสิ้น" value={grandTotal} bold />
            </React.Fragment>
            :null
        }
        

        <div style={styles.divider} />
        {withholdingTax>0 && <RowText label="หักภาษี ณ ที่จ่าย 3%" value={withholdingTax} />}
        
        <RowText
          label="ยอดชำระ"
          value={net}
          bold
          color="#46a9d8"
        />
      </div>

      <div style={styles.divider} />

      <div style={styles.qrWrapper}>
        <div style={styles.qrBox}>
          <QRCodeSVG value={qrCode} size={220} level="M" includeMargin />
          <p>สแกนเพื่อชำระเงิน</p>
        </div>
      </div>
    </div>
  );
};

function Modal_QuotationMini({
  backdrop = true,
  animation = true,
  show,
  onHide,
  centered = true,
  size = "lg",
  payload
}) {
  const cardRef = useRef(null);

  const data = useMemo(()=>{
    const { 
        vat, 
        orderNumber,
        subtotal = 0, 
        deliveryFee = 0, 
        installmentFee = 0, 
        requestDate, 
        hardware = [], 
        software = [], 
        storeSize = 20,
        oneMonth = false,
        marketplaceFranchiseEnable = false
    } = payload;
    const companyName = vat>0
        ? "บริษัท ช็อปแชมป์ จำกัด"
        : "บริษัท สแกนฟู้ด อินโนเวชั่น จำกัด"
    const logo = vat>0
        ? "/shopchamp.webp"
        : "/scanfood.webp"
    const docNo = orderNumber || "QT2026030035";
    const grandTotal = subtotal + deliveryFee + installmentFee + vat;
    const date = formatDate(requestDate);
    const packageSize = {
        20:'S',
        50:'M',
        100:"L",
    }
    const size = packageSize[storeSize] || 'Extra';
    let name = oneMonth
        ? `Software Scanfood package (${size}) - ทดลองใช้ 1 เดือน\n`
        :marketplaceFranchiseEnable
        ?`Software Scanfood Franchise package (${size})\n`
        :`Software Scanfood package (${size})\n`
    if(software.some(a=>a.name==='POS และQR code สแกนสั่งอาหาร') && software.some(a=>a.name==='แยกสิทธิ์พนักงาน')){
        name += `   - แพ็กเกจหลัก\n`
    }
    if(software.some(a=>a.name==='POS และQR code สแกนสั่งอาหาร') && !software.some(a=>a.name==='แยกสิทธิ์พนักงาน')){
        name += `   - แพ็กเกจพื้นฐาน\n`
    }
    if(!software.some(a=>a.name==='POS และQR code สแกนสั่งอาหาร') && software.some(a=>a.name==='แยกสิทธิ์พนักงาน')){
        name += `   - แพ็กเกจแยกสิทธิ์พนักงาน\n`
    }
    const filteredSoftware = software.filter(item=>!['POS และQR code สแกนสั่งอาหาร','แยกสิทธิ์พนักงาน'].includes(item.name))
    filteredSoftware.forEach(a=>{
      name += `   - ${a.name}\n`
    })

    const softwarePrice = summary(software,'price')
    
    // Software Scanfood Franchise package 1
    const items = [{ name, price:softwarePrice }, ...hardware.map(h=>({ name:`${h.name}x${h.qty}`, price:h.net }))]
        return {
            
            ...payload,
            companyName,
            logo,
            docNo,
            grandTotal,
            date,
            items
        }
  },[payload])


  const captureImage = async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#f4f4f4",
    });

    const link = document.createElement("a");
    link.download = "quotation-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    const base64 = canvas.toDataURL("image/png");
    console.log("base64 =>", base64);
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
        <h2>
          <b>ใบเสนอราคาอย่างย่อ</b>
        </h2>
      </Modal.Header>

      <Modal.Body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#f4f4f4",
        }}
      >
        <div ref={cardRef}>
          <ThaiQrQuotationCard
            {...{ data }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <OneButton text="บันทึก" submit={captureImage} />
        </div>
      </Modal.Body>
    </Modal>
  );
}

const styles = {
  card: {
    width: 350,
    // backgroundColor: "#f4f4f4",
    backgroundColor: "#FFFFFF",

    
    padding: "28px 34px 30px",
    color: "#222",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 26,
  },

  logo: {
    width: 220,
    objectFit: "contain",
    marginBottom: 10,
  },

  companyName: {
    fontSize: 15,
    fontWeight: 500,
    marginBottom: 8,
  },

  docText: {
    fontSize: 12,
    color: "#666",
  },

  itemSection: {
    marginTop: 12,
    marginBottom: 18,
  },

  itemRow: {
    display: "grid",
    gridTemplateColumns: "20px 1fr 80px",
    gap: 12,
    alignItems: "start",
    fontSize: 15,
    lineHeight: 1.45,
  },

  itemIndex: {
    textAlign: "left",
    fontSize: 15,
  },

  itemName: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: 15,
  },

  itemPrice: {
    textAlign: "right",
    fontSize: 15,
    whiteSpace: "nowrap",
  },

  summarySection: {
    fontSize: 15,
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    fontSize: 15,
  },

  divider: {
    borderTop: "1px dashed #cfcfcf",
    margin: "18px 0",
  },

  qrWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: 8,
  },

  qrBox: {
    background: "#fff",
    padding: 10,
    borderRadius: 6,
    display:'flex',
    flexDirection:'column',
    alignItems:'center'
  },
};

export default Modal_QuotationMini;