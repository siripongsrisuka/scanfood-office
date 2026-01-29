import React, { useState } from "react";
import {
  Modal,
  Form,
  Card
} from "react-bootstrap";
import { CardComponent, DeleteButton, FloatingArea, FloatingText, FooterButton, OneButton } from "../components";
import Modal_Alert from "./Modal_Alert";
import { initialAlert } from "../configs";
import { v4 as uuidv4 } from 'uuid';


const cashiersEquipment = [
    { label: '🌟🌟🌟แท็บเล็ต Scanfood', id:'1' },
    { label: '🌟🌟🌟Imin swan 2 จอ', id:'2' },
    { label: '🌟🌟🌟Imin swan 1 จอ', id:'3' },
    { label: '🌟🌟🌟Sunmi D3 Pro', id:'4' },
    { label: '🌟🌟🌟Sunmi D2S', id:'5' },
    { label: '🌟🌟🌟IPAD', id:'6' },
    { label: '🌟🌟แท็บเล็ต', id:'7' },
    { label: '🌟🌟🌟เครื่องPOS', id:'8' },
];

const networkSystems = [
    { label: '🌟🌟🌟LAN', id:'1' },
    { label: '🌟🌟WiFi', id:'2' },
    { label: '🌟hotpotจากมือถือ', id:'3' },
];

const routerSystems = [
    { label: '🌟🌟🌟Tp-link/เราเตอร์ 6 เสา', id:'1' },
    { label: '🌟🌟เราเตอร์แถมจากค่ายเน็ต', id:'2' },
    { label: '🌟Pocket wifi ใส่ซิมมือถือ', id:'3' },
];

const hostedSystems = [
    { label: '🌟🌟🌟เปิดหน้าจอตลอดเวลา + เชื่อมสาย Lan', id:'1' },
    { label: '🌟🌟เปิดหน้าจอตลอดเวลา + เชื่อม wifi', id:'2' },
    { label: '🌟มือถือเป็นเครื่องแม่ แต่สลับไปใช้แอปอื่นในขณะใช้งาน', id:'3' },
];

const initialCashier = {
    equipment:'', // pos, tablet
    network:'', // lan, wifi คือ อินเตอร์เน็ตที่เข้าเครื่อง
    host:true, // true = server , false = client
    printer:'', // lan, wifi, usb, bluetooth, inner
    printerNetwork:'', // lan, wifi, bluetooth
    printerMode:'', // text, picture
    innerPrinter:false, // ใช้ปริ้นท์ในตัวเครื่อง
}

function Modal_Shop({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
  current,
  setCurrent,
  deleteItem
}) {
    const { router, id, shopName, storeSize, softwares=[], notes=[], paymentGateway = [], ethernetSystem = {}, cashiersPos = [] } = current;


    function handleChange(event){
        event.preventDefault();
        const { name, value } = event.target;
        const newCurrent = {...current,[name]:value}
        setCurrent(newCurrent)
    };

    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;

    function addNewCashier(){
        setCurrent(prev=>({...prev, cashiers:[...prev.cashiers, {...initialCashier, id:uuidv4()}]}))
    }


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      size={size}
    >
   
      <Modal.Header closeButton>
        <h2><b>จัดการ ร้านค้า</b></h2>
      </Modal.Header>

      <Modal.Body >
            <Modal_Alert
                show={status}
                onHide={()=>{setAlert_Modal(initialAlert)}}
                content={content}
                onClick={onClick}
                variant={variant}
            />
            <FloatingText
              name='shopName'
              placeholder="ชื่อร้านค้า"
              value={shopName}
              onChange={handleChange}
            />
            <Form.Select 
                aria-label="Default select example" 
                value={storeSize} 
                onChange={(event)=>{setCurrent(prev=>({...prev,storeSize:event.target.value}))}}
                style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
            >
                <option value='20' disabled >ขนาดร้านค้า</option>
                <option  value='50' >ขนาดร้านค้า: 50 โต๊ะ</option>
                <option  value='100' >ขนาดร้านค้า: 100 โต๊ะ</option>
                <option  value='150' >ขนาดร้านค้า: 150 โต๊ะ</option>
                <option  value='200' >ขนาดร้านค้า: 200 โต๊ะ</option>
                <option  value='250' >ขนาดร้านค้า: 250 โต๊ะ</option>
            
            </Form.Select>
            <Form.Select 
                aria-label="Default select example" 
                value={router} 
                onChange={(event)=>{setCurrent(prev=>({...prev,router:event.target.value}))}}
                style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
            >
                <option value='' disabled >เราเตอร์</option>
                {routerSystems.map((item)=>(
                    <option key={item.id} value={item.id} >เราเตอร์ : {item.label}</option>
                ))}
            </Form.Select>
            <CardComponent title={`แคชเชียร์/เครื่องPOS (${softwares.length} เครื่อง)`} maxWidth={'95vw'} >
            {/* <Card title={`แคชเชียร์/เครื่องPOS (${softwares.length} เครื่อง)`} maxWidth={'95vw'} accentColor={one} > */}
                <OneButton {...{ text:'เพิ่มแคชเชียร์/เครื่องPOS', submit:()=>{addNewCashier()} }} />
                {cashiersPos.map((cashier,index)=>(
                    <Card key={index} title={`แคชเชียร์/เครื่องPOS ที่ ${index + 1}`} marginTop={10} >
                        <Form.Select 
                            aria-label="Default select example" 
                            value={cashier.equipment} 
                            onChange={(event)=>{
                                const newCashiers = [...cashiersPos];
                                newCashiers[index].equipment = event.target.value;
                                setCurrent(prev=>({...prev, cashiers:newCashiers}))
                            }}
                            style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                        >
                            <option value='' disabled >อุปกรณ์</option>
                            {cashiersPos.map((item)=>(
                                <option key={item.id} value={item.id} >อุปกรณ์ : {item.label}</option>
                            ))}
                        </Form.Select>
                    </Card>
                ))}

            </CardComponent>
            {/* {id
                ?<DeleteButton {...{ text:'ลบรายการ', submit:()=>{setAlert_Modal({ status:true, content:`ลบ ${name}`, onClick:()=>{setAlert_Modal(initialAlert);deleteItem(id)}, variant:'danger'})} }} />
                :null
            } */}
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

export default Modal_Shop;
