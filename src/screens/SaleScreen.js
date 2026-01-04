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
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Modal_Loading, Modal_Package, Modal_Payment } from "../modal";
import { db } from "../db/firestore";
import { OneButton } from "../components";
import { scanfoodAPI } from "../Utility/api";

function SaleScreen() {
    const [licenses, setLicenses] = useState([]);
    const [license_Modal, setLicense_Modal] = useState(false);
    const [current, setCurrent] = useState({ storeSize:20, software:[], requestDate:new Date(), hardware:[] });
    const [payment_Modal, setPayment_Modal] = useState(false);
    const [qrCode, setQrcode] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        setLoading(true);
        Promise.all([
            fetchLicense()
        ]).then(()=>{
            setLoading(false)
        })
    },[]);

    console.log('licenses')
    console.log(licenses)

    async function fetchLicense(){
        const licenseDoc = await db.collection('admin').doc('package').get();
        const { value } = licenseDoc.data();
        setLicenses(value)
    };

    
    const data = [
  { subject: 'R', A: 120 },
  { subject: 'B', A: 98 },
  { subject: 'T', A: 86 },
  { subject: 'RF', A: 99 },
  { subject: 'L', A: 85 },
];

    async function handleSubmit(payload){
        const shopId = '';
        const { status, data } = await scanfoodAPI.post('/gateway/payment/requestQr',{ 
            channelType:'posxpay',
            shopId:'scanfoodOffice',
            amount,
            serial:'WQRN002405000023',
            token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudElkIjoxMDQ3M30.P42rmcK6gLFCcf6x88rgpMx4hRGPPgDh4hgbreuCTaw',
            ref2:'checkout'
        });
        const { 
            referenceId,
            chargeId,
            qrCode,
        } = data?.data;
        setQrcode(qrCode);
        setAmount(amount);
        setPayment_Modal(true);
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
        <Modal_Package
            show={license_Modal}
            onHide={()=>{setLicense_Modal(false)}}
            current={current}
            setCurrent={setCurrent}
            licenses={licenses}
            submit={handleSubmit}

        />
      <h1>Temp</h1>
      <OneButton {...{ text:'เปิดบิล', submit:()=>{setLicense_Modal(true)} }} />
        <RadarChart width={350} height={300} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis domain={[0, 100]} />
            <Radar dataKey="A" stroke="#d32f2f" fill="#d32f2f" fillOpacity={0.3} />
        </RadarChart>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.text}>No.</th>
                <th style={styles.text}>วันที่สร้าง</th>
                <th style={styles.text}>ลูกค้า</th>
                <th style={styles.text}>software</th>
                <th style={styles.text}>hardware</th>
                <th style={styles.text}>ยอดชำระ</th>
                <th style={styles.text}>สถานะ</th>
            </tr>
            </thead>
            <tbody  >
            {[].map((item, index) => {
                const { orderNumber, timestamp, net, shopName, adminName, packageName, ownerId, ownerName } = item;
                return  <tr  style={styles.container} key={index} >
                            <td style={styles.text}>{index+1}.</td>
                            <td style={styles.text}>{orderNumber}</td>
                            <td style={styles.text}>{shopName}</td>
                            <td style={styles.text}>{net}</td>
                            <td style={styles.text}>{packageName}</td>
                            <td style={styles.text}>{adminName}</td>
                        </tr>
                }
            )}
            </tbody>
        </Table>
        {/* <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.text}>No.</th>
                <th style={styles.text}>วันที่ลง</th>
                <th style={styles.text}>ลูกค้า</th>
                <th style={styles.text}>รายละเอียด</th>
                <th style={styles.text}>ร้าน</th>
                <th style={styles.text}>ยอดชำระ</th>
                <th style={styles.text}>แพ็กเกจ</th>
                <th style={styles.text}>แอดมิน</th>
            </tr>
            </thead>
            <tbody  >
            {[].map((item, index) => {
                const { orderNumber, timestamp, net, shopName, adminName, packageName, ownerId, ownerName } = item;
                return  <tr  style={styles.container} key={index} >
                            <td style={styles.text}>{index+1}.</td>
                            <td style={styles.text}>{orderNumber}</td>
                            <td style={styles.text}>{shopName}</td>
                            <td style={styles.text}>{net}</td>
                            <td style={styles.text}>{packageName}</td>
                            <td style={styles.text}>{adminName}</td>
                        </tr>
                }
            )}
            </tbody>
        </Table> */}
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

export default SaleScreen;