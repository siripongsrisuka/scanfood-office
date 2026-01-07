import React, { useState, useEffect, useMemo } from "react";
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
import { Modal_Cancel, Modal_Customer, Modal_FlatListTwoColumn, Modal_Loading, Modal_OneInput, Modal_Package, Modal_Payment } from "../modal";
import { db } from "../db/firestore";
import { OneButton, SlideOptions } from "../components";
import { scanfoodAPI } from "../Utility/api";
import { stringDateTimeReceipt, stringReceiptNumber, stringYMDHMS3 } from "../Utility/dateTime";
import initialCustomer from "../configs/initialCustomer";
import { colors, initialProcess } from "../configs";
import { diffDaysCeil, diffDaysFloor, formatTime, toastSuccess } from "../Utility/function";
import initialCancelId from "../configs/initialCancelId";
import initialShopType from "../configs/initialShopType";

const { softWhite, dark, softGray } = colors;

const options = [
        {id:'1',name:'ongoing', value:'1'},
        {id:'2',name:'so', value:'2'},
        {id:'3',name:'success', value:'3'},
        {id:'4',name:'waste', value:'4'},
        {id:'5',name:'memo', value:'5'},
    ]

const initialOrder = {
    storeSize:20, 
    software:[], 
    requestDate:new Date(), 
    hardware:[], 
    note:'', 
    deliveryType:'normal'
};

const initialCancel = { cancelId:'', reason:'' };

const initialMemo = {
    id:'',
    createdAt:new Date(),
    profileId:'',
    profileName:'',
    content:'',
    team:''
}

