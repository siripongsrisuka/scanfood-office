import React, { useState } from "react";
import { db } from "../db/firestore";
import { plusDays } from "../Utility/dateTime";
import { OneButton, SearchControl } from "../components";
import { Modal_FlatListTwoColumn, Modal_Loading, Modal_Success } from "../modal";
import { Button } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';


function LaosScreen() {
  const navigate = useNavigate();

    const [tel, setTel] = useState('');
    const [stores,setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [store_Modal, setStore_Modal] = useState(false)

    const updatePackage = async (id) =>{
        const promise = await new Promise(async (resolve,reject)=>{
          const shopRef = db.collection("shop").doc(id);
          db.runTransaction(async transaction => { 
            return transaction.get(shopRef).then(async stockDoc =>{
              const { vip } = stockDoc.data();
              let newVip = vip.map(a=>({...a,expire:plusDays(a.expire.toDate(),366)}))
              transaction.update(shopRef,{vip:newVip});
              return newVip
            })
          })
          .then(res => {resolve(res) })
          .catch(err => reject(err))  
        });
      
        return promise
    };

    const updatePort = async ({ imageUrl, shopId, shopName }) =>{
        const promise = await new Promise(async (resolve,reject)=>{
          const profileRef = db.collection("profile").doc('0klW3zrwYeNyLxClQoxipkm0MKv1');
          db.runTransaction(async transaction => { 
            return transaction.get(profileRef).then(async stockDoc =>{
              const { port } = stockDoc.data();
              let newPort = {
                branch:1,
                imageUrl,
                lastLogin:new Date(),
                notification:true,
                position:['001'],
                printer:[],
                shopId,
                shopName,
                timestamp:new Date()
              }
              transaction.update(profileRef,{port:[...port,newPort]});
              return newPort
            })
          })
          .then(res => {resolve(res) })
          .catch(err => reject(err))  
        });
      
        return promise
    };

    function handleStore({ id, name, imageUrl }){
        setStore_Modal(false)
        setLoading(true)

        Promise.all([
            updatePort({ imageUrl, shopId:id, shopName:name}),
            updatePackage(id)
        ]).then(()=>{
            setLoading(false)
            setSuccess_Modal(true)
            setTimeout(()=>{
                setSuccess_Modal(false)
            },900)
        }).catch(()=>{
            setLoading(false)
        }).finally(()=>{
            setTel('')
            setStores([])
        })
  
    };

    async function searchStore(){
        setLoading(true)
        const arr = []
        try {
            await db.collection('shop')
                .where('tel','==',tel).get().then((qsnapshot)=>{
                qsnapshot.forEach((doc)=>{
                    arr.push({...doc.data(),id:doc.id})
                })
            })
        } catch (error) {
            
        } finally {
            setLoading(false)
        }
        if(arr.length>0){
            setStores(arr)
            setStore_Modal(true)
        } else {
            alert('ไม่พบร้าน')
        }
        
    };

  return (
    <div id="google_translate_element" >
        <Modal_Loading show={loading} />
        <Modal_Success show={success_Modal} />
        <Modal_FlatListTwoColumn
            show={store_Modal}
            onHide={()=>{setStore_Modal(false)}}
            header='เลือกร้านอาหาร'
            onClick={handleStore}
            value={stores}
        />
        <div style={{display:'flex',margin:10}} >
            <div  >
                <Button onClick={()=>{navigate(-1)}} variant="info" style={{color:"white"}}  ><i class="bi bi-arrow-left"></i></Button>
            </div>&emsp;
            <SearchControl {...{ placeholder:"เบอร์โทร", search:tel, setSearch:setTel }} />
            &emsp;
            <OneButton {...{ text:'ค้นหา', submit:searchStore }} />
        </div>
      <div>

    </div>
    </div>
  );
}

export default LaosScreen;