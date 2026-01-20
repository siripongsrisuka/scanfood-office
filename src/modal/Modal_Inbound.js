import React, { useState } from "react";
import {
  Modal,
  Table,
} from "react-bootstrap";
import { initialAlert } from "../configs";
import Modal_Alert from "./Modal_Alert";
import { useSelector } from "react-redux";
import Modal_OneInput from "./Modal_OneInput";
import { AreaFloating, DeleteButton, FooterButton, OneButton } from "../components";
import { multiDigitNumber } from "../Utility/function";
import Modal_FlatListTwoColumn from "./Modal_FlatListTwoColumn";

const initialCurrent = { qty:'', id:'', name:''};

function Modal_Inbound({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
}) {
    const { warehouse } = useSelector(state=>state.warehouse);
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;
    const [inboundItems, setInboundItems] = useState([]);
    const [current, setCurrent] = useState(initialCurrent);
    const { qty, name } = current;
    const [current_Modal, setCurrent_Modal] = useState(false);
    const [qty_Modal, setQty_Modal] = useState(false);
    const [existWarehouse, setExistWarehouse] = useState([]);

    const [note, setNote] = useState('');

    async function confirm(){
        if(inboundItems.length===0) return alert('กรุณาเพิ่มอย่างน้อย 1 รายการ');
        submit(inboundItems,note);
        close()
    };

    function close(){
      setInboundItems([]);
      onHide()
    }

    // 200%
    function openInbound(item){
      if(item){
        setCurrent(item);
        setQty_Modal(true)
      } else {
        const inboundIds = new Set(inboundItems.map(a=>a.id));
        let existWarehouse = warehouse.filter(a=>!inboundIds.has(a.id) && !a.stockSetStatus);
      
        setExistWarehouse(existWarehouse);
        setCurrent_Modal(true);
      }
    }

    // 200%
  function handleInboundItem(){
      if(!current.qty)return alert('กรุณาใส่จำนวน');

      setInboundItems(prev=>{
        return prev.some(a=>a.id === current.id)
          ?prev.map(a=>
            a.id === current.id
              ?current
              :a
          )
          :[
            ...prev,
            current
          ]
      })
      setCurrent(initialCurrent)
      setQty_Modal(false)
};

  // 200%
  function deleteInboundItem(id){
      setInboundItems(prev=>prev.filter(a=>a.id !== id ))
  };

  // 200%
  function handleCurrent(item){
      setCurrent({...item,qty:''})
      setCurrent_Modal(false)
      setQty_Modal(true)
  };

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={close}
      centered={centered}
      fullscreen={true}
      size={size}
    >
  
      <Modal_OneInput  
          show={qty_Modal}
          header={`${name}`}
          onHide={()=>{setQty_Modal(false)}}
          value={qty}
          onClick={handleInboundItem}
          placeholder='ใส่จำนวน'
          onChange={(value)=>{setCurrent(prev=>({...prev,qty:multiDigitNumber(value)}))}}
      />
      <Modal_FlatListTwoColumn
        show={current_Modal}
        onHide={()=>{setCurrent_Modal(false)}}
        header='เลือกสินค้า'
        onClick={handleCurrent}
        value={existWarehouse}
      />
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
      <Modal.Header closeButton>
        <h2><b>รายการรับเข้า</b></h2>
        
      </Modal.Header>
      <Modal.Body  >
        <OneButton {...{ text:'+ เพิ่มรายการ', submit:()=>{openInbound(null)}, }} />
                <h4>ทั้งหมด {inboundItems.length} รายการ</h4>
                <Table striped bordered hover responsive  variant="light"   >
                  <thead  >
                  <tr>
                      <th style={styles.container2}>No.</th>
                      <th style={styles.container3}>รายการ</th>
                      <th style={styles.container3}>จำนวน</th>
                      <th style={styles.container3}>ลบ</th>
                  </tr>
                  </thead>
                  <tbody  >
                  {inboundItems.map((item, index) => {
                      const { id, name, qty } = item;
                      return <tr   key={id} >
                                  <td style={styles.container4}>{index+1}.</td>
                                  <td >{name}</td>
                                  <td onClick={()=>{openInbound(item)}} style={styles.container4}>{qty}<i class="bi bi-pen"></i></td>
                                  <td style={styles.container4}>
                                      <DeleteButton {...{ text:'ล้างรายการ', submit:()=>{setAlert_Modal({ status:true, content:'ยืนยันการลบตัวเลือกนี้', onClick:()=>{deleteInboundItem(id);setAlert_Modal(initialAlert)}, variant:'danger' })} }} />
                                  </td>
                              </tr>
                  })}
                  </tbody>
              </Table>
              <AreaFloating
                value={note}
                onChange={setNote}
                placeholder="หมายเหตุ"
              />
        
      </Modal.Body>
        <FooterButton {...{ onHide:close, submit:confirm }} />
    </Modal>
  );
};

const styles = {
    container2 : {
      textAlign:'center',width:'12%', minWidth:'70px'
    },
    container3 : {
      textAlign:'center',width:'22%', minWidth:'180px'
    },
    container4 : {
      textAlign:'center'
    },
}

export default Modal_Inbound;
