import React, { useState, useEffect } from "react";
import {
  Row,
  Table,
  Button
} from "react-bootstrap";
import { db } from "../db/firestore";
import { summary } from "../Utility/function";
import { setTimeEnd, setTimeStart, stringDateTime3, stringYMDHMS3 } from "../Utility/dateTime";
import { Modal_FlatListTwoColumn, Modal_Loading } from "../modal";
import { Download, TimeContainer } from "../components";
import { normalSort } from "../Utility/sort";
import * as XLSX from 'xlsx';

const owners = [
    { id:1, name:'ต้น' },
    { id:2, name:'หลุย' },
    { id:3, name:'คนสวย' },
    { id:4, name:'ทดสอบ' },
];

const categorys = [
    { id:0, name:'ทั้งหมด' },
    { id:99, name:'ของหลวง' },
    { id:1, name:'ต้น' },
    { id:2, name:'หลุย' },
    { id:3, name:'คนสวย' },
    { id:4, name:'ทดสอบ' },
];

const IsName = {
    0:'ทั้งหมด',
    99:'ของหลวง',
    1:'ต้น',
    2:'หลุย',
    3:'คนสวย',
    4:'ทดสอบ'
}

function HardwareHistory() {

    const [masterData, setMasterData] = useState([])
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [filter, setFilter] = useState(0); // 0 = all , 99 = no one
  

  
    useEffect(()=>{
        let arr = []
        switch (filter) {
            case 0:
                arr = masterData
                break;
            case 99:
                arr = masterData.filter(a=>!a.ownerId)
                break;
        
            default:
                arr = masterData.filter(a=>a.ownerId === filter)
                break;
        }
        setCurrentDisplay(arr)
      
    },[masterData,filter]);


    const fetchData = async () => {
        try {
            setLoading(true)

            let query = db
            .collection("hardwareOrder")
            .where("timestamp", ">=", setTimeStart(startDate))
            .where("timestamp", "<", setTimeEnd(endDate))

     
            const snapshot = await query.get();
            if (!snapshot.empty) {
                const newData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp.toDate(),
                })).filter(b=>b.status!='cancel')

                setMasterData(normalSort('timestamp',newData));
            } 

            setLoading(false);

        } catch (error) {
            console.log(error)
            setLoading(false);

        }

    };


    const [current, setCurrent] = useState({ id:'' });
    const { id } = current;
    const [owner_Modal, setOwner_Modal] = useState(false);

    function handleOwner({ id:ownerId }){
        const ownerName = owners.find(a=>a.id===ownerId)?.name
        setOwner_Modal(false)
        setLoading(true)
        try {
            db.collection('hardwareOrder').doc(id).update({ ownerId, ownerName })
            setMasterData(prev=>prev.map(a=>{
                return a.id===id
                    ?{...a,ownerId, ownerName}
                    :a
            }))
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    function openOwner(item){
        setCurrent(item);
        setOwner_Modal(true)
    };

    const exportToXlsx = () => {
        const data = masterData.map((a) => {
          const { 
            orderNumber, timestamp, net, shopName, adminName, product, ownerId, ownerName, totalPrice, deliveryFee, address
          } = a;
      
          
          return {
            orderNumber,
            วันที่:  stringDateTime3(timestamp),
            ร้าน: shopName,
            รายการ: product.map(a=>(`${a.name} x ${a.qty}`)).join('/'),
            ค่าสินค้า: totalPrice,
            ค่าส่ง: deliveryFee,
            สุทธิ: net,
            ที่อยู่: address,
            แอดมิน: adminName,
            ของรักของข้า: ownerId ? ownerName : 'ของหลวง',
          };
        });
      
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `ผลงาน Hardware ของ ${IsName[filter]}`);
      
        const fileName = `ผลงาน Hardware ของ ${IsName[filter]} ${stringYMDHMS3(startDate)}-${stringYMDHMS3(endDate)}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      };

  return (
    <div style={{padding:10}} >
        
        <Modal_Loading show={loading} />
        <Modal_FlatListTwoColumn
            show={owner_Modal}
            onHide={()=>{setOwner_Modal(false)}}
            header='เลือกผู้ครบครอง'
            onClick={handleOwner}
            value={owners}
        />
        <div style={{position:'sticky', top:0, backgroundColor:'white' }} >
            <h1>ประวัติ Hardware</h1>
            <TimeContainer
                search={fetchData}
                startDate={startDate}
                endDate={endDate}
                onChangeStart={setStartDate}
                onChangeEnd={setEndDate}
            />
            <div style={{display:'flex', overflowX:'auto', marginLeft:10}} >
                {categorys.map((a,i)=>{
                    const status = filter === a.id
                    return <Button variant={status?'dark':'light'} onClick={()=>{setFilter(a.id)}} key={i} style={{ minWidth:'80px', marginRight:10, }} >{a.name}</Button>
                })}
            </div>
            <br/>
            <div style={{ display:'flex', justifyContent:'space-between', width:'100%', marginBottom:10 }} >
                <h5>ทั้งหมด {currentDisplay.length} รายการ , ผลงาน {summary(currentDisplay,'net').toLocaleString()} บาท</h5>
                <Download exportToXlsx={exportToXlsx} />
            </div>
           

        </div>
        
              <Row>
                <Table striped bordered hover responsive  variant="light"   >
                    <thead  >
                    <tr>
                      <th style={styles.text}>No.</th>
                      <th style={{...styles.text, minWidth:'150px'}}>orderNumber</th>
                      <th style={styles.text}>วันที่</th>
                      <th style={styles.text}>ร้าน</th>
                      <th style={{...styles.text, minWidth:'200px'}}>รายการ</th>
                      <th style={styles.text}>ค่าสินค้า</th>
                      <th style={styles.text}>ค่าส่ง</th>
                      <th style={styles.text}>สุทธิ</th>
                      <th style={{...styles.text, minWidth:'200px'}} >ที่อยู่</th>
                      <th style={styles.text}>แอดมิน</th>
                      <th style={styles.text}>ของรักของข้า</th>
                    </tr>
                  </thead>
                  <tbody  >
                    {currentDisplay.map((item, index) => {
                      const { orderNumber, timestamp, net, shopName, adminName, product, ownerId, ownerName, totalPrice, deliveryFee, address } = item;
                      return  <tr  style={styles.container} key={index} >
                                <td style={styles.text}>{index+1}.</td>
                                <td style={styles.text}>{orderNumber}</td>
                                <td style={styles.text}>{stringDateTime3(timestamp)}</td>
                                <td style={styles.text}>{shopName}</td>
                                <td style={styles.text}>
                                    {product.map((a,i)=>{
                                        return <p key={i} >{a.name} x {a.qty}</p>
                                    })}
                                </td>
                                <td style={styles.text}>{totalPrice.toLocaleString()}</td>
                                <td style={styles.text}>{deliveryFee.toLocaleString()}</td>
                                <td style={styles.text}>{net.toLocaleString()}</td>
                                <td style={styles.text}>{address}</td>
                                <td style={styles.text}>{adminName}</td>
                                {ownerId
                                    ?<td onClick={()=>{openOwner(item)}} style={styles.text}>{ownerName}</td>
                                    :<td onClick={()=>{openOwner(item)}} style={styles.text}>ของหลวง</td>
                                }
                              </tr>
                    }
                    )}
                  </tbody>
                </Table>
              </Row>
      
    </div>
  );
};

const styles = {
    container : {
      cursor: 'pointer'
    },
      text: {
        width: '10%', textAlign:'center', minWidth:'100px', maxWidth:'100px'
      },
      text2 : {
        textAlign:'center'
      }
      
  }
  

export default HardwareHistory;