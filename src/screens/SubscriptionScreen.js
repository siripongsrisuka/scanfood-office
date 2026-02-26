import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
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
import { plusDays, stringFullDate } from "../Utility/dateTime";
import { db } from "../db/firestore";
import { daysBetween, formatTime, reOrder, searchMultiFunction } from "../Utility/function";
import { Modal_Loading } from "../modal";
import { initialYearly } from "../configs";
import { scanfoodAPI } from "../Utility/api";
import { SearchControl } from "../components";


function SubscriptionScreen() {
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentDisplay, setCurrentDisplay] = useState([]);

    useEffect(()=>{
        fetchMasterData()
    },[]);

    useEffect(()=>{
        let arr = masterData;
        if(search) arr = searchMultiFunction(arr, search, ['name', 'code', 'tel']);
        setCurrentDisplay(arr);
    }, [search,masterData]);

    async function fetchMasterData() {
        setLoading(true);
        try {
            const { status, data } = await scanfoodAPI.post(
                "/office/subscription/",
                {}
            );
            const { shops } = data;
            setMasterData(shops);

            // const res = await getMasterData();
            // setMasterData(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

  async function billHistory(shopId){
    setLoading(true);
    try {
      const response = await scanfoodAPI.post(
        "/office/billHistory/",
        {
          shopId,
        }
      );
      const { status, data } = response;
      const { bills } = data;
      alert(`จำนวนบิลในแต่ละวัน \n${bills.map(a=>`${a.date} : ${a.qty}`).join('\n')}`);
    } catch (error) {
      alert(error)
    } finally {
      setLoading(false);
    }
    
  }

  return (
    <div style={styles.container} >
      <h1>Subscription</h1>
      <h6>เงื่อนไขการใช้งาน</h6>
      <ul>
        <li>แสดงผลเฉพาะร้านรายปี</li>
        <li>แสดงผลเฉพาะแพ็กเกจที่ลูกค้าเคยซื้อ</li>
        <li>แสดงผลเฉพาะแพ็กเกจที่กำลังจะหมดอายุใน 30 วัน</li>

    </ul>
      <Modal_Loading show={loading} />
        <SearchControl {...{ search, setSearch, placeholder: "ค้นหาร้านค้าด้วยชื่อหรือ code หรือเบอร์โทร" }} />
        <br/>
        <h6>จำนวน : {currentDisplay.length} ร้านค้า</h6>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th rowSpan={2} style={styles.container2}>No.</th>
                <th rowSpan={2} style={styles.container3}>code</th>
                <th rowSpan={2} style={styles.container5}>ร้านค้า</th>
                <th rowSpan={2} style={styles.container5}>แพ็กเกจที่ใช้</th>
                <th rowSpan={2} style={styles.container3}>วันที่หมดอายุ</th>
                <th rowSpan={2} style={styles.container3}>เบอร์โทรร้าน</th>
                <th colSpan={3} style={styles.container3}>ทำอะไรไปแล้ว</th>
            </tr>
            <tr>
                <th style={styles.container3}>email + ทักไลน์</th>
                <th style={styles.container3}>ทักไลน์</th>
                <th style={styles.container3}>โทร</th>
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { id, name, vip, vipExpire, tel, code } = item;
                return <tr   key={id} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td >{code}</td>
                            <td onClick={()=>{billHistory(id)}} >{name}<i class="bi bi-search"></i></td>
                            <td >{
                            vip.map(a=>{
                                const day = daysBetween(new Date(), a.expire)
                                if(day<0) return <p>{`${a.type} (- ${Math.abs(day)} วัน)`}</p>;
                                return <p>{`${a.type} (${day} วัน)`}</p>;
                            })}
                            </td>
                            <td style={styles.container4} >{stringFullDate(vipExpire)}</td>
                            <td style={styles.container4} >{tel}</td>
                            <td style={styles.container4} ></td>
                            <td style={styles.container4} ></td>
                            <td style={styles.container4} ></td>
                        </tr>
            })}
            </tbody>
        </Table>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  },
  container2 : {
    textAlign:'center',
    width:'10%',
    minWidth:'80px'
  },
  container3 : {
    textAlign:'center',
    width:'15%',
    minWidth:'120px'
  },
  container4 : {
    textAlign:'center',
  },
  container5 : {
    textAlign:'center',
    width:'15%',
    minWidth:'150px'
  },
}

export default SubscriptionScreen;