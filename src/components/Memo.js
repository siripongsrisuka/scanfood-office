import React, { useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { Modal_OneInput } from "../modal";
import { initialMemo } from "../configs";
import { toastSuccess } from "../Utility/function";
import { db } from "../db/firestore";
import { useSelector } from "react-redux";
import OneButton from "./OneButton";

function Memo({
    memo,
    setMemo,
    setLoading
}) {
    const { profile:{ id:profileId, name:profileName, team } } = useSelector(state=>state.profile);
    const [memo_Modal, setMemo_Modal] = useState(false);
    const [currentMemo, setCurrentMemo] = useState(initialMemo);
    const { content } = currentMemo;

    function openMemo(item){
        setCurrentMemo(item);
        setMemo_Modal(true);
    };

    //300%
    async function handleMemo(){
        setMemo_Modal(false);
        const { id, content } = currentMemo;
        setLoading(true);
        try {
            if(id){
                const memoRef = db.collection('memo').doc(id);
                await memoRef.update({ content });
                setMemo(prev=>prev.map(item=>
                    item.id === id
                        ?currentMemo
                        :item
                ))
                toastSuccess('อัปเดตสำเร็จ')
            } else {
                const memoRef = db.collection('memo').doc();
                const payload = {
                    content,
                    profileId,
                    profileName,
                    team,
                    createdAt:new Date(),
                    id:memoRef.id
                };
                await memoRef.set(payload);
                setMemo(prev=>[payload,...prev])
                toastSuccess('สร้างรายการสำเร็จ')
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
            setCurrentMemo(initialMemo)
        }

    };

        

  return <div>
        <Modal_OneInput
            show={memo_Modal}
            header={`Memo`}
            onHide={()=>{setMemo_Modal(false);setCurrentMemo(initialMemo)}}
            value={content}
            onClick={handleMemo}
            placeholder='ใส่ memo'
            onChange={(value)=>{setCurrentMemo(prev=>({...prev, content:value }))}}
            area={true}
        />
        <OneButton {...{ text: '+ เพิ่ม Memo', submit: ()=>setMemo_Modal(true), variant:'dark' }} />
        <h6>ทั้งหมด {memo.length} รายการ</h6>
        <Row>
            {memo.map((item,index)=>{
                const { createdAt, content } = item;
                    return <Col onClick={()=>{openMemo(item)}} xs='12' sm='6'md='4'lg='3' key={index}  >
                        <Card style={{ marginBottom:'1rem', padding:5 }} >
                            <h6>{stringDateTimeReceipt(createdAt)}</h6>
                            {content.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    &emsp;&nbsp;{line}
                                    <br />
                                </React.Fragment>
                                ))}
                            
                        </Card>
                    </Col>
            })}
        </Row>
  </div>
}

export default Memo;
