import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
} from "react-bootstrap";
import { CategoryControl, OneButton, SearchControl } from "../components";
import { Modal_Arrange, Modal_CategorySetting, Modal_Loading, Modal_Question2 } from "../modal";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../db/firestore";
import { toast } from 'react-toastify';
import { compareArrays, searchFilterFunction, totalField } from "../Utility/function";

const initialQuestion = { q:'', a:"", id:"", category:[] };


function QuestionSettingScreen() {

    const [question_Modal, setQuestion_Modal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
    const [current, setCurrent] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [editCategory_Modal, setEditCategory_Modal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState([]);
    const [categorySetting, setCategorySetting] = useState([]);
    const [currentDisplay, setCurrentDisplay] = useState([]);

    useEffect(()=>{
        handleFetch()
    },[]);

    async function handleFetch(){
        setLoading(true);
        try {
            const questionDoc = await db.collection('admin').doc('question2').get();
            const { value, category } = questionDoc.data();
            setCurrent(value)
            setCurrentCategory(category)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    function manageQuestion(){
        const { category:thisCategory, id } = currentQuestion;
        
        let category = []
        if(thisCategory.length >0){
            const { aboveId, id } = thisCategory[thisCategory.length-1]
            category = [...aboveId,id]
        };
        if(id){
            
            setCurrent(prev=>prev.map(a=>{
                return a.id === id
                    ?{...currentQuestion, category }
                    :a
            }))
        } else {
            setCurrent(prev=>[...prev,{...currentQuestion, category, id:uuidv4()}])
        }
        setQuestion_Modal(false)
    };

    function deleteQuestion(id){
        setCurrent(prev=>prev.filter(a=>a.id !== id))
        setQuestion_Modal(false)
    };

    const [items, setItems] = useState([]);
    const [questionArrange_Modal, setQuestionArrange_Modal] = useState(false);

    function handleQuestionArrange(items){
        setQuestionArrange_Modal(false)
        setCurrent(prev=>({...prev,question:items.map(({ name, index, ...rest })=>({...rest}))}))
    };

    function openQuestionArrange(){
        setItems(current.map((item,index)=>({...item,name:item.q,index})))
        setQuestionArrange_Modal(true)
    };

    function submit(){
        setLoading(true);
        try {
            db.collection('admin').doc('question2').update({ value:current })
            toast.success('🟢 บันทึกสำเร็จแล้ว');
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    function submitCategory(value){
        setEditCategory_Modal(false)
        setLoading(true);
        try {
            db.collection('admin').doc('question2').update({ category:value });
            setCurrentCategory(value)
            toast.success('🟢 บันทึกสำเร็จแล้ว');
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    function openCategory(){
      setEditCategory_Modal(true)
    };

      useEffect(()=>{
        let length = categorySetting.length;
        let result = []
        for(const item of current){
            if(length >=1){
                if(compareArrays(item.category.slice(0,length),totalField(categorySetting,'id'))){
                    result.push(item)
                }
            } else {
                result.push(item)
            }
        }
        if(search){
        result = searchFilterFunction(result,search,'q')
        }

        setCurrentDisplay(result)
    },[current,categorySetting,search]);

    function openProduct(item){
        const { category:thisCategory } = item;
        let category = currentCategory.flatMap(a=>a.value).filter(b=>thisCategory.includes(b.id));
        setCurrentQuestion({...item, category })
        setQuestion_Modal(true)
    };


  return (
    <div style={{ padding:10 }} >
        <Modal_Loading show={loading} />
        <Modal_Arrange
          show={questionArrange_Modal}
          onHide={()=>{setQuestionArrange_Modal(false)}}
          items={items}
          submit={handleQuestionArrange}
          header="เลือกลำดับที่ต้องการ"
      />
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
            submit={manageQuestion}
            deleteItem={deleteQuestion}
            currentCategory={currentCategory}
        />
        <h1>คำถามที่พบบ่อย</h1>

       
        <OneButton {...{ text:'เพิ่มคำถาม/คำตอบ', submit:()=>{setQuestion_Modal(true);setCurrentQuestion(initialQuestion)}, variant:'dark' }} />&emsp;
        <OneButton {...{ text:'จัดลำดับ', submit:openQuestionArrange, variant:'warning' }} />&emsp;
        <OneButton {...{ text:'บันทึก', submit, variant:'success' }} />&emsp;
        <OneButton {...{ text:'จัดการหมวดหมู่', submit:openCategory, variant:'dark' }} />
        <br/> <br/>
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อ', search, setSearch }} />
        
        <CategoryControl {...{ warehouseCategory:currentCategory, categorySetting, setCategorySetting }} />
        <h5>ทั้งหมด {currentDisplay.length}/{current.length} คำถาม</h5>
        {currentDisplay.length>0
            ?<Table striped bordered hover responsive  variant="light" style={{marginTop:'1rem'}}  >
                <thead  >
                <tr>
                    <th style={styles.container9}>ลำดับ</th>
                    <th style={styles.container12}>คำถาม</th>
                    <th style={styles.container11}>คำตอบ</th>
                    <th style={styles.container10}>จัดการ</th>
                </tr>
                </thead>
                <tbody  >
                {currentDisplay.map((item,index) => {
                    const { q, a } = item;
                    return <tr   key={index} >
                                <td style={styles.container9}>{index+1}</td>
                                <td style={styles.container12}>{q}</td>
                                <td >
                                {a.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    <br />
                                </React.Fragment>
                                ))}
                                </td>
                                <td style={styles.container10}>
                                <Button onClick={()=>{openProduct(item)}} variant="warning" >
                                    จัดการ
                                </Button>
                                </td>
                            </tr>
                })}
                </tbody>
            </Table>
            :null
        }
    </div>
  );
};

const styles = {}

export default QuestionSettingScreen;