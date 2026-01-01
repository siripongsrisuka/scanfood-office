import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink, Font, Image  } from '@react-pdf/renderer';
import { card, colors, } from "../configs";
import Sarabun from '../assets/fonts/Sarabun/Sarabun-Regular.ttf';
import Bold from "../assets/fonts/Sarabun/Sarabun-Bold.ttf";
import Prompt from "../assets/fonts/Sarabun/Prompt-Bold.ttf";
import { db } from "../db/firestore";

const { white} = colors;

var QRCode = require('qrcode')
const chunkSize = 2;


function CreatePDF() {


  const [shop, setShop] = useState({ name:'', id:''});
  const { name, id, yourCode } = shop;


  const [allShop, setAllShop] = useState([])
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tables, setTables] = useState([]);
  const [imageId, setImageId] = useState('')
  Font.register({
    family: "Sarabun",
    src: Sarabun,
  });
  Font.register(

    {
      family: "Bold",
      src: Bold,
    }
    );

    Font.register(

        {
          family: "Prompt",
          src: Prompt,
        }
        );

  // Create styles
const styles = StyleSheet.create({
    page: {
        fontFamily: "Sarabun",
        fontSize: 12,
        flexDirection: 'column',
        padding: 30,
        width:'1000px',
        height:'1500px'
      },
      section: {
        margin: 7,
        // padding: 10,
        // flex: 1,
        alignItems: 'center',
        // Gradient background
        // backgroundColor: '#da1b60',
        backgroundColor: 'red',
        height:'400px',
        width:'285px'
      },
  });

  function chunkArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
    }


  function createStaticTable(smartTable){
    if(smartTable.length===0){
      alert('ยังไม่มีโต๊ะ')
    } else {
      let res = []
      for(const item of smartTable){
          QRCode.toDataURL(`https://scanfood.web.app/static/${item.id}`, function (err, url) {
              console.log(url)
              res.push({...item,qrcode:url})
          })
      }
      setTables(chunkArray(res, chunkSize))
    }
    
  };

  // Create Document Component
const MyDocument = () => (
    <Document style={{ fontFamily: "Prompt", fontSize:13  }} >
      <Page size="A4" >
        {tables.map((item,index)=>{
            return <View key={index} style={{flexDirection:'row'}} >
                        {item.map(({ name, id, qrcode })=>{
                            return <View key={id} style={styles.section}>
                                        <Image style={{width:'100%',height:'100%',zIndex:1}} src={card} />
                                        <View style={{position:'absolute',bottom:60,alignItems:'center'}} >
                                            {imageId
                                                ?<Image style={{width:100,height:100}} src={imageId} />
                                                :null
                                            }
                                            
                                            <Text style={{fontSize:25,color:white}} >Scan to Order</Text>
                                            <View style={{backgroundColor:white,alignItems:'center',padding:10,marginTop:10}} >
                                                <Text style={{fontSize:19,textAlign:'center'}} >{name}</Text>
                                                <Text>กรุณาสแกน QR Code </Text>
                                                <Text>เพื่อเริ่มสั่งอาหาร</Text>
                                                <Image style={{width:100,height:100}} src={qrcode} />
                                            </View>
                                            <Text style={{fontSize:18,paddingVertical:10,color:white,textAlign:'center'}} >{shop.name}   </Text>
                                            <View style={{padding:5,backgroundColor:white,borderRadius:20,fontSize:10}} >
                                                <Text>ร้านอาหารใส่รหัส {yourCode} ใช้งานฟรี 1 เดือน</Text>
                                            </View>
                                        </View>
                                    </View>
                        })}
                    </View>
        })}
      </Page>
    </Document>
  );

  function findShop(){
    db.collection('shop').where('tel','==',phoneNumber).get().then((qsnapshot)=>{
      let data = []
        if(qsnapshot.docs.length>0){
          qsnapshot.forEach((doc)=>{
            data.push({...doc.data(),id:doc.id})
          })
          setAllShop(data)
        } else {
          alert('ไม่เจอข้อมูล')
        }
    })
  };

  return (
    <div style={{  height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{display:'flex',margin:'1rem'}} >
            <Form.Control 
                type="text" 
                placeholder={`ใส่เบอร์โทรร้านค้า`} 
                onChange={(event)=>{setPhoneNumber(event.target.value)}}
                value={phoneNumber}
                name={'item.name'}
            />
            {allShop.length>0 || id
                ?<Button onClick={()=>{setShop({ id:'', name:''});setPhoneNumber('');setAllShop([]);setTables([])}} variant="danger" style={{marginLeft:'1rem',marginRight:'1rem',minWidth:'100px'}}  >ล้าง</Button>
                :<Button onClick={findShop} variant="warning" style={{marginLeft:'1rem',marginRight:'1rem',minWidth:'100px'}} >ค้นหา</Button>
            }
        </div>
      {allShop.map((item,index)=>{
        return <div onClick={()=>{setShop(item);setAllShop([]);setPhoneNumber('');createStaticTable(item.smartTable)}} key={index} style={{padding:10,margin:5,backgroundColor:'white',borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)',cursor:'pointer'}} >
            <h5>{item.name}</h5>
        </div>
      })}
      {name
        ?<h5 style={{textAlign:'center'}} >{name}</h5>
        :null
      }
    {tables.length>0
        ?<>
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <PDFDownloadLink document={<MyDocument />} fileName="mypdf.pdf">
              {({ blob, url, loading, error }) =>
                loading ? 'Loading document...' : <Button variant="success" >Download PDF</Button>

              }
            </PDFDownloadLink>
          </div>
          <div style={{ flexGrow: 1,width: '100vw', marginTop:'1rem' }}>
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <MyDocument />
            </PDFViewer>
          </div>
        </>
        :null
    };
  </div>
  );
};


export default CreatePDF;
