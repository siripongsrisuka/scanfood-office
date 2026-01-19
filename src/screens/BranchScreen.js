import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useParams } from "react-router-dom";

import { colors, initialAlert, initialSoftware, initialStore, initialHardware } from "../configs";
import { db } from "../db/firestore";
import { updateBranchLine, updateDemo, updateFieldStore } from "../redux/careSlice";
import { Button } from "rsuite";
import { Modal_Alert, Modal_Loading, Modal_OneInput, Modal_Profile, Modal_SoftwareDetail, Modal_Success } from "../modal";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';
import { logout } from "../redux/authSlice";

const { dark, white, softWhite } = colors;

function BranchScreen() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { demo } = useSelector(state=>state.care);
    const { note } = demo;
    const [store, setStore] = useState(initialStore);
    const { storeName, process } = store;
    const [profile_Modal, setProfile_Modal] = useState(false);
    const [loading, setLoading] = useState(false)
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [note_Modal, setNote_Modal] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    const [hardware, setHardware] = useState([]);
    const [software, setSoftware] = useState([]);
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;
    const [software_Modal, setSoftware_Modal] = useState(false);
    const [currentSoftware, setCurrentSoftware] = useState(initialSoftware)
    const [hardware_Modal, setHardware_Modal] = useState(false);
    const [currentHardware, setCurrentHardware] = useState(initialHardware)

    useEffect(()=>{
        fetchStore()
    },[])

    async function fetchStore() {
        setLoading(true)
        try {
            const doc = await db.collection('portStore').doc(id).get();
            if (doc.exists) {
                const { hardwareOrder, softwareOrder } = doc.data();
                const data = { ...doc.data(), id: doc.id };
                const { timestamp, demoDate, paymentDate, expireDate, trainingDate, launchDate, endDate, ...rest } = doc.data();
                
                setStore(data);
                dispatch(updateDemo({ 
                    ...initialStore,
                    ...rest,
                    timestamp:timestamp.toDate(),
                    demoDate:demoDate.toDate(),
                    paymentDate:paymentDate.toDate(),
                    trainingDate:trainingDate.toDate(),
                    launchDate:launchDate.toDate(),
                    expireDate:expireDate.toDate(),
                    endDate:endDate.toDate(),
                    id:doc.id
                 }));
    
                // Fetch software orders in parallel
                const softwarePromises = softwareOrder.map(item => 
                    db.collection('packageOrder').doc(item).get()
                );
                const softwareDocs = await Promise.all(softwarePromises);
                const software = softwareDocs.map(doc => ({ ...doc.data(), id: doc.id }));
    
                // Fetch hardware orders in parallel
                const hardwarePromises = hardwareOrder.map(item => 
                    db.collection('hardwareOrder').doc(item).get()
                );
                const hardwareDocs = await Promise.all(hardwarePromises);
                const hardware = hardwareDocs.map(doc => ({ ...doc.data(), id: doc.id }));
    
                setSoftware(software);
                setHardware(hardware);
            }
        } catch (error) {
            console.error("Error fetching store data:", error);
        } finally {
            setLoading(false)
        }
    }
    

    async function updateData(){
        setProfile_Modal(false)
        setLoading(true)
        try {
          const { quotation, ...rest } = demo
          await db.collection('portStore').doc(demo.id).update(rest)
          setStore(demo)
          setSuccess_Modal(true);
          setTimeout(()=>{
            setSuccess_Modal(false)
          },900)
        } catch (error) {
          
        } finally {
          setLoading(false)
        }
    };

    function openNote(){
        setNote_Modal(true)
        setCurrentNote(note)
    };

    function closeNote(){
        setNote_Modal(false)
        setCurrentNote('')
    };

    function submitNote(){
        setNote_Modal(false)
        dispatch(updateFieldStore({ doc:demo.id, field:{ note:currentNote }}))
        setCurrentNote('')
    };

    function exit(){
        dispatch(logout()).then(()=>{
            navigate('/')
            dispatch(updateBranchLine(''))
        })
    }

  return (
    <div  >
      
        <Modal_SoftwareDetail
            show={software_Modal}
            onHide={()=>{setSoftware_Modal(false)}}
            current={currentSoftware}
        />
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
        <Modal_OneInput
            show={note_Modal}
            onHide={closeNote}
            placeholder='ใส่รายละเอียดเพิ่มเติม'
            header='โน๊ต'
            value={currentNote}
            onChange={(v)=>{setCurrentNote(v)}}
            onClick={submitNote}
        />
        <Modal_Loading show={loading} />
        <Modal_Success show={success_Modal} />
        <Modal_Profile
            show={profile_Modal}
            onHide={()=>{setProfile_Modal(false)}}
            submit={updateData}
        />
        <div style={{padding:'1rem',backgroundColor:dark,color:white}} >
            <div style={{position:'absolute',top:10,left:10}} >
                <Button onClick={()=>{navigate(-1)}}  ><i class="bi bi-arrow-left"></i></Button>
            </div>
            <h1 style={{textAlign:'center'}} >
                {storeName}
            </h1>
            <div style={{position:'absolute',top:10,right:10}} >
                <Button onClick={()=>{
                    setAlert_Modal({ variant:'danger',status:true, content:`ออกจากระบบ`, onClick:()=>{setAlert_Modal(initialAlert);exit()}})
                }}  appearance="ghost" color="red" ><i class="bi bi-box-arrow-right"></i></Button>
            </div>
        </div>
        <div style={{padding:10}} >
            <h4>1. โปรไฟล์</h4>
            <Button onClick={()=>{setProfile_Modal(true)}} appearance={"primary"} color='green' >จัดการโปรไฟล์</Button>
            <h4>2. ดำเนินการ : {process}</h4>
            <h4>3. คำสั่งซื้อ</h4>
            <div style={{paddingLeft:'1rem'}} >
                <h5>- คำสั่งซื้อ Software</h5>
                {software.map((item,index)=>{
                    return <div key={index} style={{padding:10,margin:5,borderRadius:20,backgroundColor:softWhite}} >
                            <h6>เลขที่คำสั่งซื้อ : {item.orderNumber} <i style={{cursor:'pointer'}} onClick={()=>{setSoftware_Modal(true);setCurrentSoftware(item)}} class="bi bi-search"></i></h6>
                            <h6>สถานะ : {item.status}</h6>
                        </div>
                })}
                
                <h5>- คำสั่งซื้อ Hardware</h5>
                {hardware.map((item,index)=>{
                    return <div key={index} style={{padding:10,margin:5,borderRadius:20,backgroundColor:softWhite}} >
                            <h6>เลขที่คำสั่งซื้อ : {item.orderNumber} <i style={{cursor:'pointer'}} onClick={()=>{setHardware_Modal(true);setCurrentHardware(item)}} class="bi bi-search"></i></h6>
                            <h6>สถานะ : {item.status}</h6>
                            {item.tracking
                                ?<Button  
                                    onClick={()=>{
                                        window.open(`https://track.thailandpost.co.th/?trackNumber=${item.tracking}`, '_blank')
                                    }}
                                    appearance={"primary"} 
                                    color='yellow' 
                                    >เช็คการจัดส่ง</Button>
                                :null
                            }
                        </div>
                })}
            </div>
            <h4>4. โน๊ต <i onClick={openNote} class="bi bi-pencil-square"></i></h4>
            <h6>&emsp;{note}</h6>
        </div>
    </div>
  );
}

export default BranchScreen;