import React  from "react";
import { colors } from "../configs";

const { white } = colors;

function ImageSize({ size='500 x 500 px'}) {

  return <div  style={styles.container} >
            <b>{size}</b>
        </div>
};

const styles = {
    container : {
        position:'absolute',top:10,left:10,zIndex:999,padding:5,backgroundColor:'rgba(0,0,0,0.3)',borderRadius:20,color:white
    }
}


export default ImageSize;
