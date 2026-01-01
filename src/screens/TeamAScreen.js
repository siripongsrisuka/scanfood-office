import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";

import { colors, initialAlert } from "../configs";
import TablePagination from '@mui/material/TablePagination';
import { formatTime, goToTop, handleDigit, searchMultiFunction } from "../Utility/function";
import { Button } from "rsuite";
import { db } from "../db/firestore";
import { minusDays, stringDateTimeReceipt, stringYMDHMS3 } from "../Utility/dateTime";
import { SearchControl } from "../components";
import { Modal_Alert, Modal_Loading, Modal_Product } from "../modal";

const { dark, white, softWhite } = colors;

// ประเภทร้าน

// ประเภทแพ็กเกจ

const options = [
    { id:'1', name:'50 ร้านล่าสุด', color:'red', },
    { id:'2', name:'จับตาดู', color:'orange', },
    { id:'3', name:'ลูกค้า', color:'yellow', },
    { id:'4', name:'Top Spending', color:'green', },
    { id:'5', name:'Waste', color:'cyan', },
];

// process == monitoring, followUp, waste

function TeamAScreen() {
    const [loading, setLoading] = useState(false);
    const [shops, setShops] = useState([]);
    const [option, setOption] = useState('1');
    const [search, setSearch] = useState('');
    const [currentShop, setCurrentShop] = useState([]);
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;
    const [billDates, setBillDates] = useState([]);
    const [shopMonitors, setShopMonitors] = useState([]); // ร้านที่กำลังติดตามให้จ่ายเงินอยู่
    const [shopFollowUps, setShopFollowUps] = useState([]); // ร้านที่ใช้งานอยู่จริงๆ
    const [shopWaste, setShopWaste] = useState([]); // ร้านที่ใช้งานอยู่จริงๆ
    const [product, setProduct] = useState({ status:false, value:[]})

    function handleOption(id){
        switch (id) {
            case '2':
                if(shopMonitors.length===0){
                    fetchMonitor();
                }
                break;
            case '3':
                if(shopFollowUps.length===0){
                    fetchFollowUp();
                }
                break;
            case '4':
            if(shopFollowUps.length===0){
                fetchFollowUp();
            }
            break;
        
            default:
                break;
        }
        setOption(id)
    }

    useEffect(()=>{
        // fetchShop();
        let arr = [];
        const today = new Date();
        for(let i =0;i<10;i++){
            arr.push(stringYMDHMS3(minusDays(today,i)))
        };
        setBillDates(arr)
    },[]);

    async function fetchShop(){
        setLoading(true);
        const query = await db.collection('shop').where('shopChannel','==','scanfood')
            .orderBy('createdDate', 'desc')
            .limit(50) 
            .get()
        
        const shops = query.docs.map(doc=>{
            const { createdDate, vip, ...rest } = doc.data();
            return {
                packageArray:[],
                info:{ name:'', tel:'', note:''},
                id: doc.id,
                ...rest,
                createdDate:formatTime(createdDate),
                vip:vip.map(a=>({...a, expire:formatTime(a.expire)}))
            }
        })
        setShops(shops);
        setLoading(false);
    };

    async function fetchMonitor(){
        setLoading(true);
        const query = await db.collection('shop').where('monitoring','==',true)
            .get()
        
        const shops = query.docs.map(doc=>{
            const { createdDate, vip, ...rest } = doc.data();
            return {
                packageArray:[],
                info:{ name:'', tel:'', note:''},
                id: doc.id,
                ...rest,
                createdDate:formatTime(createdDate),
                vip:vip.map(a=>({...a, expire:formatTime(a.expire)}))
            }
        })
        setShopMonitors(shops);
        setLoading(false);
    };

    async function fetchFollowUp(){
        setLoading(true);
        const query = await db.collection('shop').where('followUp','==',true)
            .get()
        
        const shops = query.docs.map(doc=>{
            const { createdDate, vip, ...rest } = doc.data();
            return {
                packageArray:[],
                info:{ name:'', tel:'', note:''},
                id: doc.id,
                ...rest,
                createdDate:formatTime(createdDate),
                vip:vip.map(a=>({...a, expire:formatTime(a.expire)}))
            }
        })
        setShopFollowUps(shops);
        setLoading(false);
    };

    useEffect(()=>{
        let arr = shops;
        if(search){
            arr = searchMultiFunction(shops,search,['name','tel'])
        };
        setCurrentShop(arr);
    },[shops, search]);

    function addMonitor(item){
        setLoading(true)
        db.collection('shop').doc(item.id).update({ monitoring:true });
        setShops(prev=>prev.map(a=>{
            return a.id === item.id
                ?{...a, monitoring:true }
                :a
        }))
        setLoading(false);
    };

    const handleOpenInNewTab = (shopId) => {
        const url = `https://scanfood.online/pickup/${shopId}`;
        window.open(url, '_blank');
      };

      function fetchProduct(shopId){
        setLoading(true)
        db.collection('product').where('shopId','==',shopId).get()
            .then((docs)=>{
                let data = []
                docs.forEach((doc)=>{
                    data.push({id:doc.id,...doc.data()})
                })
                setProduct({status:true,value:data})
            })
        setLoading(false)
      };

  return (
    <div style={{ padding:10 }} >
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
         <Modal_Product
            show={product.status}
            onHide={()=>{setProduct({status:false,value:[]})}}
            value={product.value}
        />
        <Modal_Loading show={loading} />
        <h1>Team A</h1>
        <Row  >
            {options.map((a,i)=>{
                const { name, color, id } = a;
                const appearance = id === option?'primary':'ghost'
                return <Col md='4' lg='2' key={i} >
                            <Button onClick={()=>{setOption(id)}} color={color} appearance={appearance} style={{ minWidth:'150px', width:'100%', margin:5 }} >{name}</Button>
                        </Col>
            })}
        </Row>
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อหรือเบอร์โทร', search, setSearch }} />
        <br/>
        <div className="custom-scrollbar" >
   
            {option==='1'
                ?<Table  bordered   variant="light"   >
                    <thead  >
                    <tr>
                        <th style={styles.text}>No.</th>
                        <th style={styles.text2}>วันที่สร้าง</th>
                        <th style={styles.text2}>ร้านค้า</th>
                        <th style={styles.text2}>เบอร์ร้าน</th>
                        <th style={styles.text2}>จำนวนโต๊ะ</th>
                        <th style={styles.text2}>รายการสินค้า</th>
                        <th style={styles.text2}>หน้าสั่งอาหาร</th>
                        <th style={styles.text2}>เพิ่มการจับตา</th>
                        <th style={{ minWidth:'200px' }}>ยอดขายย้อนหลัง</th>
                    </tr>
                    </thead>
                    <tbody  >
                    {currentShop.map((item, index) => {
                        const { createdDate, name, tel, smartTable, monitoring, monitorSale = [], id } = item;
                        const saleMap = new Map();
                        monitorSale.forEach(({ billDate, net }) => {
                        saleMap.set(billDate, net);
                        });

                        const newBillDate = billDates.map(a => handleDigit(saleMap.get(a)) || 0);
                        return <React.Fragment>
                            <tr  style={{cursor: 'pointer'}} key={index}  >
                                <td  style={styles.text3}>{index+1}.</td>
                                <td  style={styles.text3} >{stringDateTimeReceipt(createdDate)}</td>
                                <td  >{name}</td>
                                <td  style={styles.text3}>{tel}</td>
                                <td  style={styles.text3}>{smartTable.length}</td>
                                <th style={styles.text3}><Button onClick={()=>{fetchProduct(id)}} variant="warning" >ดู</Button></th>
                                <th style={styles.text3}><Button onClick={()=>{handleOpenInNewTab(id)}} variant="warning" >ดู</Button></th>
                                {monitoring
                                    ?<th style={{...styles.text3, color:'green', fontSize:25 }}><i class="bi bi-check-all"></i></th>
                                    :<th style={styles.text3}><Button onClick={()=>{setAlert_Modal({ status:true, content:`จับตาดูร้าน ${name}`, onClick:()=>{addMonitor(item);setAlert_Modal(initialAlert)}, variant:'danger' })}} variant="warning" >เพิ่มการจับตา</Button></th>
                                }
                                <th style={styles.text3}>
                                    <h6  >{newBillDate.join('/')}</h6>
                                </th>
                            </tr>
                        </React.Fragment>
                    }
                    )}
                    </tbody>
                </Table>
                :option==='2'
                ?<Table  bordered   variant="light"   >
                    <thead  >
                    <tr>
                        <th style={styles.text}>No.</th>
                        {/* <th style={styles.text2}>วันที่สร้าง</th> */}
                        <th style={styles.text2}>ร้านค้า</th>
                        <th style={styles.text2}>เบอร์ร้าน</th>
                        <th style={{ minWidth:'200px' }}>ยอดขายย้อนหลัง</th>
                        <th style={styles.text2}>วันใช้งานคงเหลือ</th>
                        <th style={styles.text2}>จำนวนโต๊ะ</th>
                        <th style={styles.text2}>รายการสินค้า</th>
                        <th style={styles.text2}>หน้าสั่งอาหาร</th>
                        <th style={styles.text2}>เพิ่มเข้า port</th>
                        <th style={styles.text2}>waste</th>
                        <th style={styles.text2}>หมายเหตุ</th>
                    </tr>
                    </thead>
                    <tbody  >
                    {shopMonitors.map((item, index) => {
                        const { createdDate, name, tel, smartTable, monitoring, monitorSale = [], id } = item;
                        const saleMap = new Map();
                        monitorSale.forEach(({ billDate, net }) => {
                        saleMap.set(billDate, net);
                        });

                        const newBillDate = billDates.map(a => handleDigit(saleMap.get(a)) || 0);
                        return <React.Fragment>
                            <tr  style={{cursor: 'pointer'}} key={index}  >
                                <td  style={styles.text3}>{index+1}.</td>
                                <td  style={styles.text3} >{stringDateTimeReceipt(createdDate)}</td>
                                <td  >{name}</td>
                                <td  style={styles.text3}>{tel}</td>
                                <td  style={styles.text3}>{smartTable.length}</td>
                                <th style={styles.text3}><Button onClick={()=>{fetchProduct(id)}} variant="warning" >ดู</Button></th>
                                <th style={styles.text3}><Button onClick={()=>{handleOpenInNewTab(id)}} variant="warning" >ดู</Button></th>
                                {monitoring
                                    ?<th style={{...styles.text3, color:'green', fontSize:25 }}><i class="bi bi-check-all"></i></th>
                                    :<th style={styles.text3}><Button onClick={()=>{setAlert_Modal({ status:true, content:`จับตาดูร้าน ${name}`, onClick:()=>{addMonitor(item);setAlert_Modal(initialAlert)}, variant:'danger' })}} variant="warning" >เพิ่มการจับตา</Button></th>
                                }
                                <th style={styles.text3}>
                                    <h6  >{newBillDate.join('/')}</h6>
                                </th>
                            </tr>
                        </React.Fragment>
                    }
                    )}
                    </tbody>
                </Table>
                :null
            }
            {/* <Table  bordered   variant="light"   >
                <thead  >
                <tr>
                    <th style={styles.text}>No.</th>
                    <th style={styles.text2}>วันที่สร้าง</th>
                    <th style={styles.text2}>ร้านค้า</th>
                    <th style={styles.text2}>เบอร์ร้าน</th>
                    <th style={styles.text2}>จำนวนโต๊ะ</th>
                    <th style={styles.text2}>รายการสินค้า</th>
                    <th style={styles.text2}>หน้าสั่งอาหาร</th>
                    <th style={styles.text2}>เพิ่มการจับตา</th>
                    <th style={{ minWidth:'200px' }}>ยอดขายย้อนหลัง</th>
                </tr>
                </thead>
                <tbody  >
                {currentShop.map((item, index) => {
                    const { createdDate, name, tel, smartTable, monitoring, monitorSale = [], id } = item;
                    const saleMap = new Map();
                    monitorSale.forEach(({ billDate, net }) => {
                    saleMap.set(billDate, net);
                    });

                    const newBillDate = billDates.map(a => handleDigit(saleMap.get(a)) || 0);
                    return <React.Fragment>
                        <tr  style={{cursor: 'pointer'}} key={index}  >
                            <td  style={styles.text3}>{index+1}.</td>
                            <td  style={styles.text3} >{stringDateTimeReceipt(createdDate)}</td>
                            <td  >{name}</td>
                            <td  style={styles.text3}>{tel}</td>
                            <td  style={styles.text3}>{smartTable.length}</td>
                            <th style={styles.text3}><Button onClick={()=>{fetchProduct(id)}} variant="warning" >ดู</Button></th>
                            <th style={styles.text3}><Button onClick={()=>{handleOpenInNewTab(id)}} variant="warning" >ดู</Button></th>
                            {monitoring
                                ?<th style={{...styles.text3, color:'green', fontSize:25 }}><i class="bi bi-check-all"></i></th>
                                :<th style={styles.text3}><Button onClick={()=>{setAlert_Modal({ status:true, content:`จับตาดูร้าน ${name}`, onClick:()=>{addMonitor(item);setAlert_Modal(initialAlert)}, variant:'danger' })}} variant="warning" >เพิ่มการจับตา</Button></th>
                            }
                            <th style={styles.text3}>
                                <h6  >{newBillDate.join('/')}</h6>
                            </th>
                        </tr>
                    </React.Fragment>
                }
                )}
                </tbody>
            </Table>
            <Table  bordered   variant="light"   >
                <thead  >
                <tr>
                    <th style={styles.text}>No.</th>
                    <th style={styles.text2}>วันที่สร้าง</th>
                    <th style={styles.text2}>ร้านค้า</th>
                    <th style={styles.text2}>เบอร์ร้าน</th>
                    <th style={styles.text2}>จำนวนโต๊ะ</th>
                    <th style={styles.text2}>ประเภทร้าน</th>
                    <th style={styles.text2}>ระยะเวลา</th>
                    <th style={styles.text2}>ดูแลล่าสุด</th>
                    <th style={{ minWidth:'200px' }}>ยอดขายย้อนหลัง</th>
                </tr>
                </thead>
                <tbody  >
                </tbody>
            </Table> */}
        </div>
      <div>

    </div>
    </div>
  );
};

const styles = {
    container : {
      margin:'1rem',marginBottom:'0'
    },
    container2 : {
      marginBottom:'1rem'
    },
    container3 : {
      marginBottom:'1rem',marginLeft:'1rem'
    },
    container4 : {
      margin:'1rem'
    },
    container5 : {
      width:'90%'
    },
    text : {
      width: '5%', textAlign:'center'
    },
    text2 : {
      width: '10%', textAlign:'center'
    },
    text3 : {
      textAlign:'center'
    },
}

export default TeamAScreen;