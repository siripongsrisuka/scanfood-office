import React, { useState } from "react";
import { toastSuccess } from "../Utility/function";
import { db } from "../db/firestore";
import { Modal_OneInput } from "../modal";
import { Col, Row } from "react-bootstrap";
import { colors } from "../configs";

const { softWhite } = colors;

function HardwareCheck({
    hardwares,
    setHardwares,
    setLoading
}) {
    const [note_Modal, setNote_Modal] = useState(false);
    const [currentHardware, setCurrentHardware] = useState({ id:'', note:''});
    const { note, id:hardwareId } = currentHardware;

    function openHardware(item){
        setCurrentHardware(item);
        setNote_Modal(true);
    };

    async function handleNote(){
        setNote_Modal(false);
        setLoading(true);
        try {
            const hardwareRef = db.collection('hardwareOrder').doc(hardwareId);
            await hardwareRef.update({ note });
            setHardwares(prev=>prev.map(item=>
                item.id === hardwareId
                    ?{
                        ...item, note
                    }
                    :item
            ));
            toastSuccess('อัปเดตสำเร็จ');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
            setCurrentHardware({ id:'', note:'' })
        }
    };

  return <div>
            <Modal_OneInput
                show={note_Modal}
                header={`Note`}
                onHide={()=>{setNote_Modal(false);setCurrentHardware({ id:'', note:'' })}}
                value={note}
                onClick={handleNote}
                placeholder='ใส่ note'
                onChange={(value)=>{setCurrentHardware(prev=>({...prev, note:value }))}}
                area={true}
            />
            <h4>ทั้งหมด : {hardwares.length} รายการ</h4>
            {hardwares.map((item)=>{
                const { name, shopName, note } = item;
                return <Row onClick={()=>{openHardware(item)}}  key={item.id} style={{ borderBottom:`1px solid ${softWhite}`, marginBottom:'5px', position:'relative' }} >
                            <Col xs='12' sm='6'  >{name}[{shopName}]</Col>
                            <Col xs='6' sm='3'  >{note}</Col>
                        </Row>
            })}
        </div>

}

export default HardwareCheck;
