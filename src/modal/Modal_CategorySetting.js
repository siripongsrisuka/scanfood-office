import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
} from "react-bootstrap";
import { colors, initialAlert } from "../configs";
import { v4 as uuidv4 } from 'uuid';
import Modal_Alert from "./Modal_Alert";
import { checkCategory2, filterDeleteInArray, findInArray, includesOutInArray, manageCategory, mapInArray, someInArray } from "../Utility/function";
import Modal_OneInput from "./Modal_OneInput";
import { FooterButton } from "../components";
const { softWhite, dark, one, two } = colors;

const initialCategory = {name:'',status:false,level:1,aboveId:[]};

function Modal_CategorySetting({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  value,
  submit
}) {
    const [currentCategory, setCurrentCategory] = useState(value);
    const [allSelectedCategory, setAllSelectedCategory] = useState([]);
    const [newCategory, setNewCategory] = useState(initialCategory);
    const [selectedCategory, setSelectedCategory] = useState({aboveId:[],id:'',name:'',level:''});
    const [editCategory, setEditCategory] = useState({});
    const [editCategory_Modal, setEditCategory_Modal] = useState(false);
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;

    useEffect(()=>{
      if(show){
        setCurrentCategory(value)
      }
    },[show,value]);

      function addNewCategory(){
        const { level, name, aboveId } = newCategory;
        let cat = findInArray(currentCategory,'level',level)
        if(cat && cat.level){
            let newSmartCategory = currentCategory.map((item)=>{
                return item.level === level
                    ?{...item,
                        value:[
                            ...item.value,
                            {
                                level,
                                name,
                                id:uuidv4(),
                                aboveId
                            }
                        ]}
                    :item
            })
            setCurrentCategory(newSmartCategory)
            setNewCategory(initialCategory)
        } else {
            setCurrentCategory([
                ...currentCategory,
                {
                    level,
                    value:[
                        {
                            id:uuidv4(),
                            name,
                            level,
                            aboveId
                        }
                    ] 
                }
            ])
            setNewCategory(initialCategory)
        }
    }
    
    function deleteCategory(item){ //100%
        const { level, id } = item;
        let highLevel = currentCategory.filter(a=>a.level < level)
        let value = filterDeleteInArray(findInArray(currentCategory,'level',level).value,'id',id)
        let lowLevel = []
        currentCategory.filter(b=>b.level > level).forEach((a)=>{
            let value = includesOutInArray(a.value,'aboveId',id);
            if(value.length >0){
                lowLevel.push({
                    ...a,
                    value,
                })
            }
        })
        if(value.length >0){
            setCurrentCategory([...highLevel,{level,value},...lowLevel])
        } else {
            setCurrentCategory([...highLevel,...lowLevel])
        }
        setAllSelectedCategory(filterDeleteInArray(allSelectedCategory,'id',id))
    }
    
    function updateEditCategory(){
        const { level, value } = findInArray(currentCategory,'level',editCategory.level)
        setCurrentCategory(mapInArray(currentCategory,'level',level,{level,value:mapInArray(value,'id',editCategory.id,editCategory)}))
        setEditCategory_Modal(false)
    };


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      fullscreen='xxl-down'
      size={size}
    >
      <Modal.Header closeButton >
        <h2><b>จัดการหมวดหมู่</b></h2>
      </Modal.Header>
      <Modal.Body  >
            <Modal_Alert
                show={status}
                onHide={()=>{setAlert_Modal(initialAlert)}}
                content={content}
                onClick={onClick}
                variant={variant}
            />
            <Modal_OneInput  // สำหรับสร้างหมวดหมู่ใหม่
                show={newCategory.status}
                header={newCategory.level===1?'ตั้งชื่อหมวดหมู่หลัก':`ตั้งชื่อหมวดหมู่ย่อยของ ${selectedCategory.name}`}
                onHide={()=>{setNewCategory({...newCategory,status:false})}}
                value={newCategory.name}
                onClick={addNewCategory}
                placeholder='ใส่ชื่อที่ต้องการ'
                onChange={(value)=>{setNewCategory({...newCategory,name:value})}}
            />
            <Modal_OneInput  // สำหรับแก้ไขหมวดหมู่
                show={editCategory_Modal}
                header={`แก้ไขชื่อหมวดหมู่ ชื่อเดิม"${selectedCategory.name.slice()}"`}
                onHide={()=>{setEditCategory_Modal(false)}}
                value={editCategory.name}
                onClick={updateEditCategory}
                placeholder='ใส่ชื่อที่ต้องการ'
                onChange={(value)=>{setEditCategory({...editCategory,name:value})}}
            />
            <div>
        <div style={styles.container}>
          {currentCategory.map((item, index) => {
            return (
              <div key={index} style={styles.container2}>
                <div style={styles.container3}>
                  <h3 >ชั้นที่ {item.level}</h3>
                </div>
                <div style={styles.container4}>
                  {/* Map over categories and render your components */}
                  {checkCategory2(allSelectedCategory, item).map((a, i) => {
                    const { id, name, aboveId, level } = a;
                    let status = someInArray(allSelectedCategory, 'id', id);
                    return (
                      <div
                        onClick={() => {
                          setSelectedCategory(a);
                          setAllSelectedCategory(manageCategory(item.value, allSelectedCategory, a));
                        }}
                        key={i}
                        style={{
                          padding: '10px',
                          borderRadius: '20px',
                          margin: '5px',
                          backgroundColor: status ? two : softWhite,
                          minWidth: '200px',
                          textAlign: 'center',
                          cursor:'pointer',
                          display:'flex',
                          flexDirection:'column',
                          justifyContent:'space-between'
                        }}
                      >
                        
                        <h4 style={styles.text}>{name}</h4>
                        <div style={styles.container5}>
                          <span
                            style={styles.container6}
                            onClick={() => {
                              setAlert_Modal({
                                ...initialAlert,
                                status:true,
                                content:`${name} และหมวดหมู่ย่อยที่เกี่ยวข้องจะถูกลบ`,
                                onClick:()=>{deleteCategory(a);setAlert_Modal(initialAlert)},
                                variant:'danger'
                              })
                            }}
                          >
                            ลบ
                          </span>
                          <span
                            style={styles.container7}
                            onClick={() => {
                              setEditCategory(a);
                              setEditCategory_Modal(true)
                            }}
                          >
                            แก้ไข
                          </span>
                          <span
                            style={styles.container7}
                            onClick={() => {
                              setNewCategory({ ...newCategory, level: level + 1, status: true, aboveId: [...aboveId, id] });
                              setSelectedCategory(a);
                              setAllSelectedCategory(manageCategory(item.value, allSelectedCategory, a));
                            }}
                          >
                            +
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {item.level === 1
                      ?<div
                          onClick={()=>{setNewCategory({...newCategory,status:true})}} 
                          style={styles.container8}
                        >
                          <h4  >+ เพิ่มหมวดหมู่หลัก</h4>
                      </div>
                      :null
                  }
                </div>
              </div>
            );
          })}
          {currentCategory.length===0
              ?<div
                  onClick={()=>{setNewCategory({...newCategory,status:true})}} 
                  style={styles.container8}
                >
                  <h4  >+ เพิ่มหมวดหมู่หลัก</h4>
              </div>
              :null
          }
        </div>
      </div>
      </Modal.Body>
      <FooterButton onHide={onHide} submit={()=>{submit(currentCategory)}} />
    </Modal>
  );
};

const styles = {
    container : {
      overflowY: 'auto', height: '70vh'
    },
    container2 : {
      display: 'flex', flexDirection: 'row'
    },
    container3 : {
      padding: '10px', borderRadius: '20px', margin: '5px',  textAlign: 'center' 
    },
    container4 : {
      overflowX: 'auto', display: 'flex', flexDirection: 'row' 
    },
    container5 : {
      display: 'flex', flexDirection: 'row', paddingTop: '10px'
    },
    container6 : {
      flex: 1, textAlign: 'center'
    },
    container7 : {
      flex: 1, textAlign: 'center', cursor:'pointer'
    },
    container8 : {
      padding:10,borderRadius:20,margin:5,backgroundColor:one,minWidth: '250px',cursor:'pointer',display:'flex',alignItems:'center',maxWidth:'300px'
    },
    text : {
      color: dark
    }
}

export default Modal_CategorySetting;
