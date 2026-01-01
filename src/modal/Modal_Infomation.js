import React from "react";
import { Button, Modal, Row, Col } from "react-bootstrap";
import { FloatingText } from "../components";
import { stringDateTimeReceipt, stringYMDHMS3 } from "../Utility/dateTime";
import { colors } from "../configs";
import { summary } from "../Utility/function";

const { softWhite, white } = colors;

function Modal_Information({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  info,
  setInfo,
  submit,
  allDate,
  date,
  setDate,
  bill
}) {
    const { name, tel, note, packageArray, shopTel} = info;

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      className='loading-screen'
      fullscreen={true}
    //   size={size}
    >
      <Modal.Header closeButton>
        <h3>ข้อมูลติดต่อ</h3>
      </Modal.Header>
      <Modal.Body   >
        <h6>เบอร์โทรร้าน : {shopTel}</h6>
        <FloatingText
            name='ชื่อผู้ติดต่อ'
            placeholder='ชื่อผู้ติดต่อ'
            onChange={(event)=>{setInfo({...info,name:event.target.value})}}
            value={name}
        />
        <FloatingText
            name='เบอร์โทร'
            placeholder='เบอร์โทร'
            onChange={(event)=>{setInfo({...info,tel:event.target.value})}}
            value={tel}
        />
        <FloatingText
            name='โน๊ต'
            placeholder='โน๊ต'
            onChange={(event)=>{setInfo({...info,note:event.target.value})}}
            value={note}
        />
        <Row>
          <Col>
          <h5>สแกนสั่งอาหาร</h5>
                <h6>&nbsp;&nbsp;&nbsp;1 เดือน : {packageArray.filter(a=>['1','4','7'].includes(a)).length} ครั้ง</h6>
                <h6>&nbsp;&nbsp;&nbsp;6 เดือน : {packageArray.filter(a=>['2','5','8'].includes(a)).length} ครั้ง</h6>
                <h6>&nbsp;&nbsp;&nbsp;1 ปี : {packageArray.filter(a=>['3','6','9'].includes(a)).length} ครั้ง</h6>
          </Col>
          <Col>
          <h5>พนักงานสั่งอาหาร</h5>
                <h6>&nbsp;&nbsp;&nbsp;1 เดือน : {packageArray.filter(a=>['10','13','16'].includes(a)).length} ครั้ง</h6>
                <h6>&nbsp;&nbsp;&nbsp;6 เดือน : {packageArray.filter(a=>['11','14','17'].includes(a)).length} ครั้ง</h6>
                <h6>&nbsp;&nbsp;&nbsp;1 ปี : {packageArray.filter(a=>['12','15','18'].includes(a)).length} ครั้ง</h6>
          </Col>
          <Col>
          <h5>วุ้นแปลภาษา</h5>
                <h6>&nbsp;&nbsp;&nbsp;1 เดือน : {packageArray.filter(a=>['19','22','25'].includes(a)).length} ครั้ง</h6>
                <h6>&nbsp;&nbsp;&nbsp;6 เดือน : {packageArray.filter(a=>['20','23','26'].includes(a)).length} ครั้ง</h6>
                <h6>&nbsp;&nbsp;&nbsp;1 ปี : {packageArray.filter(a=>['21','24','27'].includes(a)).length} ครั้ง</h6>
          </Col>
        </Row>
        <Row>
          {allDate.map((item,index)=>{
            return <Col md='2' key={index} >
                  <Button onClick={()=>{setDate(item)}} variant={item===date?'dark':'light'} >{stringYMDHMS3(item)}</Button>
                </Col>
          })}
        </Row>
        <Row style={styles.container} >
          <h5>ยอดขายวันนี้ : {summary(bill,'net').toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})} </h5>
          {bill.map((item,index)=>{
            const { receiptNumber, timestamp, net, profileName } = item;
          return <Col md='6' key={index} >
                  <div style={{padding:10,backgroundColor:softWhite,borderRadius:20,marginTop:5,marginBottom:5}} >
                    <h6> {receiptNumber}</h6>
                    <p> {stringDateTimeReceipt(timestamp)}</p>
                    <p>ยอดชำระ : {net.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</p>
                    <p>แคชเชียร์ {profileName}</p>
                  </div>
                </Col>
        })}
        </Row>
        
          
      </Modal.Body>
      <Modal.Footer>
            <Button onClick={onHide} variant="secondary">ยกเลิก</Button>
            <Button onClick={submit} variant="danger">บันทึก</Button>
      </Modal.Footer>
    </Modal>
  );
};

const styles = {
  container : {
    backgroundColor:white
  }
}

export default Modal_Information;