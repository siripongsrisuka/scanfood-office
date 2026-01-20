import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
} from "react-bootstrap";
import { db } from "../db/firestore";
import { CategoryRender, SearchControl } from "../components";
import {  Modal_FlatListTwoColumn, Modal_Loading, Modal_OneInput } from "../modal";
import { formatTime, searchMultiFunction, toastSuccess } from "../Utility/function";
import { normalSort } from "../Utility/sort";
import { stringDateTimeReceipt, stringYMDHMS3 } from "../Utility/dateTime";
import { initialWarehouse } from "../configs";

const deliveryOptions = {
    'normal':'DHL',
    'fast':'Lalamove',
    'self':'รับที่บริษัท'
};

const statusMap = {
    'prepare':'รอจัด',
    'packed':'จัดเสร็จแล้ว',
}

const statusOptions = [
    { id:'1', name:"รอจัด", status:'prepare' },
    { id:'2', name:"จัดเสร็จแล้ว", status:'packed' },
    { id:'3', name:"ส่งแล้ว", status:'sent' },
];

function WarehouseJobScreen() {
    const [current, setCurrent] = useState(initialWarehouse);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);
    const [masterData, setMasterData] = useState([]);
    const [option, setOption] = useState({ id:'1', name:"ทั้งหมด" });
    const { id:optionId, name } = option;
    const [status_Modal, setStatus_Modal] = useState(false);
    const [link_Modal, setLink_Modal] = useState(false);
    const [link, setLink] = useState('');


    const options = useMemo(()=>{
        return [
                { id:'1', name:"รอจัด", value:masterData.filter(a=>a.status==='prepare').length  },
                { id:'2', name:"จัดเสร็จแล้ว", value:masterData.filter(a=>a.status==='packed').length  },
                { id:'4', name:"ทั้งหมด", value:masterData.filter(a=>['prepare','packed'].includes(a.status)).length  },
            ]
    },[masterData])

    useEffect(()=>{
        let arr = optionId === '4'
            ?[...masterData]
            :masterData.filter(a=>{
                if(optionId === '1') return a.status==='prepare'
                if(optionId === '2') return a.status==='packed'
            });

        
        if(search){
            arr = searchMultiFunction(arr,search,['profileName','orderNumber'])
        }
        setDisplay(arr)
    },[search,masterData,optionId]);

    useEffect(()=>{
        fetchJobs();
    },[])



    async function fetchJobs(){
        setLoading(true);
        try {
            const query = await db.collection('hardwareOrder')
                .where('status','in',['prepare','packed'])
                .get();
            
            const results = query.docs.map(doc=>{
                const { timestamp, ...rest } = doc.data();
                return {
                    ...rest,
                    timestamp:formatTime(timestamp),
                    id:doc.id
                }
            });
            setMasterData(normalSort('timestamp',results));
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    function openStatus(item){
        setCurrent(item)
        setStatus_Modal(true)
    };

    async function handleStatus(item){
        setStatus_Modal(false);
        setLoading(true);
        const { id:orderId } = current;
        const { status } = item;
        try {
            await db.runTransaction( async (transaction)=>{
                const orderRef = db.collection('hardwareOrder').doc(orderId);
                const orderDoc = await transaction.get(orderRef);
                const { status:currentStatus } = orderDoc.data();
                if(['success','cancel'].includes(currentStatus)) throw new Error(`สถานะ : ${currentStatus} แก้ไขไม่ได้`);
                if(status ==='sent'){
                    transaction.update(orderRef,{ status, billDate:stringYMDHMS3(new Date()) });
                } else {
                    transaction.update(orderRef,{ status });
                }
            });
            toastSuccess('อัปเดตสถานะสำเร็จ');
            setMasterData(prev=>prev.map(item=>
                item.id === orderId
                    ?{
                        ...item,status
                    }
                    :item
            ))

        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    function openLink(item){
        setCurrent(item)
        setLink_Modal(true)
    };


    async function handleLink(){
        setLink_Modal(false);
        setLoading(true);
        const { id:orderId } = current;
        try {
            await db.runTransaction( async (transaction)=>{
                const orderRef = db.collection('hardwareOrder').doc(orderId);
                const orderDoc = await transaction.get(orderRef);
                const { status:currentStatus } = orderDoc.data();
                if(['success','cancel'].includes(currentStatus)) throw new Error(`สถานะ : ${currentStatus} แก้ไขไม่ได้`);
                transaction.update(orderRef,{ link })
            });
            toastSuccess('อัปเดตลิงค์สำเร็จ');
            setMasterData(prev=>prev.map(item=>
                item.id === orderId
                    ?{
                        ...item,link
                    }
                    :item
            ));
            setLink('');
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };
    

  return (
    <div style={styles.container} >
        <Modal_OneInput
            show={link_Modal}
            header={`ลิงค์การจัดส่ง`}
            onHide={()=>{setLink_Modal(false);setLink('')}}
            value={link}
            onClick={handleLink}
            placeholder='ใส่ link'
            onChange={setLink}
            area={true}
        />
        <Modal_FlatListTwoColumn
            show={status_Modal}
            onHide={()=>{setStatus_Modal(false)}}
            header='เลือกสถานะ'
            onClick={handleStatus}
            value={statusOptions}
        />
        <Modal_Loading show={loading} />
      <h1>งานคลัง</h1>
      <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อเซลหรือเลขที่ใบสั่งซื้อ', search, setSearch }} />
      <CategoryRender {...{ options, option:optionId, setOption }} />
      <h5>ทั้งหมด : {display.length} รายการ</h5>
        <br/>
      <div>
      <Table  bordered   variant="light"   >
        <thead  >
        <tr>
            <th style={styles.container2}>วันที่</th>
            <th style={styles.container2}>ชื่อ</th>
            <th style={styles.container3}>รายการ</th>
            <th style={styles.container3}>รายละเอียด</th>
            <th style={styles.container2}>รูปแบบการจัดส่ง</th>
            <th style={styles.container2}>สถานะ</th>
            <th style={styles.container2}>ลิงค์</th>
        </tr>
        </thead>
        <tbody  >
        {display.map((item, index) => {
            const { orderNumber, status, timestamp, profileName, product, deliveryType = 'normal', note = '', link } = item;
            return <tr  style={{cursor: 'pointer'}} key={index}  >
                    <td  style={styles.text3}>
                        {stringDateTimeReceipt(timestamp)}<br/>
                        <b>#{orderNumber}</b>
                    </td>
                    <td  style={styles.text3} >{profileName}</td>
                    <td  style={styles.text3} >
                        {product.map((a,i)=>{
                            const { name, qty, id } = a;
                            return <h6 key={id} >{qty} x {name}</h6>
                        })}
                    </td>
                    <td  style={styles.text3} >
                        {note}
                    </td>
                    <td  style={styles.container4} >{deliveryOptions[deliveryType]}</td>
                    
                    <td onClick={()=>{openStatus(item)}} style={styles.container4} >{statusMap[status]}<i class="bi bi-pen-fill"></i></td>
                    <td onClick={()=>{openLink(item)}}  style={styles.container4}>{link}</td>
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
    container : {
        minHeight:'100vh'
    },
    container2 : {
        width:'10%', minWidth:'150px', textAlign:'center'
    },
    container3 : {
        width:'15%', minWidth:'250px', textAlign:'center'
    },
    container4 : {
        textAlign:'center'
    }

}

export default WarehouseJobScreen;