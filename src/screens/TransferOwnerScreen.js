import React, { useState } from "react";
import {
  Row,
  Col,
} from "react-bootstrap";

import { db } from "../db/firestore";
import { Modal_FlatlistSearchShop, Modal_Loading } from "../modal";
import { toastSuccess } from "../Utility/function";
import { OneButton } from "../components";
import { colors, initialShop } from "../configs";

const { nine } = colors;

function TransferOwnerScreen() {

    const [loading, setLoading] = useState(false);
    const [search_Modal, setSearch_Modal] = useState(false);
    const [currentShop, setCurrentShop] = useState(initialShop);
    const { id:shopId, name:shopName } = currentShop;
    const [currentOwner, setCurrentOwner] = useState([])

    function handleShop(item){
        setSearch_Modal(false)
        setCurrentShop(item)
        setCurrentOwner(item.humanResource)
    };

    async function handleTransfer(){ // 100%
        const ok = window.confirm(`ยืนยันการย้ายสิทธิ์ Owner ของร้าน ${shopName} ?`)
        if(!ok) return;
      if(!shopId) return alert('เลือกร้านก่อน');

        setLoading(true);
        const owner = currentOwner.find(a=>a.position.includes('001'));
        if(!owner) {
            alert('กรุณาเลือก Owner ก่อนทำการย้ายสิทธิ์')
            setLoading(false)
            return;
        }
        try {
            await db.runTransaction( async (transaction)=>{
                const shopRef = db.collection("shop").doc(shopId);
                const shopDoc = await transaction.get(shopRef);
                const { humanResource:hr } = shopDoc.data();
                let newHr = hr.map(item=>
                    item.id === owner.id
                        ?{ ...item, position:['001'], owner:true }
                        :{...item, position:[], owner:false }
                )
                transaction.update(shopRef,{ humanResource:newHr  })
            });
            toastSuccess('ย้ายสิทธิ์ Owner สำเร็จ');
            setCurrentShop(initialShop);
        } catch (error) {
            console.log(error)
        } finally{
            setLoading(false)
        }
        
    };

    function handleOwner(item){
        const ok = window.confirm(`ย้าย ${item.name} เป็น owner  ?`)
        if(!ok) return;

        setCurrentOwner(prev=>prev.map(a=>
            a.id === item.id
                ?{ ...a, position:['001'], owner:true }
                :{...a, position:[], owner:false }
        ))
    };


  return (
    <div >
      <h1>ย้ายสิทธิ์ Owner</h1>
      <h5>เงื่อนไขการย้ายสิทธิ์ Owner</h5>
      <h6>- ต้องมีสิทธิ์พนักงานเท่านั้น</h6>
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
              <OneButton {...{ text:'2. กดเลือก owner จากด้านล่าง', submit:() => {alert('กดจากรูปพนักงานเอาจ้า')}, variant:currentShop.id?'success':'secondary' }} />
          </Col>
          <Col md='4' sm='6' >
              <OneButton {...{ text:'3. บันทึกการเปลี่ยนแปลง', submit:()=>{handleTransfer()}, variant:currentShop.id?'success':'secondary'  }} />
          </Col>
        </Row>
        {shopId
            ?<React.Fragment>
                <h5>ร้าน : {shopName}</h5>
                <Row>
                        {currentOwner.map((item,index)=>{
                            const owner = item.position.includes('001')
                            return <Col key={index} sm='6' md='4' lg='3' >
                                <div 
                                    onClick={()=>{handleOwner(item)}}
                                >
                                    <img 
                                        src={item.imageId || '/noImage.png'} 
                                        alt={item.name} 
                                        style={{ width:'100%', maxWidth:'150px', height:'auto', borderRadius:'8px', border:owner?'4px solid '+nine:'4px solid transparent', cursor:'pointer' }} 
                                    />
                                    <h5>{item.name}</h5>
                                    <h5>{item.position}</h5>
                                </div>
                            </Col>
                        })
                        }
                </Row>
            </React.Fragment>
            :null
        }
      <div>
      </div>
    </div>
  );
}

export default TransferOwnerScreen;