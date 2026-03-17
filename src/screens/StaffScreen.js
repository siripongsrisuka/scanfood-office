import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import { Modal_FindHuman, Modal_Human, Modal_Loading } from "../modal";
import { updateNormalFieldOffice } from "../redux/officeSlice";
import { OneButton } from "../components";
import { initialOffice } from "../configs";
import { db } from "../db/firestore";
import { toastSuccess } from "../Utility/function";

const initialHuman = {
    id:'',
    name:'',
    tel:'',
    rights:[],
    team:'',
    saleManagerTeam: ''
};

function StaffScreen() {
    const dispatch = useDispatch();
    const { office: { humanRight, telegram } } = useSelector((state)=> state.office);


    const telegramMap = useMemo(()=>{
        return new Map(telegram.map(a=>[a.id, a.title]))
    },[telegram])
   
    const [human_Modal, setHuman_Modal] = useState(false);
    const [current, setCurrent] = useState(initialHuman);
    const [newHuman_Modal, setNewHuman_Modal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentHumans, setCurrentHumans] = useState([]);

    const sideBar = useMemo(()=>{
      let sideBar = initialOffice

      return sideBar.filter(a=>!a.label)
    },[])

  
    // ดึงข้อมูลทุกครั้ง เพราะต้องอัปเดตชื่อ รูปและเบอร์โทร
    async function fetchHumanResource() {
      setLoading(true);

      try {
        const promises = humanRight.map(async (item) => {
          try {
            const doc = await db.collection("profile").doc(item.id).get();

            if (doc.exists) {
              const { name, imageId, tel } = doc.data();
              return { ...item, name, imageId, tel };
            }

            return item; // fallback if doc not found
          } catch (err) {
            return item; // fallback if error
          }
        });

        const res = await Promise.all(promises);
        setCurrentHumans(res);
      } finally {
        setLoading(false);
      }
    }

    useEffect(()=>{
      fetchHumanResource();
    },[humanRight]);
 
    // 200%
    async function manageHuman(){
        const rightIds = new Set(sideBar.map(a=>a.id))
        const { id, rights, chat_id } = current;
        const duplicateChatId = currentHumans.find(a=>a.chat_id === chat_id && a.id !== id);
        if(duplicateChatId && chat_id) return alert('มีคนใช้ telegram นี้ในระบบแล้ว กรุณาเปลี่ยนใหม่');
        setHuman_Modal(false)

        const findHuman = currentHumans.find(a=>a.id===id);
        const newHuman = findHuman
          ?currentHumans.map(item=>
            item.id === id
              ?{
                ...current,
                rights:rights.filter(a=>rightIds.has(a))
              }
              :item
          )
          :[...currentHumans,current]
        const cleanData = newHuman.map(({ id, name, rights, team = '', saleManagerTeam = '', imageId, chat_id = '', admin = false }) =>({ id, name, rights, team, saleManagerTeam, imageId, chat_id:chat_id?Number(chat_id):'', admin }))
        const updatedField = { humanRight:cleanData, humanResource:cleanData.map(a=>a.id) };
        setLoading(true);
        try {
          const officeRef = db.collection('admin').doc('office');
          await officeRef.update(updatedField);
          dispatch(updateNormalFieldOffice(updatedField));
          toastSuccess('อัปเดตสำเร็จ')
        } catch (error) {
          alert(error)
        } finally {
          setLoading(false);
          setCurrent(initialHuman);
        }
    }

    // 200%
    async function deleteHuman(id){
        setHuman_Modal(false);
        const newHuman = currentHumans.filter(a=>a.id!==id);
        setLoading(true);
        try {
          const updatedField = { humanRight:newHuman, humanResource:newHuman.map(a=>a.id) };
          const officeRef = db.collection('admin').doc('office');
          await officeRef.update(updatedField);
          dispatch(updateNormalFieldOffice(updatedField))
        } catch (error) {
          alert(error);
        } finally {
          setLoading(false);
          setCurrent(initialHuman)
        }
    };

    function openHuman(){
      setNewHuman_Modal(false)
      setHuman_Modal(true)
    };


  return (
    <div  style={styles.container}  >
        <Modal_Loading show={loading} />
        <Modal_FindHuman
            show={newHuman_Modal}
            onHide={()=>{setNewHuman_Modal(false)}}
            current={current}
            setCurrent={setCurrent}
            submit={openHuman}
        />
        <Modal_Human
            show={human_Modal}
            onHide={()=>{setHuman_Modal(false);setCurrent(initialHuman)}}
            current={current}
            setCurrent={setCurrent}
            deleteItem={deleteHuman}
            submit={manageHuman}
            sideBar={sideBar}
        />
      <h1>บุคลากร</h1>
        <OneButton {...{ text:'+ เพิ่มบุคลากร', submit:()=>{setNewHuman_Modal(true)} }} />
        <br/>
        <br/>
        <h6>บุคคากร : {currentHumans.length} คน</h6>
      <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container3}>No.</th>
                <th style={styles.container4}>รูปภาพ</th>
                <th style={styles.container4}>ชื่อ</th>
                <th style={styles.container4}>เบอร์โทร</th>
                <th style={styles.container4}>Telegram</th>
                <th style={styles.container4}>สิทธิ์</th>
                <th style={styles.container4}>จัดการ</th>
            </tr>
            </thead>
            <tbody  >
            {currentHumans.map((item, index) => {
                const { id, name, tel, rights, imageId, chat_id } = item;
                return <tr  key={id} >
                            <td style={styles.container6}>{index+1}.</td>
                            <td style={styles.container6}>
                              <img style={{ width:'100px', height:'100px', borderRadius:100 }} src={imageId} />
                            </td>

                            <td >{name}</td>
                            <td style={styles.container6}>{tel}</td>
                            <td style={styles.container6}>{chat_id?telegramMap.get(chat_id):''}</td>
                            <td style={styles.container6}>{rights.length}</td>
                            <td style={styles.container6}>
                                <OneButton {...{ text:'จัดการ', submit:()=>{setHuman_Modal(true);setCurrent(item)}, variant:'warning' }} />
                            </td>
                        </tr>
            })}
            </tbody>
        </Table>
    </div>
  );
}

const styles = {
  container : {
      minHeight:'100vh',
      scrollY:'auto'
  },

  container3 : {
      width: '5%', textAlign:'center', minWidth:'50px'
  },
  container4 : {
      width: '15%', textAlign:'center', minWidth:'180px'
  },

  container6 : {
      textAlign:'center'
  }
};

export default StaffScreen;