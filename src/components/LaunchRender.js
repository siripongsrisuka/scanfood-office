import React, { useState } from "react";
import { Table, Form, Button } from "react-bootstrap";
import OneButton from "./OneButton";
import { useDispatch } from "react-redux";
import { updateFieldStore } from "../redux/careSlice";
import { Modal_FlatListTwoColumn, Modal_SoftwareDetail } from "../modal";
import { db } from "../db/firestore";
import { setTimeStart, stringFullDate } from "../Utility/dateTime";
import DatePicker from 'react-datepicker';
import { colors, initialHardware } from "../configs";

const { dark } = colors;

const initialProcess = ['demo','payment','setup','implementation','training','softlaunch','success'];

function LaunchRender({ handleProfile, portStores, setLoading }) {
    const dispatch = useDispatch();
    const [stores, setStores] = useState([]);
    const [store_Modal, setStore_Modal] = useState(false);
    const [doc, setDoc] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [sDetail_Modal, setSDetail_Modal] = useState(false);
    const [hDetail_Modal, setHDetail_Modal] = useState(false);
    const [currentDetail, setCurrentDetail] = useState(initialHardware);

    async function openStore({ demoDate, id }){
        setLoading(true)
        const arr = []
        try {
            await db.collection('shop')
                .where('createdDate','>=',setTimeStart(demoDate)).get().then((qsnapshot)=>{
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
        const { vip, id } = item;
        const { expire } = vip.find(a=>a.type==='qrcode')
        dispatch(updateFieldStore({ doc, field:{ expireDate:expire.toDate(), shopId:id }}))
    };

    function updateDate({ doc, type, date }){
        dispatch(updateFieldStore({ doc, field:{ [type]:date }}))
    
    };

    async function requestGoogleSheet({ id }) {
        const sheetRef = db.collection("admin").doc("googleSheet");
    
        try {
            const googleSheet = await db.runTransaction(async transaction => {
                const sheetDoc = await transaction.get(sheetRef);
                const { value } = sheetDoc.data();
    
                if (value.length === 0) {
                    throw new Error("No files left");
                }
    
                const firstData = value[0];
                transaction.update(sheetRef, { value: value.slice(1) }); // Use `slice` to avoid mutating the array
                return firstData;
            });
    
            await dispatch(updateFieldStore({ doc: id, field:{ googleSheet } }));
            window.open(googleSheet, "_blank");
        } catch (error) {
            // console.error("Error fetching Google Sheet:", error.message);
            alert(error.message)
        }
    }

    function handleGoogleSheet({ id, googleSheet }){
        if(googleSheet){
            window.open(googleSheet, '_blank')
        } else {
            requestGoogleSheet({ id })
        }
    };

    function copyGoogleSheet(googleSheet){
        navigator.clipboard.writeText(`ลิงค์ excel สำหรับใช้ลงเมนูอาหารค่ะ\n1.เปิดลิงค์นี้\n👉🏻 ${googleSheet} 👈🏻\n2.วิธีการลงเมนูอาหารดูจากวีดิโอนี้ได้เลยนะคะ ⬇️\nhttps://www.youtube.com/shorts/5RxMuvDIxWc`)
        .then(() => {
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 1000); // Hide popup after 2 seconds
        })
        .catch((error) => {
            console.error('Failed to copy text:', error);
        });
    
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
        
                <Modal_SoftwareDetail
                    show={sDetail_Modal}
                    onHide={()=>{setSDetail_Modal(false)}}
                    current={currentDetail}
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
                        <th colSpan={2} style={styles.table2}>คำสั่งซื้อ</th>
                        <th rowSpan={2} style={styles.table2}>Google Sheet</th>
                        <th rowSpan={2} style={styles.table2}>Process</th>
                        <th rowSpan={2} style={styles.table2}>รายละเอียด</th>
                    </tr>
                    <tr>
                        <th style={styles.table2}>software</th>
                        <th style={styles.table2}>hardware</th>
                    </tr>
                    </thead>
                    <tbody  >
                    {portStores.map((item, index) => {
                        const { ownerName, storeName, tel, shopId, demoDate, id, expireDate, googleSheet, trainingDate, launchDate, process, softwareOrder, hardwareOrder  } = item;
                        return  <tr  key={index} >
                                    <td style={styles.text}>{index+1}.</td>
                                    <td style={styles.text} >
                                        <h6>ชื่อร้าน : {storeName}</h6>
                                        <h6>ชื่อ : {ownerName}</h6>
                                        <h6>ติดต่อ : {tel}</h6>
                                        {shopId
                                            ?<OneButton {...{ text:stringFullDate(expireDate), submit:()=>{openStore({ demoDate, id })}, variant:'danger' }} />
                                            :<OneButton {...{ text:'เลือกบัญชี', submit:()=>{openStore({ demoDate, id })} }} />
                                        }
                                    </td>
                                    <td style={styles.text}>
                                        {softwareOrder.map((a,i)=>{
                                            return <Button onClick={()=>{openSoftWare(a)}} variant="secondary" key={i} style={{marginBottom:10}} >ดูสถานะ</Button>
                                        })}
                                    </td>
                                    <td style={styles.text}>
                                        {hardwareOrder.map((a,i)=>{
                                            return <Button onClick={()=>{openHardware(a)}} variant="secondary" key={i} style={{marginBottom:10}} >ดูสถานะ</Button>
                                        })}
                                    </td>
                                    <td  style={{ textAlign:'center', cursor:'pointer'}}>
                                        {googleSheet
                                            ?<div>
                                                <i  onClick={()=>{handleGoogleSheet(item)}} style={{fontSize:30}} class="bi bi-file-earmark-spreadsheet"></i>
                                                <Button onClick={()=>{copyGoogleSheet(googleSheet)}} variant="light" >คัดลอกไฟล์</Button>
                                            </div>
                                            :<Button onClick={()=>{handleGoogleSheet(item)}} variant="dark" >ขอไฟล์</Button>
                                        }
                                        
                                    </td>
                                    <td style={styles.text}>
                                           <h6>training</h6>
                                            <DatePicker
                                                selected={trainingDate}
                                                onChange={(date) => updateDate({ doc:id, date, type:'trainingDate'})}
                                                showTimeSelect
                                                withPortal
                                                dateFormat="dd/MM/yyyy h:mm aa" // Format as DD/MM/YYYY h:mm AM/PM
                                            />
                                        <br/>
                                            <h6>softlaunch</h6>
                                            <DatePicker
                                                selected={launchDate}
                                                onChange={(date) => updateDate({ doc:id, date, type:'launchDate'})}
                                                showTimeSelect
                                                withPortal
                                                dateFormat="dd/MM/yyyy h:mm aa" // Format as DD/MM/YYYY h:mm AM/PM
                                            />
                                        
                                    </td>
                                    <td style={styles.text}>
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
                {showPopup && (
                    <div style={styles.popupStyle}>
                    Text copied successfully!
                    </div>
                )}
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
    },
    popupStyle : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '10px 20px',
        backgroundColor: dark,
        color: '#fff',
        borderRadius: '5px',
        zIndex: 1000,
        textAlign: 'center',
        fontSize: '16px',
    },
}

export default LaunchRender;

