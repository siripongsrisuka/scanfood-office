import React from "react";
import {
  Modal,
  Form,
} from "react-bootstrap";
import { FloatingArea, FooterButton } from "../components";
import initialCancelId from "../configs/initialCancelId";


function Modal_Cancel({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='xl',
  submit,
  current,
  currentCancel,
  setCurrentCancel
}) {
    const { name } = current;
    const { cancelId, reason } = currentCancel;

    function handleSubmit(){
        if(!cancelId) return alert('เลือกหัวข้อยกเลิก')
        const ok = window.confirm("ยืนยันการยกเลิกลูกค้า?");
        if (!ok) return;
        submit()
    }


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      size={size}
      fullscreen={true}
    >
      <Modal.Header closeButton>
        <h2><b>{name}</b></h2>
      </Modal.Header>

      <Modal.Body style={{maxHeight:'70vh',overflow:'auto'}} >
            <Form.Select 
                aria-label="Default select example" 
                value={cancelId} 
                onChange={(event)=>{
                event.preventDefault()
                if(event.target.value!==cancelId){
                    setCurrentCancel(prev=>({...prev,cancelId:event.target.value}))
                }
                }}
                style={styles.container} 
            >
                <option value="" disabled>เลือกหัวข้อเหตุผล</option>
                {initialCancelId.map((item,index)=>{
                    return <option key={index} value={item.id}>{item.name}</option>
                })}
            </Form.Select>
            <br/>
            <FloatingArea
                name="note"
                placeholder="ใส่เหตุผล"
                value={reason}
                onChange={(event)=>{setCurrentCancel(prev=>({...prev,reason:event.target.value}))}}
            />
         
      </Modal.Body>
        <FooterButton {...{ onHide, submit:handleSubmit }} />
      
    </Modal>
  );
};

const styles = {
    container : {
        minWidth:'200px'
    },
    container2 : {
        width:'10%', minWidth:'80px', textAlign:'center'
    },
    container3 : {
        width:'30%', minWidth:'120px', textAlign:'center'
    }
}

export default Modal_Cancel;
