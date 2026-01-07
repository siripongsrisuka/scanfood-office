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
import { Modal_Cancel, Modal_Customer, Modal_FlatlistSearchShop, Modal_FlatListTwoColumn, Modal_Loading, Modal_OneInput, Modal_Package, Modal_Payment } from "../modal";
import { db } from "../db/firestore";
import { SlideOptions } from "../components";
import { scanfoodAPI } from "../Utility/api";
import { stringDateTimeReceipt, stringReceiptNumber, stringYMDHMS3, yearMonth } from "../Utility/dateTime";
import initialCustomer from "../configs/initialCustomer";
import { colors, initialProcess } from "../configs";
import { diffDaysCeil, formatCurrency, formatTime, toastSuccess, wait } from "../Utility/function";
import initialShopType from "../configs/initialShopType";

const { softWhite, dark, softGray, greenSanta, white } = colors;

const options = [
        {id:'1',name:'lead', value:'1'},
        {id:'2',name:'so', value:'2'},
        {id:'3',name:'success', value:'3'},
        {id:'4',name:'waste', value:'4'},
        {id:'5',name:'memo', value:'5'},
        {id:'6',name:'SW', value:'6'},
        {id:'7',name:'HW', value:'7'},
];

const actionOptions = [
    { id:'1', name:'เปิดบิล'},
    { id:'2', name:'โทร'},
    { id:'3', name:'แก้ไขโปรไฟล์'},
    { id:'4', name:'ผูกบัญชีร้านค้า'},
    { id:'5', name:'ย้ายไปถังขยะ'},
];

const processMap = {
    'request':'รอชำระ',
    'success':'เสร็จสมบูรณ์',
    'paid':'ชำระเงินแล้ว',
    'cancel':'ยกเลิก'
};

const paymentActions = [
    { id:'1', name:'ผูกร้าน' },
    { id:'2', name:'ขอ QR Payment' },
    { id:'3', name:'รายละเอียด' },
    { id:'4', name:'ยกเลิกออเดอร์' },
]

