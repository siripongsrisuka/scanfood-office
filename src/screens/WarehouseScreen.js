import React, { useState, useEffect } from "react";
import {
  Table,
} from "react-bootstrap";
import { v4 as uuidv4 } from 'uuid';
import { db, prepareFirebaseImage } from "../db/firestore";
import { OneButton, SearchControl } from "../components";
import { Modal_Equipment, Modal_Loading } from "../modal";
import { searchFilterFunction, toastSuccess } from "../Utility/function";

const initialEquipment = { id:'', name:'', imageId:'', detail:'', price:'' };
const initialWarehouse = {
    id:'',
    stock:'',
    safety:'',
    
}

function WarehouseScreen() {
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
            const hardwareDoc = await db.collection('admin').doc('hardware').get();
            const { value } = hardwareDoc.data();
            setEquipment(value);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    async function submit(){
        setEquipment_Modal(false)
        const { id, imageId } = current;
        let image = imageId
        try {
            if(imageId && imageId.slice(0,5) !== 'https'){
                image = await prepareFirebaseImage(imageId,'/equipment/','equipment')
            };
            let finalCurrent = {}
            if(id){
                finalCurrent = {...current,imageId:image}
            } else {
                finalCurrent = {...current,imageId:image, id:uuidv4()}
            }
            const newEquipment = id
                ?equipments.map(a=>{
                    return a.id===current.id
                        ?finalCurrent
                        :a
                })
                :[...equipments,finalCurrent]
       
            await db.collection('admin').doc('hardware').update({ value:newEquipment })
            setEquipment(newEquipment);
            toastSuccess();
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    function openEquipment(item){
        setCurrent(item)
        setEquipment_Modal(true)
    }

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
      <h1>สต๊อกคงเหลือ</h1>
      <div style={{display:'flex'}} >
        &emsp;
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อ', search, setSearch }} />&emsp;
        <OneButton {...{ text:'เพิ่มอุปกรณ์', submit:()=>{openEquipment(initialEquipment)} }} />&emsp;
      </div>
      <h6>ทั้งหมด : {equipments.length} รายการ</h6>
        <br/>
      <div>
      <Table  bordered   variant="light"   >
        <thead  >
        <tr>
            <th style={styles.text}>No.</th>
            <th style={styles.text2}>ชื่อ</th>
            <th style={styles.text2}>รูป</th>
            <th style={styles.text2}>ราคา</th>
            <th style={styles.text2}>คุณสมบัติ</th>
            <th style={styles.text2}>สถานะการใช้งาน</th>
            <th style={styles.text2}>จัดการ</th>
        </tr>
        </thead>
        <tbody  >
        {display.map((item, index) => {
            const { detail, id, imageId, name, price, status } = item;
            return <tr  style={{cursor: 'pointer'}} key={index}  >
                    <td  style={styles.text3}>{index+1}.</td>
                    <td  style={styles.text3} >{name}</td>
                    <td  style={styles.text3} >
                        <img style={{width:'100px'}} src={imageId} />
                    </td>
                    <td  style={styles.text3} >{price}</td>
                    <td  style={styles.text3} >
                    {detail.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                            &emsp;&nbsp;{line}
                            <br />
                        </React.Fragment>
                        ))}
                    </td>
                    <td  style={styles.text3}>{status?'เปิดใช้งาน':'ปิดใช้งาน'}</td>
                    <td  style={styles.text3}>
                        <OneButton {...{ text:'จัดการ', variant:'warning', submit:()=>{openEquipment(item)} }} />
                    </td>
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
    text:{
        width:'50px'
    },
    text2 : {
        minWidth:'120px'
    }
}

export default WarehouseScreen;