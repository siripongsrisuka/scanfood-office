import React, { useState } from "react";
import { Row, Col, Button, Modal, Form } from "react-bootstrap";
import '../App.css'
import _ from "lodash"; // For debounce function
import { db } from "../db/firestore";
import { OneButton } from "../components";
import { formatTime } from "../Utility/function";

function Modal_FlatlistSearchShop({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  onClick,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchByTel(){
    setIsLoading(true);
    try {
      const query = await db.collection('shop').where('tel','==',searchTerm).get();
      const results = query.docs.map(doc=>{
        const { createdDate = new Date(), ...rest } = doc.data();
        return {
          ...rest,
          id:doc.id,
          createdDate:formatTime(createdDate)
        }
      })
      setResults(results);

    } catch (error) {
      alert(error)
    } finally {
      setIsLoading(false);
    }
  };


  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // debouncedSearch(value); // Trigger debounce
  };

    function close(){
      onHide()
      setSearchTerm('')
      setResults([])
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
      // className="loading-screen"
    >
      <Modal.Header closeButton>
        <h4><b>เลือกร้านค้า</b></h4>
      </Modal.Header>
      <Modal.Body style={styles.container3} >
        <div style={{display:'flex'}} >
          <Form.Control 
              type="search" 
              placeholder='ค้นหาด้วยเบอร์โทรร้าน'
              onChange={handleInputChange}
              value={searchTerm}
              name='ค้นหา'
          />&emsp;
          <OneButton {...{ text:'ค้นหา', submit:fetchByTel }} />
        </div>
        
        <br/>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            <h4>ค้นพบ {results.length} ร้าน</h4>
            <Row style={styles.container4} >
                {results?.map((item,index)=>{
                    return(
                      <Col key={index} sm='12' md='6'  style={styles.container} >
                        <Button onClick={()=>{onClick(item);close()}} variant="light" style={styles.container2} >
                          <h6>{item.name}</h6>
                          <h6>{item.tel}</h6>
                        </Button>
                      </Col>
                    )
                })}
            </Row>
          </ul>
        )}
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

export default Modal_FlatlistSearchShop;
