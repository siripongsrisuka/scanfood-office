import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
} from "react-bootstrap";
import { CategoryControl, SearchControl, SlideOptions } from "../components";
import { Modal_Loading, Modal_Question } from "../modal";
import { db } from "../db/firestore";
import { compareArrays, formatTime, searchFilterFunction, searchMultiFunction, toastSuccess, totalField } from "../Utility/function";
import { useSelector } from "react-redux";
import { normalSort } from "../Utility/sort";
import { initialQuestion } from "../configs";


function QuestionScreen() {
    const { profile:{ id:profileId, name:profileName } } = useSelector(state=>state.profile);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState([]);
    const [categorySetting, setCategorySetting] = useState([]);
    const [currentDisplay, setCurrentDisplay] = useState([]);
    const [masterData, setMasterData] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
    const [question_Modal, setQuestion_Modal] = useState(false);
    const [resultLength, setResultLength] = useState(0);
    const [learnStatus, setLearnStatus] = useState(true);

    const [option, setOption] = useState({id:'1',name:'เรียนรู้แล้ว', value:'1', length:0 });
    const { id:optionId, name:optinName, value, length } = option;

    const thisOptions = [
        {id:'1',name:'เรียนรู้แล้ว', value:'1'},
        {id:'2',name:'ห้ามดู', value:'2'},
    ];

    const options = useMemo(()=>{
        return thisOptions.map(a=>({ id:a.id, name:a.name, value:a.value, length:
            a.id === '1' ? masterData.filter(a=>a.lastLearn.some(item=>item.profileId===profileId)).length
            :masterData.filter(a=>!a.lastLearn.some(item=>item.profileId===profileId)).length
            }))
    },[thisOptions,masterData,profileId]);

    const handleChange = (value) => {
        const option = options.find(a=>a.value === value)
        setOption(option);
    };
    

    // const { } = useMemo(() => {

    // }, [search, masterData]);


    function openQuestionModal(item){
        setCurrentQuestion(item);
        setQuestion_Modal(true);
    };

    useEffect(()=>{
        handleFetch()
    },[]);

    async function handleFetch(){
        setLoading(true);
        try {
            const [ category, question ] = await Promise.all([fetchCategory(), fetchQuestion()]);
            setCategory(category)
            setMasterData(question)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchCategory(){
        const query = await db.collection('admin').doc('question2').get();
        const { category } = query.data();
        return category;
    }

    async function fetchQuestion(){
        const query = await db.collection('question')
            .where('status','==','approved')
            .get();
        const result = query.docs.map(doc=>{
            return {
                lastLearn:[],
                ...doc.data(),
                id:doc.id
            }
        });
        const arraySorted = normalSort('retweetCount', result);
        return arraySorted;
    };

    async function reTweet(id,copy = false){
        if(!copy){
            const ok = window.confirm('คุณแน่ใจหรือไม่ที่จะดันการเจอปัญหานี้?');
            if(!ok) return;
        }


        setLoading(true);
        const timestamp = new Date();
        try {
            const questionRef = db.collection('question').doc(id);
            const data = await db.runTransaction(async (transaction) => {
                const questionDoc = await transaction.get(questionRef);
                if (!questionDoc.exists) {
                    throw "Document does not exist!";
                }

                const data = questionDoc.data();
                const { retweetCount = 0, lastRetweet = [] } = data;
                const lastRetweetTime = lastRetweet.find(item => item.profileId === profileId && formatTime(item.timestamp) >= new Date(Date.now() - 24 * 60 * 60 * 1000));
                if (lastRetweetTime) {
                    throw "คุณได้ดันการเจอปัญหานี้แล้วในช่วง 24 ชั่วโมงที่ผ่านมา";
                }
                const newRetweetCount = retweetCount + 1;
                const newLastRetweet = lastRetweet.some(item => item.profileId === profileId)
                    ? lastRetweet.map(item =>
                        item.profileId === profileId
                            ? { ...item, timestamp }
                            : item
                    )
                    : [...lastRetweet, { profileId, profileName, timestamp }];

                transaction.update(questionRef, {
                    retweetCount: newRetweetCount,
                    lastRetweet: newLastRetweet,
                    lastRetweetAt: timestamp, // เอาไว้ดึงแสดงผลล่าสุดว่าดันเมื่อไหร่
                });
                return { ...data, retweetCount: newRetweetCount, lastRetweet: newLastRetweet };
            });
            const newMasterData = masterData.map(item => {
                if (item.id === id) {
                    return { ...item, ...data };
                }
                return item;
            });
            setMasterData(normalSort('retweetCount', newMasterData));
            toastSuccess('ดันการเจอปัญหานี้เรียบร้อยแล้ว');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        const length = categorySetting.length;
        const thisTotalField = totalField(categorySetting,'id');
        let result = []
        const filteredData = optionId === '1'
            ? masterData.filter(a=>a.lastLearn.some(item=>item.profileId===profileId))
            : masterData.filter(a=>!a.lastLearn.some(item=>item.profileId===profileId))
        for(const item of filteredData){
            if(length >=1){
                if(compareArrays(item.category.slice(0,length),thisTotalField)){
                    result.push(item)
                }
            } else {
                result.push(item)
            }
        };
        setResultLength(result.length)

        if(search){
            result = searchMultiFunction(result,search,['question','answer'])
        }

        setCurrentDisplay(result);
    },[masterData,categorySetting,search,optionId]);


    async function copyAndRetweet(item){
        setQuestion_Modal(false);
        navigator.clipboard.writeText(item.guideline);
        reTweet(item.id,true);

    };

    async function handleLearn(id){
        const ok = window.confirm('คุณแน่ใจหรือไม่ที่จะเรียนรู้ปัญหานี้?');
        if(!ok) return;
        setQuestion_Modal(false)

        setLoading(true);
        try {
            const timestamp = new Date();
            const questionRef = db.collection('question').doc(id);
            const data = await db.runTransaction(async (transaction) => {
                const questionDoc = await transaction.get(questionRef);
                if (!questionDoc.exists) {
                    throw "Document does not exist!";
                }

                const data = questionDoc.data();
                const { learnCount = 0, lastLearn = [] } = data;
                const lastLearnTime = lastLearn.find(item => item.profileId === profileId);
                if (lastLearnTime) {
                    throw "คุณได้เรียนรู้ปัญหานี้แล้ว";
                }
                const newLearnCount = learnCount + 1;
                const newLastLearn = [...lastLearn, { profileId, profileName, timestamp }]

                transaction.update(questionRef, {
                    learnCount: newLearnCount,
                    lastLearn: newLastLearn,
                    lastLearnAt: timestamp, // เอาไว้ดึงแสดงผลล่าสุดว่าดันเมื่อไหร่
                });
                return { ...data, learnCount: newLearnCount, lastLearn: newLastLearn, lastLearnAt: timestamp };
            });
            const newMasterData = masterData.map(item => {
                if (item.id === id) {
                    return { ...item, ...data };
                }
                return item;
            });
            setMasterData(normalSort('learnCount', newMasterData));
            toastSuccess('คุณได้เรียนรู้ปัญหานี้เรียบร้อยแล้ว');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div style={styles.container} >
        <h1>คำถาม/ปัญหาที่พบบ่อย</h1>
        <Modal_Question
            show={question_Modal}
            onHide={() => setQuestion_Modal(false)}
            current={currentQuestion}
            submit={copyAndRetweet}
            handleLearn={handleLearn}
        />
        <Modal_Loading show={loading} />
        <SlideOptions {...{ value, handleChange, options, show:true }} />
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อ', search, setSearch }} />
        
        <CategoryControl {...{ warehouseCategory:category, categorySetting, setCategorySetting }} />
        <h5>ทั้งหมด {currentDisplay.length}/{resultLength} คำถาม</h5>
       <Table striped bordered hover responsive  variant="light" style={{marginTop:'1rem'}}  >
                <thead  >
                <tr>
                    <th style={styles.container2}>ลำดับ</th>
                    <th style={styles.container3}>คำถาม</th>
                    <th style={styles.container4}>คำตอบ</th>
                    {optionId==='1'
                        ?<th style={styles.container3}>retweet</th>
                        :null
                    }
                </tr>
                </thead>
                <tbody  >
                {currentDisplay.map((item,index) => {
                    const { question, answer, id, retweetCount = 0,  } = item;
                    return <tr   key={index} >
                                <td style={styles.container2}>{index+1}</td>
                                <td onClick={()=>{openQuestionModal(item)}} >{question}</td>
                                <td onClick={()=>{openQuestionModal(item)}} >
                                {answer.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    <br />
                                </React.Fragment>
                                ))}
                                </td>
                                {optionId==='1'
                                    ?<td onClick={()=>{reTweet(id)}} style={styles.container3}><i class="bi bi-chevron-double-up"></i> {retweetCount}</td>
                                    :null
                                }
                                
                            </tr>
                })}
                </tbody>
        </Table>
    </div>
  );
};

const styles = {
    container : {
        minHeight:'100vh',
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

export default QuestionScreen;