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


function CloneScreen() {
  const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [search_Modal, setSearch_Modal] = useState(false);
    const [original, setOriginal] = useState({ id:'', name:''});
    const [copy, setCopy] = useState({ id:'', name:'' });
    const [type, setType] = useState('original')

    const downloadImage = async (imageUrl) => {
      setLoading(true)
      try {
          await cloneShop({ originalShop:original.id, nextShop:copy.id})
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
              <Button style={{ padding: '3rem' }} variant="success" onClick={downloadImage}>
                Clone Now!
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

export default CloneScreen;