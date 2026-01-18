import React, { useState, useEffect } from "react";
import {
  Table,
} from "react-bootstrap";
import { v4 as uuidv4 } from 'uuid';
import { db, prepareFirebaseImage } from "../db/firestore";
import { OneButton, SearchAndBottom, SearchControl } from "../components";
import { Modal_Equipment, Modal_Loading } from "../modal";
import { searchFilterFunction, toastSuccess } from "../Utility/function";
import { te } from "date-fns/locale";

const initialEquipment = { id:'', name:'', imageId:'', detail:'', price:'' }

function HardwareSettingScreen() {
    const [equipments, setEquipment] = useState([]);
    const [current, setCurrent] = useState(initialEquipment);
    const [equipment_Modal, setEquipment_Modal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);

    useEffect(()=>{
        let arr = equipments

        
        if(search){
            arr = searchFilterFunction(arr,search,'name')
        }
        setDisplay(arr)
    },[search,equipments]);



    useEffect(()=>{
        fetchHardware()
    },[]);

    async function fetchHardware(){
        setLoading(true);
        try {
            const query = await db.collection('hardware').get();
            const value = query.docs.map(doc=>({...doc.data(), id:doc.id}));
            setEquipment(value);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    // 200%
    async function submit(){
        setEquipment_Modal(false)
        const { id, imageId } = current;
        let image = imageId;
        setLoading(true);
        try {
            if(imageId && imageId.slice(0,5) !== 'https'){
                image = await prepareFirebaseImage(imageId,'/equipment/','equipment')
            };
            const finalCurrent = id
                ?{...current,imageId:image}
                :{...current,imageId:image, id:uuidv4()}
            if(id){
                const hardwareRef = db.collection('hardware').doc(id);
                await hardwareRef.update(finalCurrent);
            } else {
                const hardwareRef = db.collection('hardware').doc();
                await hardwareRef.set(finalCurrent);
            }

            setEquipment(prev=>{
                const exists = prev.find(a=>a.id===id);
                if(exists){
                    return prev.map(a=>{
                        return a.id===id
                            ?finalCurrent
                            :a
                    })
                } else {
                    return [...prev,finalCurrent]
                }
            });
            toastSuccess('บันทึกข้อมูลสำเร็จ');
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    // 200%
    function openEquipment(item){
        setCurrent(item)
        setEquipment_Modal(true)
    };

  return (
    <div >
        <Modal_Loading show={loading} />
        <Modal_Equipment
          show={equipment_Modal}
          onHide={()=>{setEquipment_Modal(false);setCurrent(initialEquipment)}}
          submit={submit}
          current={current}
          setCurrent={setCurrent}
        />
      <h1>ตั้งค่า Hardware</h1>
      <SearchAndBottom {...{ placeholder:'ค้นหาด้วยชื่อ', search, setSearch, download:false, onClick:()=>{openEquipment(initialEquipment)}, text:'เพิ่มอุปกรณ์' }} />
      <h6>ทั้งหมด : {equipments.length} รายการ</h6>
        <br/>
      <div>
      <Table  bordered   variant="light"   >
        <thead  >
        <tr>
            <th style={styles.container2}>No.</th>
            <th style={styles.container3}>ชื่อ</th>
            <th style={styles.container3}>รูป</th>
            <th style={styles.container3}>ราคา</th>
            <th style={styles.container5}>คุณสมบัติ</th>
            <th style={styles.container3}>สถานะการใช้งาน</th>
        </tr>
        </thead>
        <tbody  >
        {display.map((item, index) => {
            const { detail, id, imageId, name, price, status } = item;
            return <tr onClick={()=>{openEquipment(item)}} style={{cursor: 'pointer'}} key={index}  >
                    <td  style={styles.container4}>{index+1}.</td>
                    <td  style={styles.container4} >{name}</td>
                    <td  style={styles.container4} >
                        <img style={{width:'100px'}} src={imageId} />
                    </td>
                    <td  style={styles.container4} >{price}</td>
                    <td   >
                    {detail.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                            &emsp;&nbsp;{line}
                            <br />
                        </React.Fragment>
                        ))}
                    </td>
                    <td  style={styles.container4}>{status?'เปิดใช้งาน':'ปิดใช้งาน'}</td>
                </tr>
        }
        )}
        </tbody>
    </Table>
    </div>
    </div>
  );
};

const styles = {
    container:{
        minHeight:'100vh',
    },
    container2 : {
        width:'10%',
        minWidth:'80px',
        textAlign:'center'
    },
    container3 : {
        width:'15%',
        minWidth:'150px',
        textAlign:'center'
    },
    container4 : {
        textAlign:'center'
    },
    container5 : {
        textAlign:"center",width:'20%',
        minWidth:'300px'
    },
    text:{
        width:'50px'
    },
    text2 : {
        minWidth:'120px'
    }
}

export default HardwareSettingScreen;