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
  Tooltip,
  Dropdown
} from "react-bootstrap";


function Test() {
    const [color, setColor] = useState('red');
    // const [,] = useState()

    const color2 = 'red'

    function testColor(){
        // if(color==='red'){
        //     setColor('blue')
        // } else if(color==='blue'){
        //     setColor('green')
        // } else {
        //     setColor('red')
        // }
        alert('Qrcode')
    }

    // testColor()

  return (
    <div style={styles.container} >
      <h1>Un</h1>
        <Button onClick={testColor} style={{ backgroundColor:color }} > เปลี่ยนสี </Button>
  
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default Test;