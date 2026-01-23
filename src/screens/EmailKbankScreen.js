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
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { Modal_EmailKbank, Modal_Loading } from "../modal";
import { db } from "../db/firestore";
import { searchMultiFunction, toastSuccess } from "../Utility/function";
import { scanfoodAPI } from "../Utility/api";
import { SearchAndBottom } from "../components";

const initialEmailKbank = {
    shopName:'',
    createdAt:new Date(),
    email:'',
    profileName:'',
    profileId:'',
};

function EmailKbankScreen() {
    const { profile:{ id:profileId, name:profileName } } = useSelector((state)=> state.profile);
    const [masterData ,setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [current, setCurrent] = useState(initialEmailKbank);
    const [email_Modal, setEmail_Modal] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(()=>{
        fetchEmailKbank();
    },[]);

    useEffect(()=>{
        const filtered = search
            ?searchMultiFunction(masterData, search, ['shopName','email','profileName'])
            : masterData;
        setCurrentDisplay(filtered);
    },[search, masterData]);

    async function fetchEmailKbank(){
        setLoading(true);
        try {
            const query = await db.collection('emailKbank').orderBy('createdAt','desc').limit(100).get();
            let res = []
            query.forEach((doc)=>{
                res.push({...doc.data(), createdAt: doc.data().createdAt.toDate(), id:doc.id})
            });
            setMasterData(res);
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    }

    function openEmailModal(){
        setCurrent(initialEmailKbank);
        setEmail_Modal(true)
    };


    async function handleEmailKbank(){
        // ส่งอีเมล Kbank
        setEmail_Modal(false)
        setLoading(true);
        try {
            const { status, data } = await scanfoodAPI.post(
                "/email/oneshot/kbank/",
                {
                    toList:[current.email],
                }
            );
            const emailKbankRef = db.collection('emailKbank').doc();
            const payload = {
                ...current,
                id:emailKbankRef.id,
                createdAt:new Date(),
                profileId,
                profileName
            }
            await emailKbankRef.set(payload);
            toastSuccess('ส่งอีเมล Kbank เรียบร้อยแล้ว');
            setMasterData(prev=>[payload, ...prev])
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
        setEmail_Modal(false)
    };

    return (
        <div style={styles.container} >
        <Modal_Loading show={loading} />
        <Modal_EmailKbank
            show={email_Modal}
            onHide={()=>{setEmail_Modal(false)}}
            current={current}
            setCurrent={setCurrent}
            submit={handleEmailKbank}
        />
        <h1>ส่งอีเมล Kbank</h1>
        <SearchAndBottom {...{ search, setSearch, download:false, placeholder:'ค้นหาด้วยชื่อร้านหรืออีเมลหรือพนักงาน', text:'ส่งอีเมล', exportToXlsx:openEmailModal}} />
        <br/>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >No.</th>
                    <th style={styles.container3} >วันที่ส่ง</th>
                    <th style={styles.container3} >ร้านค้า</th>
                    <th style={styles.container3} >อีเมล</th>
                    <th style={styles.container3} >พนักงาน</th>
                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { createdAt,  profileName, shopName, email } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>{stringDateTimeReceipt(createdAt)}</td>
                            <td style={styles.container4}>{shopName}</td>
                            <td style={styles.container4}>{email}</td>
                            <td style={styles.container4}>{profileName}</td>
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
    width:'5%', minWidth:'50px', textAlign:'center'
  },
  container3 : {
    width:'25%', minWidth:'150px', textAlign:'center'
  },
  container4 : {
    textAlign:'center'
  }
}

export default EmailKbankScreen;