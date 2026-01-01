import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Table,
} from "react-bootstrap";
import { Button } from "rsuite";
import { db } from "../db/firestore";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { Modal_Loading, Modal_OneInput, Modal_Sticker, Modal_Success } from "../modal";
import { pushByIdFilter } from "../api/onesignal";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';


const initialProcess = [
    { id:'packing', color:'red', name:'packing'},
    { id:'tracking', color:'orange', name:'tracking'},
    { id:'sending', color:'yellow', name:'sending'},
    { id:'grabPack', color:'green', name:'grab Pack' },
    { id:'grabTrack', color:'cyan', name:'grab Track' },
    { id:'grabSend', color:'blue', name:'grab Send' },
];

const initialPostcode = ['packing','tracking','sending'];


function EquipmentScreen() {
        const navigate = useNavigate();

    const [currentProcess, setCurrentProcess] = useState('packing');
    const [display, setDisplay] = useState([]);
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [tracking_Modal, setTracking_Modal] = useState(false);
    const [tracking, setTracking] = useState('');
    const [current, setCurrent] = useState({});
    const [sticker_Modal, setSticker_Modal] = useState(false);
    const [destination, setDestination] = useState({
        tel:"",
        nameSername:"",
        address:''
    });

    function handleDisplay(currentProcess){
        let display = []
        switch (currentProcess) {
            case 'packing':
                display = masterData.filter(a=>a.process==='packing' && a.sendType==='normal');
                break;
            case 'tracking':
                display = masterData.filter(a=>a.process==='tracking' && a.sendType==='normal');
                break;
            case 'sending':
                display = masterData.filter(a=>a.process==='sending' && a.sendType==='normal');
                break;
            case 'grabPack':
                display = masterData.filter(a=>a.process==='packing' && a.sendType==='grab');
                break;
            case 'grabTrack':
                display = masterData.filter(a=>a.process==='tracking' && a.sendType==='grab');
                break;
            case 'grabSend':
                display = masterData.filter(a=>a.process==='sending' && a.sendType==='grab');
                break;
            default:
                break;
        }
        return display

    }

    useEffect(()=>{
        
        setDisplay(handleDisplay(currentProcess))

    },[masterData,currentProcess])
    console.log(masterData)
    console.log(display)


    useEffect(()=>{
        fetchOrder()
    },[])

    async function fetchOrder(){
        setLoading(true)
        let arr = []
        await db.collection('hardwareOrder').where('status','==','prepare')
            .get().then((qsnapshot)=>{
                if(qsnapshot.docs.length>0){
                    qsnapshot.forEach((doc)=>{
                        const { timestamp, ...rest } = doc.data()
                        arr.push({sendType:"normal",...rest,id:doc.id,timestamp:timestamp.toDate()})
                    })
                }
            })
        setLoading(false)
        if(arr.length>0){
            setMasterData(arr)
        } else {
            setTimeout(()=>{
                // alert('ยังไม่มีออเดอร์ใหม่')
            },500)
        }
    };


    async function updateProcess(id, event) {
        event.preventDefault();
        const { value } = event.target;
    
        setLoading(true);
        try {
            let obj = { process: value }
            if(value==='sending'){
                obj = { process: value, status:'sending' }
            }
            await db.collection('hardwareOrder').doc(id).update(obj);
            setMasterData(prev =>
                prev.map(item => 
                    item.id === id ? { ...item, process: value } : item
                )
            );
            setSuccess_Modal(true)
            setTimeout(()=>{
                setSuccess_Modal(false)
            },900)
        } catch (error) {
            console.error("Error updating process:", error);
        } finally {
            setLoading(false);
        }
    };

    async function updateTracking(){
        setTracking_Modal(false);
        setLoading(true);
        try {
            await db.collection('hardwareOrder').doc(current.id).update({ tracking });
            pushByIdFilter({id:current.profileId,content:`เลขพัสดุของคุณคือ ${tracking}`,heading:`Scanfood อัปเดตเลขพัสดุ`,data : { sound:`อัปเดตเลขพัสดุ` }})
            setMasterData(prev =>
                prev.map(item => 
                    item.id === current.id ? { ...item, tracking } : item
                )
            );
            setSuccess_Modal(true)
            setTimeout(()=>{
                setSuccess_Modal(false)
            },900)
        } catch (error) {
            console.error("Error updating process:", error);
        } finally {
            setLoading(false);
        }
    };


  return (
    <div style={{paddingTop:'1rem'}} >
        <Modal_Sticker
            show={sticker_Modal}
            onHide={()=>{setSticker_Modal(false)}}
            destination={destination}
        />
        <Modal_Loading show={loading} />
        <Modal_Success show={success_Modal} />
        <Modal_OneInput
            show={tracking_Modal}
            onHide={()=>{setTracking_Modal(false);setTracking('')}}
            placeholder='ใส่ Tracking'
            header='Tracking'
            value={tracking}
            onChange={(v)=>{setTracking(v)}}
            onClick={updateTracking}
        />
        <div  style={{paddingLeft:'1rem',paddingRight:'1rem',overflowX:'auto'}} >
            {initialProcess.map((item)=>{
                const { id, color, name } = item;
                let status = currentProcess === id 
                let length = handleDisplay(id).length
                return <Button onClick={()=>{setCurrentProcess(id)}} key={id} color={color} appearance={status?"primary":"ghost"} style={{minWidth:'140px',marginRight:'1rem',marginBottom:'1rem'}}  >{name} ({length})</Button>
            })}
        </div>
        <h4>&emsp;ค้นพบ {display.length} รายการ</h4>
        
        {display.length>0
            ?currentProcess==='packing'
            ?<div  style={{overflowX:'auto'}} >
                <Table  bordered   variant="light" style={styles.container}  >
                    <thead  >
                    <tr>
                        <th style={styles.table1}>No.</th>
                        <th style={styles.table2}>เลขที่คำสั่งซื้อ</th>
                        <th style={styles.table2}>เวลาสั่งซื้อ</th>
                        <th style={styles.table2}>ชื่อร้าน</th>
                        <th style={styles.table2}>รายการ</th>
                        <th style={styles.table2}>พิมพ์ใบปะหน้า</th>
                        <th style={styles.table2}>สถานะ</th>
                    </tr>
                    </thead>
                    <tbody  >
                    {display.map((item, index) => {
                        const { shopName, product, orderNumber, timestamp, process, id, tel, nameSername, address } = item;
                        return  <tr  key={index} >
                                    <td style={styles.text}>{index+1}.</td>
                                    <td style={styles.text} >{orderNumber}</td>
                                    <td style={styles.text}>{stringDateTimeReceipt(timestamp)}</td>
                                    <td style={styles.text}>{shopName}</td>
                                    <td style={styles.text}>
                                        {product.map((a,i)=>{
                                            return <h6 key={i} >{a.name}x{a.qty}</h6>
                                        })}
                                    </td>
                                    <td style={styles.text}>
                                        <i onClick={()=>{setSticker_Modal(true);setDestination({ tel, nameSername, address })}} style={{fontSize:30,cursor:'pointer'}} class="bi bi-printer"></i>
                                    </td>
                                    <td style={styles.text}>
                                    <Form.Select 
                                        aria-label="Default select example" 
                                        value={process} 
                                        onChange={(event)=>{updateProcess(id,event)}}
                                        style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                                    >
                                        <option value='' disabled >ขั้นตอน</option>
                                        {initialPostcode.map((item,index)=>{
                                            return <option key={index} value={item} >{item}</option>
                                        })}
                                    </Form.Select>
                                    </td>
                                </tr>
                    })}
                    </tbody>
                </Table>
            </div>
            :currentProcess==='tracking'
            ?<Table  bordered   variant="light" style={styles.container}  >
                <thead  >
                <tr>
                    <th style={styles.table1}>No.</th>
                    <th style={styles.table2}>เลขที่คำสั่งซื้อ</th>
                    <th style={styles.table2}>เวลาสั่งซื้อ</th>
                    <th style={styles.table2}>ชื่อร้าน</th>
                    <th style={styles.table2}>รายการ</th>
                    <th style={styles.table2}>ใส่ Tracking</th>
                    <th style={styles.table2}>สถานะ</th>
                </tr>
                </thead>
                <tbody  >
                {display.map((item, index) => {
                    const { shopName, orderNumber, timestamp, product, tracking, process, id } = item;
                    return  <tr  key={index} >
                                <td style={styles.text}>{index+1}.</td>
                                <td style={styles.text} >{orderNumber}</td>
                                <td style={styles.text}>{stringDateTimeReceipt(timestamp)}</td>
                                <td style={styles.text}>{shopName}</td>
                                <td style={styles.text}>
                                    {product.map((a,i)=>{
                                        return <h6 key={i} >{a.name}x{a.qty}</h6>
                                    })}
                                </td>
                                <td style={styles.text}>
                                    <Button onClick={()=>{setTracking(tracking);setCurrent(item);setTracking_Modal(true)}} color='red' style={{minWidth:'5rem'}} appearance={"primary"} >{tracking}</Button>
                                </td>
                                <td style={styles.text}>
                                <Form.Select 
                                    aria-label="Default select example" 
                                    value={process} 
                                    onChange={(event)=>{updateProcess(id,event)}}
                                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                                >
                                    <option value='' disabled >ขั้นตอน</option>
                                    {initialPostcode.map((item,index)=>{
                                        return <option key={index} value={item} >{item}</option>
                                    })}
                                </Form.Select>
                                </td>
                            </tr>
                })}
                </tbody>
            </Table>
            :currentProcess==='sending'
            ?<Table  bordered   variant="light" style={styles.container}  >
                <thead  >
                <tr>
                    <th style={styles.table1}>No.</th>
                    <th style={styles.table2}>เลขที่คำสั่งซื้อ</th>
                    <th style={styles.table2}>เวลาสั่งซื้อ</th>
                    <th style={styles.table2}>ชื่อร้าน</th>
                    <th style={styles.table2}>รายการ</th>
                    <th style={styles.table2}>ใส่ Tracking</th>
                    <th style={styles.table2}>สถานะ</th>
                </tr>
                </thead>
                <tbody  >
                {display.map((item, index) => {
                    const { shopName, orderNumber, timestamp, product, tracking, process, id } = item;
                    return  <tr  key={index} >
                                <td style={styles.text}>{index+1}.</td>
                                <td style={styles.text} >{orderNumber}</td>
                                <td style={styles.text}>{stringDateTimeReceipt(timestamp)}</td>
                                <td style={styles.text}>{shopName}</td>
                                <td style={styles.text}>
                                    {product.map((a,i)=>{
                                        return <h6 key={i} >{a.name}x{a.qty}</h6>
                                    })}
                                </td>
                                <td style={styles.text}>
                                    <Button onClick={()=>{setTracking(tracking);setCurrent(item);setTracking_Modal(true)}} color='red' style={{minWidth:'5rem'}} appearance={"primary"} >{tracking}</Button>
                                </td>
                                <td style={styles.text}>
                                <Form.Select 
                                    aria-label="Default select example" 
                                    value={process} 
                                    onChange={(event)=>{updateProcess(id,event)}}
                                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                                >
                                    <option value='' disabled >ขั้นตอน</option>
                                    {initialPostcode.map((item,index)=>{
                                        return <option key={index} value={item} >{item}</option>
                                    })}
                                </Form.Select>
                                </td>
                            </tr>
                })}
                </tbody>
            </Table>
            :currentProcess==='grabPack'
            ?<Table  bordered   variant="light" style={styles.container}  >
                <thead  >
                <tr>
                    <th style={styles.table1}>No.</th>
                    <th style={styles.table2}>เลขที่คำสั่งซื้อ</th>
                    <th style={styles.table2}>ชื่อร้าน</th>
                    <th style={styles.table2}>รายการ</th>
                    <th style={styles.table2}>ที่อยู่จัดส่ง</th>
                    <th style={styles.table2}>เวลาจัดส่ง</th>
                    <th style={styles.table2}>note</th>
                    <th style={styles.table2}>สถานะ</th>
                </tr>
                </thead>
                <tbody  >
                {display.map((item, index) => {
                    const { shopName, orderNumber, product, address, id, process } = item;
                    return  <tr  key={index} >
                                <td style={styles.text}>{index+1}.</td>
                                <td style={styles.text} >{orderNumber}</td>
                                <td style={styles.text}>{shopName}</td>
                                <td style={styles.text}>
                                    {product.map((a,i)=>{
                                        return <h6 key={i} >{a.name}x{a.qty}</h6>
                                    })}
                                </td>
                                <td style={styles.text}>{address}</td>
                                <td style={styles.text}>เวลาจัดส่ง</td>
                                <td style={styles.text}>note</td>
                                <td style={styles.text}>
                                <Form.Select 
                                    aria-label="Default select example" 
                                    value={process} 
                                    onChange={(event)=>{updateProcess(id,event)}}
                                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                                >
                                    <option value='' disabled >ขั้นตอน</option>
                                    {initialPostcode.map((item,index)=>{
                                        return <option key={index} value={item} >{item}</option>
                                    })}
                                </Form.Select>
                                </td>
                            </tr>
                })}
                </tbody>
            </Table>
            :currentProcess==='grabTrack'
            ?<Table  bordered   variant="light" style={styles.container}  >
                <thead  >
                <tr>
                    <th style={styles.table1}>No.</th>
                    <th style={styles.table2}>เลขที่คำสั่งซื้อ</th>
                    <th style={styles.table2}>ชื่อร้าน</th>
                    <th style={styles.table2}>รายการ</th>
                    <th style={styles.table2}>ที่อยู่จัดส่ง</th>
                    <th style={styles.table2}>เวลาจัดส่ง</th>
                    <th style={styles.table2}>ใส่ Tracking</th>
                    <th style={styles.table2}>สถานะ</th>
                </tr>
                </thead>
                <tbody  >
                {display.map((item, index) => {
                    const { shopName, orderNumber, product, address, id, process, tracking } = item;
                    return  <tr  key={index} >
                                <td style={styles.text}>{index+1}.</td>
                                <td style={styles.text} >{orderNumber}</td>
                                <td style={styles.text}>{shopName}</td>
                                <td style={styles.text}>
                                    {product.map((a,i)=>{
                                        return <h6 key={i} >{a.name}x{a.qty}</h6>
                                    })}
                                </td>
                                <td style={styles.text}>{address}</td>
                                <td style={styles.text}>เวลาจัดส่ง</td>
                                <td style={styles.text}>
                                    <Button onClick={()=>{setTracking(tracking);setCurrent(item);setTracking_Modal(true)}} color='red' style={{minWidth:'5rem',maxWidth:'7rem'}} appearance={"primary"} >{tracking}</Button>
                                </td>
                                <td style={styles.text}>
                                <Form.Select 
                                    aria-label="Default select example" 
                                    value={process} 
                                    onChange={(event)=>{updateProcess(id,event)}}
                                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                                >
                                    <option value='' disabled >ขั้นตอน</option>
                                    {initialPostcode.map((item,index)=>{
                                        return <option key={index} value={item} >{item}</option>
                                    })}
                                </Form.Select>
                                </td>
                            </tr>
                })}
                </tbody>
            </Table>
            :<Table  bordered   variant="light" style={styles.container}  >
                <thead  >
                <tr>
                    <th style={styles.table1}>No.</th>
                    <th style={styles.table2}>เลขที่คำสั่งซื้อ</th>
                    <th style={styles.table2}>ชื่อร้าน</th>
                    <th style={styles.table2}>รายการ</th>
                    <th style={styles.table2}>ที่อยู่จัดส่ง</th>
                    <th style={styles.table2}>เวลาจัดส่ง</th>
                    <th style={styles.table2}>ใส่ Tracking</th>
                    <th style={styles.table2}>สถานะ</th>
                </tr>
                </thead>
                <tbody  >
                {display.map((item, index) => {
                    const { shopName, orderNumber, product, address, id, process, tracking } = item;
                    return  <tr  key={index} >
                                <td style={styles.text}>{index+1}.</td>
                                <td style={styles.text} >{orderNumber}</td>
                                <td style={styles.text}>{shopName}</td>
                                <td style={styles.text}>
                                    {product.map((a,i)=>{
                                        return <h6 key={i} >{a.name}x{a.qty}</h6>
                                    })}
                                </td>
                                <td style={styles.text}>{address}</td>
                                <td style={styles.text}>เวลาจัดส่ง</td>
                                <td style={styles.text}>
                                    <Button onClick={()=>{setTracking(tracking);setCurrent(item);setTracking_Modal(true)}} color='red' style={{minWidth:'5rem',maxWidth:'7rem'}} appearance={"primary"} >{tracking}</Button>
                                </td>
                                <td style={styles.text}>
                                <Form.Select 
                                    aria-label="Default select example" 
                                    value={process} 
                                    onChange={(event)=>{updateProcess(id,event)}}
                                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                                >
                                    <option value='' disabled >ขั้นตอน</option>
                                    {initialPostcode.map((item,index)=>{
                                        return <option key={index} value={item} >{item}</option>
                                    })}
                                </Form.Select>
                                </td>
                            </tr>
                })}
                </tbody>
            </Table>
            :<div style={{display:'flex',flex:1,justifyContent:'center',alignItems:'center',flexDirection:'column'}} >
                <img style={{width:'30%'}} src="https://cdni.iconscout.com/illustration/premium/thumb/businessman-completed-tasks-illustration-download-in-svg-png-gif-file-formats--no-task-list-tasklist-complete-done-emaily-pack-communication-illustrations-4202464.png" />
                <h3>ไม่มีงาน ก็ไม่มีเงิน!</h3>
            </div>
        }
    </div>
  );
};


const styles = {
    container : {
        marginLeft:'1rem',marginRight:'1rem'
    },
    table1 : {
        width:'5%', textAlign:'center', minWidth:'50px'
    },
    table2 : {
        width: '12%', textAlign:'center', minWidth:'150px'
    },
    text : {
        textAlign:'center'
    }
}

export default EquipmentScreen;