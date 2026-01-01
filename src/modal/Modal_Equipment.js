import React, { useState, useRef } from "react";
import {
  Button,
  Row,
  Col,
  Modal,
  Image,
  Table,
  Dropdown
} from "react-bootstrap";
import { colors, initialAlert } from "../configs";
import { FooterButton, ImageSize, InputArea, InputText, RootImage } from "../components";
import { twoDigitNumber, } from "../Utility/function";

import Modal_Alert from "./Modal_Alert";

import Modal_NewCrop from "./Modal_NewCrop";

const { darkGray, softWhite, white } = colors;
const statusType = [
    {id:1, statusName:'เปิดใช้งาน', status:true},
    {id:2, statusName:'ปิดงาน', status:false },
];


function Modal_Equipment({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
  current,
  setCurrent,
}) {
    const { imageId, name, detail, price, status, limit } = current;
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status:alertStatus, content:alertContent, onClick, variant } = alert_Modal;
    const [image_Modal, setImage_Modal] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const fileInputRef = useRef(null);

    function confirm(){
        if(!name){
            alert('กรุณาใส่ชื่อ')
        } else if(!price){
            alert('กรุณาใส่ราคา')
        } else {
            submit()
        }
    }



  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the selected file

    if (file) {
      // Create a FileReader to read the file
      const reader = new FileReader();
      reader.onloadend = async () => {
      setImage_Modal(true)
      setImgSrc(reader.result)
      };

      reader.readAsDataURL(file); // Convert file to a base64 string
    }
  };


  function deleteImage(){
    setCurrent(prev=>({...prev,imageId:''}))
  };



  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      // fullscreen='xxl-down'
      fullscreen={true}
      size={size}
    >
 
    
    <Modal_NewCrop
            show={image_Modal}
            onHide={()=>{setImage_Modal(false)}}
            onClick={(value)=>{
            setImage_Modal(false);
            setCurrent({...current,imageId:value})
            }}
            ratio={1}
            imgSrc={imgSrc}
    />

      <Modal_Alert
        show={alertStatus}
        onHide={()=>{setAlert_Modal(initialAlert)}}
        content={alertContent}
        onClick={onClick}
        variant={variant}
    />

      <Modal.Header closeButton>
        <h2><b>ตั้งค่าทั่วไป</b></h2>
        
      </Modal.Header>
      <Modal.Body  >

        {/* ================= Restautrant ================== */}
        <Row style={styles.container2}>
            <Col sm='3' >1. รูปสินค้า</Col>
            <Col sm='9' >
              <form >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }} // Hide the default file input
                    />
                    <Button  variant="light">
                      {imageId
                          ?<div style={{position:'relative'}} >
                            <div onClick={()=>{setAlert_Modal({ status:true, content:`ลบรูปภาพ`, onClick:()=>{deleteImage();setAlert_Modal(initialAlert)}, variant:'danger' })}} style={{position:'absolute',top:10,right:10,zIndex:999}} >
                              <i style={{fontSize:30,color:white}} class="bi bi-trash3"></i>
                            </div>
                            <Image onClick={handleButtonClick} style={styles.image} src={imageId} />
                            <ImageSize/>
                          </div>
                          :<div onClick={handleButtonClick} style={{position:'relative'}} >
                            <RootImage  style={styles.image} />
                            <ImageSize/>
                          </div>
                      }
                      
                    </Button>
                  </form>
            </Col>
        </Row>
        <br/>
     
        <Col sm='12'>
            <InputText
              name='2. ชื่อสินค้า'
              placeholder="ชื่อ"
              onChange={(event)=>{setCurrent({...current,name:event.target.value})}}
              value={name}
              style={{maxWidth:'400px'}}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='3. ราคา'
              placeholder="ชื่อ"
              onChange={(event)=>{setCurrent({...current,price:twoDigitNumber(event.target.value)})}}
              value={price}
              style={{maxWidth:'400px'}}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='4. สั่งได้ไม่เกิน'
              placeholder="จำนวน"
              onChange={(event)=>{setCurrent({...current,limit:twoDigitNumber(event.target.value)})}}
              value={limit}
              style={{maxWidth:'400px'}}
            />
        </Col>
        <Col sm='12'>
            <InputArea
              name='detail'
              placeholder="detail"
              onChange={(event)=>{setCurrent({...current,detail:event.target.value})}}
              value={detail}
              strict={true}
            />
        </Col>
        <Row  >
            <Col md='3' >
                สถานะการใช้งาน
            </Col>
            <Col md='9' >
            <Dropdown data-bs-theme={darkGray}  >
                <Dropdown.Toggle id="dropdown-button-dark-example1" variant="secondary" style={styles.container8} >
                    {status?"เปิดใช้งาน":'ปิดใช้งาน'}
                </Dropdown.Toggle>
                <Dropdown.Menu style={styles.container6} >
                    {statusType.map((item,index)=>{
                        return(
                            <Dropdown.Item key={index} onClick={()=>{setCurrent({...current,status:item.status})}} >{item.statusName}</Dropdown.Item>
                        )
                    })}
                </Dropdown.Menu>
            </Dropdown>
            
            </Col>
        </Row>
      </Modal.Body>
      <FooterButton {...{ onHide, submit:confirm }} />
    </Modal>
  );
};

const styles = {
    container : {
        border: '1px solid #dee2e6',borderRadius:20,backgroundColor:softWhite,padding:0,width:'100%',marginBottom:'1rem'
    },
    container2 : {
      marginBottom:'1rem'
    },

    container4 : {
      marginLeft:'1rem', textAlign:'center'
    },
    container5 : {
      textAlign:'center'
    },
    container6 : {
        marginBottom:'1rem', marginRight:'1rem'
    },
    container7 : {
      minWidth:'300px'
    },
    container8 : {
      minWidth:'400px',marginBottom:'1rem'
    },
    container9 : {
      textAlign:"center",width:'10%'
    },
    container10 : {
      textAlign:"center",width:'15%'
    },
    container11 : {
      textAlign:"center",width:'50%'
    },
    container12 : {
      textAlign:"center",width:'20%'
    },
    image : {
      width:'100%',maxWidth:300
    },
    text : {
      color:darkGray
    }
}

export default Modal_Equipment;
