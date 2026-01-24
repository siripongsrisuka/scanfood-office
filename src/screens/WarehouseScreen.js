import React, { useState, useEffect } from "react";
import {
  Table,
} from "react-bootstrap";
import { db } from "../db/firestore";
import { SearchAndBottom } from "../components";
import { Modal_Inbound, Modal_Loading, Modal_Stock } from "../modal";
import { isApprover, searchFilterFunction, toastSuccess } from "../Utility/function";
import { useDispatch, useSelector } from "react-redux";
import { updateNormalWarehouse } from "../redux/warehouseSlice";
import { initialWarehouse } from "../configs";
import { stringYMDHMS3 } from "../Utility/dateTime";


function WarehouseScreen() {
    const dispatch = useDispatch();
    const { warehouse } = useSelector(state=>state.warehouse);
    const { profile:{ id:profileId, name:profileName } } = useSelector(state=>state.profile)
    const [current, setCurrent] = useState(initialWarehouse);
    const [equipment_Modal, setEquipment_Modal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);
    const [inbound_Modal, setInbound_Modal] = useState(false);  

    useEffect(()=>{
        const arr = search
            ?searchFilterFunction(warehouse,search,'name')
            :[...warehouse];
   
        setDisplay(arr)
    },[search,warehouse]);


    // 200%
    async function submit(){
        setEquipment_Modal(false)
        const { id, stock, safetyStock } = current;
        setLoading(true);
        try {
            const warehouseRef = db.collection('warehouse').doc(id);
            await warehouseRef.update({ stock, safetyStock });
            dispatch(updateNormalWarehouse({ id, updatedField: { stock, safetyStock } }))
     
            toastSuccess('บันทึกข้อมูลสำเร็จ');
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    // 200%
    function openEquipment(item){
        if(!isApprover(profileId))return;
        setCurrent(item)
        setEquipment_Modal(true)
    };

    async function handleInbound(inboundItems,note){
        setInbound_Modal(false)
        setLoading(true);
        try {
            const warehouseUpdates = await db.runTransaction(async (transaction) => {
                let warehouseUpdates = [];
                const inboundRef = db.collection('inbound').doc();
                
                for (const item of inboundItems) {
                    const { id, qty } = item;
                    const warehouseRef = db.collection('warehouse').doc(id);
                    const doc = await transaction.get(warehouseRef);
                    if (doc.exists) {
                        const data = doc.data();
                        const newStock = Number(data.stock || 0) + Number(qty);
                        transaction.update(warehouseRef, { stock: newStock });
                        warehouseUpdates.push({ id, stock: newStock });
                    }
                }
                transaction.set(inboundRef, {
                    items: inboundItems.map(item=>({
                        id: item.id,
                        name: item.name,
                        qty: item.qty,
                    })),
                    note: note,
                    createdAt: new Date(),
                    timestamp: new Date(),
                    billDate: stringYMDHMS3(new Date()),
                    createdBy: profileId,
                    createdName: profileName,
                });
                return warehouseUpdates;
            });
            warehouseUpdates.forEach(update => {
                dispatch(updateNormalWarehouse({ id: update.id, updatedField: { stock: update.stock } }));
            });
       
            toastSuccess('รับเข้าสินค้าสำเร็จ');
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    function openInbound(){
        setInbound_Modal(true)
    };


  return (
    <div >
        <Modal_Loading show={loading} />
        <Modal_Inbound
            show={inbound_Modal}
            onHide={()=>{setInbound_Modal(false)}}
            submit={handleInbound}
        />
        <Modal_Stock
            show={equipment_Modal}
            onHide={()=>{setEquipment_Modal(false);setCurrent(initialWarehouse)}}
            submit={submit}
            current={current}
            setCurrent={setCurrent}
        />
      <h1>สต๊อกคงเหลือ</h1>
      <SearchAndBottom {...{ placeholder:'ค้นหาด้วยชื่อ', search, setSearch, download:false, exportToXlsx:openInbound, text:'รับเข้า' }} />
      <h6>ทั้งหมด : {warehouse.length} รายการ</h6>
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
                const { name, safetyStock, stock = '', stockSetStatus } = item;
                return <tr onClick={()=>{openEquipment(item)}} style={{cursor: 'pointer'}} key={index}  >
                        <td  style={styles.container4}>{index+1}.</td>
                        <td  >{name}</td>
                        <td  style={styles.container4} >{stockSetStatus?"-":safetyStock}</td>
                        <td  style={styles.container4} >{stockSetStatus?"-":stock}</td>
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
        width:'5%',
        minWidth:'70px',
        textAlign:'center'
    },
    container3 : {
        width:'20%',
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