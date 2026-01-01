import React, { useRef } from "react";
import { Modal } from "react-bootstrap";
import '../styles/ShopListScreen.css';
import { useSelector } from "react-redux";
import html2canvas from 'html2canvas';
import { FooterButton } from "../components";
import { stringFullDate } from "../Utility/dateTime";
import { colors } from "../configs";

const { dark } = colors;

const YesOrNo = ({ value, content }) =>{
    if(value){
      return <h6>{content}<i  style={{color:'green'}} class="bi bi-check-square-fill"></i> ต้องการ</h6>
    }
    return <h6>{content}<i  style={{color:'red'}} class="bi bi-x-square"></i> ไม่ต้องการ</h6>
}

function Modal_Requirement({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
}) {
    const { demo } = useSelector(state=>state.care);
    const { profile } = useSelector(state=>state.profile);
    const { name:saleName, tel:saleTel } = profile;

    const { ownerName, province, tel, storeName, staffTakeOrder, staffRight,
        kitchenAmount, shift, vat, channels, promotions, payments, 
        table, tableAmount, staffNationality, customerNationality, 
        posDevice, printerDevice, workingTime, network, shopType,
        note
       } = demo;

       const displayRef = useRef(null);

      const handleCapture = () => {
        if (displayRef.current) {
          html2canvas(displayRef.current,{
            scrollX: -window.scrollX, // Capture full horizontal scroll
          windowWidth: displayRef.current.scrollWidth, // Set to the full scrollable width
          })
            .then((canvas) => {
              const imgData = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = imgData;
              link.download = `${storeName}${stringFullDate(new Date())}.png`;
              link.click();
            });
        }
      };
     

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
            <h2>Requirement</h2>
        </Modal.Header>
      <Modal.Body ref={displayRef}  >
          
          <h3 style={{textAlign:'center'}} >ร้าน {storeName}</h3>
          <h6>ลูกค้า : {ownerName}</h6>
          <h6>ติดต่อ : {tel}</h6>
          <h6>จังหวัด : {province}</h6>
          <h6>ประเภทร้าน : {shopType}</h6>
          {table==='มีหน้าร้านและมีโต๊ะ'
              ?<h6>จำนวนโต๊ะ : {tableAmount} โต๊ะ</h6>
              :<h6>รูปแบบร้าน : {shopType}</h6>
          }
          <YesOrNo value={staffTakeOrder} content='พนักงานรับออเดอร์ : ' /> 
          <YesOrNo value={staffRight} content='แยกสิทธิ์พนักงาน : ' /> 
          <h6>ภาษาพนักงาน : {staffNationality.join('/')}</h6>
          <h6>ภาษาลูกค้า : {customerNationality.join('/')}</h6>
          <h6>โปรโมชั่นที่ต้องใช้ : {promotions.join('/')}</h6>
          <h6>ช่องทางขาย : {channels.join('/')}</h6>
          <h6>ช่องทางชำระงิน : {payments.join('/')}</h6>
          <YesOrNo value={shift} content='ระบบกะเงินสด : ' /> 
          <YesOrNo value={vat} content='ระบบภาษี : ' /> 
          <h6>เวลาทำการ : {workingTime}</h6>

          {kitchenAmount
              ?<h6>จำนวนครัว : {kitchenAmount} ครัว</h6>
              :null
          }
          <h6>อุปกรณ์เดิม POS : {posDevice?posDevice:"- ไม่มี"}</h6>
          <h6>อุปกรณ์เดิม เครื่องปริ้น : {printerDevice}</h6>
          <h6>เครือข่ายอินเตอร์เน็ต : {network}</h6>
          <h6><i  style={{color:'green'}} class="bi bi-check-square-fill"></i> แนะนำจุดที่เชื่อมปริ้นเตอร์ ใช้เป็น Lan ทั้งหมด</h6>
          <h6>โน๊ต : {note}</h6>
          <div style={{border:`1px dotted ${dark}`,borderRadius:20,display:'flex',padding:10}} >
              <img style={{width:50,height:50}} src={'/logo512.png'} alt="My Image" />&emsp;
              <div>
                <h6>ดูแลลูกค้า : {saleName}</h6>
                <h6>ติดต่อ : {saleTel}</h6>
              </div>
          </div>

      </Modal.Body>
      <FooterButton {...{ onHide, submit:handleCapture }} />
      
   
    </Modal>
  );
}

export default Modal_Requirement;

