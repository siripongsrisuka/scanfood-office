import React, { useState, useRef, useMemo } from "react";
import {
  Button,
  Row,
  Col,
  Modal,
  Image,
  Form,
  Table
} from "react-bootstrap";
import { colors, initialAlert } from "../configs";
import { FooterButton, ImageSize, InputArea, InputText, OneButton, RootImage } from "../components";
import { twoDigitNumber, } from "../Utility/function";
import Modal_Alert from "./Modal_Alert";
import Modal_NewCrop from "./Modal_NewCrop";
import Modal_OneInput from "./Modal_OneInput";
import Modal_FlatListTwoColumn from "./Modal_FlatListTwoColumn";
import { useSelector } from "react-redux";

const { white } = colors;
const statusType = [
    {id:1, statusName:'เปิดใช้งาน', status:true},
    {id:2, statusName:'ปิดใช้งาน', status:false },
];

function Modal_Warehouse({
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
    const { warehouse } = useSelector(state=>state.warehouse);
    const { imageId, name, detail, price, status, limit, stockSetStatus = false, stockSet = [] } = current;
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status:alertStatus, content:alertContent, onClick, variant } = alert_Modal;
    const [image_Modal, setImage_Modal] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const fileInputRef = useRef(null);

    const [stockSet_Modal, setStockSet_Modal] = useState(false);
    const [availableStockSets, setAvailableStockSets] = useState([]);
    const [currentStockSet,setCurrentStockSet] = useState({ id:'', qty:1 });
    const { qty } = currentStockSet;
    const [qty_Modal, setQty_Modal] = useState(false);

  const warehouseName = useMemo(() => {
    return new Map(warehouse.map(item => [item.id, item.name]));
  }, [warehouse]);



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

  function openStockSet(){
    // Fetch available stock sets from warehouse or any other source
    const availableSets = warehouse.filter(item => item.id !== current.id && !item.stockSetStatus && !stockSet.includes(item.id)); // Example filter
    setAvailableStockSets(availableSets);
    setStockSet_Modal(true);
  }

  function handleStockSet(item){
    const exists = stockSet.find(a=>a.id===item.id);
    if(exists){
        setCurrent(prev=>({...prev,stockSet:prev.stockSet.filter(a=>a.id!==item.id)}))
    } else {
        setCurrent(prev=>({...prev,stockSet:[...prev.stockSet,{ id:item.id,qty:1}]}))
    }
    setStockSet_Modal(false)
  };

  function handleDelete(item){
    const ok = window.confirm('ต้องการลบรายการนี้หรือไม่?');
    if(!ok) return
    setCurrent(prev=>({...prev,stockSet:prev.stockSet.filter(a=>a.id!==item.id)}))
  };

  function openQty(item){
    setCurrentStockSet({ ...item })
    setQty_Modal(true)
  }

  function closeQty(){
    setQty_Modal(false)
    setCurrentStockSet({ id:'', qty:1 })
  };

  function handleQty(){
    if(!qty || qty<=0){
        alert('กรุณาใส่จำนวนที่ถูกต้อง')
        return
    }
   setCurrent(prev=>({...prev,stockSet:prev.stockSet.map(a=>{
        return a.id===currentStockSet.id
            ?{...a, qty:qty}
            :a
    })}))
    closeQty()
  }


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
      <Modal_OneInput
          show={qty_Modal}
          onHide={closeQty}
          placeholder='ใส่จำนวน'
          header='จำนวน'
          value={qty}
          onChange={(v)=>{setCurrentStockSet(prev=>({...prev, qty:v}))}}
          onClick={handleQty}
      />
    <Modal_FlatListTwoColumn
        header={'เลือกรายการคลังสินค้า'}
        show={stockSet_Modal}
        onHide={()=>{setStockSet_Modal(false)}}
        value={availableStockSets}
        onClick={handleStockSet}
    />
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
        <Row >
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
            <Form.Select 
                  aria-label="Default select example" 
                  value={status} 
                  onChange={(event)=>{setCurrent(prev=>({...prev,status:event.target.value==='true'}))}}
                  style={{marginTop:'1rem',marginBottom:'1rem', maxWidth:'300px'}}
              >
                <option value='' disabled >การใช้งาน</option>
                {statusType.map((item,index)=>{
                  return <option key={index} value={item.status} >{item.statusName}</option>
                })}
                
              </Form.Select>
          </Col>
        </Row>
        <Row  >
            <Col md='3' >
                เซตสินค้า?
            </Col>
            <Col md='9' >
              <Form.Select 
                    aria-label="Default select example" 
                    value={stockSetStatus} 
                    onChange={(event)=>{setCurrent(prev=>({...prev,stockSetStatus:event.target.value==='true'}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem', maxWidth:'300px'}}
                >
                  <option value='' disabled >การใช้งาน</option>
                  {statusType.map((item,index)=>{
                    return <option key={index} value={item.status} >{item.statusName}</option>
                  })}
                  
                </Form.Select>
                {stockSetStatus &&
                  <React.Fragment>
                    <OneButton  {...{ text:'เพิ่มรายการคลังสินค้า', submit:openStockSet }} />
                    <Table striped bordered hover responsive  variant="light"   >
                        <thead  >
                        <tr>
                          <th style={styles.container}>No.</th>
                          <th style={styles.container2}>รายการ</th>
                          <th style={styles.container}>จำนวน</th>
                          <th style={styles.container}>ลบ</th>
                        </tr>
                      </thead>
                      <tbody  >
                        {stockSet.map((item, index) => {
                          const { id, qty } = item;
                          const name = warehouseName.get(id);
                          return  <tr  key={index} >
                                    <td style={styles.container}>{index+1}.</td>
                                    <td>{name}</td>
                                    <td onClick={()=>{openQty(item)}} style={styles.container}>{qty}</td>
                                    <td style={styles.container}>
                                      <OneButton {...{ text:'ลบ', submit:()=>{handleDelete(item)}, variant:'danger' }} />
                                    </td>
                                    
                                  </tr>
                        }
                        )}
                      </tbody>
                    </Table>
                  </React.Fragment>
                  
                  }
            </Col>
        </Row>
        <Col sm='12'>
            <InputText
              name='4. สั่งได้ไม่เกิน'
              placeholder="จำนวน"
              onChange={(event)=>{setCurrent({...current,limit:twoDigitNumber(event.target.value)})}}
              value={limit}
              style={{maxWidth:'400px'}}
            />
        </Col>
  
      </Modal.Body>
      <FooterButton {...{ onHide, submit:confirm }} />
    </Modal>
  );
};

const styles = {

    image : {
      width:'100%',maxWidth:200
    },
    container : {
      width:'10%', minWidth:'80px', textAlign:'center'
    },
    container2 : {
      width:'15%', minWidth:'200px', textAlign:'center'
    }
}

export default Modal_Warehouse;
