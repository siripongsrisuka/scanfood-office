import React, { useState } from "react";
import {
  Button,
  Row,
  Col,
} from "react-bootstrap";

import { Modal_FlatlistSearchShop, Modal_Loading } from "../modal";
import { shopchampRestaurantAPI } from "../Utility/api";
import { toastSuccess } from "../Utility/function";

function CloneScreen() {

    const [loading, setLoading] = useState(false);
    const [search_Modal, setSearch_Modal] = useState(false);
    const [original, setOriginal] = useState({ id:'', name:''});
    const [copy, setCopy] = useState({ id:'', name:'' });
    const [type, setType] = useState('original')

    const handleClone = async () => {
      setLoading(true)
      try {
            const response = await shopchampRestaurantAPI.post(
              "/shop/cloneShop/",
              {
                originalShop:original.id,
                nextShop:copy.id
              }
            );
            toastSuccess('Clone ร้านค้าสำเร็จ');
            setLoading(false)
      } catch (error) {
        console.log(error)
      }
      };
    


    function handleShop(item){
        setSearch_Modal(false)
        if(type==='original'){
          setOriginal(item)
        } else {
          setCopy(item)
        }
    }

  return (
    <div >
      <h1>Clone ข้อมูลจากร้านต้นทางไปร้านปลายทาง</h1>
      <h5>1. ข้อมูล Shop ได้แก่</h5>
      <h6>smartCategory, smartOption, smartKitchen, channel, BOMCategory, scanFoodPayment, scanFoodVat, scanFoodServiceCharge, rounding, payConfig</h6>
      <h5>2. ข้อมูลสินค้าทั้งหมด</h5>
      <h5>3. ข้อมูลวัตถุดิบ</h5>
        <Modal_FlatlistSearchShop
            show={search_Modal}
            onHide={()=>{setSearch_Modal(false)}}
            onClick={handleShop}
        />
        <Modal_Loading show={loading} />
        <br/>
        <br/>
        <Row>
          <Col md='6' style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}} >
            <Button onClick={()=>{setSearch_Modal(true);setType('original')}} variant="dark" >ร้านต้นแบบ</Button>
            <br/>
            {original.id
                ?<h4>{original.name}</h4>
                :null
            }
          </Col>
          <Col md='6' style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}} >
            <Button onClick={()=>{setSearch_Modal(true);setType('copy')}} variant="dark" >ร้านก๊อปปี้</Button>
            <br/>
            {copy.id
                ?<h4>{copy.name}</h4>
                :null
            }
          </Col>
        </Row>
        {original.id && copy.id
            ?<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button style={{ padding: '3rem' }} variant="success" onClick={handleClone}>
                Clone Now!
              </Button>
            </div>
            :null
        }
      <div>
      </div>
    </div>
  );
}

export default CloneScreen;