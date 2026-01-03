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
import { OneButton } from "../components";
import { Modal_Payment } from "../modal";


function CreateOrder() {
    const [payment_Modal, setPayment_Modal] = useState(false);

    function openPayment(){
        setPayment_Modal(true);
    }

  return (
    <div style={styles.container} >
        <Modal_Payment
            show={payment_Modal}
            onHide={()=>{setPayment_Modal(false)}}
        />
        <OneButton {...{ text:'เปิดบิล', submit:()=>{openPayment()} }} />
      <h1>
       Temp
      </h1>
      <div>

    </div>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default CreateOrder;