import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Row,
  Col,
  Table,
  Button,
} from "react-bootstrap";

import { OneButton, SearchAndBottom } from "../components";
import { Modal_Alert, Modal_Card, Modal_FlatListTwoColumn, Modal_Loading, Modal_OneInput } from "../modal";
import { db } from "../db/firestore";
import { addNormalCard, deleteNormalCard, fetchCard, updateNormalCard } from "../redux/cardSlice";
import { searchFilterFunction, toastSuccess } from "../Utility/function";
import { colors, initialAlert } from "../configs";
import { addNormalScenario, deleteNormalScenario, fetchScenario, updateNormalScenario } from "../redux/scenarioSlice";
import { toast } from "react-toastify";
import { normalSort } from "../Utility/sort";
import { v4 as uuidv4 } from 'uuid';
import Modal_FlatListTypeColumn from "../modal/Modal_FlatListTypeColumn";
import { scanfoodAPI } from "../Utility/api";

const { dark, softWhite, white, one, two, three, four, five, six, seven, eight } = colors;

const initialCard = {
    id:'',
    name:'',
    imageIds:[],
    content:'',
    createdBy:'',
    createdAt:'',
    link:'',
    cardIds:[],
    type:'', // question, answer, sequence
};

const initialScenario = {
    id:"",
    name:'',
    cases:[], //
}

