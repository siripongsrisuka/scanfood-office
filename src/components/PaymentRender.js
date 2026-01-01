import React, { useState } from "react";
import { Table, Form, Button } from "react-bootstrap";
import OneButton from "./OneButton";
import { useDispatch, useSelector } from "react-redux";
import { updateDemo, updateFieldStore } from "../redux/careSlice";
import { Modal_FlatListTwoColumn, Modal_Software, Modal_Quotation, Modal_Hardware, Modal_HardwareDetail, Modal_SoftwareDetail } from "../modal";
import { db } from "../db/firestore";
import { minusDays, setTimeStart, stringFullDate } from "../Utility/dateTime";
import { daysBetween } from "../Utility/function";
import { colors, initialHardware, initialSoftware } from "../configs";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';


const initialProcess = ['demo','payment','setup','implementation','training','softlaunch','cancel'];

const  { green, white } = colors;

function PaymentRender({ handleProfile, portStores, setLoading }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [store_Modal, setStore_Modal] = useState(false);
    const [doc, setDoc] = useState('');
    const [quotation_Modal, setQuotation_Modal] = useState(false);
    const [currentQuotation, setCurrentQuotation] = useState({ currentPackage:[], currentHardware:[], vatQuotation:false,tax:{}, orderNumber:'', createdDate:new Date(), expireDate:new Date(), note:'', saleName:'', saleTel:'' })
    const [software_Modal, setSoftware_Modal] = useState(false);
    const [hardware_Modal, setHardware_Modal] = useState(false);
    const [sDetail_Modal, setSDetail_Modal] = useState(false);
    const [hDetail_Modal, setHDetail_Modal] = useState(false);
    const [currentDetail, setCurrentDetail] = useState(initialHardware);

    async function openStore({ demoDate, id }){
        setLoading(true)
        const arr = []
        try {
            await db.collection('shop')
                .where('createdDate','>=',setTimeStart(minusDays(demoDate,5))).get().then((qsnapshot)=>{
                qsnapshot.forEach((doc)=>{
                    arr.push({...doc.data(),id:doc.id})
                })
            })
        } catch (error) {
            
        } finally {
            setLoading(false)
        }
        
        setStores(arr.filter(a=>a.shopChannel==='scanfood'))
        setStore_Modal(true)
        setDoc(id)
    };

    function handleStore(item){
        setStore_Modal(false)
        const { vip, id, name } = item;
        const { expire } = vip.find(a=>a.type==='qrcode')
        dispatch(updateFieldStore({ doc, field:{ expireDate:expire.toDate(), shopId:id, storeName:name }}))
    };

    function openQuotation(a,item){
        dispatch(updateDemo(item))
        setCurrentQuotation(a)
        setQuotation_Modal(true)
    };

    async function openSoftWare(id){
        await db.collection('packageOrder').doc(id).get().then((doc)=>{
            if(doc.exists){
                setCurrentDetail({...doc.data(),id:doc.id})
            }
        });
        setSDetail_Modal(true)
    };

    async function openHardware(id){
        await db.collection('hardwareOrder').doc(id).get().then((doc)=>{
            if(doc.exists){
                setCurrentDetail({...doc.data(),id:doc.id})
            }
        });
        setHDetail_Modal(true)
    }

  return    <div>
                <Modal_HardwareDetail
                    show={hDetail_Modal}
                    onHide={()=>{setHDetail_Modal(false)}}
                    current={currentDetail}
                />
                <Modal_SoftwareDetail
                    show={sDetail_Modal}
                    onHide={()=>{setSDetail_Modal(false)}}
                    current={currentDetail}
                />
                <Modal_Hardware
                    show={hardware_Modal}
                    onHide={()=>{setHardware_Modal(false)}}
                    submit={()=>{}}
                />
                <Modal_Software
                    show={software_Modal}
                    onHide={()=>{setSoftware_Modal(false)}}
                    submit={()=>{}}
                />
                <Modal_Quotation 
                    show={quotation_Modal} 
                    onHide={()=>{setQuotation_Modal(false)}}
                    currentQuotation={currentQuotation}
                />
                <Modal_FlatListTwoColumn
                    show={store_Modal}
                    onHide={()=>{setStore_Modal(false)}}
                    header='เลือกร้านอาหาร'
                    onClick={handleStore}
                    value={stores}
                />
                <Table  bordered   variant="light" style={styles.container}  >
                <thead  >
                <tr>
                    <th rowSpan={2} style={styles.table1}>No.</th>
                    <th rowSpan={2} style={styles.table2}>โปรไฟล์</th>
                    <th rowSpan={2} style={styles.table2}>ใบเสนอราคา</th>
                    <th rowSpan={2} style={styles.table2}>กำหนดชำระ</th>
                    <th colSpan={2} style={styles.table2}>คำสั่งซื้อ</th>
                    <th rowSpan={2} style={styles.table2}>โน๊ต</th>
                    <th rowSpan={2} style={styles.table2}>รายละเอียด</th>
                </tr>
                <tr>
                    <th style={styles.table2}>software</th>
                    <th style={styles.table2}>hardware</th>
                </tr>
                </thead>
                <tbody  >
                {portStores.map((item, index) => {
                    const { ownerName, storeName, tel, note, demoDate, shopId, id, expireDate, quotation, process, softwareOrder, hardwareOrder } = item;
                 
                    return  <tr   key={index} >
                                <td style={styles.text}>{index+1}.</td>
                                <td style={styles.text} >
                                    <h6>ชื่อร้าน : {storeName}</h6>
                                    <h6>ชื่อ : {ownerName}</h6>
                                    <h6>ติดต่อ : {tel}</h6>
                                    {shopId
                                        ?<OneButton {...{ text:stringFullDate(expireDate), submit:()=>{openStore({ demoDate, id })}, variant:"danger" }} />
                                        :<OneButton {...{ text:'เลือกบัญชี', submit:()=>{openStore({ demoDate, id })} }} />
                                    }
                                </td>
                                <td style={styles.text}>
                                    {quotation.map((a,i)=>{
                                        return <h6 onClick={()=>{openQuotation(a,item)}} key={i} >{a.orderNumber}</h6>
                                    })}
                                </td>
                                <td style={styles.text}>{daysBetween(new Date(),expireDate)}</td>
                                <td style={styles.text}>
                                    {/* <Button onClick={()=>{setSoftware_Modal(true);dispatch(updateDemo(item))}} variant="light" >+ คำสั่งซื้อ</Button><br/> */}
                                    {softwareOrder.map((a,i)=>{
                                        return <Button onClick={()=>{openSoftWare(a)}} variant="secondary" key={i} style={{marginBottom:10}} >ดูสถานะ</Button>
                                    })}
                                </td>
                                <td style={styles.text}>
                                    {/* <Button onClick={()=>{setHardware_Modal(true)}} variant="light" >+ คำสั่งซื้อ</Button><br/> */}
                                    {hardwareOrder.map((a,i)=>{
                                        return <Button onClick={()=>{openHardware(a)}} variant="secondary" key={i} style={{marginBottom:10}} >ดูสถานะ</Button>
                                    })}
                                </td>
                                <td style={styles.text}>{note}</td>
                                <td style={styles.text}>
                                    <Button onClick={()=>{navigate(`/branch/${id}`)}} variant="success" >Go</Button>
                                    <br/>
                                    <br/>
                                    <OneButton {...{ text:'รายละเอียด', submit:()=>{handleProfile(item)} }} />
                                    <Form.Select 
                                        aria-label="Default select example" 
                                        value={process} 
                                        onChange={(event)=>{dispatch(updateFieldStore({ doc:id, field:{ process:event.target.value }}))}}
                                        style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                                    >
                                        <option value='' disabled >เลือก process</option>
                                        {initialProcess.map((item,index)=>{
                                            return <option key={index} value={item} >{item}</option>
                                        })}
                                    </Form.Select>
                                </td>
                            </tr>
                })}
                </tbody>
                </Table>
            </div>
};

const styles = {
    container : {
        marginLeft:'1rem',marginRight:'1rem'
    },
    table1 : {
        width:'5%', textAlign:'center', minWidth:'50px'
    },
    table2 : {
        width: '19%', textAlign:'center', minWidth:'120px'
    },
    text : {
        textAlign:'center'
    }
}

export default PaymentRender;

