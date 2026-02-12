import React from "react";
import { colors } from "../configs";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";


const { white } = colors;
function SourceScreen() {

    const openDriveFolder = () => {
        window.open(
            "https://drive.google.com/drive/folders/1-agCT4RVx9p3-P6xgfrAI1mNRjKVLFpf",
            "_blank"
        );
        };

  return (
    <div style={styles.container}>
        <h1>สื่อต่างๆ</h1>
        <Button variant="success" onClick={openDriveFolder}>กดฉันสิ กดเลยๆ</Button>
    </div>
  );
};

const styles = {
    container : {
        minHeight:'100vh',
    },
}

export default SourceScreen;
