import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
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
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';

import { Button } from "rsuite";
import { logout } from "../redux/authSlice";
import { colors, initialAdmin } from "../configs";

const { dark } = colors;

function AdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state)=> state.auth);
    const { profile:{ id:profileId }} = useSelector(state=>state.profile)

    function exit(){
        dispatch(logout()).then(()=>{
            navigate('/')
        })
    };

    function commander(path,admin){
        let findName = initialAdmin.find(a=>a.id==profileId)?.name
        if(!admin.includes(findName)){
            alert('คนไม่มีสิทธิ์')
            return;
        }
        navigate(path)
    }

  return (
    <div  >
        <br/>
        <br/>
        <div style={{position:'absolute',top:10,right:10}} >
            <Button onClick={exit}  appearance="primary" style={{backgroundColor:dark}} ><i class="bi bi-box-arrow-right"></i></Button>
        </div>
      <Row>
        <Col onClick={()=>{navigate('/diagnosis')}} lg='4' md='6' sm='12' >
            <Button color="cyan" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} >Diagnosis flowchart</Button>
        </Col>
        <Col onClick={()=>{navigate('/store')}} lg='4' md='6' sm='12' >
            <Button color="red" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} > ร้านเดี่ยว </Button>
        </Col>
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{navigate('/sbs')}} color="yellow" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} > Customer Care </Button>
        </Col>
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{navigate('/equipment')}} color="green" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} > Hardware </Button>
        </Col>
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{navigate('/shop')}} color="cyan" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} > 50 ร้าน ล่าสุด </Button>
        </Col>

        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{commander('/approve',['pack','gift'])}} color="red" appearance="ghost" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} >อนุมัติ คำสั่งซื้อ</Button>
        </Col>
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{navigate('/importItemFranchise')}} color="orange" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} >  import สินค้า Franchise  </Button>
        </Col>
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{navigate('/importBomFranchise')}} color="yellow" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} > import bom Franchise </Button>
        </Col>
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{navigate('/importMarketPlaceFranchise')}} color="cyan" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} > import marketplace Franchise </Button>
        </Col>
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{navigate('/customerCare')}} color="blue" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} > คุณลูกค้าที่น่ารัก </Button>
        </Col>
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{commander('/transform',['pack','ton','gift'])}} color="blue" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} > เปลี่ยนไม่มีโต๊ะ ให้เป็น 1- 20 โต๊ะ </Button>
        </Col>
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{commander('/transferExpire',['pack','gift'])}} color="blue" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} >ย้ายวันใช้งาน</Button>
        </Col>
    
        <Col lg='4' md='6' sm='12' >
            <Button onClick={()=>{commander('/questionSetting',['pack','gift'])}} color="blue" appearance="primary" style={{height:'88px',width:'90%',marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem',fontSize:'2rem'}} >QuestionSetting</Button>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard;