import React, { useMemo, forwardRef, useRef } from "react";
import {
  Modal,
} from "react-bootstrap";
import { colors } from "../configs";
import DatePicker from "react-datepicker";
import { SlCalender } from "react-icons/sl";
const { white } = colors;

function Modal_DatePicker({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  submit,

  requestDate
}) {
    
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <div  style={{ borderRadius:20 }} onClick={onClick} ref={ref}>
          {value}
        </div>
    ));

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      fullscreen={true}
    >
      <Modal.Header closeButton>
        <h2><b>วันที่ต้องการเพิ่มแพ็กเกจ</b></h2>
      </Modal.Header>
      <Modal.Body  >
        <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                    <h2>3. วันที่ต้องการเพิ่มแพ็กเกจ</h2>
                </div>
                <div style={{ width:'350px' }} >
                    <div style={{ display:'flex',padding:5,borderRadius:10,border: '1px solid grey',backgroundColor:white,alignItems:'center' }} >
                        <SlCalender />
                        <div style={{ paddingLeft:10,paddingRight:10 }} >  วันที่: </div>
                        <DatePicker
                            dateFormat="dd/MM/yyyy"
                            selected={requestDate}
                            onChange={(date)=>{(submit(date))}}
                            selectsStart
                            minDate={new Date()}     // ⛔ ห้ามเลือกวันที่ผ่านมาแล้ว
                            customInput={<ExampleCustomInput />}
                            withPortal
                            
                        />
                    </div>
                </div>
            </div>
      </Modal.Body>
      
    </Modal>
  );
};

const styles = {
  container : {
      textAlign:'center', width: '9%', minWidth:'50px'
  },
  container2 : {
      textAlign:'center', width:'13%', textAlign:'center',minWidth:'150px'
  }
};

export default Modal_DatePicker;
