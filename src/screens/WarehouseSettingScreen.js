import React, { useState, useEffect } from "react";
import {
  Table,
} from "react-bootstrap";
import { db, prepareFirebaseImage } from "../db/firestore";
import { SearchAndBottom } from "../components";
import { Modal_Warehouse, Modal_Loading } from "../modal";
import { formatCurrency, searchFilterFunction, toastSuccess } from "../Utility/function";
import { initialWarehouse } from "../configs";
import { useDispatch, useSelector } from "react-redux";
import { addNormalWarehouse, updateNormalWarehouse } from "../redux/warehouseSlice";


function WarehouseSettingScreen() {
    const dispatch = useDispatch();
    const { warehouse } = useSelector(state=>state.warehouse);

    const [current, setCurrent] = useState(initialWarehouse);
    const [warehouse_Modal, setWarehouse_Modal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);

    useEffect(()=>{
        let arr = warehouse
        
        if(search){
            arr = searchFilterFunction(arr,search,'name')
        }
        setDisplay(arr)
    },[search,warehouse]);



    // 200%
    async function submit(){
        setWarehouse_Modal(false)
        const { id, imageId } = current;
        let image = imageId;
        setLoading(true);
        try {
            if(imageId && imageId.slice(0,5) !== 'https'){
                image = await prepareFirebaseImage(imageId,'/equipment/','equipment')
            };
            const finalCurrent = id
                ?{...current,imageId:image}
                :{...current,imageId:image, createdAt:new Date(), timestamp:new Date()}
            if(id){
                const warehouseRef = db.collection('warehouse').doc(id);
                await warehouseRef.update(finalCurrent);
                dispatch(updateNormalWarehouse({ id, updatedField: finalCurrent }))
            } else {
                const warehouseRef = db.collection('warehouse').doc();
                await warehouseRef.set(finalCurrent);
                dispatch(addNormalWarehouse({ ...finalCurrent, id:warehouseRef.id }))
            }

            toastSuccess('บันทึกข้อมูลสำเร็จ');
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    // 200%
    function openEquipment(item){
        const { stockSet } = item;
        const hardwareIds = new Set(warehouse.map(a=>a.id));
    
        setCurrent({...initialWarehouse,...item,stockSet:stockSet.filter(a=>hardwareIds.has(a.id))})
        setWarehouse_Modal(true)
    };


  return (
    <div >
        <Modal_Loading show={loading} />
        <Modal_Warehouse
          show={warehouse_Modal}
          onHide={()=>{setWarehouse_Modal(false);setCurrent(initialWarehouse)}}
          submit={submit}
          current={current}
          setCurrent={setCurrent}
        />
      <h1>ตั้งค่า Warehouse</h1>
      <SearchAndBottom {...{ placeholder:'ค้นหาด้วยชื่อ', search, setSearch, download:false, exportToXlsx:()=>{openEquipment(initialWarehouse)}, text:'เพิ่มสินค้า' }} />
      <h6>ทั้งหมด : {warehouse.length} รายการ</h6>
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
            const { detail, imageId, name, price, status, stockSetStatus } = item;
            return <tr onClick={()=>{openEquipment(item)}} style={{cursor: 'pointer'}} key={index}  >
                    <td  style={styles.container4}>{index+1}.</td>
                    <td   >
                        {name}
                        {stockSetStatus && <span style={{color:'red'}}> *SET</span>}
                        </td>
                    <td  style={styles.container4} >
                        <img style={{width:'100px'}} src={imageId} />
                    </td>
                    <td  style={styles.container4} >{formatCurrency(Number(price))}</td>
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
        width:'5%',
        minWidth:'70px',
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

export default WarehouseSettingScreen;