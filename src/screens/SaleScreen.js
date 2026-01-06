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
import { Modal_Customer, Modal_FlatListTwoColumn, Modal_Loading, Modal_Package, Modal_Payment } from "../modal";
import { db } from "../db/firestore";
import { OneButton, SlideOptions } from "../components";
import { scanfoodAPI } from "../Utility/api";
import { stringReceiptNumber, stringYMDHMS3 } from "../Utility/dateTime";
import initialCustomer from "../configs/initialCustomer";
import { colors } from "../configs";
import { formatTime, toastSuccess } from "../Utility/function";

const { softWhite } = colors;

const actionOptions = [
    { id:'1', name:'เปิดบิล'},
    { id:'2', name:'โทร'},
    { id:'3', name:'แก้ไขโปรไฟล์'},
    { id:'4', name:'ย้ายไปถังขยะ'},
]

function SaleScreen() {
    const [licenses, setLicenses] = useState([]);
    const [hardwares, setHardwares] = useState([]);
    const [license_Modal, setLicense_Modal] = useState(false);
    const [current, setCurrent] = useState({ storeSize:20, software:[], requestDate:new Date(), hardware:[], note:'', deliveryType:'normal' });
    const [payment_Modal, setPayment_Modal] = useState(false);
    const [qrCode, setQrcode] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const { profile:{ id:profileId, name:profileName, team = "A" } } = useSelector(state=>state.profile);
    const [action_Modal, setAction_Modal] = useState(false);
    const [customers, setCustomers] = useState([]);

    useEffect(()=>{
        setLoading(true);
        Promise.all([
            fetchLicense(),
            fetchHardware(),
            fetchCustomer()
        ]).then(()=>{
            setLoading(false)
        })
    },[]);

    async function fetchCustomer(){
        try {
            const query = await db.collection('customer')
                .where('profileId','==',profileId)
                .where('status','==','waiting')
                .get();
            const results = query.docs.map(doc=>{
                const { createdAt, ...rest } = doc.data();
                return {
                    ...rest,
                    createdAt:formatTime(createdAt),
                    id:doc.id
                }
            });
            setCustomers(results)
        } catch (error) {
            console.log(error)
        }
    }


    async function fetchLicense(){
        const licenseDoc = await db.collection('admin').doc('package').get();
        const { value } = licenseDoc.data();
        setLicenses(value);
    };

    async function fetchHardware(){
        const hardwareDoc = await db.collection('admin').doc('hardware').get();
        const { value } = hardwareDoc.data();
        setHardwares(value);
    }


    
    const data = [
        { subject: 'R', A: 120 },
        { subject: 'B', A: 98 },
        { subject: 'T', A: 86 },
        { subject: 'RF', A: 99 },
        { subject: 'L', A: 85 },
    ];

    async function handleSubmit(payload){
        setLicense_Modal(false)
        setLoading(true);
        try {
            const amount = 1;
            const timestamp = new Date();
            const qrCode = await db.runTransaction(async (transaction) => {

                const docNumberRef = db.collection("admin").doc('documentNumber');
                const autoPaymentRef = db.collection('autoPayment').doc();
                const docNumberDoc = await transaction.get(docNumberRef);

                const { value } = docNumberDoc.data();
                const currentSo = value.find(a=>a.id==='so')
                let newValue = [];
                const thisMonth = timestamp.getMonth() + 1;
                let receiptNumber = `SO${stringReceiptNumber(1)}`;
                if(currentSo){
                    const { month, run } = currentSo;
                    let newRun = run + 1;
                    receiptNumber = `SO${stringReceiptNumber(newRun)}`;
                    
                    if (thisMonth !== month) {
                        newRun = 1;
                        receiptNumber = `SO${stringReceiptNumber(newRun)}`;
                        newValue = value.map(a=>{
                        return a.id==='so'
                            ?{ month: thisMonth, run: newRun, id:'so' }
                            :a
                        })
                    } else {
                    newValue = value.map(a=>{
                        return a.id==='so'
                            ?{ month, run: newRun, id:'so' }
                            :a
                    })
                    }
                } else {
                    newValue = [...value,{ month: thisMonth, run: 1, id:'so' }]
                };

                const { status, data } = await scanfoodAPI.post(process.env.REACT_APP_API_URL,{ 
                    channelType:'posxpay',
                    shopId:`sale:${autoPaymentRef.id}`,
                    amount,
                    serial:'WQRN002405000023',
                    token:process.env.REACT_APP_API_TOKEN,
                    ref2:'auto'
                });
                const { 
                    referenceId,
                    chargeId,
                    qrCode,
                } = data?.data;

                transaction.update(docNumberRef, { value:newValue });
                transaction.set(autoPaymentRef,{
                    ...current,
                    ...payload,
                    orderNumber:receiptNumber,
                    createdAt:timestamp,
                    chargeId,
                    qrCode,
                    shopId:'OoYpKchrpJ24H9yaIXmi',
                    shopName:'ตำกระด้ง',
                    billDate:stringYMDHMS3(timestamp),
                    profileId,
                    profileName,
                    process:'request', // request, cancel, success
                    team
                    
                })
                return qrCode
            });

            
            setQrcode(qrCode);
            setAmount(amount);
            setPayment_Modal(true);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
        
    };

    const [option, setOption] = useState({id:1,name:'Ongoing', value:'1' });
    const { id:optionId, name:optinName, value } = option;
    const [options] = useState([
        {id:1,name:'ongoing', value:'1'},
        {id:2,name:'so', value:'2'},
        {id:3,name:'success', value:'3'},
        {id:4,name:'waste', value:'4'},
        {id:5,name:'memo', value:'5'},
    ]);
    const handleChange = (value) => {
      const option = options.find(a=>a.value === value)
        setOption(option);
    };

    const [customer_Modal, setCustomer_Modal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(initialCustomer);
    const { tel, id:customerId } = currentCustomer;
    function openAction(item){
        setCurrentCustomer(item);
        setAction_Modal(true);
    }

    const actionOptions = [
    { id:'1', name:'เปิดบิล'},
    { id:'2', name:'โทร'},
    { id:'3', name:'แก้ไขโปรไฟล์'},
    { id:'4', name:'ย้ายไปถังขยะ'},
]
    function handleAction(item){
        setAction_Modal(false);
        switch (item.id) {
            case '1':
                setLicense_Modal(true)
                break;
            case '2':
                if(!tel) return alert('ไม่มีเบอร์')
                window.location.href = `tel:${tel}`;
                break;
            case '3':
                setCustomer_Modal(true);
                break;
            case '4':
                
                break;
        
            default:
                break;
        }
    };

    async function handleCustomer(){
        setCustomer_Modal(false);
        setLoading(true);
        try {
            if(customerId){
                const customerRef = db.collection('customer').doc(customerId);
                await customerRef.update(currentCustomer);
                setCustomers(prev=>prev.map(item=>
                    item.id === customerId
                        ?currentCustomer
                        :item
                ));
                toastSuccess('อัปเดตสำเร็จ')
            } else {
                const customerRef = db.collection('customer').doc();
                const payload = {
                    ...currentCustomer,
                    id:customerRef.id,
                    profileId,
                    profileName,
                    team,
                    billDate:stringYMDHMS3(new Date()),
                    createdAt:new Date()
                }
                await customerRef.set(payload);
                setCustomers(prev=>[payload,...prev]);
                toastSuccess('เพิ่มสำเร็จ')
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div style={styles.container} >
        <h1>Sale</h1>
        <Modal_FlatListTwoColumn
            header={'Action'}
            show={action_Modal}
            onHide={()=>{setAction_Modal(false)}}
            value={actionOptions}
            onClick={handleAction}
        />
        <Modal_Customer
            show={customer_Modal}
            onHide={()=>{setCustomer_Modal(false)}}
            current={currentCustomer}
            setCurrent={setCurrentCustomer}
            submit={handleCustomer}
        />
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
            hardwares={hardwares}
            submit={handleSubmit}

        />
        <SlideOptions {...{ value, handleChange, options }} />
      <OneButton {...{ text:'เปิดบิล', submit:()=>{setLicense_Modal(true)} }} />
      <OneButton {...{ text:'customer', submit:()=>{setCustomer_Modal(true)} }} />
        {customers.map((item,index)=>{
            const { name, storeSize, shopType, note } = item;
            return <Row onClick={()=>{openAction(item)}} key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px' }} >
                        <Col xs='12' sm='4'md='3'lg='3' >{name}</Col>
                        <Col xs='6' sm='4'md='3'lg='1'  >โต๊ะ : {storeSize}</Col>
                        <Col xs='6' sm='4'md='3'lg='2'  >{shopType}</Col>
                        <Col md='12' lg='6'  >Note : {note}</Col>
                    </Row>
        })}
        
        <RadarChart width={350} height={300} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis domain={[0, 100]} />
            <Radar dataKey="A" stroke="#d32f2f" fill="#d32f2f" fillOpacity={0.3} />
        </RadarChart>
   
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