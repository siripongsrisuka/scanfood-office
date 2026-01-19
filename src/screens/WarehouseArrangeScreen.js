import React, { useState } from "react";
import {
  Table,
} from "react-bootstrap";
import { toastSuccess } from "../Utility/function";
import '../styles/CartScreen.css'
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../db/firestore";
import { Modal_Arrange, Modal_Loading } from "../modal";
import { minusDays, plusSecond } from "../Utility/dateTime";
import { OneButton, RootImage } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { fetchNormalWarehouse } from "../redux/warehouseSlice";

function WarehouseArrangeScreen() {
  const dispatch = useDispatch();
  const { warehouse } = useSelector(state=>state.warehouse);
  const [loading, setLoading] = useState(false);
  const [arrange_Modal, setArrange_Modal] = useState(false);
  const [alphaData, setAlphaData] = useState([]);


  function openArrange(){
    setArrange_Modal(true)
    setAlphaData(warehouse.map((item,index)=>({...item,index})))
  };


async function submit(){
    setArrange_Modal(false)
    setLoading(true);

    const date = minusDays(new Date(),1)
    let newReOrder = alphaData.map((item,index)=>{return({...item,timestamp:plusSecond(date,30*index)})})
    const batchSize = 500;

    try {
      const totalUpdates = newReOrder.length;
    
      for (let i = 0; i < totalUpdates; i += batchSize) {
        const batch = db.batch();
    
        for (let j = i; j < i + batchSize && j < totalUpdates; j++) {
          const update = newReOrder[j];
          const docRef = db.collection('warehouse').doc(update.id);
          batch.update(docRef, {timestamp: update.timestamp});
        }
        await batch.commit();
      };
      dispatch(fetchNormalWarehouse(alphaData))
      setAlphaData(alphaData)

      toastSuccess('อัปเดตการจัดเรียงรายการสำเร็จ')
    } catch (error) {
      alert(error)
    } finally {
      setLoading(false)
    }
  };


  return (
    <div style={styles.container} >
        <Modal_Arrange
            show={arrange_Modal}
            onHide={()=>{setArrange_Modal(false)}}
            alphaData={alphaData}
            setAlphaData={setAlphaData}
            submit={submit}
        />
        <Modal_Loading show={loading} />
     
        <h2>จัดเรียงสินค้า</h2>
            <OneButton {...{ text:'จัดเรียงใหม่', submit:openArrange, variant:'warning' }} />
        <br/>
        <h4>ค้นพบ {warehouse.length} รายการ</h4>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr  >
                <th style={styles.container4}>No.</th>
                <th style={styles.container7}>รูปภาพ</th>
                <th style={styles.container5}>รายการ</th>
            </tr>
            </thead>
            <tbody  >
            {warehouse.map((item, index) => {
                const { imageId, name, id } = item;
                return <tr  key={id} >
                            <td style={styles.container9}  >{index+1}.</td>
                            <td style={styles.container9} >
                                {imageId
                                    ?<img style={styles.container8} src={imageId} />
                                    :<RootImage style={styles.container8} />
                                }
                            </td>
                            <td >{name}</td>
                        </tr>
            })}
            </tbody>
        </Table>
    </div>
  );
};

const styles = {
  container : {
      minHeight:'100vh'
  },
  container3 : {
    width: '100%', overflowX: 'auto'
  },
  container4 : {
    width: '5%', textAlign:'center'
  },
  container5 : {
    width: '30%', textAlign:'center',minWidth:'150px'
  },
  container7 : {
    width: '10%', textAlign:'center', minWidth:'100px'
  },
  
  container8 : {
    width:'5rem',height:'5rem'
  },
  container9 : {
    textAlign:'center'
  },


};

export default WarehouseArrangeScreen;
