import React, { useState } from "react";
import {
  Modal,
  Row,
  Col,
  Button,
  Form
} from "react-bootstrap";
import { DeleteButton, FooterButton, InputArea, InputText, OneButton } from "../components";
import { colors } from "../configs";
import { checkAddCategory, checkCategory2, findInArray, manageCategory } from "../Utility/function";
import Modal_FlatListTwoColumn from "./Modal_FlatListTwoColumn";

const { darkGray, softWhite, white, dark  } = colors;

function Modal_Question2({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  current,
  submit,
  setCurrent,
  deleteItem,
  currentCategory
}) {
    const { id, question, answer, category = [], imageUrls = [], type = '', guideline } = current;

    const [category_Modal, setCategory_Modal] = useState(false) //category modal
    const [selectedCategory, setSelectedCategory] = useState([]);

    function confirmDelete(){
      const ok = window.confirm(`คุณต้องการลบคำถามนี้(${question})ใช่หรือไม่?`);
      if(!ok) return;
        deleteItem(id)
    }

    function confirm(){
        if(!question){
            alert('กรุณาใส่คำถาม')
        } else if(!answer){
            alert('กรุณาใส่คำตอบ')
        }else {
            submit()
        }
    };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Convert each file to a Promise
    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result?.toString() || "");
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    // Wait for all FileReaders to finish
    Promise.all(readers).then((results) => {
      // results = array of base64 strings
      setCurrent({ ...current, imageUrls: [...(imageUrls || []), ...results] });
    });
  };

  function deleteImage(url){
    const ok = window.confirm("คุณต้องการลบรูปภาพนี้ใช่หรือไม่?");
    if (!ok) return;
    const filteredImages = imageUrls.filter(img => img !== url);
    setCurrent({ ...current, imageUrls: filteredImages });
  }


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
       className="loading-screen"
       fullscreen
    >

        <Modal_FlatListTwoColumn 
          show={category_Modal}
          header='เลือกหมวดหมู่ที่ต้องการ'
          onHide={()=>{setCategory_Modal(false)}}
          onClick={(value)=>{setCurrent({...current,category:manageCategory(selectedCategory,category||[],value)});setCategory_Modal(false)}}
          value={selectedCategory}
        />
   
      <Modal.Header closeButton>
        <h2><b>ชุดคำถาม</b></h2>
        
      </Modal.Header>
      <Modal.Body  >
        <InputText
            name='คำถาม'
            placeholder="คำถาม"
            onChange={(event)=>{setCurrent({...current,question:event.target.value})}}
            value={question}
            strict={true}
        />
        <InputArea
            name='คำตอบ'
            placeholder="คำตอบ"
            onChange={(event)=>{setCurrent({...current,answer:event.target.value})}}
            value={answer}
            strict={true}
            rows={8}
        />
        <InputArea
            name='guildeline'
            placeholder="คำแนะนำ"
            onChange={(event)=>{setCurrent({...current,guideline:event.target.value})}}
            value={guideline}
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
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor="file-upload"
              style={{
                padding: "10px 20px",
                backgroundColor: "#0D8266",
                color: white,
                borderRadius: "8px",
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              เลือกรูปภาพ
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 20 }}>
              {imageUrls.map((img, index) => (
                <div key={index} style={{ margin: 10, position:'relative' }}>
                  <img
                    src={img}
                    alt={`upload-${index}`}
                    style={{ width: 150, height: 150, objectFit:'contain' }}
                  />
                  <div onClick={()=>{deleteImage(img)}} style={{position:'absolute',top:10,right:10,zIndex:999}} >
                    <i style={{fontSize:30,color:dark}} class="bi bi-trash3"></i>
                  </div>
                </div>
              ))}
            </div>
          <Form.Select 
              aria-label="Default select example" 
              value={type} 
              onChange={(event)=>{setCurrent({...current,type:event.target.value})}}
              style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}} 
          >
            <option value={'question'}>1. question</option>
            <option value={'problem'}>2. problem</option>
          </Form.Select>
        {id
            ?<Row  >
                <Col sm='3' >
                  ลบรายการ
                </Col>
                <Col sm='9' >
                    <DeleteButton {...{ text:'ลบรายการ', submit:confirmDelete }} />
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

    image : {
      width:'100%',maxWidth:300,height:undefined,aspectRatio:1 , objectFit: 'cover'
    },
    text : {
      color:darkGray
    }
}

export default Modal_Question2;
