import React, { useState } from "react";
import {
  Table,
} from "react-bootstrap";
import { db } from "../db/firestore";
import { Modal_Loading } from "../modal";
import { OneButton, SearchControl } from "../components";
import { toastSuccess } from "../Utility/function";

function TransformTable() {
    const [shops, setShops] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);


    async function fetchShops(){
        setLoading(true);
        try {
            const shopDocs = await db.collection('shop').where('tel','==',search).get();
            const shops = shopDocs.docs.map(doc=>{
                return {
                    ...doc.data(),
                    id:doc.id
                }
            })
            setShops(shops)
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false)
        }

    };

    async function transformNow(shopId){
        const ok = window.confirm('ยืนยันการปรับโต๊ะ')
        if(!ok) return;
        setLoading(true)
        try {
            const response = await db.runTransaction( async (transaction)=>{
                const shopRef = db.collection('shop').doc(shopId);
                const shopDoc = await transaction.get(shopRef);
                const { village, storeSize } = shopDoc.data();
                if(!village) throw new Error("เป็นแบบมีโต๊ะอยู่แล้ว");
                transaction.update(shopRef,{
                    village:false,
                    storeSize:20
                });
            });

            toastSuccess('เปลี่ยนเป็น 20 โต๊ะเรียบร้อย');
  
            setShops([]);
            setSearch('')
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    }



  return (
    <div  >
        <Modal_Loading show={loading} />
        <h1>เปลี่ยนไม่มีโต๊ะ ให้เป็น 1- 20 โต๊ะ</h1>
        <div style={{ display:'flex', margin:10}} >
            <SearchControl {...{ placeholder:'เบอร์โทร', search, setSearch }} />&emsp;
            <OneButton {...{ text:'ค้นหา', submit:fetchShops }} />
        </div>
        {shops.length>0 &&
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.text}>No.</th>
                <th style={styles.text}>ชื่อร้าน</th>
                <th style={styles.text}>จำนวนโต๊ะ</th>
                <th style={styles.text}>ประเภท</th>
                <th style={styles.text}>จัดการ</th>
            </tr>
            </thead>
            <tbody  >
            {shops.map((item, index) => {
                const { name, storeSize, village, id } = item;
                return  <tr  style={styles.container} key={index} >
                        <td style={styles.text2}>{index+1}.</td>
                        <td style={styles.text2} >{name}</td>
                        <td style={styles.text2} >{storeSize}</td>
                        <td style={styles.text2} >{village?'ไม่มีโต๊ะ':'มีโต๊ะ'}</td>
                        <td style={styles.text2}>
                            <OneButton {...{ text:'อนุมัติ', submit:()=>{transformNow(id)} }} />
                        </td>
                        </tr>
            }
            )}
            </tbody>
        </Table>
        }
        
    </div>
  );
};

const styles = {

}

export default TransformTable;