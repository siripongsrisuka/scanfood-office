import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { Modal_Email, Modal_Loading } from "../modal";
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

function EmailPrinterScreen() {
    const { profile:{ id:profileId, name:profileName } } = useSelector((state)=> state.profile);
    const [masterData ,setMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [current, setCurrent] = useState(initialEmailKbank);
    const [email_Modal, setEmail_Modal] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(()=>{
        fetchEmailTax();
    },[]);

    useEffect(()=>{
        const filtered = search
            ?searchMultiFunction(masterData, search, ['shopName','email','profileName'])
            : masterData;
        setCurrentDisplay(filtered);
    },[search, masterData]);

    async function fetchEmailTax(){
        setLoading(true);
        try {
            const query = await db.collection('emailTax').orderBy('createdAt','desc').limit(100).get();
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


    async function handleEmailTax(){
        // ส่งอีเมล ขอหมายเลขเครื่อง POS
        setEmail_Modal(false)
        setLoading(true);
        try {
            const { status, data } = await scanfoodAPI.post(
                "/email/oneshot/tax/",
                {
                    toList:[current.email],
                }
            );
            const emailTaxRef = db.collection('emailTax').doc();
            const payload = {
                ...current,
                id:emailTaxRef.id,
                createdAt:new Date(),
                profileId,
                profileName
            }
            await emailTaxRef.set(payload);
            toastSuccess('ส่งอีเมล ขอหมายเลขเครื่อง POS เรียบร้อยแล้ว');
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
        <Modal_Email
            show={email_Modal}
            onHide={()=>{setEmail_Modal(false)}}
            current={current}
            setCurrent={setCurrent}
            submit={handleEmailTax}
        />
        <h1>ส่งอีเมล ขอหมายเลขเครื่อง POS</h1>
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

export default EmailPrinterScreen;