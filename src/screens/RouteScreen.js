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

import { lineNotifyAPI, pushByTwoFilter } from "../api/onesignal";

function RouteScreen() {
    
  function testPush(){
    pushByTwoFilter({
      id:'cZ7XkJeZzNOrr5HEZKEPgAjtMrx2',
      shopId:'OoYpKchrpJ24H9yaIXmi',
      content:`คำสั่งซื้อเลขที่`,
      heading:'sss',
      data:{ sound:'heading'  }

    })
  };

  function testLine(){
    lineNotifyAPI({
      arrLineNotifyToken:["8AlwzGsVaRo7LwQUJSZj2UBkKv1vsmTsZJr1fgEeuCm"],
      message:'form care',
      // base64Image
  })
  }

  return (
    <div id="google_translate_element" >
      <h1>
        RouteScreen
      </h1>
      <Button onClick={()=>{testPush()}} >test</Button>
      <Button onClick={()=>{testLine()}} >testLine</Button>
      <div>

    </div>
    </div>
  );
}

export default RouteScreen;