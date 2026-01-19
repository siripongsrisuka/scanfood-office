import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Modal_Cancel, Modal_Customer, Modal_FlatlistSearchShop, Modal_FlatListTwoColumn, Modal_Loading, Modal_OneInput, Modal_So, Modal_Qrcode, Modal_DatePicker } from "../modal";
import { db } from "../db/firestore";
import { SlideOptions } from "../components";
import { scanfoodAPI } from "../Utility/api";
import { stringDateTimeReceipt, stringFullDate, stringReceiptNumber, stringYMDHMS3, yearMonth } from "../Utility/dateTime";
import initialCustomer from "../configs/initialCustomer";
import { colors, initialProcess } from "../configs";
import { fetchCustomer, fetchHardware, fetchLicense, fetchMemo, fetchPayment, fetchSoftware, fetchSuccessCases, fetchWaste, formatCurrency, formatTime, isGodIt, toastSuccess, wait } from "../Utility/function";
import initialShopType from "../configs/initialShopType";
import initialCancelId from "../configs/initialCancelId";
const { softWhite, dark, softGray, greenSanta, white } = colors;

const data = [
    { subject: 'R', A: 120 },
    { subject: 'B', A: 98 },
    { subject: 'T', A: 86 },
    { subject: 'RF', A: 99 },
    { subject: 'L', A: 85 },
];

const options = [
        {id:'1',name:'lead', value:'1'},
        {id:'2',name:'so', value:'2'},
        {id:'3',name:'success', value:'3'},
        {id:'4',name:'waste', value:'4'},
        {id:'5',name:'memo', value:'5'},
        {id:'6',name:'SW', value:'6'},
        {id:'7',name:'HW', value:'7'},
];

const customerOptions = [
    { id:'1', name:'เปิดบิล'},
    { id:'2', name:'โทร'},
    { id:'3', name:'แก้ไขโปรไฟล์'},
    { id:'4', name:'ผูกบัญชีร้านค้า'},
    { id:'5', name:'ย้ายไปถังขยะ'},
];

const processMap = {
    'request':{ name:'รอชำระ', color:'#FFE871'},
    'success':{ name:'เสร็จสมบูรณ์', color:'#0D8266'},
    'paid':{ name:'ชำระเงินแล้ว', color:'#5DC3FF'},
    'cancel':{ name:'ยกเลิก', color:'#FF5757'}
};

const paymentOptions = [
    { id:'1', name:'ผูกร้าน' },
    { id:'2', name:'ขอ QR Payment' },
    { id:'3', name:'รายละเอียด' },
    { id:'4', name:'ยกเลิกออเดอร์' },
]

const initialSo = {
    storeSize:20, 
    software:[], 
    requestDate:new Date(), 
    requestBillDate:stringYMDHMS3(new Date()),
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
};

const softwareOptions = [
    { id:'1', name:'อนุมัติทันที'},
    { id:'2', name:'แก้ไขวันอนุมัติ'},
];

const initialSoftware = {
    shopId:'',
    shopName:'',
    profileId:'',
    profileName:'',
    timestamp:'',
    imageId:'',
    net:'',
    status:'order',//
    vat:false,
    email:'',
    tel:'',
    suggestCode:'',
    requestDate:new Date(),
    requestBillDate:stringYMDHMS3(new Date()),
};

