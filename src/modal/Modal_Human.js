import React, { useState } from "react";
import {
  Row,
  Col,
  Modal,
  Button,
} from "react-bootstrap";
import { colors, initialAlert } from "../configs";
import Switch from "react-switch";
import Modal_Alert from "./Modal_Alert";
import { DeleteButton, FooterButton } from "../components";

const { softWhite, softGray, white } = colors;

function Modal_Human({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='xl',
  submit,
  setCurrent,
  current,
  deleteItem,
  sideBar
}) {
  
    const { id, rights, name } = current;
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;


    function manageRights(id,status){
        setCurrent(prev=>({
          ...prev,
          rights:status
            ?[...prev.rights,id]
            :prev.rights.filter(a=>a !== id)
        }))
    };

    // 200%
    function addAllRights(){
      setCurrent(prev=>({...prev,rights:sideBar.map(a=>a.id)}))
    };

    // 200%
    function closeAllRights(){
      setCurrent(prev=>({...prev,rights:[]}));
    };


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      size={size}
    //   fullscreen={true}
    >
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
      <Modal.Header closeButton>
        <h2><b>สิทธิ์ของ {name}</b></h2>
      </Modal.Header>

      <Modal.Body style={styles.container4} >
            <div style={styles.container2} >
              <Button onClick={closeAllRights} variant="secondary" >ปิดสิทธิ์ทั้งหมด</Button>&emsp;
              <Button onClick={addAllRights} variant="success" >เปิดสิทธิ์ทั้งหมด</Button>&emsp;
              {id
                ?<DeleteButton {...{ text:'ลบบุคลากร', submit:()=>{setAlert_Modal({ status:true, content:`ลบ ${name}`, onClick:()=>{setAlert_Modal(initialAlert);deleteItem(id)}, variant:'danger' })} }} />
                :null
              }

              <h4 style={styles.container5} >สิทธิ์ที่ใช้งานได้ {rights.length}/{sideBar.length} สิทธิ์</h4>
            </div>
            <br/>
            <Row  >
                {sideBar.map((a,i)=>{
                let status = rights.includes(a.id)
                return <Col xs ='12' sm='6' md='6' key={i}  >
                            <div  style={{display:'flex',padding:5,margin:5,backgroundColor:status?softWhite:softGray,borderRadius:5,marginRight:0,cursor:'pointer'}} >
                                <div style={styles.container3} >
                                {a.topic}
                                <Switch onChange={(value)=>{manageRights(a.id,value)}} checked={status} />
                                </div>
                            </div>
                        </Col>
                })}
            </Row>
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

const styles = {
    container : {
        marginBottom:'1rem'
    },
    container2 : {
        position:'sticky', top:0, backgroundColor:white, margin:-10, padding:10, marginTop:-20, zIndex:999
    },
    container3 : {
        display:'flex',flexDirection:'column',paddingLeft:10
    },
    container4 : {
      maxHeight:'70vh',minHeight:'70vh', overflowY:'auto',  margin:0, paddingTop:0
    },
    container5 : {
      marginTop:10
    }
 
}
export default Modal_Human;
