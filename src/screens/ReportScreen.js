import React, { useState, useMemo, useEffect } from "react";
import { admin, colors } from "../configs";
import { useSelector, useDispatch } from "react-redux";
import { Commission, Customer, Media, NavBar, NewShop, ShareLink, ManageImport, ImageEditor, SoftwareCheck, CreatePDF, HardwareCheck,
  MorrisTest,
 } from "../components";
import '../styles/CartScreen.css'
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../db/firestore";
import { Button } from "react-bootstrap";
import { Modal_FlatListTwoColumn, Modal_Loading, Modal_OneInput } from "../modal";
import { clearOrder, fetchOrder } from "../redux/orderSlice";
import { clearShop } from "../redux/shopSlice";

import { runOneSignal, onesignalWebGetDeviceState, onesignalWebSetPushSubsciption } from '../api/onesignal'



const { dark, softWhite, white } = colors;


function ReportScreen() {
  const dispatch = useDispatch()
  const { profile: { name, id:profileId } } = useSelector(state => state.profile)
  const [selectedReport, setSelectedReport] = useState({id:1});
  const [sale_modal, setSale_Modal] = useState(false);
  const [sale, setSale] = useState([]);
  const [loading, setLoading] = useState(false);
  const [password_Modal, setPassword_Modal] = useState(false);
  const [password, setPassword] = useState('')

  const { reports, IsAdmin } = useMemo(()=>{
      let IsAdmin = admin.includes(profileId)
      return {
        reports :IsAdmin?[
          { id:1, name:'ค่าคอม'},
          { id:2, name:'ลูกค้าของฉัน'},
          { id:3, name:'ประวัติการถอนเงิน'},
          { id:4, name:'แชร์ลิงค์ให้ลูกค้า'},
          { id:5, name:'สื่อประกอบการขาย'},
          { id:6, name:'ร้านใหม่'},
          { id:7, name:'จัดการถอนเงิน'},
          { id:8, name:'นำเข้าเมนูอาหาร'},
          { id:9, name:'แก้ไขรูป'},
          { id:10, name:'ตรวจซอฟแวร์'},
          { id:11, name:'ตรวจฮาร์ดแวร์'},
          { id:12, name:'รูป QR CODE'},
          { id:13, name:'Morris Test'},
        ]
        :[
          { id:1, name:'ค่าคอม'}, 
          { id:2, name:'ลูกค้าของฉัน'},
          { id:3, name:'ประวัติการถอนเงิน'},
          { id:4, name:'แชร์ลิงค์ให้ลูกค้า'},
          { id:5, name:'สื่อประกอบการขาย'},
          { id:8, name:'นำเข้าเมนูอาหาร'},
          { id:9, name:'แก้ไขรูป'},
          { id:12, name:'รูป QR CODE'},
        ],
        IsAdmin
      }
        
  },[profileId]);

  async function fetchSale(){
    dispatch(clearOrder())
    dispatch(clearShop())
    setLoading(true)
    let res =[]
    db.collection('profile').where('yourCode','!=','')
      .get().then((docs)=>{
        docs.forEach((doc)=>{
          res.push({...doc.data(),id:doc.id})
        })
        setSale(res)
        setSale_Modal(true)
        setLoading(false)
      }).catch(()=>{
        setLoading(false)
      })
    
  };

  function manageSale(value){

    setSale_Modal(false)
  };

  function checkPassword(){
    if(password==='69'){
      fetchSale()
    } else {
      alert('รหัสผิด')
      
    }
    setPassword('')
    setPassword_Modal(false)
  }



  useEffect(()=>{


    // if( ['eQLm1OgPWGMVMzwbwKSbjGYJJ5f1'].includes(profileId)){


    //   // alert('bef_runOneSignal')
    //   console.log('bef_runOneSignal')
    //   runOneSignal();
    // }


  },[profileId])



  // useEffect(()=>{
  //   console.log('runOneSignal')
  //   runOneSignal();

  // },[])

  // console.log('runOneSignal')
  // runOneSignal();


  return (
    <div  >
      <Modal_OneInput
          show={password_Modal}
          onHide={()=>{setPassword_Modal(false);setPassword('')}}
          placeholder=''
          header='รหัสผ่าน'
          value={password}
          onChange={(v)=>{setPassword(v)}}
          onClick={checkPassword}
      />
      <Modal_Loading show={loading} />
      <NavBar {...{ name, admin:IsAdmin, setPassword_Modal }} />
      <Modal_FlatListTwoColumn
            show={sale_modal}
            onHide={()=>{setSale_Modal(false)}}
            header='เลือกเซล'
            onClick={manageSale}
            value={sale}
      />

      {['eQLm1OgPWGMVMzwbwKSbjGYJJ5f1'].includes(profileId) ? 
        <Button onClick={()=>{ onesignalWebSetPushSubsciption(true) }} >Subscribe Noti</Button> :
        null
      }

      <div style={{ overflowX: 'auto', display:'flex', paddingLeft:10, margin:10 }} className="custom-scrollbar" >
          {reports.map((item)=>{
            let status = item.id===selectedReport.id
              return(
                  <div onClick={()=>{setSelectedReport(item)}} key={item.id} style={{borderRadius:10,backgroundColor:status?dark:softWhite,color:status?white:dark,marginRight:5,display:'flex',justifyContent:'center',alignItems:'center',padding:8,cursor:'pointer',minWidth:'300px'}} >
                      <h5  >{item.name}</h5>
                  </div>
              )
          })}
      </div>
      {/* {admin
        ?<Button onClick={fetchSale} >เลือกเซล</Button>
        :null
      } */}
        
      {selectedReport.id===1
          ?<Commission/>
          :selectedReport.id===2
              ?<Customer/>
              :selectedReport.id===3
                  ?null
                  :selectedReport.id===4
                      ?<ShareLink/>
                          :selectedReport.id===5
                            ?<Media/>
                            :selectedReport.id===6
                              ?<NewShop/> 
                              :selectedReport.id===7
                                ?null
                                :selectedReport.id===8
                                  ?<ManageImport/>
                                      :selectedReport.id===9
                                        ?<ImageEditor/>
                                        :selectedReport.id===10
                                          ?<SoftwareCheck/>
                                          :selectedReport.id===11
                                              ?<HardwareCheck/>
                                              :<CreatePDF  />
      }



      {/* <ManageImport/> */}
      {/* <MorrisTest/> */}


    </div>
  );
}

export default ReportScreen;
