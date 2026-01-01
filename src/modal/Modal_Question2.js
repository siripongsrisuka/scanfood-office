import React, { useState } from "react";
import {
  Modal,
  Row,
  Col,
  Button
} from "react-bootstrap";
import { DeleteButton, FooterButton, InputArea, InputText, OneButton } from "../components";
import { colors, initialAlert } from "../configs";
import Modal_Alert from "./Modal_Alert";
import { checkAddCategory, checkCategory2, findInArray, manageCategory } from "../Utility/function";
import Modal_FlatListTwoColumn from "./Modal_FlatListTwoColumn";

const { darkGray, softWhite, white  } = colors;

function Modal_Question2({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='xl',
  current,
  submit,
  setCurrent,
  deleteItem,
  currentCategory
}) {
    const { id, q, a, category } = current;
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;
    const [category_Modal, setCategory_Modal] = useState(false) //category modal
    const [selectedCategory, setSelectedCategory] = useState([]);

    function confirm(){
        if(!a){
            alert('กรุณาใส่คำถาม')
        } else if(!q){
            alert('กรุณาใส่คำตอบ')
        }else {
            submit()
        }
    }


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      fullscreen='xxl-down'
      size={size}
       className="loading-screen"
    >

        <Modal_FlatListTwoColumn 
          show={category_Modal}
          header='เลือกหมวดหมู่ที่ต้องการ'
          onHide={()=>{setCategory_Modal(false)}}
          onClick={(value)=>{setCurrent({...current,category:manageCategory(selectedCategory,category||[],value)});setCategory_Modal(false)}}
          value={selectedCategory}
        />
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
      <Modal.Header closeButton>
        <h2><b>ชุดคำถาม</b></h2>
        
      </Modal.Header>
      <Modal.Body  >
        <InputText
            name='คำถาม'
            placeholder="คำถาม"
            onChange={(event)=>{setCurrent({...current,q:event.target.value})}}
            value={q}
            strict={true}
        />
        <InputArea
            name='คำตอบ'
            placeholder="คำตอบ"
            onChange={(event)=>{setCurrent({...current,a:event.target.value})}}
            value={a}
            strict={true}
            rows={8}
        />
        <Row style={styles.container2} >
                <Col sm='3' >
                  <div>
                    กำหนดหมวดหมู่สินค้า
                  </div>
                  <OneButton {...{ text:'ล้างหมวดหมู่', variant:"danger", submit:()=>{setCurrent({...current,category:[]})} }} />
                </Col>
                <Col sm='9'>
                {currentCategory?.length >0
                        ?category.length >0
                            ?category.map((item,index)=>{
                                let res = []
                                const { level, name, } = item;
                                const value = findInArray(currentCategory,'level',level).value
                                const selectedSmart = findInArray(currentCategory,'level',level+1) // เพื่อตรวจดูว่ามันมีชั้นถัดไปไหม
                                if(selectedSmart && selectedSmart.level){ // ใช้ตรวจสอบว่าชั้นถัดไป มีตรงกับ above ก่อนหน้ามั้ย
                                    res = checkCategory2(category,selectedSmart)
                                }
                                return(
                                  <div key={index} sm='6'  >
                                    <Button variant="light" onClick={()=>{setSelectedCategory(value);setCategory_Modal(true)}} style={styles.container} >
                                      <div style={styles.container3} >
                                        <h4><b>{name}</b></h4>
                                        <h6 style={styles.text}>หมวดหมู่ระดับ {level}</h6>
                                      </div>
                                    </Button>
                                    {category.length === index +1  // เพื่อให้แสดงเฉพาะตัวสุดท้าย
                                        ?res.length >0
                                            ?<Button variant="light" onClick={()=>{setSelectedCategory(res);setCategory_Modal(true)}} style={styles.container} >
                                              <div style={styles.container3} >
                                                <h4><b>--ยังไม่ได้กำหนด--</b></h4>
                                                <h6 style={styles.text}>หมวดหมู่ระดับ {level+1}</h6>
                                              </div>
                                            </Button>
                                            :null
                                        :null
                                    }
                                  </div>
                                )
                            })
                            :<div sm='6' onClick={()=>{setSelectedCategory(checkAddCategory(currentCategory,findInArray(currentCategory,'level',1),category,()=>{setCategory_Modal(true)}))}}  style={styles.container3} >
                                <Button variant="light"  style={styles.container} >
                                  <div style={styles.container3} >
                                    <h4><b>--ยังไม่ได้กำหนด--</b></h4>
                                    <h6 style={styles.text}>หมวดหมู่ระดับ 1</h6>
                                  </div>
                                </Button>
                            </div>
                        :<div sm='6'  style={styles.container3} >
                            <Button variant="light"  style={styles.container} >
                              <div style={styles.container3} >
                                <h4><b>--ยังไม่ได้กำหนด--</b></h4>
                              </div>
                            </Button>
                        </div>
                    }
                </Col>
            </Row>
        {id
            ?<Row  >
                <Col sm='3' >
                  ลบรายการ
                </Col>
                <Col sm='9' >
                    <DeleteButton {...{ text:'ลบรายการ', submit:()=>{setAlert_Modal({ status:true, content:`ลบ ${q}`, onClick:()=>{setAlert_Modal(initialAlert);deleteItem(id)}, variant:'danger'})} }} />
                </Col>
            </Row>
            :null
        }
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
    container3 : {
      padding:10
    },
    container4 : {
      marginLeft:'1rem'
    },
    container5 : {
      marginTop:'1rem'
    },
    container6 : {
      width:'10%', textAlign:'center'
    },
    container7 : {
      width:'20%', textAlign:'center', minWidth:'180px'
    },
    container8 : {
      textAlign:'center'
    },
    image : {
      width:'100%',maxWidth:300,height:undefined,aspectRatio:1 , objectFit: 'cover'
    },
    text : {
      color:darkGray
    }
}

export default Modal_Question2;
