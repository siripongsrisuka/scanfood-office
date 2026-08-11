import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { Modal_ContactValue, Modal_FacebookLead, Modal_FlatlistSelected, Modal_FlatListTwoColumn, Modal_Loading, Modal_OneInput } from "../modal";
import { firstDayOfMonth, setTimeEnd, setTimeStart, stringDateTimeReceipt, stringYMDHMS3 } from "../Utility/dateTime";
import { db } from "../db/firestore";
import { FacebookSearchBar, OneButton, SearchControl } from "../components";
import { formatTime, isGodIt, normalizeThaiPhone, searchMultiFunction, toastSuccess } from "../Utility/function";
import { normalSort } from "../Utility/sort";
import {
  Panel,
  Stack,
  Input,
  InputGroup,
  SelectPicker,
  DatePicker,
  Button,
} from "rsuite";
import SearchIcon from "@rsuite/icons/Search";
import { scanfoodAPI } from "../Utility/api";
import { initialLead } from "../configs";
import { MdLteMobiledata } from "react-icons/md";
import { id, ta } from "date-fns/locale";
import { set } from "date-fns";

const leadOptions = [
    { label:"ทั้งหมด", value:"all" },
    { label:"ยังไม่ติดต่อ", value:"registered" },
    { label:"กำลังติดต่อ", value:"in_progress" },
    { label:"ติดต่อแล้ว", value:"contacted" },
    { label:"ซื้อแล้ว", value:"purchased" },
    { label:"ไม่สนใจ", value:"not_interested" },
];

const timelineMap = {
    'register':'📝',
    'in_progress':'📞',
    'contact':'✅',
    'purchased':'💰',
    'not_interested':'❌'
}

const timelineOptions = [
    { name:"กำลังติดต่อ", id:"in_progress" },
    { name:"ติดต่อแล้ว", id:"contacted" },
];

const tagOptions = [
    { name:"เปิดร้านใหม่ ไม่พร้อมซื้ออุปกรณ์", id:"po", },
    { name:"ปรึกษาหุ้นส่วน/หุ้นส่วนหลายคน", id:"laalaa", },
    { name:"สนใจซื้อขาด", id:"dispy", },
    { name:"สนใจเช่า/รายเดือน/รายวัน", id:"tinky-winky", },
    { name:"สี่ข้อก็น่าจะพอแล้ว", id:"sun", },
];

const leadStatusOptions = [
    { name:"Cold", id:"cold" },
    { name:"Warm", id:"warm" },
    { name:"Hot", id:"hot" },
    { name:"ไม่มีคุณภาพ", id:"dog" },
];