function DiagnosisScreen() {
    const dispatch = useDispatch();
    const { cards, modal_Card } = useSelector(state=>state.card);
    const { scenarioes } = useSelector(state=>state.scenario);
    const [loading, setLoading] = useState(false);
    const [currentCard, setCurrentCard] = useState(initialCard);
    const [currentDisplay, setCurrentDisplay] = useState([]);
    const [search, setSearch] = useState('');
    const [card_Modal, setCard_Modal] = useState(false);
    const [scenario_Modal, setScenario_Modal] = useState(false);
    const [currentScenario, setCurrentScenario] = useState(initialScenario);
    const { name, id, cases } = currentScenario;
    const cardMaps = new Map(cards.map(a=>[a.id,a]));

    const colorWithTypes = {
        'problem':one,
        'sequence':'#ffbd59',
        'question':'#88d0f9',
        'answer':'#ac8eff',
        'solution':'#00bf63'
    }

    useEffect(()=>{
        dispatch(fetchCard())
        dispatch(fetchScenario())
    },[]);


    useEffect(()=>{
        let results = cards;
        if(search){
            results = searchFilterFunction(cards,search,'name')
        }
        setCurrentDisplay(results)
    },[search,cards])

    function onHide(){
        setCard_Modal(false);
        setCurrentCard(initialCard);
    };

    function openCard(payload={}){
        setCard_Modal(true)
        setCurrentCard({...initialCard,...payload})
    }

    async function handleCard(){
        onHide();
        setLoading(true);
        try {
            if(currentCard.id){
                const cardRef = db.collection('card').doc(currentCard.id);
                await cardRef.update(currentCard);
                dispatch(updateNormalCard(currentCard));
                toastSuccess()
            } else {
                const cardRef = db.collection('card').doc();
                await cardRef.set(currentCard);
                dispatch(addNormalCard({
                    ...currentCard,
                    id:cardRef.id
                }));
                toastSuccess()
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    };

    async function deleteItem(){
        onHide();
        setLoading(false);
        try {
            const batch = db.batch();
            batch.delete(db.collection('card').doc(currentCard.id));
            const updatedCards = cards.reduce((acc, card) => {
                if (card.cardIds.includes(currentCard.id)) {
                    acc.push({
                    ...card,
                    cardIds: card.cardIds.filter(id => id !== currentCard.id),
                    });
                }
                return acc;
                }, []);
            updatedCards.forEach(item=>batch.update(db.collection('card').doc(item.id),{ cardIds:item.cardIds }))
            dispatch(deleteNormalCard(currentCard.id));
            for(const item of updatedCards){
                dispatch(updateNormalCard(item));
            }
            await batch.commit();
            toastSuccess('ลบสำเร็จ')
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    };

    const [currentFlow, setCurrentFlow] = useState([]);

    function handleFlow(index, id) {
        // Copy the current array
        let newFlow = [...currentFlow];

        // Replace the id at the given index
        newFlow[index] = id;

        // Cut the array after the given index
        newFlow = newFlow.slice(0, index + 1);
        // newFlow = newFlow.slice(0, index + 1);

        // Update state (if using React for example)
        setCurrentFlow(newFlow);
    };

    const [cardIds, setCardIds] = useState({ id:'', level:1, cardId:'' });
    const [add_Modal, setAdd_Modal] = useState(false);
    const [exisCards, setExisCards] = useState([]);
    const [remove_Modal, setRemove_Modal] = useState(false);



    async function addCardIds(item){
        setAdd_Modal(false);
        setLoading(true);
        const newCases = [
            ...cases,
            {
                cardId:item.id,
                rootId:cardIds.id,
                level:cardIds.level +1,
                id:uuidv4()
            }
        ]
        try {
            const scenarioRef = db.collection('scenario').doc(currentScenario.id);
            await scenarioRef.update({ cases:newCases });
            dispatch(updateNormalScenario({ cases:newCases, id:currentScenario.id }));
            setCurrentScenario(prev=>({...prev,cases:newCases}))
            toastSuccess()
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    function openAddCard({ id, level, cardId }){
        const ids = cardId
            ?new Set([cardId,...currentFlow])
            :new Set(currentFlow)
        setExisCards(cards.filter(a=>!ids.has(a.id)));
        setCardIds({ id, level, cardId })
        setAdd_Modal(true);
    };

    function openRemoveCard({ id, level }){
        const exisCard = new Set(cases.filter(a=>a.rootId===id).map(b=>b.cardId))
        setExisCards(cards.filter(a=>exisCard.has(a.id)));
        setCardIds({ id, level });
        setRemove_Modal(true);
    };

    async function removeCardIds(item){
        setRemove_Modal(false);
        setLoading(true);
        const findItem = cases.find(a=>a.cardId===item.id && a.rootId === cardIds.id)
        try {
           // Collect all descendants of item.id, then remove them from cases
            const childrenByRoot = new Map();
            /* Build adjacency list: rootId -> [childId, ...] */
            for (const c of cases) {
            const arr = childrenByRoot.get(c.rootId);
            if (arr) arr.push(c.id);
            else childrenByRoot.set(c.rootId, [c.id]);
            }

            const deleteIds = new Set([findItem.id]);
            const stack = [findItem.id]; // or use a queue for BFS

            while (stack.length) {
            const rid = stack.pop();
            const kids = childrenByRoot.get(rid);
            if (!kids) continue;
            for (const kidId of kids) {
                if (!deleteIds.has(kidId)) {
                deleteIds.add(kidId);
                stack.push(kidId);
                }
            }
            }

            const finalCases = cases.filter(c => !deleteIds.has(c.id));

            const scenarioRef = db.collection('scenario').doc(currentScenario.id);
            await scenarioRef.update({ cases: finalCases });
            dispatch(updateNormalScenario({ cases: finalCases, id:currentScenario.id }))
            setCurrentScenario(prev=>({...prev,cases:finalCases}))


       
            toastSuccess();
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };



    async function handleScenario(){
        setLoading(true);
        try {
            if(id){
                const scenarioRef = db.collection('scenario').doc(id);
                await scenarioRef.update({ name });
                dispatch(updateNormalScenario({ id, name }));
                toastSuccess();
            } else {
                const scenarioRef = db.collection('scenario').doc();
                await scenarioRef.set({ name, cases:[] });
                dispatch(addNormalScenario({ id:scenarioRef.id, name, cases:[] }));
                toastSuccess();
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
        onHideScenario();
    };

    function onHideScenario(){
        setScenario_Modal(false);
        setCurrentScenario(initialScenario);
    };

    function openScenario(payload = {}){
        setScenario_Modal(true);
        setCurrentScenario({...initialScenario,...payload})
    };

    async function deleteScenario(id){
        setLoading(true);
        try {
            const scenarioRef = db.collection('scenario').doc(id);
            await scenarioRef.delete();
            dispatch(deleteNormalScenario(id));
            toastSuccess('ลบสำเร็จ')
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    }
    

    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;

    function caseToLevel(cases){
        let levels = [];
        for(const item of cases){
            let findLevel = levels.find(a=>a.level===item.level);
            if(findLevel){
                findLevel.value.push(item)
            } else {
                levels.push({
                    level:item.level,
                    value:[item]
                })
            }
        }
        return normalSort('level',levels)
    };

    console.log('currentFlow')
    console.log(currentFlow)


  return (
    <div >
      <h1>Diagnosis FlowChart</h1>
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
        <Modal_OneInput
            show={scenario_Modal}
            onHide={onHideScenario}
            placeholder='ใส่ชื่อ'
            header='Scenario'
            value={name}
            onChange={(v)=>{setCurrentScenario(prev=>({...prev,name:v}))}}
            onClick={handleScenario}
        />
      <Modal_Loading show={loading || modal_Card} />
    <Modal_FlatListTypeColumn
            show={remove_Modal}
            onHide={()=>{setRemove_Modal(false)}}
            header='เลือกรายการขาออก'
            onClick={removeCardIds}
            value={exisCards}
      />
      <Modal_FlatListTypeColumn
            show={add_Modal}
            onHide={()=>{setAdd_Modal(false)}}
            header='เลือกรายการขาเข้า'
            onClick={addCardIds}
            value={exisCards}
      />
      <Modal_Card
        show={card_Modal}
        onHide={onHide}
        current={currentCard}
        setCurrent={setCurrentCard}
        submit={handleCard}
        deleteItem={deleteItem}
      />
        <Row>
            <Col md='6' sm='12' >
            <OneButton {...{ text:'เพิ่ม Scenario', submit:()=>{openScenario({})} }} />
                <div style={{ display:'flex', overflowX:'auto' }} >
                    {scenarioes.map(item=>{
                        const { id, name } = item;
                        const status = currentScenario.id===id;
                        const backgroundColor = status?dark:softWhite;
                        const color = status?white:dark
                        return  <div onClick={()=>{setCurrentScenario(item);setCurrentFlow([])}} style={{ width:'200px', display:'flex', justifyContent:'space-between', backgroundColor, color, margin:10, padding:10, cursor:'pointer', borderRadius:20 }} >
                                    <i onClick={()=>{openAddCard({ id:"", level:0, cardId:'' });setCurrentScenario(item)}} class="bi bi-arrow-down-left"></i>{name}<i onClick={()=>{openScenario(item)}} class="bi bi-pencil"></i><i onClick={()=>{setAlert_Modal({ status:true, content:`ลบ ${name}`, onClick:()=>{setAlert_Modal(initialAlert);deleteScenario(id)}, variant:'danger'})}} class="bi bi-trash3"></i>
                                </div>
                    })}
                </div>
      
                <div style={{ display:'flex', overflowX:'auto' }} >
                        {cases.filter(a=>a.level===1).map(item=>{
                            const { id, cardId } = item;
                            const { name, type } = cardMaps.get(cardId)
                            const status = currentFlow.includes(id);
                            const backgroundColor = status?dark:softWhite;
                            const color = status?white:dark
                            return  <div onClick={()=>{setCurrentFlow([id])}} style={{ minWidth:'200px', display:'flex', justifyContent:'space-between', backgroundColor, color, margin:10, padding:10, cursor:'pointer', borderRadius:20 }} >
                                        <i onClick={()=>{openAddCard({ id, level:1, cardId })}} class="bi bi-arrow-down-left"></i>{name}<i onClick={()=>{openRemoveCard({ id, level:1, cardId })}} class="bi bi-trash3"></i>
                                    </div>
                        })}
                    </div>
                
                {currentFlow.map((item,index)=>{
                    const thisCards = cases.filter(a=>a.rootId===item);
                    if(thisCards.length===0){
                        return null
                    };
                    return <Row>
                            <div style={{ display:'flex', overflowX:'auto' }} >
                                {thisCards.map(item=>{
                                    const { cardId, id } = item;
                                    const { name, type, content, link  } = cardMaps.get(cardId)
                                    const status = currentFlow.includes(id);
                                    const backgroundColor = status?(colorWithTypes[type]||dark):softWhite;
                                    const color = status?white:dark
                                    return  <div onDoubleClick={()=>{openCard(cardMaps.get(cardId))}} onClick={()=>{handleFlow(index+1,id)}} style={{ minWidth:'200px', backgroundColor, color, margin:10, padding:10, cursor:'pointer', borderRadius:20 }} >
                                                
                                                <div style={{ display:'flex', justifyContent:'space-between',  }} >
                                                    <i onClick={()=>{openAddCard(item)}} class="bi bi-arrow-down-left"></i>{name}<i onClick={()=>{openRemoveCard(item)}} class="bi bi-trash3"></i>
                                                </div>
                                                {type==='question'
                                                    ?<div onClick={() => {navigator.clipboard.writeText(name);toastSuccess('คัดลอกแล้ว')}} style={{ paddingLeft:10, paddingRight:10, backgroundColor:six, borderRadius:20, display:'flex', justifyContent:'center', color:dark}} >
                                                        คัดลอก
                                                    </div>
                                                    :null
                                                }
                                                {/* {type==='answer'
                                                    ?<div onClick={() => {navigator.clipboard.writeText(content);toastSuccess('คัดลอกคำตอบแล้ว')}} style={{ paddingLeft:10, paddingRight:10, backgroundColor:five, borderRadius:20, display:'flex', justifyContent:'center', color:dark}} >
                                                        คัดลอกคำตอบ
                                                    </div>
                                                    :null
                                                }
                                                {type==='answer'&&content
                                                    ?<h6 style={{ fontSize:10, color:dark}} >{content}</h6>
                                                    :null
                                                }
                                                
                                                {type==='answer' && link
                                                    ?<div onClick={() => {navigator.clipboard.writeText(link);toastSuccess('คัดลอกลิงค์แล้ว')}} style={{ paddingLeft:10, paddingRight:10, backgroundColor:two, borderRadius:20, display:'flex', justifyContent:'center', color:dark}} >
                                                        คัดลอกลิงค์
                                                    </div>
                                                    :null
                                                } */}
                                                {type==='solution'
                                                    ?<div onClick={() => {navigator.clipboard.writeText(content);toastSuccess('คัดลอกคำตอบแล้ว')}} style={{ paddingLeft:10, paddingRight:10, backgroundColor:five, borderRadius:20, display:'flex', justifyContent:'center', color:dark}} >
                                                        คัดลอกคำตอบ
                                                    </div>
                                                    :null
                                                }
                                            </div>
                                })}
                            </div>
                            </Row>
                })}
            </Col>
            <Col md='6' sm='12' >
            <SearchAndBottom {...{ search, setSearch, placeholder:'ค้นหาด้วยชื่อ', text:'+ เพิ่ม Card', exportToXlsx:()=>{openCard({})}  }} />
            <Table striped bordered hover responsive  variant="light"   >
                    <thead  >
                        <tr >
                            <th style={styles.container2}>No.</th>
                            <th style={styles.container3}>รายการ</th>
                            <th style={styles.container3}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody  >
                        {currentDisplay.map((item, index) => {
                            const { id, name } = item;
                            return <tr key={id}   >
                                        <td style={styles.container4}>{index+1}.</td>
                                        <td >{name}</td>
                                        <td style={styles.container4}>
                                            <OneButton {...{ text:'จัดการ', submit:()=>{openCard(item)}, variant:'warning' }} />
                                        </td>
                                    </tr>
                        })}
                    </tbody>
                </Table>
            </Col>
        </Row>

    </div>
  );
};

const styles = {
    container2 : {
        width:'10%', minWidth:'70px', textAlign:'center'
    },
    container3 : {
        widtd:'30%', minWidth:'150px', textAlign:'center'
    },
    container4 : {
        textAlign:'center'
    }
}

export default DiagnosisScreen;