function SaleScreen() {
    const [licenses, setLicenses] = useState([]);
    const [hardwares, setHardwares] = useState([]);
    const [license_Modal, setLicense_Modal] = useState(false);
    const [current, setCurrent] = useState(initialOrder);
    const [payment_Modal, setPayment_Modal] = useState(false);
    const [qrCode, setQrcode] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const { profile:{ id:profileId, name:profileName, team = "A" } } = useSelector(state=>state.profile);
    const [action_Modal, setAction_Modal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [cancel_Modal, setCancel_Modal] = useState(false);
    const [currentCancel, setCurrentCancel] = useState(initialCancel);
    const [memo, setMemo] = useState([]);
    const [memo_Modal, setMemo_Modal] = useState(false);
    const [currentMemo, setCurrentMemo] = useState(initialMemo);
    const { content } = currentMemo;

    const colorMap = useMemo(
        () => new Map(initialProcess.map(a=>[a.id,a.color]))
    ,[])

    const shopTypeMap = useMemo(
        ()=> new Map(initialShopType.map(a=>[a.id,a.name]))
    ,[])

    useEffect(()=>{
        setLoading(true);
        Promise.all([
            fetchLicense(),
            fetchHardware(),
            fetchCustomer(),
            fetchMemo()
        ]).then(()=>{
            setLoading(false)
        })
    },[]);

    async function fetchCustomer(){
        const today = new Date().getTime();
        try {
            const query = await db.collection('customer')
                .where('profileId','==',profileId)
                .where('status','==','waiting')
                .get();
            const results = query.docs.map(doc=>{
                const { createdAt, ...rest } = doc.data();
                return {
                    ...initialCustomer,
                    ...rest,
                    createdAt:formatTime(createdAt),
                    id:doc.id,
                    day:diffDaysCeil(formatTime(createdAt).getTime(),today)
                }
            });
            setCustomers(results)
        } catch (error) {
            console.log(error)
        }
    };

      async function fetchMemo(){
        try {
            const query = await db.collection('memo')
                .where('profileId','==',profileId)
                .orderBy('createdAt','desc')
                .limit(30)
                .get();
            const results = query.docs.map(doc=>{
                const { createdAt, ...rest } = doc.data();
                return {
                    ...rest,
                    createdAt:formatTime(createdAt),
                    id:doc.id,
                }
            });
            setMemo(results)
        } catch (error) {
            console.log(error)
        }
    };

    async function handleMemo(){
        setMemo_Modal(false);
        const { id, content } = currentMemo;
        setLoading(true);
        try {
            if(id){
                const memoRef = db.collection('memo').doc(id);
                await memoRef.update({ content });
                setMemo(prev=>prev.map(item=>
                    item.id === id
                        ?currentMemo
                        :item
                ))
                toastSuccess('อัปเดตสำเร็จ')
            } else {
                const memoRef = db.collection('memo').doc();
                const payload = {
                    content,
                    profileId,
                    profileName,
                    team,
                    createdAt:new Date(),
                    id:memoRef.id
                };
                await memoRef.set(payload);
                setMemo(prev=>[payload,...prev])
                toastSuccess('สร้างรายการสำเร็จ')
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
            setCurrentMemo(initialMemo)
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

    const [option, setOption] = useState({id:'1',name:'Ongoing', value:'1' });
    const { id:optionId, name:optinName, value } = option;

    const handleChange = (value) => {
      const option = options.find(a=>a.value === value)
        setOption(option);
    };

    const [customer_Modal, setCustomer_Modal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(initialCustomer);
    const { tel, id:customerId, storeSize } = currentCustomer;
    function openAction(item){
        setCurrentCustomer(item);
        setAction_Modal(true);
    }

    console.log(storeSize)
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
                setCurrent({...initialOrder, storeSize:Number(storeSize) })
                setLicense_Modal(true)
                break;
            case '2': // 100%
                if(!tel) return alert('ไม่มีเบอร์')
                window.location.href = `tel:${tel}`;
                break;
            case '3': // 100%
                setCustomer_Modal(true);
                break;
            case '4':
                setCancel_Modal(true);
                setCurrentCancel(initialCancel);
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
    };

    // 200%
    async function handleCancel(){
        const { cancelId, reason } = currentCancel;
        setCancel_Modal(false);
        setLoading(true);
        try {
            const customerRef = db.collection('customer').doc(customerId);
            await customerRef.update({ cancelId, reason });
                setCustomers(prev=>prev.filter(a=>a.id !== customerId));
                toastSuccess('อัปเดตสำเร็จ');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    function checkOpen(){
        if(optionId==='5') return setMemo_Modal(true);
        setCustomer_Modal(true);
    };

    function openMemo(item){
        setCurrentMemo(item);
        setMemo_Modal(true);
    }

  return (
    <div style={styles.container} >
        <h1>Sale</h1>
        <Modal_OneInput
            show={memo_Modal}
            header={`Memo`}
            onHide={()=>{setMemo_Modal(false);setCurrentMemo(initialMemo)}}
            value={content}
            onClick={handleMemo}
            placeholder='ใส่ memo'
            onChange={(value)=>{setCurrentMemo(prev=>({...prev, content:value }))}}
        />
        <Modal_Cancel
            show={cancel_Modal}
            onHide={()=>{setCancel_Modal(false)}}
            currentCancel={currentCancel}
            setCurrentCancel={setCurrentCancel}
            current={current}
            submit={handleCancel}
        />
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
        <div style={{ display:'flex', alignItems:'center' }} >
            <SlideOptions {...{ value, handleChange, options }} />&emsp;
            <Button style={{ backgroundColor:dark, borderRadius:100, width:'40px', height:'40px', borderColor:dark, marginBottom:'12px' }} onClick={checkOpen} ><i class="bi bi-plus-circle"></i></Button>
        </div>
        {['1','3','4'].includes(optionId)
            ?<React.Fragment>
                <h4>ทั้งหมด : {customers.length} ลูกค้า</h4>
                {customers.map((item,index)=>{
                    const { name, storeSize, shopType, note, process, day } = item;
                    const color = colorMap.get(process);
                    const shopTypeName = shopTypeMap.get(shopType);
                    return <Row onClick={()=>{openAction(item)}} key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                                <Col xs='12' sm='4'md='3'lg='3' ><i style={{ color }} class="bi bi-circle-fill"></i>&nbsp;<span style={{ color:softGray }} >({day})</span><span  >({storeSize})</span>{name}</Col>
                                <Col xs='6' sm='4'md='3'lg='3'  >{shopTypeName}</Col>
                                <Col md='12' lg='6'  >Note : {note}</Col>
                            </Row>
                })}
            </React.Fragment>
            :optionId==='2'
            ?null // so
            :optionId ==='5'
            ?<Row>
            {memo.map((item,index)=>{
                const { createdAt, content } = item;
                    return <Col onClick={()=>{openMemo(item)}} xs='12' sm='6'md='4'lg='3' key={index}  >
                        <Card style={{ marginBottom:'1rem', padding:5 }} >
                            <h6>{stringDateTimeReceipt(createdAt)}</h6>
                            <p>{content}</p>
                        </Card>
                    </Col>
                })}
            </Row>
            :null
        }
 
        

        {/* <RadarChart width={350} height={300} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis domain={[0, 100]} />
            <Radar dataKey="A" stroke="#d32f2f" fill="#d32f2f" fillOpacity={0.3} />
        </RadarChart> */}
      <div>
    </div>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh',
  }
}

export default SaleScreen;