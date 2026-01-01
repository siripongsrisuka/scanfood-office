import React, { useState, useEffect } from "react";
import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import { onlyNumberValue, searchMultiFunction } from "../Utility/function";
import '../App.css'
import { FooterButton } from "../components";
import Modal_OneInput from "./Modal_OneInput";

function Modal_Arrange({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  header='',
  placeholder='ค้นหาด้วยชื่อ',
  searchKey=['name'],
  items,
  submit
}) {
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);
    const [move_Modal, setMove_Modal] = useState('');
    const [moveIndex, setMovIndex] = useState('');
    const [alphaData, setAlphaData] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);

    function rearrangeArray() {
        if(moveIndex){
          const { index, item } = currentItem;
          const newData = alphaData.slice();
          // Remove 'e' from its current position
          newData.splice(index, 1);
          // Insert 'e' at the target index
          newData.splice(moveIndex-1, 0, item);
          
          setAlphaData(newData.map((item,index)=>({...item,index})));
        }
        setMove_Modal(false)
        setMovIndex('')
    }

    useEffect(()=>{
        if(show){
            setAlphaData(items)
        }
    },[items,show]);


    useEffect(()=>{
        if(search){
          setDisplay(searchMultiFunction(alphaData,search,searchKey))
        } else {
          setDisplay(alphaData)
        }
    },[alphaData,search])

    function close(){
      onHide()
      setSearch('')
      setAlphaData([])
    }
  // console.log(JSON.stringify(value,null,4));
  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={close}
      centered={centered}
      size={size}
      className="loading-screen"
    >
        <Modal_OneInput
            show={move_Modal}
            header={`เลือกลำดับที่ต้องการ`}
            onHide={()=>{setMovIndex('');setMove_Modal(false)}}
            value={moveIndex}
            onClick={rearrangeArray}
            placeholder='ใส่ตำแหน่ง'
            onChange={(value)=>{setMovIndex(onlyNumberValue(value))}}
        />
      <Modal.Header closeButton>
        <h4><b>{header}</b></h4>
      </Modal.Header>
      <Modal.Body style={styles.container3} >
        <Form.Control 
            type="search" 
            placeholder={placeholder}
            onChange={(event)=>{setSearch(event.target.value)}}
            value={search}
            name='ค้นหา'
        />
        <br/>
        <h4>ค้นพบ {display.length} รายการ</h4>
        <Row style={styles.container4} >
            {display?.map((item)=>{
                const { name, index } = item
                return(
                  <Col key={index} sm='12' md='6'  style={styles.container} >
                    <Button onClick={()=>{setCurrentItem({ item, index });setMove_Modal(true)}} variant="light" style={styles.container2} >
                      {index+1}. {name}
                    </Button>
                  </Col>
                )
            })}
        </Row>
      </Modal.Body>
      <FooterButton {...{ onHide, submit:()=>{submit(alphaData);close()} }} />
    </Modal>
  );
};

const styles = {
    container : {
      display:'flex',justifyContent:'center',cursor:'pointer'
    },
    container2 : {
      margin:'0.5rem',padding:'1rem',borderRadius:'1rem',width:'100%'
    },
    container3 : {
      minHeight:'55vh',maxHeight:'55vh'
    },
    container4 : {
      overflowY: 'auto',maxHeight:'55vh'
    }
}

export default Modal_Arrange;
