import React from "react";
import { Row, Button } from "react-bootstrap";

function Media() {

  function redirectToWebsite() {
    window.open('https://drive.google.com/drive/folders/1dRPYq9sq5K5hJhCS0MfJ9_tS9JiFQoIG?usp=sharing', '_blank');
  };

  return (
    <div style={{display:'flex',justifyContent:'center',flexDirection:'column',alignItems:'center'}}  >
        <hr/>
        <h4>คุณสามารถเลือกสื่อประกอบการขายได้จากลิงค์ด้านล่าง</h4>
        <hr/>
        <Row>
          <Button onClick={redirectToWebsite} style={{padding:'24px 24px 24px 24px'}} variant="success" ><h4>Google Drive</h4></Button>
        </Row>
    </div>
  );
}

export default Media;
