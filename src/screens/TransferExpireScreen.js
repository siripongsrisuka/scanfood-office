import React, { useState } from "react";
import {
  Row,
  Col,
} from "react-bootstrap";

import { db } from "../db/firestore";
import { Modal_FlatlistSearchShop, Modal_Loading } from "../modal";
import { daysBetween, findInArray, formatTime, toastSuccess } from "../Utility/function";
import { NumberYMD, plusDays } from "../Utility/dateTime";
import { Card, OneButton } from "../components";
import { colors } from "../configs";

const { nine } = colors;

function TransferExpireScreen() {

    const [loading, setLoading] = useState(false);
    const [search_Modal, setSearch_Modal] = useState(false);
    const [original, setOriginal] = useState({ id:'', name:''});
    const [copy, setCopy] = useState({ id:'', name:'' });
    const [type, setType] = useState('original');
    const today = new Date();


    function handleShop(item){
        setSearch_Modal(false)
        if(type==='original'){
          setOriginal(item)
        } else {
          setCopy(item)
        }
    };

    async function handleTransfer(){ // 100%
      if(!original.id) return alert('เลือกร้านต้นทางก่อน');
      if(!copy.id) return alert('เลือกร้านปลายทางก่อน');

        const value = original.vip.filter(a=>formatTime(a.expire)>today).map(a=>({ packageType:a.type, day:daysBetween(today,formatTime(a.expire))}))
        const { id:shopId } = copy;
        setLoading(true)
        try {
            await db.runTransaction( async (transaction)=>{
                const shopRef = db.collection("shop").doc(shopId);
                const shopRef2 = db.collection('shop').doc(original.id)
                const shopDoc = await transaction.get(shopRef);
                const shopDoc2 = await transaction.get(shopRef2);
                const { vip } = shopDoc.data();
                const { vip:vip2 } = shopDoc2.data();
                let newVip = vip.slice().map(a=>({...a,expire:a.expire.toDate()}))
                    for(const item of value){
                        let find = findInArray(newVip,'type',item.packageType)
                        let nextDay = new Date()
                          if(find && find.type){
                              if(NumberYMD(new Date())> NumberYMD(find.expire)){ // แปลว่าหมดอายุไปก่อนหน้านี้แล้ว
                                  nextDay = plusDays(new Date(),item.day)
                              } else { // ยังไม่หมดอายุ จึงต่อจากวันใช้งานเดิม
                                  nextDay = plusDays(find.expire,item.day)
                              };
                          }
                          newVip = newVip.map(a=>{
                              return a.type===item.packageType
                                  ?{type:item.packageType,expire:nextDay}
                                  :a
                          })
                    }
                transaction.update(shopRef,{ vip:newVip })
                transaction.update(shopRef2,{ vip:vip2.map(a=>({...a,expire:today})) })
            })
            toastSuccess('ย้ายวันใช้งานสำเร็จ')
            setOriginal({ id:'', name:'' });
            setCopy({ id:'', name:'' })
        } catch (error) {
            console.log(error)
        } finally{
            setLoading(false)
        }
        
    };

  return (
    <div >
      <h1>ย้ายวันใช้งาน</h1>
      <h5>ค่าบริการ 500 บาทต่อครั้ง</h5>
        <Modal_FlatlistSearchShop
            show={search_Modal}
            onHide={()=>{setSearch_Modal(false)}}
            onClick={handleShop}
        />
        <Modal_Loading show={loading} />
        <br/>
         <Row>
          <Col md='4' sm='6' >
              <OneButton {...{ text:'1. เลือกร้านต้นทาง', submit:()=>{setSearch_Modal(true);setType('original')}, variant:'success' }} />
          </Col>
          <Col md='4' sm='6' >
              <OneButton {...{ text:'2. เลือกร้านปลายทาง', submit:() => {setSearch_Modal(true);setType('copy')}, variant:original.id?'success':'secondary' }} />
          </Col>
          <Col md='4' sm='6' >
              <OneButton {...{ text:'3. ย้ายวันใช้งานตอนนี้', submit:()=>{handleTransfer()}, variant:original.id&&copy.id?'success':'secondary'  }} />
          </Col>
        </Row>
        <Row>
          <Col sm='12' md='6' >
          {original.id && 
            <Card title="ร้านต้นทาง"  maxWidth={'95vw'}  >
                <h4>{original.name}</h4>
                {original.vip.map(a=>{
                    const thisTime = formatTime(a.expire)
                    return thisTime > today
                        ?<p>{a.type} : {daysBetween(today,thisTime)} วัน</p>
                        :<p>{a.type} : หมดอายุ</p>
                })}
            </Card>
          }
          </Col>
          <Col sm='12' md='6' >
            {copy.id &&
              <Card title="ร้านปลายทาง"  maxWidth={'95vw'} accentColor={nine} >
                  <h4>{copy.name}</h4>
                  {copy.vip.map(a=>{
                      const thisTime = formatTime(a.expire)
                      return thisTime > today
                          ?<p>{a.type} : {daysBetween(today,thisTime)} วัน</p>
                          :<p>{a.type} : หมดอายุ</p>
                  })}
              </Card>
            }
          </Col>
        </Row>
        
      <div>
      </div>
    </div>
  );
}

export default TransferExpireScreen;