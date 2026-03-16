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
import { scanfoodAPI } from "../Utility/api";
import { Modal_Loading } from "../modal";


function UploadStaffScreen() {
    const [loading, setLoading] = useState(false);

    async function handleCheckEmails(){
        const { status, data } = await scanfoodAPI.post(
            "/office/checkEmail/",
            {
                emails:[
                    'siripongsrisukha@gmail.com',
                    'siripongsrisukha100@gmail.com',
                ],
            }
        );
        if(status === 200){
            const { data:emails } = data;
            console.log('emails')
            console.log(emails)
        }
    }

  return (
    <div style={styles.container} >
        <Modal_Loading show={loading} />
        <h1>อัปโหลดพนักงานเข้าบัญชีร้าน</h1>
        <h6>เงื่อนไขการใช้งาน</h6>
        <ul>
            <li>ใช้กับร้านใหม่เท่านั้น</li>
            <li>email ที่เคยลงทะเบียนไปแล้วจะไม่สามารถอัปโหลดได้</li>
            <li>วิธีการเข้าใช้งาน + วิธีการเปลี่ยนรหัสพนักงาน</li>
            <li>เบอร์โทรห้ามใส่ขีด</li>
        </ul>
        <Button onClick={handleCheckEmails}>Check Emails</Button>
        <div>

    </div>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default UploadStaffScreen;