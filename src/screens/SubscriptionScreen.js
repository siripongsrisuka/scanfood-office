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
import { formatTime } from "../Utility/function";
import { Modal_Loading } from "../modal";


function SubscriptionScreen() {
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        fetchMasterData()
    },[]);

    async function fetchMasterData() {
        setLoading(true);
        const oneMonthShop = plusDays(new Date(), 30);
        try {
            const query = await db.collection('shop')
                .where('vipExpire','<=', oneMonthShop)
                .get();
            const shops = query.docs.map(doc=>{
                const { vip, vipExpire, ...rest } = doc.data();
                return {
                    ...rest,
                    id: doc.id,
                    vip: vip.map(a=>{
                        return {
                            ...a,
                            expire: formatTime(a.expire)
                        }
                    }),
                    vipExpire: formatTime(vipExpire)
                }
            });
            setMasterData(shops);

            // const res = await getMasterData();
            // setMasterData(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    console.log(masterData);
  return (
    <div style={styles.container} >
      <h1>Subscription</h1>
      <Modal_Loading/>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container2}>No.</th>
                <th style={styles.container3}>ร้านค้า</th>
                <th style={styles.container3}>แพ็กเกจ</th>
                <th style={styles.container3}>วันที่หมดอายุ</th>
                <th style={styles.container3}>เบอร์โทรร้าน</th>
            </tr>
            </thead>
            <tbody  >
            {masterData.map((item, index) => {
                const { id, name, vip, vipExpire, tel } = item;
                return <tr   key={id} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td >{name}</td>
                            <td >{vip.map(a=>a.type).join(', ')}</td>
                            <td>{stringFullDate(vipExpire)}</td>
                            <td>{tel}</td>
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
  }
}

export default SubscriptionScreen;