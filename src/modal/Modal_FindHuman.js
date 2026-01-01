import React, { useState } from "react";
import {
  Row,
  Col,
  Modal,
  Form
} from "react-bootstrap";
import { colors, initialProfile } from "../configs";
import { db } from "../db/firestore";
import { FooterButton, OneButton } from "../components";
import Modal_Loading from "./Modal_Loading";

const { softWhite, three, white } = colors;

function Modal_FindHuman({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
  current,
  setCurrent
}) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profiles, setProfiles] = useState([]);
    const { id:humanId } = current;
    const [loading, setLoading] = useState(false);

    function close(){
        setPhoneNumber('')
        onHide()
    }

    function check(){
        if(!humanId)return alert('กรุณาเลือกโปรไฟล์');
        submit()
        setProfiles([])
    };


    async function findProfile(){
        setLoading(true);
        try {
            const query = await db.collection('profile').where('tel','==',phoneNumber).get();
            const results = query.docs.map(doc=>({
                ...initialProfile,
                ...doc.data(),
                id:doc.id
            }))
            setProfiles(results)
            setPhoneNumber('')
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={close}
      centered={centered}
      size={size}
    >
      <Modal.Header closeButton>
        <h2><b>โปรไฟล์</b></h2>
      </Modal.Header>
        <Modal_Loading show={loading} />
      <Modal.Body style={styles.container} >
        <div style={styles.container2} >
            <Form.Control 
                type="text" 
                placeholder={`ใส่เบอร์โทร`} 
                onChange={(event)=>{setPhoneNumber(event.target.value)}}
                value={phoneNumber}
            />&emsp;
            {profiles.length>0
                ?<OneButton {...{ text:"ล้าง", submit:()=>{setProfiles([]);setCurrent(prev=>({...prev,id:''}))}, variant:'danger' }} />
                :<OneButton {...{ text:'ค้นหา', submit:findProfile  }} />
            }
            
        </div>
        <Row  >
            {profiles.map((a)=>{
                const { name, id } = a;
                let status = humanId===id
                return <Col key={id} md='6' >
                            <div onClick={()=>{setCurrent(prev=>({...prev,...a}))}} style={{padding:10,margin:10,borderRadius:20,cursor:'pointer',backgroundColor:status?three:softWhite}} >
                                <h4>{name}</h4>
                            </div>
                        </Col>
            })}
        </Row>
      </Modal.Body>
      <FooterButton {...{ onHide:close, submit:check }} />
    </Modal>
  );
};

const styles = {
    container : {
        height:'65vh',overflowY:'auto', padding:0, margin:0
    },
    container2 : {
        display:'flex', position:'sticky', top:0, backgroundColor:white, padding:10
    },
}
export default Modal_FindHuman;
