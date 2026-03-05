import React from "react";
import { colors } from "../configs";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";


const { white } = colors;
function TrainingScheduleScreen() {

    const openDriveFolder = () => {
        window.open(
            "https://calendar.app.google/Cqrd62bg8a4LWi1G6",
            "_blank"
        );
        };

  return (
    <div style={styles.container}>
        <h1>จองคิวทอง</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
            <Button variant="success" onClick={openDriveFolder}>จองคิวทั้งหมด</Button>
        </div>
        <h6>เงื่อนไขการใช้งาน</h6>
        <ul>
            <li style={{ textDecoration: 'underline' }} >เป็นเคสที่ก่อให้เกิด Case Refer เท่านั้น❤️❤️❤️</li>
            <li>ใช้เวลา 20 นาทีต่อการ train</li>
            <li>ไม่สามารถเลื่อนเวลาการ train ได้(ต้องยกเลิกและจองใหม่)</li>
            <li>แสดงผลเฉพาะแพ็กเกจที่กำลังจะหมดอายุใน 30 วัน</li>
            <li>จองก่อนถึงเวลาอย่างน้อย 1 ชั่วโมง</li>
            <li>ระยะเวลาการให้บริการ จ - ศ ไม่รวมวันหยุดนักขัตฤกษ์ ตั้งแต่ 09:30 - 17:00 น.</li>
            <li>เซลที่จองคิวมั่วซั่ว จะได้รับการลงโทษจากพี่หลุยส์อย่างสาสม☠️☠️☠️</li>
        </ul>
        <h6>หัวข้อการ train 4 หัวข้อ</h6>
        <ul>
            <li>การตั้งค่า/ใช้งานเครื่องปริ้นครัว</li>
            <li>ระบบบุฟเฟ่ต์</li>
            <li>ระบบวัตถุดิบ</li>
            <li>ระบบสมาชิก</li>
        </ul>
        <h6>SOP</h6>
        <ul>
            <li>เซลขออีเมลลูกค้าเพื่อลงทะเบียนการจอง</li>
            <li>จองคิวในระบบ</li>
            <li>เซลตามลูกค้าก่อนถึงเวลา train</li>
            <li>เซลตามเก็บ feedback ลูกค้าหลังจบ train</li>
            <li>คลิปปลากรอบ <a href="https://www.youtube.com/watch?v=1F1tlH3nAqg" target="_blank" rel="noopener noreferrer">ดูคลิป</a> </li>
        </ul>
        
    </div>
  );
};

const styles = {
    container : {
        minHeight:'100vh',
    },
}

export default TrainingScheduleScreen;