function SaleScreen() {
    const { profile:{ id:profileId, name:profileName, team = "A" } } = useSelector(state=>state.profile);
    const { warehouse } = useSelector(state=>state.warehouse);

    const [loading, setLoading] = useState(false);
    const [licenses, setLicenses] = useState([]);
    const [so_Modal, setSo_Modal] = useState(false);
    const [currentSo, setCurrentSo] = useState(initialSo);

    // แสดงผล QR Code 
    const [qrCode_Modal, setQrcode_Modal] = useState(false);
    const [qrCode, setQrcode] = useState('');
    const [amount, setAmount] = useState('');

    // สร้าง customer ใหม่ หรือ แก้ไข customer เดิม
    const [currentCustomer, setCurrentCustomer] = useState(initialCustomer);
    const [customer_Modal, setCustomer_Modal] = useState(false);
    const { tel, id:customerId, storeSize, shopId, shopName, name } = currentCustomer;

    const [customers, setCustomers] = useState([]);
    const [customerAction_Modal, setCustomerAction_Modal] = useState(false);
    const [cancel_Modal, setCancel_Modal] = useState(false);
    const [currentCancel, setCurrentCancel] = useState(initialCancel);
    const [connect_Modal, setConnect_Modal] = useState(false);

    const [paymentAction_Modal, setPaymentAction_Modal] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(initialSo);
    const [paymentActions, setPaymentActions] = useState(paymentOptions);
    const [payments, setPayments] = useState([]);

    const [successCases, setSuccessCases] = useState([]);
    const [waste, setWaste] = useState([]);
    const [softwares, setSoftwares] = useState([]); // license เฉพาะที่ยังไม่ได้อนุมัติ
    const [hardwares, setHardwares] = useState([]);

    const [memo, setMemo] = useState([]);
    const [memo_Modal, setMemo_Modal] = useState(false);
    const [currentMemo, setCurrentMemo] = useState(initialMemo);
    const { content } = currentMemo;

    const [option, setOption] = useState({id:'1',name:'lead', value:'1' });
    const { id:optionId, name:optinName, value } = option;

    const [currentSoftware, setCurrentSoftware] = useState(initialSoftware);
    const { requestDate } = currentSoftware;
    const [softwareAction_Modal, setSoftwareAction_Modal] = useState(false);
    const [request_Modal, setRequest_Modal] = useState(false);
    const [note_Modal, setNote_Modal] = useState(false);
    const [currentHardware, setCurrentHardware] = useState({ id:'', note:''});
    const { note, id:hardwareId } = currentHardware;


    const colorMap = useMemo(
        () => new Map(initialProcess.map(a=>[a.id,a.color]))
    ,[])

    const shopTypeMap = useMemo(
        ()=> new Map(initialShopType.map(a=>[a.id,a.name]))
    ,[])

    const cancelMap = useMemo(
        () => new Map(initialCancelId.map(a=>[a.id,a.name]))
    ,[])

    useEffect(()=>{
        handleFetchAll()
    },[]);

    async function handleFetchAll(){
        setLoading(true);
        try {
            const [licenses, hardwares, softwares, payments, wastes, successCases, customers, memo ] = await Promise.all([
                fetchLicense(),
                fetchHardware(profileId),
                fetchSoftware(profileId),
                fetchPayment(profileId),
                fetchWaste(profileId),
                fetchSuccessCases(profileId),
                fetchCustomer(profileId),
                fetchMemo(profileId)
            ])
            setLicenses(licenses); // ราคา software
            setHardwares(hardwares); // hardware ท่ีรอจัดส่ง
            setSoftwares(softwares); // software ที่รอ activate
            setPayments(payments); // payments ย้อนหลัง 30 doc
            setWaste(wastes); // ลูกค้าที่ปิดไม่ได้ทั้งหมด ที่เกิดขึ้นในเดือนนี้
            setSuccessCases(successCases); // successCase ทั้งหมดที่เกิดในเดือนนี้
            setCustomers(customers); // Lead ลูกค้าทั้งหมดที่ยังไม่เลือกสถานะ
            setMemo(memo); // memo ย้อนหลัง 30 อัน
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
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

    function openCustomerAction(item){
        setCurrentCustomer(item);
        if(optionId==='1') return setCustomerAction_Modal(true);

        // ถ้า optionId เป็นอย่างอื่น จะเปิด customerProfile เลย
        setCustomer_Modal(true)
    };

    async function handleCustomerAction(item){
        setCustomerAction_Modal(false);
        await wait(500)
        switch (item.id) {
            case '1': // เปิดบิล
                if(!storeSize) return alert('ไม่มี storeSize')
                setCurrentSo({...initialSo, storeSize:Number(storeSize) })
                setSo_Modal(true)
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
    async function handleSo(payload){
        setSo_Modal(false)
        const { hardware } = currentSo;

        const countProduct = hardware.filter(a => !a.stockSetStatus).map(a=>({ id:a.id, qty:a.qty }));
      const stockSet = hardware
        .filter(a => a.stockSetStatus)
        .flatMap(c =>
          c.stockSet.map(d => ({
            id: d.id,
            qty: Number(d.qty) * Number(c.qty)
          }))
        );
      // Flatten all products into one array (normalize qty for countProduct)
      const products = [
        ...countProduct,
        ...stockSet
      ];

    const productMap = new Map();
      for (const { id, qty } of products) {
        productMap.set(id, (productMap.get(id) || 0) + qty);
      }

      // Convert Map back to array format
      const uniqueProducts = Array.from(productMap, ([id, qty]) => ({ id, qty }));
      console.log('uniqueProducts')
        console.log(uniqueProducts)
        // setSo_Modal(false)
        // setLoading(true);
        
        // try {
        //     const amount = isGodIt(profileId)
        //         ?1 // payload.net
        //         :payload.net
        //     const timestamp = new Date();
        //     const { qrCode, paymentData } = await db.runTransaction(async (transaction) => {

        //         const docNumberRef = db.collection("admin").doc('documentNumber');
        //         const autoPaymentRef = db.collection('autoPayment').doc();
        //         const docNumberDoc = await transaction.get(docNumberRef);

        //         const { value } = docNumberDoc.data();
        //         const thisCurrentSo = value.find(a=>a.id==='so')
        //         let newValue = [];
        //         const thisMonth = timestamp.getMonth() + 1;
        //         let receiptNumber = `SO${stringReceiptNumber(1)}`;
        //         if(thisCurrentSo){
        //             const { month, run } = thisCurrentSo;
        //             let newRun = run + 1;
        //             receiptNumber = `SO${stringReceiptNumber(newRun)}`;
                    
        //             if (thisMonth !== month) {
        //                 newRun = 1;
        //                 receiptNumber = `SO${stringReceiptNumber(newRun)}`;
        //                 newValue = value.map(a=>{
        //                 return a.id==='so'
        //                     ?{ month: thisMonth, run: newRun, id:'so' }
        //                     :a
        //                 })
        //             } else {
        //             newValue = value.map(a=>{
        //                 return a.id==='so'
        //                     ?{ month, run: newRun, id:'so' }
        //                     :a
        //             })
        //             }
        //         } else {
        //             newValue = [...value,{ month: thisMonth, run: 1, id:'so' }]
        //         };

        //         const { status, data } = await scanfoodAPI.post(process.env.REACT_APP_API_URL,{ 
        //             channelType:'posxpay',
        //             shopId:`sale:${autoPaymentRef.id}`,
        //             amount,
        //             serial:'WQRN002405000023',
        //             token:process.env.REACT_APP_API_TOKEN,
        //             ref2:'auto'
        //         });
        //         const { 
        //             referenceId,
        //             chargeId,
        //             qrCode,
        //         } = data?.data;

        //         transaction.update(docNumberRef, { value:newValue });
        //         const paymentData = {
        //             ...currentSo,
        //             ...payload,
        //             orderNumber:receiptNumber,
        //             createdAt:timestamp,
        //             chargeId,
        //             qrCode,
        //             shopId,
        //             shopName,
        //             billDate:stringYMDHMS3(timestamp),
        //             profileId,
        //             profileName,
        //             process:'request', // request, cancel, success, paid
        //             team,
        //             customerId,
        //             name,
        //             id:autoPaymentRef.id,
        //             requestDate:new Date(), 
        //             requestBillDate:stringYMDHMS3(new Date()),
        //         };
        //         transaction.set(autoPaymentRef,paymentData)
        //         return {
        //             qrCode,
        //             paymentData
        //         }
        //     });

            
        //     setQrcode(qrCode);
        //     setAmount(amount);
        //     setQrcode_Modal(true);
        //     setPayments(prev=>[paymentData,...prev]);
        // } catch (error) {
        //     alert(error);
        // } finally {
        //     setLoading(false);
        // }
    };

    async function handleConnect(item){
        setConnect_Modal(false);
        const { id, name, storeSize } = item;

        // ป้องกันให้แพ็กเกจผิดขนาดร้าน
        if(optionId==='2' && storeSize !== currentPayment.storeSize && currentPayment.software.length>0) return alert('ขนาดร้านไม่ตรงกัน')
        setLoading(true);
        
        try {
            if(optionId==='2'){ // ผูกที่ autoPayment และ customer พร้อมกัน จากนั้นอัปเดต process: success
                const response = await scanfoodAPI.post(
                    "/gateway/webhook/manualConnect",
                    {
                        shop:item,
                        currentPayment
                    }
                );
                const updatedField = {
                    shopId:id, shopName:name, storeSize, status:'paid'
                }
                const currentCustomer = customers.find(a=>a.id === currentPayment.customerId);
                setSuccessCases(prev=>[{...currentCustomer,...updatedField},...prev]);
                setCustomers(prev=>prev.filter(a=>a.id !== currentPayment.customerId));
                setPayments(prev=>prev.map(item=>
                    item.id === currentPayment.id
                        ?{
                            ...item,process:'success'
                        }
                        :item
                ))
            } else { // ผูกที่ Lead
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
            };
         
            toastSuccess('ผูกร้านสำเร็จแล้ว');


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
            const updatedField = {
                cancelId, 
                reason, 
                status:'cancel',
                yearMonth:yearMonth(new Date()) 
            }
            await customerRef.update(updatedField);
            setCustomers(prev=>prev.filter(a=>a.id !== customerId));
            setWaste(prev=>[{...currentCustomer,...updatedField},...prev])
            toastSuccess('อัปเดตสำเร็จ');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };




    function openPaymentOption(item){
        setCurrentPayment(item);
        setPaymentAction_Modal(true);
        if(item.process==='success'){
            setPaymentActions([
                { id:'2', name:'ขอ QR Payment' },
                { id:'3', name:'รายละเอียด' },
            ])
        } else if(item.process==='paid'){
            setPaymentActions([
                { id:'1', name:'ผูกร้าน' }, // ผูกร้านเพื่อ approve อัตโนมัติและทำ revenue
                { id:'2', name:'ขอ QR Payment' },
                { id:'3', name:'รายละเอียด' },
            ])
        } else if(item.process==='cancel'){
            setPaymentActions([
                { id:'3', name:'รายละเอียด' },
            ])
        } else { // request
            setPaymentActions([
                // { id:'1', name:'ผูกร้าน' }, ห้ามผูกร้านเด็กขาด เพราะมันจะ approve เลย
                { id:'2', name:'ขอ QR Payment' },
                { id:'3', name:'รายละเอียด' },
                { id:'4', name:'ยกเลิกออเดอร์' },
            ])
        }
    };

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

    };

    const handleChange = (value) => {
      const option = options.find(a=>a.value === value)
        setOption(option);
    };


    function checkOpen(){
        if(optionId==='5') return setMemo_Modal(true);
        setCustomer_Modal(true);
    };

    function openMemo(item){
        setCurrentMemo(item);
        setMemo_Modal(true);
    };

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
                setQrcode_Modal(true);
                setAmount(net)
                break;
            case '3': // 100%
                setCurrentSo(currentPayment);
                setSo_Modal(true);
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
        if(shopId) return alert('ผูก shop ไว้อยู่แล้ว');
        setConnect_Modal(true);
    };

    function openSoftware(item){
        setCurrentSoftware(item);
        setSoftwareAction_Modal(true);
    };

    async function handleSoftwareAction(item){
        setSoftwareAction_Modal(false);
        await wait(500);
        switch (item.id) {
            case '1': // เปิดใช้งานทันที
                activateSoftware(currentSoftware.id)
                break;
            case '2': // แก้ไขวันเปิดใช้งาน
                setRequest_Modal(true)
                break;
            default:
                break;
        }
    };

    // 200%
    async function activateSoftware(docId){
        setLoading(true);
        try {
            const response = await scanfoodAPI.post(
                "/gateway/webhook/manualApprove",
                {
                    docId
                }
            );
            setSoftwares(prev=>prev.filter(a=>a.id !== docId));
            toastSuccess('Activate Software Success')
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    async function handleRequestDate(date){
        setRequest_Modal(false);
        setLoading(true);
        const { id } = currentSoftware;
        try {
            await db.runTransaction( async (transaction)=>{
                const packageRef = db.collection('packageOrder').doc(id);
                const packageDoc = await transaction.get(packageRef);
                const { status } = packageDoc.data();
                if(status!=='request') throw new Error(`อัปเดตสถานะนี้ไม่ได้นะ : ${process}`);
                transaction.update(packageRef,{ 
                    requestDate:date,
                    requestBillDate:stringYMDHMS3(date)
                })

            });
            setSoftwares(prev=>prev.map(item=>
                item.id === id
                    ?{...item, requestDate:date, requestBillDate:stringYMDHMS3(date)}
                    :item
            ))
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    function openHardware(item){
        setCurrentHardware(item);
        setNote_Modal(true);
    };

    async function handleNote(){
        setNote_Modal(false);
        setLoading(true);
        try {
            const hardwareRef = db.collection('hardwareOrder').doc(hardwareId);
            await hardwareRef.update({ note });
            setHardwares(prev=>prev.map(item=>
                item.id === hardwareId
                    ?{
                        ...item, note
                    }
                    :item
            ));
            toastSuccess('อัปเดตสำเร็จ');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
            setCurrentHardware({ id:'', note:'' })
        }
    };




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
        <Modal_OneInput
            show={note_Modal}
            header={`Note`}
            onHide={()=>{setNote_Modal(false);setCurrentHardware({ id:'', note:'' })}}
            value={note}
            onClick={handleNote}
            placeholder='ใส่ note'
            onChange={(value)=>{setCurrentHardware(prev=>({...prev, note:value }))}}
            area={true}
        />
        <Modal_DatePicker
            show={request_Modal}
            onHide={()=>{setRequest_Modal(false)}}
            requestDate={requestDate}
            submit={handleRequestDate}
        />
        <Modal_So
            show={so_Modal}
            onHide={()=>{setSo_Modal(false)}}
            current={currentSo}
            setCurrent={setCurrentSo}
            licenses={licenses}
            hardwares={warehouse}
            submit={handleSo}
            disabled={optionId!=='1'} // ป้องกันหน้าอื่นแก้ข้อมูล so
        />
        <Modal_Qrcode
            show={qrCode_Modal}
            onHide={()=>{setQrcode_Modal(false)}}
            qrCode={qrCode}
            amount={amount}
        />
        <Modal_FlatlistSearchShop
            show={connect_Modal}
            onHide={()=>{setConnect_Modal(false)}}
            onClick={handleConnect}
        />
        <Modal_FlatListTwoColumn
            header={'Payment Action'}
            show={paymentAction_Modal}
            onHide={()=>{setPaymentAction_Modal(false)}}
            value={paymentActions}
            onClick={handlePaymentAction}
        />

        <Modal_OneInput
            show={memo_Modal}
            header={`Memo`}
            onHide={()=>{setMemo_Modal(false);setCurrentMemo(initialMemo)}}
            value={content}
            onClick={handleMemo}
            placeholder='ใส่ memo'
            onChange={(value)=>{setCurrentMemo(prev=>({...prev, content:value }))}}
            area={true}
        />
        <Modal_Cancel
            show={cancel_Modal}
            onHide={()=>{setCancel_Modal(false)}}
            currentCancel={currentCancel}
            setCurrentCancel={setCurrentCancel}
            current={currentSo}
            submit={handleCancel}
        />
        <Modal_FlatListTwoColumn
            header={'CustomerOptions'}
            show={customerAction_Modal}
            onHide={()=>{setCustomerAction_Modal(false)}}
            value={customerOptions}
            onClick={handleCustomerAction}
        />
        <Modal_Customer
            show={customer_Modal}
            onHide={()=>{setCustomer_Modal(false)}}
            current={currentCustomer}
            setCurrent={setCurrentCustomer}
            submit={handleCustomer}

        />
        <Modal_FlatListTwoColumn
            header={'Software Action'}
            show={softwareAction_Modal}
            onHide={()=>{setSoftwareAction_Modal(false)}}
            value={softwareOptions}
            onClick={handleSoftwareAction}
        />
        <Modal_Loading show={loading} />
       
        {optionId==='1'
            ?<React.Fragment>
                <h4>ทั้งหมด : {customers.length} ลูกค้า</h4>
                {customers.map((item)=>{
                    const { name, storeSize, shopType, note, process, day, shopId } = item;
                    const color = colorMap.get(process);
                    const shopTypeName = shopTypeMap.get(shopType);
                    return <Row onClick={()=>{openCustomerAction(item)}} key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >

                                <Col xs='12' sm='4'md='3'lg='3' ><i style={{ color }} class="bi bi-circle-fill"></i>&nbsp;<span style={{ color:softGray }} >({day})</span><span  >({storeSize})</span>{name}{shopId?<span><button style={{ backgroundColor:'rgba(247,199,77,0.9)'}} >ผูกบัญชีแล้ว</button></span>:null}</Col>
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
                    const { name:processName, color } = processMap[process]
                    return <Row onClick={()=>{openPaymentOption(item)}} key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                                <Col xs='12' sm='6'  >{name}[{shopName}]</Col>
                                <Col xs='6' sm='3'  >{formatCurrency(net)}</Col>
                                <Col xs='6' sm='3'  ><button style={{backgroundColor:color}} >{processName}</button></Col>
                            </Row>
                })}
            </React.Fragment>
            :optionId === '3'
            ?<React.Fragment> 
                <h4>ทั้งหมด : {successCases.length} Success</h4>
                {successCases.map((item)=>{
                    const { name,  shopType,  process,  revenue } = item;
                    const shopTypeName = shopTypeMap.get(shopType);
                    return <Row  key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                                <Col xs='12' sm='4'md='3'lg='3' >{name}</Col>
                                <Col xs='6' sm='4'md='3'lg='3'  >{shopTypeName}</Col>
                                <Col xs='6' sm='4'md='3'lg='3'  >Revenue : {formatCurrency(revenue)}</Col>
                            </Row>
                })}
            </React.Fragment>
            :optionId==='4'
            ?<React.Fragment> 
                <h4>ทั้งหมด : {waste.length} Failed</h4>
                {waste.map((item)=>{
                    const { name, shopType,reason, cancelId } = item;
                    const shopTypeName = shopTypeMap.get(shopType);
                    const cancelName = cancelMap.get(cancelId)
                    return <Row  key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                                <Col xs='12' sm='4'md='3'lg='3' >{name}</Col>
                                <Col xs='6' sm='4'md='3'lg='3'  >{shopTypeName}</Col>
                                <Col xs='6' sm='4'md='3'lg='3'  >เหตุผล : {cancelName}</Col>
                                <Col xs='6' sm='4'md='3'lg='3'  >{reason}</Col>
                            </Row>
                })}
            </React.Fragment>
            
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
                    const { name, shopName, net, requestDate } = item;
                    return <Row onClick={()=>{openSoftware(item)}}  key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                                <Col xs='12' sm='6'  >{name}[{shopName}]</Col>
                                <Col xs='6' sm='3'  >{formatCurrency(net)}</Col>
                                <Col xs='6' sm='3'  >วันอนุมัติ : {stringFullDate(requestDate)}</Col>
                            </Row>
                })}
            </React.Fragment> 
            :<React.Fragment> 
                <h4>ทั้งหมด : {hardwares.length} รายการ</h4>
                {hardwares.map((item)=>{
                    const { name, shopName, note } = item;
                    return <Row onClick={()=>{openHardware(item)}}  key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                                <Col xs='12' sm='6'  >{name}[{shopName}]</Col>
                                <Col xs='6' sm='3'  >{note}</Col>
                            </Row>
                })}
            </React.Fragment> 
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