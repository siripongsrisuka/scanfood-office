import React from "react";
import { Row, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RWebShare } from "react-web-share";


function ShareLink() {

  const { profile : { name, yourCode } } = useSelector(state => state.profile)


  return (
    <div style={{display:'flex',justifyContent:'center',flexDirection:'column',alignItems:'center'}}  >
        <hr/>
        <h4>รหัสแนะนำของคุณคือ : {yourCode}</h4>
        <hr/>
        <Row>
          <div>
            <RWebShare
                data={{
                  text: `SCAN FOOD สั่งอาหารผ่าน QR Code \n 1.ดาวน์โหลดแอปที่ลิงค์ด้านล่าง ${'https://onelink.to/3dxu77'}\n 2. กรอกรหัสแนะนำจาก${name} คือ ${yourCode} ที่หน้าแพ็กเกจของฉัน เพื่อรับวันใช้งานฟรี 1 เดือน`,
                  url: `SCAN FOOD สั่งอาหารผ่าน QR Code \n 1.ดาวน์โหลดแอปที่ลิงค์ด้านล่าง ${'https://onelink.to/3dxu77'}\n 2. กรอกรหัสแนะนำจาก${name} คือ ${yourCode} ที่หน้าแพ็กเกจของฉัน เพื่อรับวันใช้งานฟรี 1 เดือน`,
                  title: "SCANFOOD",
                }}
                onClick={() => console.log("shared successfully!")}
            >
                <Button style={{padding:'24px 24px 24px 24px'}} variant="success" ><h4>แชร์ลิงค์ให้ลูกค้า</h4></Button>
            </RWebShare>
          </div>
        </Row>
    </div>
  );
}

export default ShareLink;
