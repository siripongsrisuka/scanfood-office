import React, { useMemo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stringFullDate } from "../Utility/dateTime";
import DemoBar from "./DemoBar";
import { colorIndex, colors, initialPackage } from "../configs";
import MasterCheckBox from "./MasterCheckBox";
import { updateDemo } from "../redux/careSlice";
import { formatCurrency, formatCurrency2, summary } from "../Utility/function";
import { db } from "../db/firestore";
import { Col, Row } from "react-bootstrap";
import { Button } from "rsuite";
import FloatingArea from "./FloatingArea";

const { ten, darkGray, softWhite, softGray, white, one, five, green } = colors;


function DemoPart3() {
    const dispatch = useDispatch()
    const { demo } = useSelector(state=>state.care);
    const [hardwares, setHardwares] = useState([]);

    const { name, province, tel, shopName, staffTakeOrder, staffRight,
      kitchenAmount, shift, vat, channels, promotions, payments, journey,
      table, tableAmount, staffNationality, customerNationality, endDate,
      posUsed, oldPos, posDevice, printerDevice, workingTime, network, shopType,
      currentPackage, currentHardware, vatQuotation, quoteNote
     } = demo;

    const price = useMemo(()=>{
        return vatQuotation
            ?summary([...currentHardware,...currentPackage],'net')*1.07
            :summary([...currentHardware,...currentPackage],'net')
    },[currentHardware,currentPackage,vatQuotation])

    useEffect(()=>{
        fetchHardware()
    },[]);

    async function fetchHardware(){
        await db.collection('admin').doc('hardware').get().then((doc)=>{
            if(doc.exists){
                setHardwares(doc.data().value)
            }
        })
    }

     const { thisPackage } = useMemo(()=>{
        let table = '20'
        if(tableAmount){
            if(tableAmount>50){
                table = '100'
            } else if(tableAmount>20){
                table = '50'
            } else {
                table='20'
            }
        }
        return {
            thisPackage:initialPackage.filter(a=>a.table===table).map((item,index)=>({...item,color:colorIndex[index]}))
        }
     },[])

     function handlePackage(item){
        if(currentPackage.some(a=>a.id===item.id)){
            dispatch(updateDemo({...demo,currentPackage:currentPackage.filter(a=>a.id!==item.id)}))
        } else {
            dispatch(updateDemo({...demo,currentPackage:[...currentPackage,item]}))
        }
     };


     function handleHardware({ item, type }){
        switch (type) {
            case 'plus':
                dispatch(updateDemo({...demo,currentHardware:currentHardware.map(a=>{
                    return a.id===item.id
                        ?{...a,qty:a.qty+1,net:a.net+Number(a.price)}
                        :a
                })}))
                break;
            case 'minus':
                dispatch(updateDemo({...demo,currentHardware:currentHardware.map(a=>{
                    return a.id===item.id
                        ?{...a,qty:a.qty-1,net:a.net-Number(a.price)}
                        :a
                }).filter(b=>b.qty>0)}))
                break;
            case 'add':
                dispatch(updateDemo({...demo,currentHardware:[...currentHardware,{...item,net:Number(item.price),qty:1}]}))
            break;
        
            default:
                break;
        }
     }
    
    function handleQuotation(){
        dispatch(updateDemo({...demo,vatQuotation:!vatQuotation}))
    };

    function handleChange(event){
        event.preventDefault();
        const { name, value } = event.target;
        const newDemo = {...demo,[name]:value}
        dispatch(updateDemo(newDemo))
    };

  return (
    <div style={{padding:'1rem'}} >
        <DemoBar price={price} />
        <h6>ใบกำกับภาษี</h6>
        <MasterCheckBox
            status={vatQuotation}
            color={vatQuotation?one:ten}
            value={`ต้องการใบกำกับภาษี`}
            onClick={handleQuotation}
        />
        
        <div  >
            <h6>ค่าระบบรายปี : {formatCurrency2(summary(currentPackage,'price'))}</h6>
            {thisPackage.map((item)=>{
                const { color, id, name, price } = item;
                let status = currentPackage.some(a=>a.id===id)
                return <MasterCheckBox
                            key={id}
                            status={status}
                            color={status?color:ten}
                            value={`${name}[${formatCurrency2(price)}]`}
                            onClick={()=>{handlePackage({...item,net:price,qty:1})}}
                        />
            })}
        </div>
        <br/>
        <div>
            <h6>อุปกรณ์เท่าที่จำเป็น : {formatCurrency2(summary(currentHardware,'net'))}</h6>
            <Row>
                {hardwares.map((item,index)=>{
                    const { imageId, price, detail, name, id } = item;
                    let { qty } = currentHardware.find(a=>a.id===id) || { qty:''}
                    return <Col key={index} lg='4' md='6' sm='12' style={{marginBottom:'1rem'}} >
                                <div 
                                style={{
                                    border: `1px solid ${softWhite}`, 
                                    backgroundColor: white, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    // justifyContent: 'center',
                                    padding: '10px', // optional padding
                                    height:'100%'
                                }} >
                                    <img style={{width:'150px'}} src={imageId} />
                                    <div style={{ alignSelf: 'flex-start', marginTop: '10px',flex:1,justifyContent:'space-between',display:'flex',flexDirection:'column',width:'100%'}}>
                                        <div style={{flex:1}} >
                                            <h5  >{name}</h5>
                                            <h6 
                                                style={{ lineHeight: '1.8' }}
                                                dangerouslySetInnerHTML={{ __html: detail.replace(/\n/g, '<br />') }} ></h6>
                                        </div>
                                        <React.Fragment>
                                            <h6 style={{color:one}} >จัดส่งสินค้าภายใน 5 วัน</h6>
                                            <h5 style={{color:green}} >{formatCurrency2(price)}</h5>
                                            {qty
                                                ?<div style={{display:'flex',justifyContent:'space-between',width:'150px',alignSelf:'center',alignItems:'center',height:'40px'}} >
                                                    <i onClick={()=>{handleHardware({ item, type:'minus'})}} class="bi bi-dash-circle" style={{fontSize:30,cursor:'pointer'}} ></i>
                                                    {qty}
                                                    <i onClick={()=>{handleHardware({ item, type:'plus'})}} class="bi bi-plus-circle" style={{fontSize:30,cursor:'pointer'}} ></i>
                                                </div>
                                                :<Button onClick={()=>{handleHardware({ item, type:'add'})}} color='green' appearance="primary" style={{height:'40px'}} >หยิบใส่ตะกร้า</Button>
                                            }
                                        </React.Fragment>
                                    </div>
                                </div>
                            </Col>
                })}
            </Row>
            
            
        </div>
        <div>
            <FloatingArea
                name="quoteNote"
                placeholder="Quotation โน๊ต"
                value={quoteNote}
                onChange={handleChange}
            />
        </div>
    </div>
  );
}


export default DemoPart3;