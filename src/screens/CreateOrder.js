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
import { Modal_Loading, Modal_Payment } from "../modal";
import { scanfoodAPI } from "../Utility/api";


function CreateOrder() {
    const [payment_Modal, setPayment_Modal] = useState(false);
    const [qrCode, setQrcode] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    async function openPayment(){
        setLoading(true);
        const amount = 1;
        try {
            const payload = {

            }
            const { status, data } = await scanfoodAPI.post(process.env.REACT_APP_API_URL,{ 
                    // const { status, data } = await scanfoodAPI.post('/gateway/payment/requestQr',{ 
                        channelType:'posxpay',
                        shopId:'scanfoodOffice',
                        amount,
                        serial:'WQRN002405000023',
                        token:process.env.REACT_APP_API_TOKEN,
                        // token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudElkIjoxMDQ3M30.P42rmcK6gLFCcf6x88rgpMx4hRGPPgDh4hgbreuCTaw',
                        ref2:'checkout'
                    });
            // const { status, data } = await scanfoodAPI.post('/gateway/payment/requestQr',{ 
            //     channelType:'posxpay',
            //     shopId:'scanfoodOffice',
            //     amount,
            //     serial:'WQRN002405000023',
            //     token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudElkIjoxMDQ3M30.P42rmcK6gLFCcf6x88rgpMx4hRGPPgDh4hgbreuCTaw',
            //     ref2:'checkout'
            // });
            const { 
                referenceId,
                chargeId,
                qrCode,
            } = data?.data;
            setQrcode(qrCode);
            setAmount(amount);
            setPayment_Modal(true);
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }

    }

  return (
    <div style={styles.container} >
        <Modal_Loading show={loading} />
        <Modal_Payment
            show={payment_Modal}
            onHide={()=>{setPayment_Modal(false)}}
            qrCode={qrCode}
            amount={amount}
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