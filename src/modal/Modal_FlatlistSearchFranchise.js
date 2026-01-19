import React, { useState } from "react";
import { Row, Col, Button, Modal } from "react-bootstrap";
import '../App.css'
import _, { set } from "lodash"; // For debounce function
import { db } from "../db/firestore";
import { OneButton } from "../components";

function Modal_FlatlistSearchFranchise({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  onClick,
}) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchAllFranchise(){
    setIsLoading(true);
    try {
      const query = await db.collection('franchise').orderBy('timestamp','desc').get();
      const results = query.docs.map((doc)=>({ ...doc.data(), id: doc.id }));
 
      setResults(results);
    } catch (error) {
      console.log(error)
    } finally{
      setIsLoading(false);
    }
  }


    function close(){
      onHide()
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
        <h4><b>เลือกแฟรนไชส์</b></h4>
      </Modal.Header>
      <Modal.Body style={styles.container3} >
        <OneButton {...{ text: "ค้นหาแฟรนไชส์", submit: fetchAllFranchise, variant:'warning' }} />
        
        <br/>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            <h4>ค้นพบ {results.length} แฟรนไชส์</h4>
            <Row style={styles.container4} >
                {results?.map((item,index)=>{
                    return(
                      <Col key={index} sm='12' md='6'  style={styles.container} >
                        <Button onClick={()=>{onClick(item);close()}} variant="light" style={styles.container2} >
                          <h6>{item.name}</h6>
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

export default Modal_FlatlistSearchFranchise;
