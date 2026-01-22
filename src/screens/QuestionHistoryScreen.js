import React, { useState, useEffect } from "react";
import {
  Table,
} from "react-bootstrap";
import { CategoryControl, OneButton, SearchAndBottom } from "../components";
import { Modal_CategorySetting, Modal_FlatListTwoColumn, Modal_Loading, Modal_Question2 } from "../modal";
import { db, prepareFirebaseImage, webImageDelete } from "../db/firestore";
import { compareArrays, formatTime, searchFilterFunction, toastSuccess, totalField } from "../Utility/function";
import { initialQuestion } from "../configs";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { useSelector } from "react-redux";


function QuestionHistoryScreen() {
    const { profile:{ id:profileId, name:profileName } } = useSelector(state=>state.profile);
    const [question_Modal, setQuestion_Modal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [editCategory_Modal, setEditCategory_Modal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState([]);
    const [categorySetting, setCategorySetting] = useState([]);
    const [currentDisplay, setCurrentDisplay] = useState([]);
    const [masterData, setMasterData] = useState([]);
    const [oldImageUrls, setOldImageUrls] = useState([]);
    const [status_Modal, setStatus_Modal] = useState(false);

    const statusOptions = [
        { id:'approved', name:"อนุมัติ" },
        { id:'rejected', name:"ปฏิเสธ" },
    ];

    function handleStatus(item){
        setStatus_Modal(false);
        if(item.id === 'approved'){
            approvedQuestion(item.id)
        }
        if(item.id === 'rejected'){
            rejectedQuestion(item.id)
        }
    };

    useEffect(()=>{
        fetchQuestion()
    },[]);

    // 200%
    async function fetchQuestion(){
        setLoading(true);
        try {
            const query = await db.collection('question').get();
            const result = query.docs.map(doc=>{
                const { createdAt, ...data } = doc.data();
                return {...data, id:doc.id, createdAt:formatTime(createdAt) }
            });
            setMasterData(result);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }

    };

    // 200%
    async function handleQuestion(){
        setQuestion_Modal(false);
        setLoading(true);

        const { category:thisCategory, id, imageUrls, status } = currentQuestion;
        try {
            let category = []
            if(thisCategory.length >0){
                const { aboveId, id } = thisCategory[thisCategory.length-1]
                category = [...aboveId,id]
            };
            if(id){
                if((status === 'approved' || status === 'rejected') && profileId !== 'cZ7XkJeZzNOrr5HEZKEPgAjtMrx2'){
                    alert('ไม่สามารถแก้ไขคำถามที่อนุมัติหรือปฏิเสธแล้วได้')
                    setLoading(false);
                    return;
                }
                let images = imageUrls.filter(a=>!a?.startsWith('http')) || []
                if (images.length > 0) {
                    images = await Promise.all(
                        images.map(item => prepareFirebaseImage(item, '/question/', 'office'))
                    );
                }
                const existingImages = imageUrls.filter(a=>a.startsWith('http')) || []
                images = [...existingImages,...images]

                const deleteImages = oldImageUrls.filter(a=>a.startsWith('http') && !images.includes(a)) || []
                for(const img of deleteImages){
                    await webImageDelete(img);
                }

                const questionRef = db.collection('question').doc(id);
                await questionRef.update({ ...currentQuestion, category, imageUrls:images });
                setMasterData(prev=>prev.map(a=>{
                    return a.id === id
                        ?{...currentQuestion, category, imageUrls:images }
                        :a
                }))
            } else {
                let images = imageUrls.filter(a=>!a?.startsWith('http')) || []
                if (images.length > 0) {
                    images = await Promise.all(
                        images.map(item => prepareFirebaseImage(item, '/question/', 'office'))
                    );
                }
                const questionRef = db.collection('question').doc();
                const payload = {
                    ...currentQuestion,
                    createdAt: new Date(),
                    id: questionRef.id,
                    imageUrls: images,
                    profileId,
                    profileName,
                }
                await questionRef.set(payload);
                setMasterData(prev=>[payload,...prev])
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
     
    };

    // 200%
    async function deleteQuestion(id){
        const { status } = currentQuestion;
        if((status === 'approved' || status === 'rejected') && profileId !== 'cZ7XkJeZzNOrr5HEZKEPgAjtMrx2'){
            alert('ไม่สามารถลบคำถามที่อนุมัติหรือปฏิเสธแล้วได้')
            return;
        }
        setQuestion_Modal(false);
        setLoading(true);
        try {
            for(const img of oldImageUrls){
                await webImageDelete(img);
            }
            await db.collection('question').doc(id).delete();
            toastSuccess('🟢 ลบสำเร็จแล้ว');
            setMasterData(prev=>prev.filter(a=>a.id !== id))
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    };

    // 200%
    async function approvedQuestion(){
        const { id } = currentQuestion;
        setLoading(true);
        try {
            const questionRef = db.collection('question').doc(id);
            await questionRef.update({ status:'approved' });
            const newMasterData = masterData.map(item => {
                if (item.id === id) {
                    return { ...item, status:'approved', adminId:profileId, adminName:profileName};
                }
                return item;
            });
            setMasterData(newMasterData);
            toastSuccess('อนุมัติคำถาม/ปัญหานี้เรียบร้อยแล้ว');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    // 200%
    async function rejectedQuestion(){
        setLoading(true);
        try {
            const { id } = currentQuestion;
            const questionRef = db.collection('question').doc(id);
            await questionRef.update({ status:'rejected' });
            const newMasterData = masterData.map(item => {
                if (item.id === id) {
                    return { ...item, status:'rejected', adminId:profileId, adminName:profileName};
                }
                return item;
            });
            setMasterData(newMasterData);
            toastSuccess('ปฏิเสธคำถาม/ปัญหานี้เรียบร้อยแล้ว');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };


    // 200%
    async function submitCategory(value){
        setEditCategory_Modal(false)
        setLoading(true);
        try {
            await db.collection('admin').doc('question2').update({ category:value });
            setCurrentCategory(value)
            toastSuccess('🟢 บันทึกสำเร็จแล้ว');
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    };

    function openCategory(){
        if(profileId !== 'cZ7XkJeZzNOrr5HEZKEPgAjtMrx2') return alert('คุณไม่มีสิทธิ์จัดการหมวดหมู่');
      setEditCategory_Modal(true)
    };

    useEffect(()=>{
        let length = categorySetting.length;
        let result = []
        for(const item of masterData){
            if(length >=1){
                if(compareArrays(item.category.slice(0,length),totalField(categorySetting,'id'))){
                    result.push(item)
                }
            } else {
                result.push(item)
            }
        }
        if(search){
            result = searchFilterFunction(result,search,'question')
        }

        setCurrentDisplay(result)
    },[masterData,categorySetting,search]);

    function openProduct(item){
        const { category:thisCategory, imageUrls } = item;
        const category = currentCategory.flatMap(a=>a.value).filter(b=>thisCategory.includes(b.id));
        setCurrentQuestion({...item, category });
        setOldImageUrls(imageUrls || []);
        setQuestion_Modal(true);
    };

    function openStatus(item){
        if(profileId !== 'cZ7XkJeZzNOrr5HEZKEPgAjtMrx2') return;
        setStatus_Modal(true)
        setCurrentQuestion(item);
    };


  return (
    <div style={styles.container} >
        <h1>ประวัติคำถาม/ปัญหาที่พบบ่อย</h1>
        <Modal_FlatListTwoColumn
            show={status_Modal}
            onHide={()=>{setStatus_Modal(false)}}
            header='เลือกACTION'
            onClick={handleStatus}
            value={statusOptions}
        />

        <Modal_Loading show={loading} />

        <Modal_CategorySetting 
          show={editCategory_Modal} 
          onHide={()=>{setEditCategory_Modal(false)}}
          value={currentCategory}
          submit={submitCategory}
        />
        <Modal_Question2
            show={question_Modal}
            onHide={()=>{setQuestion_Modal(false)}}
            current={currentQuestion}
            setCurrent={setCurrentQuestion}
            submit={handleQuestion}
            deleteItem={deleteQuestion}
            currentCategory={currentCategory}
        />

        <OneButton {...{ text:'จัดการหมวดหมู่', submit:openCategory, variant:'dark' }} />
        <br/>
        <SearchAndBottom {...{ placeholder:'ค้นหาด้วยชื่อคำถาม', search, setSearch, download:false, exportToXlsx:()=>{openProduct(initialQuestion)}, text:'เพิ่มคำถาม/คำตอบ' }} />
        
        <CategoryControl {...{ warehouseCategory:currentCategory, categorySetting, setCategorySetting }} />
        <h5>ทั้งหมด {currentDisplay.length}/{masterData.length} คำถาม</h5>
        {currentDisplay.length>0
            ?<Table striped bordered hover responsive  variant="light" style={{marginTop:'1rem'}}  >
                <thead  >
                <tr>
                    <th style={styles.container2}>ลำดับ</th>
                    <th style={styles.container3}>วันที่สร้าง</th>
                    <th style={styles.container3}>คำถาม</th>
                    <th style={styles.container4}>คำตอบ</th>
                    <th style={styles.container3}>สถานะ</th>
                    <th style={styles.container3}>ผู้สร้าง</th>
                </tr>
                </thead>
                <tbody  >
                {currentDisplay.map((item,index) => {
                    const { question, answer, status, createdAt, profileName } = item;
                    return <tr   key={index} >
                                <td style={styles.container5}>{index+1}</td>
                                <td style={styles.container5}>{stringDateTimeReceipt(createdAt)}</td>
                                <td onClick={()=>{openProduct(item)}} >{question}</td>
                                <td onClick={()=>{openProduct(item)}} >
                                {answer.split('\n').map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                                </td>
                                <td onClick={()=>{openStatus(item)}} style={styles.container5}>{status}</td>
                                <td style={styles.container5}>{profileName}</td>
                            </tr>
                })}
                </tbody>
            </Table>
            :null
        }
    </div>
  );
};

const styles = {
    container : {
        minHeight:'100vh'
    },
    container2 : {
        width:'5%', minWidth:'70px', textAlign:'center'
    },
    container3 : {
        width:'20%', minWidth:'150px', textAlign:'center'
    },
    container4 : {
       width:'25%', minWidth:'250px', textAlign:'center'
    },
    container5 : {
        textAlign:'center'
    }
}

export default QuestionHistoryScreen;