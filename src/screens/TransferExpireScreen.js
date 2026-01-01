import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";

import { db, prepareFirebaseImage } from "../db/firestore";
import { Modal_FlatlistSearchShop, Modal_Loading, Modal_Success } from "../modal";
import { cloneShop } from "../api/onesignal";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';
import { daysBetween, findInArray, formatTime } from "../Utility/function";
import { NumberYMD, plusDays } from "../Utility/dateTime";


function TransferExpireScreen() {
  const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [success_Modal, setSuccess_Modal] = useState(false);
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
            alert('success')
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
        <Modal_FlatlistSearchShop
            show={search_Modal}
            onHide={()=>{setSearch_Modal(false)}}
            onClick={handleShop}
        />
        <Modal_Loading show={loading} />
        <Modal_Success show={success_Modal} />
        <br/>
        <br/>
        <div style={{paddingLeft:'20px'}} >
              <Button onClick={()=>{navigate(-1)}} variant="info" style={{color:"white"}}  ><i class="bi bi-arrow-left"></i></Button>
          </div>
        <br/>
        <Row>
          <Col md='6' style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}} >
            <Button onClick={()=>{setSearch_Modal(true);setType('original')}} variant="dark" >ร้านต้นแบบ</Button>
            <br/>
            {original.id
                ?<div>
                    <h4>{original.name}</h4>
                    {original.vip.map(a=>{
                        const thisTime = formatTime(a.expire)
                        return thisTime > today
                            ?<p>{a.type} : {daysBetween(today,thisTime)} วัน</p>
                            :<p>{a.type} : หมดอายุ</p>
                    })}
                </div>
                :null
            }
          </Col>
          <Col md='6' style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}} >
            <Button onClick={()=>{setSearch_Modal(true);setType('copy')}} variant="dark" >ร้านก๊อปปี้</Button>
            <br/>
            {copy.id
                ?<div>
                    <h4>{copy.name}</h4>
                    {copy.vip.map(a=>{
                        const thisTime = formatTime(a.expire)
                        return thisTime > today
                            ?<p>{a.type} : {daysBetween(today,thisTime)} วัน</p>
                            :null
                    })}
                </div>
                :null
            }
          </Col>
        </Row>
        {original.id && copy.id
            ?<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button style={{ padding: '3rem' }} variant="success" onClick={handleTransfer}>
                ย้านวันใช้งานตอนนี้
              </Button>
            </div>
            :null
        }
        {/* <Button onClick={()=>{downloadImage('https://firebasestorage.googleapis.com/v0/b/shopchamp-restaurant.appspot.com/o/icon%2F2-67125d30eb9c8.webp?alt=media&token=8cd267f4-0a6d-4192-8d83-bc000015b38d')}} >downloadImage</Button> */}
      <div>
      </div>
    </div>
  );
}

export default TransferExpireScreen;