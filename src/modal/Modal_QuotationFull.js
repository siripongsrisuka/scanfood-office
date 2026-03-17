import React, { useMemo, useRef } from "react";
import { Modal } from "react-bootstrap";
import { summary } from "../Utility/function";
import TaxInvoiceReceiptTemplate from "../screens/TaxInvoiceReceiptTemplate";


function formatDate(date = new Date()) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  return `${d}-${m}-${y}`;
}


function Modal_QuotationFull({
  backdrop = true,
  animation = true,
  show,
  onHide,
  centered = true,
  size = "xl",
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
        ? "/shopchamp.png"
        : "/scanfood.png"

    const seller = vat>0
      ?{
        company: "บริษัท ช็อปแชมป์ จำกัด",
        branchText: "(สำนักงานใหญ่)",
        address: "61/114 ชั้นที่ 2 ห้องเลขที่ 2บี ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง ",
        taxId: "0105566020622",
        phone: "020556595",
        website: "www.shopchamp.co",
      }
      :{
      company: "บริษัท สแกนฟู้ด อินโนเวชั่น จำกัด",
        branchText: "(สำนักงานใหญ่)",
        address: "เลขที่ 61/114 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310 ",
        taxId: "0105568078318",
        phone: "020556595",
        website: "Scanfood.online",
      }
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
    const items = [{ name, price:softwarePrice, qty:1, net:softwarePrice }, ...hardware.map(h=>({ name:h.name, price:h.price, qty:h.qty, net:h.net }))]
        return {
            
            ...payload,
            companyName,
            logo,
            docNo,
            grandTotal,
            date,
            items,
            seller
        }
  },[payload])





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
          <b>ใบเสนอราคา</b>
        </h2>
      </Modal.Header>
        
      <Modal.Body
      >
        <TaxInvoiceReceiptTemplate data={data} ref={cardRef} />
      </Modal.Body>
    </Modal>
  );
}

const styles = {

};

export default Modal_QuotationFull;