import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
} from "react-bootstrap";
import { db, prepareFirebaseImage, webImageDelete } from "../db/firestore";
import { CategoryRender, SearchControl } from "../components";
import {  Modal_FlatListTwoColumn, Modal_Loading, Modal_OneInput, Modal_WarehouseImage } from "../modal";
import { formatTime, isApprover, searchMultiFunction, toastSuccess } from "../Utility/function";
import { normalSort } from "../Utility/sort";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { deleteMessage, sendMessage, telegramDeleteQueue } from "../Utility/telegram";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';

const deliveryOptions = {
    'normal':'DHL',
    'fast':'Lalamove',
    'self':'รับที่บริษัท'
};
const deliveryOptions2 = [
    { id:'normal', name:"DHL" },
    { id:'fast', name:"Lalamove" },
    { id:'self', name:"รับที่บริษัท" }
]

const statusMap = {
    'prepare':'รอจัด',
    'packed':'จัดเสร็จแล้ว',
    'sent':'ส่งแล้ว',
    'success':'สำเร็จ',
    'cancel':'ยกเลิก'
}

const statusOptions = [
    { id:'1', name:"รอจัด", status:'prepare' },
    { id:'2', name:"จัดเสร็จแล้ว", status:'packed' },
    { id:'3', name:"ส่งแล้ว", status:'sent' },
];

