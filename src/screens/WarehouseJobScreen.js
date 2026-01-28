import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
} from "react-bootstrap";
import { db, prepareFirebaseImage, webImageDelete } from "../db/firestore";
import { CategoryRender, SearchControl } from "../components";
import {  Modal_FlatListTwoColumn, Modal_Loading, Modal_OneInput, Modal_WarehouseImage } from "../modal";
import { formatTime, searchMultiFunction, toastSuccess } from "../Utility/function";
import { normalSort } from "../Utility/sort";
import { stringDateTimeReceipt, stringYMDHMS3 } from "../Utility/dateTime";
import { colors, initialWarehouse } from "../configs";
import { scanfoodAPI } from "../Utility/api";

const { white } = colors;

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
        const { id:orderId, link } = current;
        const { status:thisStatus } = item;
        try {
            const telegram = await db.runTransaction( async (transaction)=>{
                const orderRef = db.collection('hardwareOrder').doc(orderId);
                const orderDoc = await transaction.get(orderRef);
                const { status:currentStatus } = orderDoc.data();
                if(['success','cancel'].includes(currentStatus)) throw new Error(`สถานะ : ${currentStatus} แก้ไขไม่ได้`);
                // if(status ==='sent'){
                //     transaction.update(orderRef,{ status, billDate:stringYMDHMS3(new Date()) });
                // } else {
                //     transaction.update(orderRef,{ status });
                // }
                transaction.update(orderRef,{ status:thisStatus });
                return orderDoc.data()
            });
            const { chat_id, chat_id_warehouse, message_id, message_id_warehouse, reply_message_id, reply_message_id_warehouse } = telegram;
            let newReplyId = '';
            let newReplyIdWarehouse = '';
            if(chat_id && message_id){
          
                if(thisStatus === 'sent'){
                    await db.collection("telegramDeleteQueue").add({
                      chat_id,
                      message_id,
                      deleteAt: Date.now() + 2 * 1000 // 2 วินาที
                      // deleteAt: Date.now() + 12 * 60 * 60 * 1000
                    });
                } 
                const { status, data } = await scanfoodAPI.post(
                    "/telegram/office/reply/",
                    {
                        "channelType":"warehouse",
                        "chat_id":chat_id,
                        "message_id": message_id,
                        "status":thisStatus,
                        "link":link
                    }
                );
                const { message_id:xxx } = data;
                newReplyId = xxx;
                if(thisStatus === 'sent'){
                    await db.collection("telegramDeleteQueue").add({
                      chat_id,
                      message_id:xxx,
                      deleteAt: Date.now() + 2 * 1000 // 2 วินาที
                      // deleteAt: Date.now() + 12 * 60 * 60 * 1000
                    });
                }
            
            }
            if(chat_id_warehouse && message_id_warehouse){
                if(thisStatus === 'sent'){
                    const { status, data } = await scanfoodAPI.post(
                    "/telegram/office/delete/",
                    {
                        "channelType":"warehouse",
                        "chat_id":chat_id_warehouse,
                        "message_id": message_id_warehouse,
                    }
                    );
                } else {
                    const { status, data } = await scanfoodAPI.post(
                        "/telegram/office/reply/",
                        {
                            "channelType":"warehouse",
                            "chat_id":chat_id_warehouse,
                            "message_id": message_id_warehouse,
                            "status":thisStatus,
                            "link":link
                        }
                    );
                    const { message_id:xxx } = data;
                    newReplyIdWarehouse = xxx;
                }
             
            }
            const orderRef = db.collection('hardwareOrder').doc(orderId);
            await orderRef.update({
                reply_message_id: newReplyId,
                reply_message_id_warehouse: newReplyIdWarehouse
            });
            if(reply_message_id){
                const { status, data } = await scanfoodAPI.post(
                    "/telegram/office/delete/",
                    {
                        "channelType":"warehouse",
                        "chat_id":chat_id,
                        "message_id": reply_message_id,
                    }
                );
            }
            if(reply_message_id_warehouse){
                const { status, data } = await scanfoodAPI.post(
                    "/telegram/office/delete/",
                    {
                        "channelType":"warehouse",
                        "chat_id":chat_id_warehouse,
                        "message_id": reply_message_id_warehouse,
                    }
                );
            }
            toastSuccess('อัปเดตสถานะสำเร็จ');
            setMasterData(prev=>prev.map(item=>
                item.id === orderId
                    ?{
                        ...item,status:thisStatus,
                        reply_message_id: newReplyId,
                        reply_message_id_warehouse: newReplyIdWarehouse
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
        const { id:orderId, status:thisStatus } = current;
        try {
            const telegram = await db.runTransaction( async (transaction)=>{
                const orderRef = db.collection('hardwareOrder').doc(orderId);
                const orderDoc = await transaction.get(orderRef);
                const { status:currentStatus } = orderDoc.data();
                if(['success','cancel'].includes(currentStatus)) throw new Error(`สถานะ : ${currentStatus} แก้ไขไม่ได้`);
                transaction.update(orderRef,{ link })
                return orderDoc.data()
            });

            const { chat_id, chat_id_warehouse, message_id, message_id_warehouse, reply_message_id, reply_message_id_warehouse } = telegram;
            let newReplyId = '';
            let newReplyIdWarehouse = '';
            if(chat_id && message_id){
                const { status, data } = await scanfoodAPI.post(
                    "/telegram/office/reply/",
                    {
                        "channelType":"warehouse",
                        "chat_id":chat_id,
                        "message_id": message_id,
                        "status":thisStatus,
                        "link":link
                    }
                );
                const { message_id:xxx } = data;
                newReplyId = xxx;
            }
            if(chat_id_warehouse && message_id_warehouse){
                const { status, data } = await scanfoodAPI.post(
                    "/telegram/office/reply/",
                    {
                        "channelType":"warehouse",
                        "chat_id":chat_id_warehouse,
                        "message_id": message_id_warehouse,
                        "status":thisStatus,
                        "link":link
                    }
                );
                const { message_id:xxx } = data;
                newReplyIdWarehouse = xxx;
            }
            const orderRef = db.collection('hardwareOrder').doc(orderId);
            await orderRef.update({
                reply_message_id: newReplyId,
                reply_message_id_warehouse: newReplyIdWarehouse
            });
            if(reply_message_id){
                const { status, data } = await scanfoodAPI.post(
                    "/telegram/office/delete/",
                    {
                        "channelType":"warehouse",
                        "chat_id":chat_id,
                        "message_id": reply_message_id,
                    }
                );
            }
            if(reply_message_id_warehouse){
                const { status, data } = await scanfoodAPI.post(
                    "/telegram/office/delete/",
                    {
                        "channelType":"warehouse",
                        "chat_id":chat_id_warehouse,
                        "message_id": reply_message_id_warehouse,
                    }
                );
            }
            toastSuccess('อัปเดตลิงค์สำเร็จ');
            setMasterData(prev=>prev.map(item=>
                item.id === orderId
                    ?{
                        ...item,link,
                        reply_message_id: newReplyId,
                        reply_message_id_warehouse: newReplyIdWarehouse
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
    

  return (
    <div style={styles.container} >
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
            const { orderNumber, status, timestamp, profileName, product, deliveryType = 'normal', note = '', link, imageUrls = [], comment = '' } = item;
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