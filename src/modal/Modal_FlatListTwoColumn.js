import React, { useState, useEffect } from "react";
import { Row, Col, Button, Modal, Form } from "react-bootstrap";
import { searchMultiFunction } from "../Utility/function";
import '../App.css'

function Modal_FlatListTwoColumn({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  header='',
  onClick,
  value,
  thisKey=['name'],
  placeholder='ค้นหาด้วยชื่อ',
  searchKey=['name']
}) {
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);

    useEffect(()=>{
        if(search){
          setDisplay(searchMultiFunction(value,search,searchKey))
        } else {
          setDisplay(value)
        }
    },[value,search])

    function close(){
      onHide()
      setSearch('')
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
            {display?.map((item,index)=>{
                return(
                  <Col key={index} sm='12' md='6'  style={styles.container} >
                    <Button onClick={()=>{onClick(item);setSearch('')}} variant="light" style={styles.container2} >
                      {thisKey.map((a,i)=>{
                        return <h6 key={i} >{item[a]}</h6>
                      })}
                    </Button>
                  </Col>
                )
            })}
        </Row>
      </Modal.Body>
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
      minHeight:'85vh',maxHeight:'85vh'
    },
    container4 : {
      overflowY: 'auto',maxHeight:'65vh'
    }
}

export default Modal_FlatListTwoColumn;
