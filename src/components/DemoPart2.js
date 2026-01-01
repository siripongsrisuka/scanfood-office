import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import DemoBar from "./DemoBar";
import Slide from "./Slide";
import Youtuber from "./Youtuber";
import { Button } from "rsuite";
import { colors } from "../configs";
import Report from "./Report";
import { updateDemo } from "../redux/careSlice";
import FloatingArea from "./FloatingArea";

const { white, redOrange } = colors;

function DemoPart2() {
    const dispatch = useDispatch()
    const { demo } = useSelector(state=>state.care);

    const [scan, setScan] = useState(false);

    const { journey, shopType, note
     } = demo;


     const [display, setDisplay] = useState(journey);
     const url = useMemo(()=>{
        return "https://www.youtube.com/watch?v=m32wUYMDJi0"
     },[shopType])

     function handleDisplay(value){
        if(display===value){
            setDisplay(journey)
        } else {
            setDisplay(value)
        }
     };

     function handleChange(event){
        event.preventDefault();
        const { name, value } = event.target;
        const newDemo = {...demo,[name]:value}
        dispatch(updateDemo(newDemo))
    };

  return (
    <div style={{padding:'1rem'}} >
        <div style={{display:'flex',flexWrap:'wrap',position:'sticky',top:0,zIndex:100}} >
            <DemoBar/>&emsp;
            <Button color="red" appearance="primary" onClick={()=>{handleDisplay('testimonials')}} >Testimonials</Button>&emsp;
            <Button color="orange" appearance="primary" onClick={()=>{setScan(scan=>!scan)}} >สแกนสั่งอาหาร</Button>&emsp;
            <Button color="yellow" appearance="primary" onClick={()=>{handleDisplay('report')}} >Report</Button>&emsp;
            {/* <Button color="green" appearance="primary" onClick={()=>{setScan(scan=>!scan)}} >ใบเสร็จและใบคิว</Button>&emsp;
            <Button color="cyan" appearance="primary" onClick={()=>{setScan(scan=>!scan)}} >เสียงแจ้งเตือน</Button>&emsp;
            <Button color="blue" appearance="primary" onClick={()=>{setScan(scan=>!scan)}} >เดลิเวอรี่</Button>&emsp;
            <Button color="violet" appearance="primary" onClick={()=>{setScan(scan=>!scan)}} >Cashier/KDS/Serve</Button>&emsp; */}
            {/* <Button  appearance="default" onClick={()=>{handleDisplay('report')}} >Report</Button>&emsp; */}
        </div>
        <br/>
        {display==='testimonials'
            ?<Youtuber url={url} />
            :display==='report'
            ?<Report/>
            :<Slide/>
        }
        {scan
            ?<div style={{ width:'400px', height:'700px', position:'absolute', right:10, top:130, zIndex:999, border:`4px solid ${redOrange}`, backgroundColor:white }}>
                <iframe
                    src={`https://scanfood.web.app/static/MoLL1aeVBS4Ulkg58oGq`}
                    title="Web B"
                    style={{ width: '100%', height: '100%', border: 'none', margin:0,padding:0 }}
                />
            </div>
            :null
        }
        <br/>
        <div>
            <FloatingArea
                name="note"
                placeholder="โน๊ต"
                value={note}
                onChange={handleChange}
            />
        </div>
        
    </div>
  );
}


export default DemoPart2;