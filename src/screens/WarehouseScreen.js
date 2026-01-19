import React, { useState, useEffect } from "react";
import {
  Table,
} from "react-bootstrap";
import { db } from "../db/firestore";
import { SearchControl } from "../components";
import { Modal_Loading, Modal_Stock } from "../modal";
import { formatTime, searchFilterFunction, toastSuccess } from "../Utility/function";
import { useSelector } from "react-redux";

const initialEquipment = { id:'', name:'', imageId:'', detail:'', price:'' };

function WarehouseScreen() {
    const { profile:{ id:profileId } } = useSelector(state=>state.profile)
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
            const value = query.docs.map(doc=>{
                const { timestamp, ...rest } = doc.data();
                return {
                    ...rest,
                    timestamp:formatTime(timestamp),
                    id:doc.id
                }
            });
            const arrangeResults = value.sort((a,b)=> a.timestamp - b.timestamp)
            setEquipment(arrangeResults);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    // 200%
    async function submit(){
        setEquipment_Modal(false)
        const { id, stock, safetyStock } = current;
        setLoading(true);
        try {
            const hardwareRef = db.collection('hardware').doc(id);
            await hardwareRef.update({ stock, safetyStock });

            setEquipment(prev=>prev.map(a=>{
                        return a.id===id
                            ?current
                            :a
                    }));
            toastSuccess('บันทึกข้อมูลสำเร็จ');
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    // 200%
    function openEquipment(item){
        if(profileId!=='cZ7XkJeZzNOrr5HEZKEPgAjtMrx2')return;
        setCurrent(item)
        setEquipment_Modal(true)
    };


  return (
    <div >
        <Modal_Loading show={loading} />
        <Modal_Stock
            show={equipment_Modal}
            onHide={()=>{setEquipment_Modal(false);setCurrent(initialEquipment)}}
            submit={submit}
            current={current}
            setCurrent={setCurrent}
        />
      <h1>สต๊อกคงเหลือ</h1>
      <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อ', search, setSearch }} />
      <h6>ทั้งหมด : {equipments.length} รายการ</h6>
        <br/>
      <div>
      <Table  bordered   variant="light"   >
        <thead  >
        <tr>
            <th style={styles.container2}>No.</th>
            <th style={styles.container3}>ชื่อ</th>
            <th style={styles.container3}>เซฟตี้สต๊อก</th>
            <th style={styles.container3}>สต๊อกคงเหลือ</th>
        </tr>
        </thead>
        <tbody  >
        {display.map((item, index) => {
                const { name, safetyStock, stock = '' } = item;
                return <tr onClick={()=>{openEquipment(item)}} style={{cursor: 'pointer'}} key={index}  >
                        <td  style={styles.container4}>{index+1}.</td>
                        <td  >{name}</td>
                        <td  style={styles.container4} >{safetyStock}</td>
                        <td  style={styles.container4} >{stock}</td>
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
}

export default WarehouseScreen;