const imageId = 'https://firebasestorage.googleapis.com/v0/b/shopchamp-restaurant.appspot.com/o/bank%2F6224286624665767378.jpg?alt=media&token=641c6da4-dce9-4faf-8a52-3550012be1ee'
function FacebookLeadScreen() {
    const { office:{ humanRight } } = useSelector(state=>state.office);
    const { profile:{ name:profileName, id:profileId, saleManagerTeam } } = useSelector(state=>state.profile);
    const { sales, saleMap, salemanager } = useMemo(()=>{
        // return humanRight.filter(a=>a.team)
        const sales = humanRight.filter(a=>a.team && !a.saleManagerTeam)
        const salemanager = humanRight.filter(a=>a.team && a.saleManagerTeam)
        return {
            sales:[...sales,{ id:'', name:'ไม่ใส่ใจ', team:'', imageId }],
            saleMap:new Map(sales.map(a=>[a.id, a.name])),
            salemanager
        }
    },[humanRight]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [masterDisplay, setMasterDisplay] = useState([]);
    const [currentDisplay, setCurrentDisplay] = useState([]); // leads ที่ผ่านการ filter แล้ว
    const [search, setSearch] = useState('');
    const [currentSale, setCurrentSale] = useState('all'); // 'all' หรือ id ของเซล
    const [currentStatus, setCurrentStatus] = useState('all'); // 'all' หรือ not_contacted, in_progress, contacted, purchased, not_interested
    const [contact_Modal, setContact_Modal] = useState(false);
    const [lead, setLead] = useState(initialLead);
    const { id:leadId } = lead;
    const [timeline_Modal, setTimeline_Modal] = useState(false);
    const [lead_Modal, setLead_Modal] = useState(false);    
    const [memo_Modal, setMemo_Modal] = useState(false);
    const [currentMemo, setCurrentMemo] = useState('');
    const [leadStatus_Modal, setLeadStatus_Modal] = useState(false);
    const [currentLeadStatus, setCurrentLeadStatus] = useState('all');
    const [currentTag, setCurrentTag] = useState('all');


    const { statDisplay, channel, leadStatusDisplay, tagDisplay } = useMemo(()=>{
        const stat = leadOptions.map(option=>{
            let count = currentSale==='all' ? masterDisplay.filter(item=>item.status === option.value).length : masterDisplay.filter(item=>item.status === option.value && item.saleId === currentSale).length;
            if(option.value === 'all') count = currentSale==='all' ? masterDisplay.length : masterDisplay.filter(item=>item.saleId === currentSale).length;
            const percent = currentSale==='all' ? (count/masterDisplay.length)*100 : (count/masterDisplay.filter(item=>item.saleId === currentSale).length)*100;
            return {
                ...option,
                count,
                percent
            }
        })
        //leadStatusOptions
        const contactedStatus = masterDisplay.filter(item=>item.status === 'contacted');
        const leadStatusDisplay = [{ id:"all", name:"ทั้งหมด" },...leadStatusOptions].map(option=>{
            let count = currentSale==='all' ? contactedStatus.filter(item=>item.leadStatus === option.id).length : contactedStatus.filter(item=>item.leadStatus === option.id && item.saleId === currentSale).length;
            if(option.id === 'all') count = currentSale==='all' ? contactedStatus.length : contactedStatus.filter(item=>item.saleId === currentSale).length;
            const percent = currentSale==='all' ? (count/contactedStatus.length)*100 : (count/contactedStatus.filter(item=>item.saleId === currentSale).length)*100;

            return {
                ...option,
                count,
                percent
            }
        });

        const tagDisplay = [{ id:"all", name:"ทั้งหมด" },...tagOptions].map(option=>{
            let count = currentSale==='all' ? contactedStatus.filter(item=>item.tag?.includes(option.id)).length : contactedStatus.filter(item=>item.tag?.includes(option.id) && item.saleId === currentSale).length;
            if(option.id === 'all') count = currentSale==='all' ? contactedStatus.filter(item=>item.tag?.length>0).length : contactedStatus.filter(item=>item.tag?.length>0 && item.saleId === currentSale).length;
            const percent = currentSale==='all' ? (count/contactedStatus.length)*100 : (count/contactedStatus.filter(item=>item.saleId === currentSale).length)*100;
            return {
                ...option,
                count,
                percent
            }
        })

        const channel = [
            { id:'instantForm', length: masterDisplay.filter(item=>item.source === 'facebook_instant_form').length, name:'I' },
            { id:'facebook_engagement', length: masterDisplay.filter(item=>item.source === 'facebook_engagement').length, name:'M' },
            { id:'line_engagement', length: masterDisplay.filter(item=>item.source === 'line_engagement').length, name:'L' },
            { id:'app_engagement', length: masterDisplay.filter(item=>item.source === 'app_engagement').length, name:'A' },
            { id:'facebook_call', length: masterDisplay.filter(item=>item.source === 'facebook_call').length, name:'C' },
        ]
        return {
            statDisplay:stat,
            channel,
            leadStatusDisplay,
            tagDisplay
        };
    },[masterDisplay,currentSale])

    const { score } = useMemo(()=>{
        let score = sales.map(item=>{
            return { 
                ...item, 
                score: masterDisplay.filter(a=>a.saleId === item.id).length,
                 register: masterDisplay.filter(a=>a.saleId === item.id && a.status === 'registered').length,
                 in_progress: masterDisplay.filter(a=>a.saleId === item.id && a.status === 'in_progress').length,
                 contact: masterDisplay.filter(a=>a.saleId === item.id && a.status === 'contacted').length,
                 purchased: masterDisplay.filter(a=>a.saleId === item.id && a.status === 'purchased').length,
                 not_interested: masterDisplay.filter(a=>a.saleId === item.id && a.status === 'not_interested').length,
            }
        });

            score = normalSort('score', score);
            return { score }
    },[sales,masterDisplay])
    
    useEffect(()=>{
        let filtered = masterDisplay;
        if(currentStatus!=='all'){
            filtered = filtered.filter(item=>item.status === currentStatus);
        }
        if(currentSale!=='all'){
            filtered = filtered.filter(item=>item.saleId === currentSale);
        }
        if(currentLeadStatus!=='all'){
            filtered = filtered.filter(item=>item.leadStatus === currentLeadStatus);
        }
        if(currentTag!=='all'){
            filtered = filtered.filter(item=>item.tag?.includes(currentTag));
        }


        if(search){
            filtered = searchMultiFunction(filtered,search, ['fullName', 'phone', 'email', 'leadId']);
        }
        setCurrentDisplay(filtered);
    },[masterDisplay, currentStatus, currentSale, search, currentLeadStatus, currentTag])

    useEffect(()=>{
        const today = new Date();
        const firstDay = firstDayOfMonth(today);
        setStartDate(firstDay);
        setEndDate(today);
        handleFetchLeads(firstDay, today);
    },[]);

    async function handleFetchLeads(startDate, endDate){
        setContact_Modal(false);
        setLoading(true);
        try {
            const query = db.collection("leads")
                .where("createdAt", ">=", setTimeStart(startDate))
                .where("createdAt", "<=", setTimeEnd(endDate))
                // .limit(1);
            const snapshot = await query.get();
            const leads = snapshot.docs.map(doc=>{
                const { createdTime, phone, timeline = [], ...rest } = doc.data()
                return {
                    saleId:'', // เซลล์ที่รับผิดชอบ (ถ้ามี)
                    note:'', // หมายเหตุต่างๆจากเซลล์
                    ...rest,
                    id:doc.id,
                    createdTime:formatTime(createdTime),
                    phone:normalizeThaiPhone(phone),
                    timeline:timeline.map(a=>({...a,timestamp:formatTime(a.timestamp)}))
                }
            });
            setMasterDisplay(normalSort('createdTime', leads))
            toastSuccess('อัปเดตข้อมูลเรียบร้อย')
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    }


    async function handleConfirm({ id, value }){
        setContact_Modal(false)
        setLoading(true);
        try {
            const findSale = sales.find(sale=>sale.id === lead.saleId);
            if(!findSale) return alert('ไม่พบเซลล์ที่รับผิดชอบ กรุณาเลือกเซลล์ก่อน')
            const team = findSale?findSale.team:'';
            const { fullName, phone, saleId } = lead;
            const payload = {
                channel: "facebook",
                name:fullName,
                process:'3',
                status:'waiting',
                storeSize:'',
                tel:phone,
                id:'',
                profileId:saleId,
                profileName:findSale?findSale.name:'ไม่มีเซลล์',
                team,
                billDate:stringYMDHMS3(new Date()),
            }
            const response = await scanfoodAPI.post(
                "/meta/tracking/contactLead",
                {
                    leadId,
                    value,
                    payload
                }
            );
        
            setMasterDisplay(prev=>{
                const newLeads = prev.map(lead=>{
                    if(lead.id === leadId){
                        return {
                            ...lead,
                            contactValue:value,
                            status:'contacted',
                            timeline:[...lead.timeline, { type:'contacted', timestamp:new Date() }]
                        }
                    }
                    return lead;
                })
                return normalSort('createdTime', newLeads);
            })
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    
    }

    async function updateTimeline(lead){
        if(!lead.saleId) return alert('ยังไม่มีเซลล์ assigned กรุณาเลือกเซลล์ก่อน')
        if(lead.status==='contacted') return alert('ไม่สามารถแก้ไขสถานะได้ เนื่องจากติดต่อแล้ว')
        setLead(lead);
        setTimeline_Modal(true);
        // const { status } = lead;
    };

    async function handleTimelineAction(value){
        setTimeline_Modal(false);
        const ok = window.confirm(`ยืนยันสถานะ : ${value.name} หรือไม่?`)
        if(!ok) return;
        if(value.id === 'contacted'){
            setContact_Modal(true);
            return;
        }

        // โทรแล้วไม่ติด
        const leadRef = db.collection("leads").doc(leadId);
        try {
            const timeline = await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(leadRef);
                if (!doc.exists) {
                    throw new Error("Lead does not exist!");
                }
                const currentTimeline = doc.data().timeline || [];
                const newTimelineEntry = {
                    type: value.id,
                    timestamp: new Date()
                };
                const timeline = [...currentTimeline, newTimelineEntry];
                transaction.update(leadRef, {
                    status: value.id,
                    timeline: timeline
                });
                return timeline;
            });
            const fomrattedTimeline = timeline.map(a=>({...a,timestamp:formatTime(a.timestamp)}))
            setMasterDisplay(prev=>{
                const newLeads = prev.map(item=>{
                    if(item.id === lead.id){
                        return {
                            ...item,
                            status:value.id,
                            timeline:fomrattedTimeline
                        }
                    }
                    return item;
                })
                return normalSort('createdTime', newLeads);
            })
            toastSuccess('อัปเดตสถานะเรียบร้อย')
        } catch (error) {
            alert(error);
        }

    };
    const [sale_Modal, setSale_Modal] = useState(false);
    function openSale(item){
        if(item.saleId && !(saleManagerTeam && ['registered','in_progress'].includes(item.status)))return alert('ไม่สามารถแก้ไขเซลล์ได้ เนื่องจากมีเซลล์อยู่แล้ว')
        setLead(item);
        setSale_Modal(true);
    }


    async function handleAssignSale({ id:saleId }){
        setSale_Modal(false);
        setLoading(true);
        try {

            await db.runTransaction(async (transaction) => {
                const leadRef = db.collection("leads").doc(leadId);

                const doc = await transaction.get(leadRef);

                if (!doc.exists) {
                    throw new Error("Lead does not exist!");
                };
                if(doc.data().saleId && !(saleManagerTeam && ['registered','in_progress'].includes(doc.data().status))){
                    throw new Error("Lead นี้มีเซลล์อยู่แล้ว ไม่สามารถเปลี่ยนแปลงได้");
                }

                transaction.update(leadRef, {
                    saleId
                });
            });

            setMasterDisplay(prev=>{
                const newLeads = prev.map(item=>{
                    if(item.id === leadId){
                        return {
                            ...item,
                            saleId
                        }
                    }
                    return item;
                })
                return normalSort('createdTime', newLeads);
            })
            toastSuccess('อัปเดตเซลล์เรียบร้อย')
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    async function handleLead(){
        setLead_Modal(false);
        setLoading(true);
        const timestamp = new Date();
        try {
            const payload= {
                ...lead,
                timeline:[{ type:'register', timestamp }],
                createdTime: timestamp,
                createdAt: timestamp,
                status:'registered',
                createdBy:profileName,
                // source:'facebook_engagement', // เปลี่ยนไปให้เลือกได้ว่าจะเอา lead มาจากไหน (facebook, line)
                businessSize:`ขนาด ${lead.businessSize} โต๊ะ`
            }
            const leadRef = db.collection("leads").doc();
            await leadRef.set(payload);
            payload.id = leadRef.id;
            setMasterDisplay(prev=>normalSort('createdTime', [payload, ...prev]))
            setLead(initialLead)
            toastSuccess('เพิ่ม lead แล้วเรียบร้อย')
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    function openMemo(item){
        if(!item.saleId) return alert('ยังไม่มีเซลล์ assigned กรุณาเลือกเซลล์ก่อน')
        if(profileId !== item.saleId && !isGodIt(profileId)) return alert('ไม่สามารถแก้ไข memo ได้ เนื่องจากไม่ใช่เซลล์ที่รับผิดชอบ')
        setLead(item);
        setMemo_Modal(true);
        setCurrentMemo(item?.note);
    }


    async function handleMemo(){
        setMemo_Modal(false);
        const { id:leadId } = lead;
        setLoading(true);
        try {
            const leadRef = db.collection("leads").doc(leadId);
            const updatedField = {
                note:currentMemo
            };
            await leadRef.update(updatedField);
            setMasterDisplay(prev=>{
                const newLeads = prev.map(item=>{
                    if(item.id === leadId){
                        return {
                            ...item,
                            ...updatedField
                        }
                    }
                    return item;
                })
                return normalSort('createdTime', newLeads);
            })
            toastSuccess('อัปเดต memo เรียบร้อย')
            
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
            setCurrentMemo('')
        }
    };


    function openLeadStatus(item){
        if(item.status !== 'contacted') return alert('สามารถแก้ไขสถานะได้เฉพาะ lead ที่ติดต่อแล้วเท่านั้น')
        if(profileId !== 'ebhtbWII6TUanBMqS7bBHIQ1aws2') return alert('คุณไม่ใช่คุณหลุยส์ ไม่สามารถแก้ไขสถานะได้')
        setLead(item);
        setLeadStatus_Modal(true);
    };

    async function handleLeadStatus({ id:leadStatus }){
        setLeadStatus_Modal(false);
        const { id:leadId } = lead;
        setLoading(true);
        try {
            const leadRef = db.collection("leads").doc(leadId);
            const updatedField = {
                leadStatus
            };
            await leadRef.update(updatedField);
            setMasterDisplay(prev=>{
                const newLeads = prev.map(item=>{
                    if(item.id === leadId){
                        return {
                            ...item,
                            ...updatedField
                        }
                    }
                    return item;
                })
                return normalSort('createdTime', newLeads);
            })
            toastSuccess('อัปเดตสถานะ lead เรียบร้อย')
            
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    const [tag_Modal, setTag_Modal] = useState(false);
    const [selected, setSelected] = useState([]);
    function openTag(item){
        if(item.status !== 'contacted') return alert('สามารถแก้ไขสถานะได้เฉพาะ lead ที่ติดต่อแล้วเท่านั้น')
        if(profileId !== 'ebhtbWII6TUanBMqS7bBHIQ1aws2') return alert('คุณไม่ใช่คุณหลุยส์ ไม่สามารถแก้ไขสถานะได้อีกเหมือนกัน')
        setLead(item);
        setTag_Modal(true);
        setSelected(item.tag || []);
    }

     async function submitSelected(){
        setTag_Modal(false);
        const { id:leadId } = lead;
        setLoading(true);
        try {
            const leadRef = db.collection("leads").doc(leadId);
            const updatedField = {
                tag:selected
            };
            await leadRef.update(updatedField);
            setMasterDisplay(prev=>{
                const newLeads = prev.map(item=>{
                    if(item.id === leadId){
                        return {
                            ...item,
                            ...updatedField
                        }
                    }
                    return item;
                })
                return normalSort('createdTime', newLeads);
            })
            toastSuccess('อัปเดต tag เรียบร้อย')
            
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    function handleSelected({ id }){
        if(selected.includes(id)){
            setSelected(prev=>prev.filter(i=>i!==id))
        } else {
            setSelected(prev=>[...prev, id])
        }
    }




  return (
    <div style={styles.container} >
        <Modal_FlatlistSelected
            show={tag_Modal}
            onHide={()=>{setTag_Modal(false);setSelected([])}}
            display={tagOptions}
            onClick={handleSelected}
            selected={selected}
            submit={submitSelected}

        />
        <Modal_FlatListTwoColumn
            header={'เลือก Lead Status'}
            show={leadStatus_Modal}
            onHide={()=>{setLeadStatus_Modal(false)}}
            value={leadStatusOptions}
            onClick={handleLeadStatus}
        />
        <Modal_OneInput
            show={memo_Modal}
            header={`Memo`}
            onHide={()=>{setMemo_Modal(false);setCurrentMemo('')}}
            value={currentMemo}
            onClick={handleMemo}
            placeholder='ใส่ memo'
            onChange={(value)=>{setCurrentMemo(value)}}
            area={true}
        />
        <div style={{ display:'flex' }} >
                 <h1>Leads</h1>
        <OneButton {...{ text:'เพิ่ม Lead', submit:()=>{setLead_Modal(true)} }} />

        </div>
           <FacebookSearchBar
            startDate={startDate}
            endDate={endDate}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
            search={() => handleFetchLeads(startDate, endDate)}
        />
        <div style={{ display:'flex', padding:5, paddingBottom:0, overflowX:'auto' }} >
                {score.map((item,index)=>{
                    const active = item.id === currentSale;
                    return <div onClick={()=>{setCurrentSale(item.id||'all')}} key={index} style={{ marginRight: '3px', textAlign: 'center', minWidth:'60px', cursor:'pointer' }} >
                             <img
                                style={{
                                    width: '50px',
                                    borderRadius: '50%',
                                    filter: active ? 'grayscale(0%)' : 'grayscale(100%)'
                                }}
                                src={item.imageId}
                            />
                            <p style={{ padding:0, margin:0}} >{item.name} : {item.score}</p>
                            <p style={{ padding:0, margin:0}} >{timelineMap['register']} | {timelineMap['in_progress']} | {timelineMap['contact']} | {timelineMap['purchased']}</p>
                            <p style={{ padding:0, margin:0}} >{item.register} | {item.in_progress} | {item.contact} | {item.purchased}</p>
                    </div>
                })}
        </div>
        <div style={{ display:'flex', padding:5, paddingBottom:0, overflowX:'auto' }} >
                {leadStatusDisplay.map((item,index)=>{
                    const active = item.id === currentLeadStatus;
                    return <div onClick={()=>{setCurrentLeadStatus(item.id||'all')}} key={index} style={{ marginRight: '3px', textAlign: 'center', minWidth:'100px', cursor:'pointer' }} >
                             <img
                                style={{
                                    width: '50px',
                                    borderRadius: '50%',
                                    filter: active ? 'grayscale(0%)' : 'grayscale(100%)'
                                }}
                                src={`/${item.id}.png`}
                            />
                            <p style={{ padding:0, margin:0}} >{item.name} : {item.count}</p>
                    </div>
                })}
        </div>
   
        <div style={{ display:'flex', padding:5, paddingBottom:0, overflowX:'auto' }} >
                {tagDisplay.map((item,index)=>{
                    const active = item.id === currentTag;
                    return <div onClick={()=>{setCurrentTag(item.id||'all')}} key={index} style={{ marginRight: '3px', textAlign: 'center', minWidth:'60px', cursor:'pointer' }} >
                             <img
                                style={{
                                    width: '50px',
                                    borderRadius: '50%',
                                    filter: active ? 'grayscale(0%)' : 'grayscale(100%)'
                                }}
                                src={`/${item.id}.png`}
                            />
                            <p style={{ padding:0, margin:0}} >{item.name} : {item.count}</p>
                    </div>
                })}
        </div>
        <Modal_FacebookLead
            show={lead_Modal}
            onHide={()=>{setLead_Modal(false);setLead(initialLead)}}
            current={lead}
            setCurrent={setLead}
            submit={handleLead}
        />
        <Modal_FlatListTwoColumn
            header={'เลือก Lead Status'}
            show={timeline_Modal}
            onHide={()=>{setTimeline_Modal(false)}}
            value={timelineOptions}
            onClick={handleTimelineAction}
        />
        <Modal_FlatListTwoColumn
            header={'เลือกสถานะ'}
            show={timeline_Modal}
            onHide={()=>{setTimeline_Modal(false)}}
            value={timelineOptions}
            onClick={handleTimelineAction}
        />
        <Modal_FlatListTwoColumn
            header={'เลือกเซลล์'}
            show={sale_Modal}
            onHide={()=>{setSale_Modal(false)}}
            value={sales}
            onClick={handleAssignSale}
        />
        <Modal_Loading show={loading} />
        <Modal_ContactValue
            open={contact_Modal}
            onClose={() => setContact_Modal(false)}
            onConfirm={handleConfirm}
            initialLead={lead}
            loading={loading}
        />
     
        <div style={{ display:'flex', alignItems:'center' }} >
             <InputGroup inside style={styles.searchBox}>
            <InputGroup.Addon>
                <SearchIcon />
            </InputGroup.Addon>
            <Input
                value={search}
                onChange={setSearch}
                placeholder="ค้นหาชื่อ / ร้าน / เบอร์โทร / leadId"
            />
            </InputGroup>&emsp;
            <Form.Select 
                aria-label="Default select example" 
                value={currentStatus} 
                onChange={(event)=>{setCurrentStatus(event.target.value)}}
                style={{marginTop:'1rem',marginBottom:'1rem',width:'200px'}} 
            >
                {leadOptions.map(option=>(
                    <option key={option.value} value={option.value}>สถานะ : {option.label}</option>
                ))}
            </Form.Select>&emsp;
            <Form.Select 
                aria-label="Default select example" 
                value={currentSale} 
                onChange={(event)=>{setCurrentSale(event.target.value)}}
                style={{marginTop:'1rem',marginBottom:'1rem',width:'200px'}} 
            >
                <option value="all">เซล : ทั้งหมด</option>
                {sales.map(sale=>(
                    <option key={sale.id} value={sale.id}>เซล : {sale.name}</option>
                ))}
            </Form.Select>
            {channel.map(option=>(
                <div style={{ width: '3rem', cursor:'pointer', backgroundColor:'#f8f9fa', padding:10 }} >
                        {option.name} {option.length}
                    </div>
            ))}
            
        </div>
        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }} >
            {statDisplay.map(option=>{
                const isActive = currentStatus === option.value;
                return <Card key={option.value} onClick={()=>setCurrentStatus(option.value)} style={{ width: '12rem', cursor:'pointer', backgroundColor:isActive?'#FA8900':'#f8f9fa' }} >
                    <Card.Body>
                        <Card.Title>{option.label}</Card.Title>
                        <Card.Text>
                            {option.count} Leads ({option.percent.toFixed(2)}%)
                        </Card.Text>
                    </Card.Body>
                </Card>
            })}
        </div>


        <h6>ค้นพบ : {currentDisplay.length} รายการ</h6>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container2}>No.</th>
                <th style={styles.container5}>Lead</th>
                <th style={styles.container5}>สถานะ</th>
                <th style={styles.container3}>Timeline</th>
                <th style={styles.container3}>เซล</th>
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { tag = [], leadStatus = '', id, fullName, email, phone, contactPeriod, saleId = '', status, contactValue = '', purchaseValue = '', timeline = [], businessSize = '', source = '', note = '' } = item;
                const saleName = saleId?saleMap.get(saleId):'ยังไม่ระบุ';
                const leadStatusImage = leadStatus==='cold'?"/cold.png":leadStatus==='warm'?"/warm.png":leadStatus==='hot'?"/hot.png":leadStatus==='dog'?"/dog.png":"/cow.png";
                return <tr   key={id} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={{ position:'relative'}}  >
                                <h6>ชื่อ : {fullName}</h6>
                                <p style={{ padding:0, margin:0 }} >email : {email}</p>
                                <p style={{ padding:0, margin:0 }} >โทรศัพท์ : {phone}</p>
                                <p style={{ margin: 0 }}>
                                    ช่วงเวลาติดต่อ
                                <span
                                    style={{
                                    backgroundColor: '#FFF9C4',
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    marginRight: 6,
                                    fontWeight: 500
                                    }}
                                >
                                    {contactPeriod}
                                </span>
                                
                                </p>
                                <p style={{ padding:0, margin:0 }} >ขนาดธุรกิจ : {businessSize}</p>
                                <p style={{ padding:0, margin:0 }} >แหล่งที่มา : {source}</p>
                                {contactValue||purchaseValue
                                    ?<p style={{ margin: 0 }}>
                                        busket size
                                    <span
                                        style={{
                                        backgroundColor: '#7ff9cf',
                                        padding: '4px 8px',
                                        borderRadius: 6,
                                        marginRight: 6,
                                        fontWeight: 500
                                        }}
                                    >
                                        {purchaseValue?purchaseValue:contactValue}
                                    </span>
                                    
                                    </p>
                                    :null
                                }
                                <img onClick={()=>{openLeadStatus(item)}} style={{ width:'80px', borderRadius:'50px', position:'absolute',top:10, right:10, cursor:'pointer',opacity: 0.9   }} src={leadStatusImage} alt="My Image" />
                            </td>
                            <td  >
                                <div style={{ display:'flex', justifyContent:'space-between'}} >
                                    <p onClick={()=>{updateTimeline(item)}} style={{ cursor: 'pointer', padding:0, margin:0 }} >{status}<i class="bi bi-pen"></i></p>
                                    <p onClick={()=>{openTag(item)}} style={{ cursor: 'pointer', padding:0, margin:0 }} ><i class="bi bi-bookmark-heart"></i></p>
                                </div>
                                {tag.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                        {tag.map((t, i) => {
                                        const name = tagOptions.find(option => option.id === t)?.name || t;

                                        return (
                                            <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                background: '#e2efff',
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                            }}
                                            >
                                            <img
                                                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                                src={`/${t}.png`}
                                                alt={t}
                                            />
                                            <span style={{ fontSize: '0.85rem' }}>{name}</span>
                                            </div>
                                        );
                                        })}
                                    </div>
                                    )}

                                <Card
                                    style={{ marginTop: '0.5rem', padding: 5, cursor: 'pointer' }}
                                    onClick={() => { openMemo(item) }}
                                    >
                                    <p style={{ padding: 0, margin: 0, whiteSpace: 'pre-line' }}>
                                        <i className="bi bi-journal-bookmark-fill"></i>
                                        {' '}หมายเหตุ : {note || 'ไม่มี'}
                                    </p>
                                    </Card>

                                
                            </td>
                            <td >
                                {timeline.map((a,i)=>(
                                    <div key={i} >
                                        <p style={{ padding:0, margin:0 }} >{timelineMap[a.type]} : {stringDateTimeReceipt(a.timestamp)}</p>
                                    </div>
                                ))}
                            </td>
                            <td onClick={()=>{openSale(item)}}  style={styles.container4}>{saleName}<i class="bi bi-pen"></i></td>
                           
                        </tr>
            })}
            </tbody>
        </Table>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  },
  container2 : {
    width:'30px',
    textAlign:'center'
  },
  container3 : {
    minWidth:'150px',
    textAlign:'center'
  },
  container4 : {
    textAlign:'center'
  },
  container5 : {
    minWidth:'220px',
    textAlign:'center'
  },
  container6 : {
    minWidth:'200px',
    maxWidth:'200px'
  },
searchBox: {
    width: 360,
    maxWidth: "100%",
    maxHeight:'55px'
  },
}

export default FacebookLeadScreen;