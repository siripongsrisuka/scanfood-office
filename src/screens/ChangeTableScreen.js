import React, { useState } from "react";
import {
  Row,
  Col,
  Form
} from "react-bootstrap";

import { db } from "../db/firestore";
import { Modal_FlatlistSearchShop, Modal_Loading } from "../modal";
import { toastSuccess } from "../Utility/function";
import { OneButton } from "../components";
import { colors, initialShop, initialStoreSize } from "../configs";

function ChangeTableScreen() {

    const [loading, setLoading] = useState(false);
    const [search_Modal, setSearch_Modal] = useState(false);
    const [currentShop, setCurrentShop] = useState(initialShop);
    const { id:shopId, name:shopName, storeSize } = currentShop;

    function handleShop(item){
        setSearch_Modal(false)
        setCurrentShop(item)
    };

    async function handleChangeTable(){ // 100%

      if(!shopId) return alert('เลือกร้านก่อน');
        const ok = window.confirm(`คุณต้องการเปลี่ยนจำนวนโต๊ะเป็น ${storeSize} โต๊ะ ใช่หรือไม่?`)
        if(!ok) return;
    
        setLoading(true);

        try {
            await db.runTransaction( async (transaction)=>{
                const shopRef = db.collection("shop").doc(shopId);
                const shopDoc = await transaction.get(shopRef);
                const { packageArray = [], smartTable = [] } = shopDoc.data();
                if(packageArray.length>0) throw new Error('ไม่สามารถเปลี่ยนจำนวนโต๊ะได้ เนื่องจากมีการจ่ายเงินเข้ามาแล้ว');
                if(smartTable.length>Number(storeSize)) throw new Error(`ไม่สามารถเปลี่ยนจำนวนโต๊ะได้ เนื่องจากมีการสร้างโต๊ะเกินจำนวนโต๊ะใหม่ที่เลือก`);
                transaction.update(shopRef, {
                    storeSize:Number(storeSize),
                });
            });
            toastSuccess('เปลี่ยนจำนวนโต๊ะสำเร็จ');
            setCurrentShop(initialShop);
        } catch (error) {
            alert(error)
        } finally{
            setLoading(false)
        }
        
    };


  return (
    <div >
      <h1>เปลี่ยนจำนวนโต๊ะ</h1>
      <h5>เงื่อนไขการเปลี่ยนจำนวนโต๊ะ</h5>
      <h6>- ต้องเป็นบัญชีที่ยังไม่เคยมีการจ่ายเงินเข้ามา</h6>
      <h6>- ขนาดร้านต้องมากกว่าหรือเท่ากับจำนวนโต๊ะที่สร้างไว้แล้ว</h6>
        <Modal_FlatlistSearchShop
            show={search_Modal}
            onHide={()=>{setSearch_Modal(false)}}
            onClick={handleShop}
        />
        <Modal_Loading show={loading} />
        <br/>
         <Row>
          <Col md='4' sm='6' >
              <OneButton {...{ text:'1. เลือกร้านค้า', submit:()=>{setSearch_Modal(true)}, variant:'success' }} />
          </Col>
          <Col md='4' sm='6' >
              <OneButton {...{ text:'2. บันทึกการเปลี่ยนแปลง', submit:()=>{handleChangeTable()}, variant:shopId?'success':'secondary'  }} />
          </Col>
        </Row>
        {shopId
            ?<React.Fragment>
                <h5>ร้าน : {shopName}</h5>
                <Form.Select 
                    aria-label="Default select example" 
                    value={storeSize} 
                    onChange={(event)=>{
                    event.preventDefault()
                    if(event.target.value!==storeSize){
                        setCurrentShop({
                            ...currentShop,
                            storeSize:event.target.value,
                        })
                    }
                    }}
                    style={styles.container} 
                >
                    <option value="" disabled>เลือกขนาดโต๊ะ</option>
                    {initialStoreSize.map((item,index)=>{
                        return <option  key={index} value={item.value}>โต๊ะ : {item.value}</option>
                    })}
                </Form.Select>
            </React.Fragment>
            :null
        }
      <div>
      </div>
    </div>
  );
};

const styles = {
    container : {
        minWidth:'200px'
    },
    container2 : {
        width:'10%', minWidth:'80px', textAlign:'center'
    },
    container3 : {
        width:'30%', minWidth:'120px', textAlign:'center'
    }
}

export default ChangeTableScreen;