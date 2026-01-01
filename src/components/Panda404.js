
import React  from "react";
import * as panda404 from '../panda404.json';
import Lottie from "react-lottie";


function Panda404() {

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: panda404.default,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  return (
    <div style={{display:"flex",alignItems:'center',flexDirection:'column'}} >
      <Lottie options={defaultOptions} height={200} width={200} />
      ลิงค์หมดอายุ...
      
    </div>
  )
}

export default Panda404;