function WarehouseJobScreen() {
    const { profile:{ id:profileId } } = useSelector(state=>state.profile);
    const [current, setCurrent] = useState({ imageUrls: [], comment:'' });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);
    const [masterData, setMasterData] = useState([]);
    const [option, setOption] = useState({ id:'1', name:"ทั้งหมด" });
    const { id:optionId, name } = option;
    const [status_Modal, setStatus_Modal] = useState(false);
    const [link_Modal, setLink_Modal] = useState(false);
    const [link, setLink] = useState('');
    const [oldImageUrls, setOldImageUrls] = useState(null);
    const [image_Modal, setImage_Modal] = useState(false);
    const [route_Modal, setRoute_Modal] = useState(false);


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
        const { status:thisStatus } = item;
        try {
            const orderData = await db.runTransaction( async (transaction)=>{
                const orderRef = db.collection('hardwareOrder').doc(orderId);
                const orderDoc = await transaction.get(orderRef);
                const { status:currentStatus } = orderDoc.data();
                if(['success','cancel'].includes(currentStatus)) throw new Error(`สถานะ : ${currentStatus} แก้ไขไม่ได้`);
                if(thisStatus === 'sent'){ // หลังส่งแล้ว เซลจะต้องไปเลือกผูกกับข้อ 4.3
                    transaction.update(orderRef,{ status:thisStatus, linkCode:false });
                } else {
                    transaction.update(orderRef,{ status:thisStatus });
                }
                
                return orderDoc.data()
            });
            const { chat_id, chat_id_warehouse, message_id, message_id_warehouse, telegram = [], noNeedTelegram = false } = orderData;
            const warehousePayload = telegram.find(a=>a.type === 'warehouse');
            if(warehousePayload && !noNeedTelegram){
                const { process = [] } = warehousePayload;
                const newProcess = thisStatus==='sent' // สถานะสุดท้ายถ้าเป็นส่งแล้วจะมีข้อความบอกว่าข้อความจะถูกลบอัตโนมัติใน 12 ชั่วโมง แต่ถ้าไม่ใช่ส่งแล้วจะไม่มีข้อความนั้น
                    ?[
                        ...process, 
                        { name:`${statusMap[thisStatus]}`, createdAt: `${stringDateTimeReceipt(new Date())}\n*ข้อความจะถูกลบอัตโนมัติใน 12 ชั่วโมง\n✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅`, id:uuidv4() }
                    ]
                    :[
                        ...process, 
                        { name:statusMap[thisStatus], createdAt: stringDateTimeReceipt(new Date()), id:uuidv4() }
                    ]

                const updatePromises = [];

                updatePromises.push(sendMessage({ chat_id, ...warehousePayload, process:newProcess }));

                if(thisStatus !=='sent'){ // เพราะถ้าสถานะส่งแล้ว คลังไม่ต้องรับรู้ แค่ลบอย่างเดียวก็พอ
                    updatePromises.push(sendMessage({ chat_id: chat_id_warehouse, ...warehousePayload, process:newProcess }));
                }

                if(chat_id && message_id){ // ช่องของเซล
                    updatePromises.push(deleteMessage({ chat_id, message_id }));
                }
                if(chat_id_warehouse && message_id_warehouse){ // ช่องของคลัง
                    updatePromises.push(deleteMessage({ chat_id: chat_id_warehouse, message_id: message_id_warehouse }));
                }
                const results = await Promise.all(updatePromises);
                const newMessageId = results[0];
                const newMessageIdWarehouse = results[1];
                if(thisStatus ==='sent'){
                    // ลบของ sale
                    await telegramDeleteQueue({ chat_id: chat_id, message_id: newMessageId });
             
                    
                }
                const orderRef = db.collection('hardwareOrder').doc(orderId);
                const newTelegram = orderData.telegram.map(a=>{
                        if(a.type === 'warehouse'){
                            return {
                                ...a,
                                process:newProcess
                            }
                        }
                        return a;
                })
                await orderRef.update({
                    telegram: newTelegram,
                    message_id:newMessageId, 
                    message_id_warehouse:thisStatus === 'sent' ? null : newMessageIdWarehouse
                });
                setMasterData(prev=>prev.map(item=>
                    item.id === orderId
                        ?{
                            ...item,
                            status:thisStatus,
                            telegram: newTelegram,
                            message_id:newMessageId, 
                            message_id_warehouse:thisStatus === 'sent' ? null : newMessageIdWarehouse
                        }
                        :item
                ))
            } else {
                setMasterData(prev=>prev.map(item=>
                    item.id === orderId
                        ?{
                            ...item,
                            status:thisStatus,
                        }
                        :item
                ))
            }
            
     
            toastSuccess('อัปเดตสถานะสำเร็จ');
            

        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    function openLink(item){
        setCurrent(item)
        setLink_Modal(true)
        setLink(item.link || '')
    };


    async function handleLink(){
        setLink_Modal(false);
        setLoading(true);
        const { id:orderId } = current;
        try {
            const orderData = await db.runTransaction( async (transaction)=>{
                const orderRef = db.collection('hardwareOrder').doc(orderId);
                const orderDoc = await transaction.get(orderRef);
                const { status:currentStatus } = orderDoc.data();
                if(['success','cancel'].includes(currentStatus)) throw new Error(`สถานะ : ${currentStatus} แก้ไขไม่ได้`);
                transaction.update(orderRef,{ link })
                return orderDoc.data()
            });

            const { telegram = [] } = orderData;
            const warehousePayload = telegram.find(a=>a.type === 'warehouse');
            const { 
                chat_id, 
                chat_id_warehouse, 
                message_id, 
                message_id_warehouse, 
            } = orderData;

            if(warehousePayload && !orderData?.noNeedTelegram){ // ถ้าไม่มี noNeedTelegram แปลว่าแม้จะมี warehousePayload แต่ก็ไม่ต้องแจ้งเตือน เพราะกระบวนการอัปเดตลิงค์บางครั้งอาจจะมาจากการแก้ไขสถานะที่มีการตั้ง noNeedTelegram ไว้แล้ว
                const { process = [] } = warehousePayload;
                const newProcess = [
                        ...process, 
                        { name:`ลิงค์ส่งสินค้า`, createdAt: `${stringDateTimeReceipt(new Date())}\n${link}`, id:uuidv4() }
                ]
                const updatePromises = [];

                updatePromises.push(sendMessage({ chat_id, ...warehousePayload, process:newProcess }));
                updatePromises.push(sendMessage({ chat_id: chat_id_warehouse, ...warehousePayload, process:newProcess }));
                if(chat_id && message_id){ // ช่องของเซล
                    updatePromises.push(deleteMessage({ chat_id, message_id }));
                }
                if(chat_id_warehouse && message_id_warehouse){ // ช่องของคลัง
                    updatePromises.push(deleteMessage({ chat_id: chat_id_warehouse, message_id: message_id_warehouse }));
                }
                const results = await Promise.all(updatePromises);
                const newMessageId = results[0];
                const newMessageIdWarehouse = results[1];
                const orderRef = db.collection('hardwareOrder').doc(orderId);
                const newTelegram = orderData.telegram.map(a=>{
                        if(a.type === 'warehouse'){
                            return {
                                ...a,
                                process:newProcess
                            }
                        }
                        return a;
                })
                await orderRef.update({
                    telegram: newTelegram,
                    message_id:newMessageId, 
                    message_id_warehouse:newMessageIdWarehouse
                });
                setMasterData(prev=>prev.map(item=>
                    item.id === orderId
                        ?{
                            ...item,
                            link,
                            telegram: newTelegram,
                            message_id:newMessageId, 
                            message_id_warehouse:newMessageIdWarehouse
                        }
                        :item
                ))
            } else {
                setMasterData(prev=>prev.map(item=>
                    item.id === orderId
                        ?{
                            ...item,
                            link,
                        }
                        :item
                ))
            }

            toastSuccess('อัปเดตลิงค์สำเร็จ');
  
            setLink('');
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    function openImage(item){
        setCurrent(item)
        setImage_Modal(true)
        setOldImageUrls(item.imageUrls || [])
    };

    // 200%
    async function handleImage(){
        setImage_Modal(false);
        setLoading(true);

        const { id, imageUrls, comment = '' } = current;
        try {
       
                let images = imageUrls.filter(a=>!a?.startsWith('http')) || []
                if (images.length > 0) {
                    images = await Promise.all(
                        images.map(item => prepareFirebaseImage(item, '/warehouse/', 'office'))
                    );
                }
                const existingImages = imageUrls.filter(a=>a.startsWith('http')) || []
                images = [...existingImages,...images]

                const deleteImages = oldImageUrls.filter(a=>a.startsWith('http') && !images.includes(a)) || []
                for(const img of deleteImages){
                    await webImageDelete(img);
                }

                const orderRef = db.collection('hardwareOrder').doc(id);
                await orderRef.update({ imageUrls:images, comment });
                setMasterData(prev=>prev.map(a=>{
                    return a.id === id
                        ?{...a, imageUrls:images, comment }
                        :a
                }))
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    function openRoute(item){
        setCurrent(item)
        setRoute_Modal(true)
    };

    async function handleRoute(item){
        if(!isApprover(profileId))return alert('คุณไม่มีสิทธิ์แก้ไข')
        setRoute_Modal(false);
        setLoading(true);
        const { id:orderId } = current;
        const { id:deliveryType } = item;
        try {
            const orderRef = db.collection('hardwareOrder').doc(orderId);
            await orderRef.update({ deliveryType });
            setMasterData(prev=>prev.map(a=>{
                return a.id === orderId
                    ?{...a, deliveryType }
                    :a
            }))
            toastSuccess('อัปเดตรูปแบบการจัดส่งสำเร็จ');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };



  return (
    <div style={styles.container} >
        <Modal_FlatListTwoColumn
            show={route_Modal}
            onHide={()=>{setRoute_Modal(false)}}
            header='เส้นทางการจัดส่ง'
            value={deliveryOptions2}
            onClick={handleRoute}
        />
        <Modal_WarehouseImage
            show={image_Modal}
            onHide={()=>{setImage_Modal(false)}}
            current={current}
            setCurrent={setCurrent}
            submit={handleImage}
        />
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
            <th style={styles.container2}>รูปปลากรอบ</th>
            <th style={styles.container2}>comment</th>
        </tr>
        </thead>
        <tbody  >
        {display.map((item, index) => {
            const { orderNumber, status, timestamp, profileName, product, deliveryType = 'normal', 
                note = '', link, imageUrls = [], comment = '', nameSername = '', address = '', tel = '' } = item;
            return <tr onClick={()=>{console.log(item.id)}} style={{cursor: 'pointer'}} key={index}  >
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
                        {nameSername || address || tel ?
                            <>
                            <hr />
                            {nameSername}<br/>{address}<br/>{tel}
                            </>
                            :null
                        }
                        
                    </td>
                    <td onClick={()=>{openRoute(item)}}  style={styles.container4} >{deliveryOptions[deliveryType]}<i class="bi bi-pen-fill"></i></td>
                    
                    <td onClick={()=>{openStatus(item)}} style={styles.container4} >{statusMap[status]}<i class="bi bi-pen-fill"></i></td>
                    <td onClick={()=>{openLink(item)}}  style={styles.container4}>{link}</td>
                    <td onClick={()=>{openImage(item)}}  style={styles.container4}>
                        {imageUrls.map((a,i)=><img key={i} src={a} alt="img" width={50} style={{ marginRight:5 }} />)}
                    </td>
                    <td onClick={()=>{openImage(item)}} style={styles.container4} >{comment}</td>
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