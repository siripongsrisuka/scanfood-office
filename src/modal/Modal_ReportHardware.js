import React from "react";
import {
  Modal,
  Table,
} from "react-bootstrap";
import { colors } from "../configs";
import { stringDateTimeReceipt } from "../Utility/dateTime";


function Modal_ReportHardware({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  currentDisplay
}) {


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
    //    className="loading-screen"
       fullscreen
    >
      <Modal.Header closeButton>
        <h2><b>อุปกรณ์ที่ซื้อจาก Scanfood</b></h2>
      </Modal.Header>
      <Modal.Body  >
         <h4>ทั้งหมด {currentDisplay.length} รายการ</h4> 
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >No.</th>
                    <th style={styles.container3} >วันเวลา</th>
                    <th style={styles.container3} >รายละเอียด</th>
                    <th style={styles.container3} >เซล</th>
                    <th style={styles.container3} >รูปภาพ</th>
                    <th style={styles.container3} >หมายเหตุ</th>
                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { timestamp,  product = [], profileName, orderNumber, shopName, status, link, imageUrls = [], comment = '' } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>
                              <p>{orderNumber}</p>
                              {stringDateTimeReceipt(timestamp)}
                            </td>
                            <td >
                              {product.map((a,i)=>(
                                <p key={i} >- {a.name} : {a.qty} </p>
                              ))}
                            </td>
                            <td style={styles.container4}>{profileName}</td>
                            <td   style={styles.container4}>
                                {imageUrls.map((a,i)=><img key={i} src={a} alt="img" width={100} style={{ marginRight:5 }} />)}
                            </td>
                            <td  >{comment}</td>
                        </tr>
            })}
            </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  },
  container2 : {
    width:'5%', minWidth:'70px', textAlign:'center'
  },
  container3 : {
    width:'20%', minWidth:'150px', textAlign:'center', maxWidth:'200px'
  },
  container4 : {
    textAlign:'center'
  }
}

export default Modal_ReportHardware;
