import React, { useState, useEffect, forwardRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";

import { Modal_FlatlistSelected, Modal_FlatListTwoColumn } from "../modal";
import { provinces } from "../configs";
import { FloatingText, InputText, OneButton } from "../components";
import { updateDemo } from "../redux/careSlice";
import DatePicker from "react-datepicker";

const initialChannel = ['หน้าร้าน','โทรมาสั่ง','Grab','Lineman','FoodPanda','Robinhood','อื่นๆ'];

const initialPromotion = ['ไม่มีโปร','ลดรายสินค้า','ลดรายหมวดหมู่','ลดเป็นบาท','ลดเป็น%','ซับซ้อน'];

const initialPayment = ['เงินสด','แม่มณี','พร้อมเพย์กรอกยอดเอง','พร้อมเพย์กรอกอัตโนมัติ','อื่นๆ'];

const initialStaff = ['ไทย','เมียนมา','กัมพูชา','ลาว','เวียดนาม','จีน'];

const initialCustomer = ['ไทย','จีน','มาเลเซีย','อินเดีย','เกาหลีใต้','รัสเซีย','ลาว','ไต้หวัน','เวียนนาม','ญี่ปุ่น','สหรัฐ'];

const initialPos = ['foodstory','ocha','wongnai','slash','ezOrder','แสนดี','linko','bpos','storeHub','Buzzebees','คอมพิวเตอร์','อื่นๆ'];

const initialPosDevice = ['มือถือแอนดรอย','iphone','ipad','tablet','Sunmi 1 จอ','Sunmi 2 จอ','Sunmi เครื่องเล็ก','คอมพิวเตอร์','โน๊ตบุ๊ค']

const initialNetwork = ['ไม่มี','ไวไฟ','แลน','แลนและไวไฟ'];

const initialShopType = ['สตรีทฟู้ด','ร้านอาหารทั่วไป','คาเฟ่','บุฟเฟ่','ร้านอาหารขนาดใหญ่','เครื่องดื่ม','ฟู้ดทรัค']

function DemoPart1() {
    const dispatch = useDispatch();
    const { demo } = useSelector(state=>state.care)
    const [location_Modal, setLocation_Modal] = useState(false)
    const [masterData, setMasterData] = useState([]);
    const [selected_Modal, setSelected_Modal] = useState(false);
    const [selected ,setSelected] = useState([]);
    const [selectedType, setSelectedType] = useState('')


    const { ownerName, province, tel, storeName, staffTakeOrder, staffRight,
      kitchenAmount, shift, vat, channels, promotions, payments, journey,
      table, tableAmount, staffNationality, customerNationality, endDate,
      posUsed, oldPos, posDevice, printerDevice, workingTime, network, shopType
     } = demo;


    function handleLocation({ name }){
        setLocation_Modal(false)
        dispatch(updateDemo({...demo,province:name}))
    };

    function handleChange(event){
        event.preventDefault();
        const { name, value } = event.target;
        const newDemo = {...demo,[name]:value}
        dispatch(updateDemo(newDemo))
    };

    function handleSelected(value) {
      setSelected(selected => {
          const newSelected = new Set(selected);
          if (newSelected.has(value)) {
              newSelected.delete(value);
          } else {
              newSelected.add(value);
          }
          return Array.from(newSelected);
      });
    };

    function submitSelected(){
      setSelected_Modal(false)
      switch (selectedType) {
        case 'channel':
            dispatch(updateDemo({...demo,channels:selected}))
          break;
        case 'promotion':
            dispatch(updateDemo({...demo,promotions:selected}))
          break;
        case 'payment':
          dispatch(updateDemo({...demo,payments:selected}))
        break;
        case 'staff':
          dispatch(updateDemo({...demo,staffNationality:selected}))
        break;
        case 'customer':
          dispatch(updateDemo({...demo,customerNationality:selected}))
        break;
      
        default:
          break;
      }
    };

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
      <div style={styles.container} onClick={onClick} ref={ref}>
        {value}
      </div>
    ));

  return (
    <div id="google_translate_element" style={{padding:'1rem'}} >
        <Modal_FlatListTwoColumn
            header={'จังหวัด'}
            show={location_Modal}
            onHide={()=>{setLocation_Modal(false)}}
            value={masterData}
            onClick={handleLocation}
        />
        <Modal_FlatlistSelected
            show={selected_Modal}
            onHide={()=>{setSelected_Modal(false);setSelected([])}}
            display={masterData}
            onClick={handleSelected}
            selected={selected}
            submit={submitSelected}

        />
        {/* <h1>สรุปความต้องการ</h1> */}
        <Row>
          <Col lg='4' md='6' sm='12' >
            <FloatingText
              name={'ownerName'}
              placeholder="ชื่อลูกค้า"
              value={ownerName}
              onChange={handleChange}
            />
          </Col>
          <Col lg='4' md='6' sm='12' >
            <FloatingText
              name={'storeName'}
              placeholder="ชื่อร้าน"
              value={storeName}
              onChange={handleChange}
            />
          </Col>
          <Col lg='4' md='6' sm='12' >
            <FloatingText
              name={'tel'}
              placeholder="เบอร์โทร"
              value={tel}
              onChange={handleChange}
            />
          </Col>
          <Col lg='4' md='6' sm='12' >
            <Form.Select 
                aria-label="Default select example" 
                value={shopType} 
                onChange={(event)=>{dispatch(updateDemo({...demo,shopType:event.target.value}))}}
                style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
            >
              <option value='' disabled >เลือก shopType</option>
              {initialShopType.map((item,index)=>{
                return <option key={index} value={item} >{item}</option>
              })}
              
            </Form.Select>
          </Col>
          <Col lg='4' md='6' sm='12' >
            {province
                ?<Button style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}  variant="light" onClick={()=>{setLocation_Modal(true);setMasterData(provinces.map(a=>({...a,name:a.name_th})))}} >{province}</Button>
                :<Button style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}  variant="secondary" onClick={()=>{setLocation_Modal(true);setMasterData(provinces.map(a=>({...a,name:a.name_th})))}} >เลือก จังหวัด</Button>
            }
          </Col>
          <Col lg='4' md='6' sm='12' >
                <Form.Select 
                    aria-label="Default select example" 
                    value={posUsed} 
                    onChange={(event)=>{dispatch(updateDemo({...demo,posUsed:event.target.value==='true'}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}} 
                >
                  <option value={true}>1. เคยใช้งาน pos</option>
                  <option value={false}>1. ไม่เคยใช้งาน pos</option>
                </Form.Select>
                {posUsed
                    ?<Form.Select 
                          aria-label="Default select example" 
                          value={oldPos} 
                          onChange={(event)=>{dispatch(updateDemo({...demo,oldPos:event.target.value}))}}
                          style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                      >
                        <option value='' disabled >เลือก pos</option>
                        {initialPos.map((item,index)=>{
                          return <option key={index} value={item} >{item}</option>
                        })}
                        
                      </Form.Select>
                    :null
                }
                {oldPos
                    ?<React.Fragment>
                        <h6>วันหมดอายุ pos เดิม</h6>
                        <DatePicker
                          dateFormat="dd/MM/yyyy"
                          selected={endDate}
                          onChange={(date) => dispatch(updateDemo({...demo,endDate:date}))}
                          selectsEnd
                          customInput={<ExampleCustomInput />}
                          withPortal
                        />
                    </React.Fragment>
                    :null
                }
                
          </Col>
          <Col lg='4' md='6' sm='12' >
                <Form.Select 
                    aria-label="Default select example" 
                    value={table} 
                    onChange={(event)=>{dispatch(updateDemo({...demo,table:event.target.value}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                >
                  <option value='มีหน้าร้านและมีโต๊ะ' >2. มีหน้าร้านและมีโต๊ะ</option>
                  <option value='มีหน้าร้านแต่ไม่มีโต๊ะ' >2. มีหน้าร้านแต่ไม่มีโต๊ะ</option>
                  <option value='ไม่มีหน้าร้าน' >2. ไม่มีหน้าร้าน</option>
                </Form.Select>
                {table==='มีหน้าร้านและมีโต๊ะ'
                    ?<FloatingText
                      name={'tableAmount'}
                      placeholder="จำนวนโต๊ะ"
                      value={tableAmount}
                      onChange={handleChange}
                    />
                    :null
                }
          </Col>
          <Col lg='4' md='6' sm='12' >
                <Form.Select 
                    aria-label="Default select example" 
                    value={journey} 
                    onChange={(event)=>{dispatch(updateDemo({...demo,journey:event.target.value}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                >
                  <option value='กินก่อนจ่าย' >3. กินก่อนจ่าย</option>
                  <option value='จ่ายก่อนกิน' >3. จ่ายก่อนกิน</option>
                </Form.Select>
          </Col>
          <Col lg='4' md='6' sm='12' >
                <Form.Select 
                    aria-label="Default select example" 
                    value={staffRight} 
                    onChange={(event)=>{dispatch(updateDemo({...demo,staffRight:event.target.value==='true'}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                >
                  <option value={true}>4. แยกสิทธิ์พนักงาน</option>
                  <option value={false}>4. ไม่แยกสิทธิ์พนักงาน</option>
                </Form.Select>
          </Col>
          <Col lg='4' md='6' sm='12' >
                <Form.Select 
                    aria-label="Default select example" 
                    value={staffTakeOrder} 
                    onChange={(event)=>{dispatch(updateDemo({...demo,staffTakeOrder:event.target.value==='true'}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                >
                  <option value={true}>5. ต้องการให้พนักงานรับออเดอร์</option>
                  <option value={false}>5. ไม่ต้องการให้พนักงานรับออเดอร์</option>
                </Form.Select>
          </Col>
          <Col lg='4' md='6' sm='12' >
            <p style={{margin:0}} >6. ภาษาพนักงาน</p>
            {staffNationality && staffNationality.length>0
                ?<Button style={{marginBottom:'1rem',width:'100%'}}  variant="light" onClick={()=>{setSelected_Modal(true);setMasterData(initialStaff);setSelectedType('staff');setSelected(staffNationality)}} >{staffNationality.join('/')}</Button>
                :<Button style={{marginBottom:'1rem',width:'100%'}}  variant="secondary" onClick={()=>{setSelected_Modal(true);setMasterData(initialStaff);setSelectedType('staff');setSelected(staffNationality)}} >เลือก ภาษาพนักงาน</Button>
            }
          </Col>
          <Col lg='4' md='6' sm='12' >
            <p style={{margin:0}} >7. ภาษาลูกค้า</p>
            {customerNationality && customerNationality.length>0
                ?<Button style={{marginBottom:'1rem',width:'100%'}}  variant="light" onClick={()=>{setSelected_Modal(true);setMasterData(initialCustomer);setSelectedType('customer');setSelected(customerNationality)}} >{customerNationality.join('/')}</Button>
                :<Button style={{marginBottom:'1rem',width:'100%'}}  variant="secondary" onClick={()=>{setSelected_Modal(true);setMasterData(initialCustomer);setSelectedType('customer');setSelected(customerNationality)}} >เลือก ภาษาลูกค้า</Button>
            }
          </Col>
          <Col lg='4' md='6' sm='12' >
            <p style={{margin:0}} >8. โปรโมชั่น</p>
            {promotions && promotions.length>0
                ?<Button style={{marginBottom:'1rem',width:'100%'}}  variant="light" onClick={()=>{setSelected_Modal(true);setMasterData(initialPromotion);setSelectedType('promotion');setSelected(promotions)}} >{promotions.join('/')}</Button>
                :<Button style={{marginBottom:'1rem',width:'100%'}}  variant="secondary" onClick={()=>{setSelected_Modal(true);setMasterData(initialPromotion);setSelectedType('promotion');setSelected(promotions)}} >เลือก โปรโมชั่น</Button>
            }
          </Col>
          <Col lg='4' md='6' sm='12' >
            <p style={{margin:0}} >9. ช่องทางขาย</p>
            {channels && channels.length>0
                ?<Button style={{marginBottom:'1rem',width:'100%'}}  variant="light" onClick={()=>{setSelected_Modal(true);setMasterData(initialChannel);setSelectedType('channel');setSelected(channels)}} >{channels.join('/')}</Button>
                :<Button style={{marginBottom:'1rem',width:'100%'}}  variant="secondary" onClick={()=>{setSelected_Modal(true);setMasterData(initialChannel);setSelectedType('channel');setSelected(channels)}} >เลือก ช่องทางขาย</Button>
            }
          </Col>
          <Col lg='4' md='6' sm='12' >
            <p style={{margin:0}} >10. ช่องทางชำระเงิน</p>
            {payments && payments.length>0
                ?<Button style={{marginBottom:'1rem',width:'100%'}}  variant="light" onClick={()=>{setSelected_Modal(true);setMasterData(initialPayment);setSelectedType('payment');setSelected(payments)}} >{payments.join('/')}</Button>
                :<Button style={{marginBottom:'1rem',width:'100%'}}  variant="secondary" onClick={()=>{setSelected_Modal(true);setMasterData(initialPayment);setSelectedType('payment');setSelected(payments)}} >เลือก ช่องทางชำระเงิน</Button>
            }
          </Col>
          <Col lg='4' md='6' sm='12' >
                <Form.Select 
                    aria-label="Default select example" 
                    value={shift} 
                    onChange={(event)=>{dispatch(updateDemo({...demo,shift:event.target.value==='true'}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                >
                  <option value={true}>11. ใช้งานระบบกะเงินสด</option>
                  <option value={false}>11. ไม่ใช้งานระบบกะเงินสด</option>
                </Form.Select>
          </Col>
          <Col lg='4' md='6' sm='12' >
                <Form.Select 
                    aria-label="Default select example" 
                    value={vat} 
                    onChange={(event)=>{dispatch(updateDemo({...demo,vat:event.target.value==='true'}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                >
                  <option value={true}>12. ใช้งานใบกำกับภาษีและส่งภาษี</option>
                  <option value={false}>12. ไม่ใช้งานใบกำกับภาษี</option>
                </Form.Select>
          </Col>
          <Col lg='4' md='6' sm='12' >
                <Form.Select 
                    aria-label="Default select example" 
                    value={kitchenAmount} 
                    onChange={(event)=>{dispatch(updateDemo({...demo,kitchenAmount:event.target.value}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                >
                  <option value='' disabled >13. จำนวนครัว</option>
                  <option value='1' >1 ครัว</option>
                  <option value='2' >2 ครัว</option>
                  <option value='3' >3 ครัว</option>
                  <option value='4' >4 ครัว</option>
                  <option value='5' >5 ครัว</option>
                  <option value='6' >6 ครัว</option>
                  <option value='7' >7 ครัว</option>
                  <option value='8' >8 ครัว</option>
                  <option value='9' >9 ครัว</option>
                  <option value='10' >10 ครัว</option>
                  <option value='11' >11 ครัว</option>
                </Form.Select>
          </Col>
          <Col lg='4' md='6' sm='12' >
                <p style={{margin:0}} >14. อุปกรณ์เดิม</p>
                <Form.Select 
                    aria-label="Default select example" 
                    value={posDevice} 
                    onChange={(event)=>{dispatch(updateDemo({...demo,posDevice:event.target.value}))}}
                    style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                >
                  <option value='' disabled >เลือก เครื่อง pos</option>
                  {initialPosDevice.map((item,index)=>{
                    return <option key={index} value={item} >{item}</option>
                  })}
                </Form.Select>
          </Col>
          <Col lg='4' md='6' sm='12' >
            <FloatingText
              name={'printerDevice'}
              placeholder="15. เครื่องปริ้นเดิม"
              value={printerDevice}
              onChange={handleChange}
            />
          </Col>
          <Col lg='4' md='6' sm='12' >
            <FloatingText
              name={'workingTime'}
              placeholder="16. เวลาทำการ"
              value={workingTime}
              onChange={handleChange}
            />
          </Col>
          <Col lg='4' md='6' sm='12' >
            <Form.Select 
                aria-label="Default select example" 
                value={network} 
                onChange={(event)=>{dispatch(updateDemo({...demo,network:event.target.value}))}}
                style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
            >
              <option value='' disabled >17. เลือก network</option>
              {initialNetwork.map((item,index)=>{
                return <option key={index} value={item} >17. {item}</option>
              })}
              
            </Form.Select>
          </Col>
        </Row>
      <div>
    </div>
    </div>
  );
}

const styles = {
  container : {
    borderRadius:20
},
}

export default DemoPart1;