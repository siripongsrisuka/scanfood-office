import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
} from "react-bootstrap";
import { OneButton, SearchControl } from "../components";
import { colors } from "../configs";
import { db } from "../db/firestore";
import { Modal_Loading, Modal_Sbs, Modal_Success } from "../modal";
import { searchFilterFunction } from "../Utility/function";
import { normalSort } from "../Utility/sort";

const { dark } = colors;

const initialSbs = {
    name:'',
    link:'',
    count:0,
    leftText:'สามารถทำได้ครับ',
    rightText:'',
    timestamp:new Date(),
    leftCount:0,
    rightCount:0
}

function SbsScreen() {
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [current, setCurrent] = useState(initialSbs);
    const [sbs_Modal, setSbs_Modal] = useState(false);
    const [masterData, setMasterData] = useState([]);

    useEffect(()=>{
        fetchSbs()
    },[])

    useEffect(()=>{
        let arr = masterData
        if(search){
            arr = searchFilterFunction(masterData,search,'name')
        }
        setDisplay(normalSort('count',arr))
    },[search,masterData])

    async function fetchSbs(){
        db.collection('sbs').get().then((qsnapshot)=>{
            let arr = []
            if(qsnapshot.docs.length>0){
                qsnapshot.forEach((doc)=>{
                    arr.push({...doc.data(),id:doc.id})
                })
            }
            setMasterData(arr)
        })
    }

    

    async function handleCopy(side,id) {
        try {
            const shopRef = db.collection("sbs").doc(id);
            
            await db.runTransaction(async (transaction) => {
              const shopDoc = await transaction.get(shopRef);
              const { leftCount, rightCount, count, link, leftText, rightText } = shopDoc.data();
              let newLeft = leftCount
              let newRight = rightCount
              let newCount = count
              let content = ''
              switch (side) {
                case 'left':
                    newLeft ++
                    content = leftText
                    break;
                case 'right':
                    newRight ++
                    content = rightText
                    break;
                default:
                    break;
              }
              newCount ++
              content += `\n${link}`
              let obj = { leftCount:newLeft, rightCount:newRight, count:newCount }
              transaction.update(shopRef, obj);
              return {...obj,link, leftText, rightText, content, id };
            }).then(({ content, id, ...rest })=>{
                setMasterData(masterData=>masterData.map(a=>{
                    return a.id===id
                        ?{...a,...rest}
                        :a
                }))
                navigator.clipboard.writeText(content)
                .then(() => {
                    setShowPopup(true);
                    setTimeout(() => setShowPopup(false), 1000); // Hide popup after 2 seconds
                })
                .catch((error) => {
                    console.error('Failed to copy text:', error);
                });
            })
        
          } catch (err) {
            console.log(err)
          }
    };

    async function handleSbs(){  // สร้างและแก้ไข
        setSbs_Modal(false)
        setLoading(true)
        const { id, leftText, rightText, link, name } = current;
        try {
            if(id){
                await db.collection('sbs').doc(id).update({ leftText, rightText, link, name })
                setMasterData(masterData=>masterData.map(a=>{
                    return a.id === id
                        ?{...a,leftText,rightText,link,name}
                        :a
                }))
            } else {
                await db.collection('sbs').add(current).then((doc)=>{
                    setMasterData(masterData=>[...masterData,{...current,id:doc.id}])
                })
            }
            setLoading(false)
            setSuccess_Modal(true)
            setTimeout(()=>{
                setSuccess_Modal(false)
            },900)
        } catch (error) {
            setLoading(false)
        }
    }


    async function deleteSbs(){
        setSbs_Modal(false)
        setLoading(true)
        try {
            await db.collection('sbs').doc(current.id).delete();
            setLoading(false)
            setSuccess_Modal(true)
            setTimeout(()=>{
                setSuccess_Modal(false)
            },900)
            setMasterData(masterData=>masterData.filter(a=>a.id!==current.id))
        } catch (error) {
            setLoading(false)
        }
    };

 

    function close(){
        setSbs_Modal(false)
        setCurrent(initialSbs)
    };

    function openSbs(item){
        setCurrent(item)
        setSbs_Modal(true)
    };

  

  return (
    <div style={{padding:'1rem'}} >
        <Modal_Loading show={loading} />
        <Modal_Success show={success_Modal} />
        <Modal_Sbs
            show={sbs_Modal}
            onHide={close}
            current={current}
            setCurrent={setCurrent}
            submit={handleSbs}
            deleteSbs={deleteSbs}
        />
      <h1>มุมตอบคำถาม</h1>
      <div style={{display:'flex'}} >
      <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อหัวข้อ', search, setSearch }} />
        &emsp;<OneButton {...{ text:'เพิ่มหัวข้อ', submit:()=>{openSbs(initialSbs)} }} />
      </div>
      <br/>
      <h4>ทั้งหมด {display.length}/{masterData.length} คำตอบ</h4>
      <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
              <th style={styles.container}>ทำได้ไหม</th>
              <th style={{...styles.container2,textAlign:'center'}}>หัวข้อ</th>
              <th style={styles.container}>ทำยังไง</th>
            </tr>
          </thead>
          <tbody  >
            {display.map((item, index) => {
                const { name, count, leftCount, rightCount, id } = item;
                return <tr   key={index} >
                            <td style={styles.container} >
                                <Button onClick={()=>{handleCopy('left',id)}} variant="warning" >{leftCount}</Button>
                            </td>
                            <td onClick={()=>{openSbs(item)}} style={styles.container2} >{name}[{count}]</td>
                            <td style={styles.container} >
                                <Button onClick={()=>{handleCopy('right',id)}} variant="success" >{rightCount}</Button>
                            </td>
                        </tr>
            })}
          </tbody>
        </Table>
      {/* Popup message */}
      {showPopup && (
        <div style={styles.popupStyle}>
          Text copied successfully!
        </div>
      )}
    </div>
  );
};

const styles = {
    popupStyle : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '10px 20px',
        backgroundColor: dark,
        color: '#fff',
        borderRadius: '5px',
        zIndex: 1000,
        textAlign: 'center',
        fontSize: '16px',
    },
    container:{
        width:'10%',minWidth:'50px',textAlign:'center'
    },
    container2:{
        width:'80%',minWidth:'250px',cursor:'pointer'
    }
}

export default SbsScreen;