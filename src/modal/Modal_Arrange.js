import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
} from "react-bootstrap";
import Modal_OneInput from "./Modal_OneInput";
import { onlyNumberValue2, searchMultiFunction } from "../Utility/function";
import { FooterButton, RootImage, SearchControl } from "../components";

function Modal_Arrange({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
  alphaData,
  setAlphaData
}) {
    const [move_Modal, setMove_Modal] = useState('');
    const [moveIndex, setMovIndex] = useState('');
    const [currentItem, setCurrentItem] = useState(null);
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);

    useEffect(()=>{
        let arr = alphaData
        if(search){
          arr = searchMultiFunction(arr,search,['name','sku'])
        }
        setDisplay(arr)
    },[alphaData,search])

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
  };

  function close(){
    setSearch('')
    onHide()
  }



  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={close}
      centered={centered}
      // fullscreen='xxl-down'
      fullscreen={true}
      size={size}
    >
      <Modal_OneInput  // สำหรับแก้ไขหมวดหมู่
            show={move_Modal}
            header='เลือกตำแหน่งที่ต้องการจัดเรียง'
            onHide={()=>{setMove_Modal(false)}}
            value={moveIndex}
            onClick={rearrangeArray}
            placeholder='ใส่ตำแหน่ง'
            onChange={(value)=>{setMovIndex(onlyNumberValue2(value))}}
        />
      <Modal.Header closeButton>
        <h2><b>เรียงรายการ</b></h2>
      </Modal.Header>
      <Modal.Body  >
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อสินค้า', search, setSearch }} />
      <br/>
      <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr  >
                <th style={styles.container4}>ลำดับ</th>
                <th style={styles.container5}>รูปภาพ</th>
                <th style={styles.container5}>รายการ</th>
            </tr>
            </thead>
            <tbody  >
            {display.map((item) => {
                const { imageId, name, sku, barcode, index } = item;
                return <tr onClick={()=>{setCurrentItem({ index, item });setMove_Modal(true)}} key={index} >
                            <td style={styles.container7}>{index+1}.</td>
                            <td style={styles.container7} >
                                {imageId
                                    ?<img style={styles.container8} src={imageId} />
                                    :<RootImage style={styles.container8} />
                                }
                                
                            </td>
                            <td style={styles.container7}>{name}</td>
                        </tr>
            })}
            </tbody>
        </Table>
      </Modal.Body>
      <FooterButton onHide={close} submit={submit} />
    </Modal>
  );
};

const styles = {
    container2 : {
      textAlign:'center',width:'12%'
    },
    container3 : {
      textAlign:'center',width:'22%'
    },
    container4 : {
        width: '5%', textAlign:'center'
    },
    container5 : {
        width: '9.5%', textAlign:'center',minWidth:'150px'
    },
    container6 : {
        cursor: 'pointer'
    },
    container7 : {
        textAlign:'center'
    },
    container8 : {
        width:'5rem',height:'5rem',borderRadius:'1rem'
      },
    image : {
      width:'100%',maxWidth:300,height:undefined,aspectRatio:1
    },
}

export default Modal_Arrange;