const initialOrder = {
    storeSize:20, 
    software:[], 
    requestDate:new Date(), 
    hardware:[], 
    note:'', 
    deliveryType:'normal',
    customerId:''
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
    const [waste, setWaste] = useState([]);
    const [successCases, setSuccessCases] = useState([]);
    const [connect_Modal, setConnect_Modal] = useState(false);
    const [payments, setPayments] = useState([]);
    const [paymentAction_Modal, setPaymentAction_Modal] = useState(false);
    const [softwares, setSoftwares] = useState([]); // license เฉพาะที่ยังไม่ได้อนุมัติ
    const [hardware, setHardware] = useState([]); // hardware เฉพาะที่ยังไม่จัดส่ง
    const [option, setOption] = useState({id:'1',name:'Ongoing', value:'1' });
    const { id:optionId, name:optinName, value } = option;
    const [customer_Modal, setCustomer_Modal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(initialCustomer);
    const { tel, id:customerId, storeSize, shopId, shopName, name } = currentCustomer;

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
            fetchMemo(),
            fetchWaste(),
            fetchSuccessCases(),
            fetchPayment(),
            fetchSoftware()
        ]).then(()=>{
            setLoading(false)
        })
    },[]);

        // 200%
    async function fetchSoftware(){
        try {
            const query = await db.collection('packageOrder')
                .where('profileId','==',profileId)
                .where('status','==','request')
                .get();
            
            const results = query.docs.map(doc=>{
                const { timestamp, requestDate, ...rest } = doc.data();
                return {
                    ...rest,
                    timestamp:formatTime(timestamp),
                    requestDate:formatTime(requestDate),
                    id:doc.id,
                }
            });
            setSoftwares(results)
        } catch (error) {
            console.log(error)
        }
    };

    // 200%
    async function fetchPayment(){
        try {
            const query = await db.collection('autoPayment')
                .where('profileId','==',profileId)
                .orderBy('createdAt','desc')
                .limit(30)
                .get();
            const results = query.docs.map(doc=>{
                const { createdAt, requestDate, ...rest } = doc.data();
                return {
                    ...rest,
                    createdAt:formatTime(createdAt),
                    requestDate:formatTime(requestDate),
                    id:doc.id,
                }
            });
            setPayments(results)
        } catch (error) {
            console.log(error)
        }
    };

    // 200%
    async function fetchWaste(){
        const thisYearMonth = yearMonth(new Date());
        try {
            const query = await db.collection('customer')
                .where('profileId','==',profileId)
                .where('status','==','cancel')
                .where('yearMonth','==',thisYearMonth)
                .get();
            const results = query.docs.map(doc=>{
                const { createdAt, ...rest } = doc.data();
                return {
                    ...initialCustomer,
                    ...rest,
                    createdAt:formatTime(createdAt),
                    id:doc.id,
                }
            });
            setWaste(results)
        } catch (error) {
            console.log(error)
        }
    };

    // 200%
    async function fetchSuccessCases(){
        const thisYearMonth = yearMonth(new Date());
        try {
            const query = await db.collection('customer')
                .where('profileId','==',profileId)
                .where('status','==','paid')
                .where('yearMonth','==',thisYearMonth)
                .get();
            const results = query.docs.map(doc=>{
                const { createdAt, ...rest } = doc.data();
                return {
                    ...initialCustomer,
                    ...rest,
                    createdAt:formatTime(createdAt),
                    id:doc.id,
                }
            });
            setSuccessCases(results)
        } catch (error) {
            console.log(error)
        }
    };

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
                    shopId,
                    shopName,
                    billDate:stringYMDHMS3(timestamp),
                    profileId,
                    profileName,
                    process:'request', // request, cancel, success
                    team,
                    customerId,
                    name
                    
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


    const handleChange = (value) => {
      const option = options.find(a=>a.value === value)
        setOption(option);
    };


    function openAction(item){
        setCurrentCustomer(item);
        if(optionId==='1') return setAction_Modal(true);
        setCustomer_Modal(true)
    };

    async function handleAction(item){
        setAction_Modal(false);
        await wait(500)
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
                setConnect_Modal(true);
                break;
            case '5':
                setCancel_Modal(true);
                setCurrentCancel(initialCancel);
                break;
        
            default:
                break;
        }
    };


    // 200%
    async function handleCustomer(){
        setCustomer_Modal(false);
        if(currentCustomer.status !=='waiting') return alert('แก้ไขไม่ได้')
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
                    createdAt:new Date(),
                    // yearMonth:yearMonth(new Date()) // เอาไว้ใส่ตอน success หรือ cancel
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
            await customerRef.update({ 
                cancelId, 
                reason, 
                status:'cancel',
                yearMonth:yearMonth(new Date()) 
            });
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
    };

    async function handleConnect(item){
        setConnect_Modal(false);
        const { id, name, storeSize } = item;
        setLoading(true);
        try {
            const updatedField = {
                shopId:id, shopName:name, storeSize
            }
            const customerRef = db.collection('customer').doc(customerId);
            await customerRef.update(updatedField);
            setCustomers(prev=>prev.map(item=>
                item.id === customerId
                    ?{
                        ...item,...updatedField
                    }
                    :item
            ));
            toastSuccess('ผูกร้านสำเร็จแล้ว')

        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    const [currentPayment, setCurrentPayment] = useState(initialOrder);

    async function handlePaymentAction(item){
        setPaymentAction_Modal(false);
        await wait(500);
        const { qrCode, net } = currentPayment
        switch (item.id) {
            case '1':
                openPaidOrder()
                break;
            case '2': // 100%
                setQrcode(qrCode);
                setPayment_Modal(true);
                setAmount(net)
                break;
            case '3': // 100%
                setCurrent(currentPayment);
                setLicense_Modal(true);
                break;
            case '4':
                const ok = window.confirm('ยืนยันการยกเลิกออเดอร์')
                if(ok){
                    handleCancelPayment()
                }
                break;
            default:
                break;
        }
    };

    async function openPaidOrder(){
        const { shopId } = currentPayment;
        if(shopId) return alert('ผูก shop ไว้อยู่แล้ว')
    }

    // 100%
    async function handleCancelPayment(){
        setLoading(true);
        try {
            await db.runTransaction( async (transaction)=>{
                const orderRef = db.collection('autoPayment').doc(currentPayment.id);
                const orderDoc = await transaction.get(orderRef);
                const { process } = orderDoc.data();
                if(process!=='request') throw new Error(`ยกเลิกสถานะนี้ไม่ได้นะ : ${process}`);
                transaction.update(orderRef,{ process:'cancel' })
            });
            setPayments(prev=>prev.map(item=>
                item.id === currentPayment.id
                    ?{ ...item, process:'cancel' }
                    :item
            ));
            toastSuccess('ยกเลิกบิลสำเร็จ')
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    function openPaymentOption(item){
        setCurrentPayment(item);
        setPaymentAction_Modal(true);
    }

  return (
    <div style={styles.container} >
        <div style={{ display:'flex', justifyContent:'space-between', marginRight:'3rem', paddingTop:'1rem' }} >
            <RadarChart width={105} height={100} data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar dataKey="A" stroke="#d32f2f" fill="#d32f2f" fillOpacity={0.3} />
            </RadarChart>
            <Button style={{ backgroundColor:greenSanta, borderRadius:100, width:'40px', height:'40px', borderColor:greenSanta }} onClick={checkOpen} ><i class="bi bi-plus-circle"></i></Button>
        </div>
        <SlideOptions {...{ value, handleChange, options }} />
        <Modal_FlatListTwoColumn
            header={'Payment Action'}
            show={paymentAction_Modal}
            onHide={()=>{setPaymentAction_Modal(false)}}
            value={paymentActions}
            onClick={handlePaymentAction}
        />
        <Modal_FlatlistSearchShop
            show={connect_Modal}
            onHide={()=>{setConnect_Modal(false)}}
            onClick={handleConnect}
        />
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
            disabled={optionId!=='1'}

        />

        {optionId==='1'
        // {['1','3','4'].includes(optionId)
            ?<React.Fragment>
                <h4>ทั้งหมด : {customers.length} ลูกค้า</h4>
                {customers.map((item)=>{
                    const { name, storeSize, shopType, note, process, day, shopId } = item;
                    const color = colorMap.get(process);
                    const shopTypeName = shopTypeMap.get(shopType);
                    return <Row onClick={()=>{openAction(item)}} key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >

                                <Col xs='12' sm='4'md='3'lg='3' ><i style={{ color }} class="bi bi-circle-fill"></i>&nbsp;<span style={{ color:softGray }} >({day})</span><span  >({storeSize})</span>{name}{shopId?<span><button style={{ backgroundColor:'rgba(247,199,77,0.9)'}} >ผูกบัญชีแล้ว</button></span>:null}</Col>
                                <Col xs='6' sm='4'md='3'lg='3'  >{shopTypeName}</Col>
                                <Col md='12' lg='6'  >Note : {note}</Col>
                            </Row>
                })}
            </React.Fragment>
            :optionId === '3'
            ?<React.Fragment> 
                <h4>ทั้งหมด : {successCases.length} Success</h4>
                {successCases.map((item)=>{
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
            :optionId==='4'
            ?<React.Fragment> 
                <h4>ทั้งหมด : {waste.length} Failed</h4>
                {waste.map((item)=>{
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
            ?<React.Fragment> 
                <h4>ทั้งหมด : {payments.length} บิล</h4>
                {payments.map((item)=>{
                    const { name, shopName, net, process } = item;
                    const processName = processMap[process]
                    return <Row onClick={()=>{openPaymentOption(item)}} key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                                <Col xs='12' sm='6'  >{name}[{shopName}]</Col>
                                <Col xs='6' sm='3'  >{formatCurrency(net)}</Col>
                                <Col xs='6' sm='3'  >{processName}</Col>
                            </Row>
                })}
            </React.Fragment> // so
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
            :optionId ==='6'
            ?<React.Fragment> 
                <h4>ทั้งหมด : {softwares.length} รายการ</h4>
                {softwares.map((item)=>{
                    const { name, shopName, net, process, requestDate } = item;
                    const processName = processMap[process]
                    return <Row onDoubleClick={()=>{alert('xxx')}}  key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                                <Col xs='12' sm='6'  >{name}[{shopName}]</Col>
                                <Col xs='6' sm='3'  >{formatCurrency(net)}</Col>
                                <Col xs='6' sm='3'  >{processName}</Col>
                            </Row>
                })}
            </React.Fragment> // so
            :null
        }
 
        

        
      <div>
    </div>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh',
    position:'relative'
  }
}

export default SaleScreen;