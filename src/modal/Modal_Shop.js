import React, { useState } from "react";
import {
  Modal,
  Form,
  Card,
  FloatingLabel,
  Row,
  Col
} from "react-bootstrap";
import { CardComponent, FloatingText, FooterButton, OneButton } from "../components";
import Modal_Alert from "./Modal_Alert";
import { cashiersEquipment, colors, initialAlert, networkSystems, printerModes,
    routerSystems, hostedSystems, printers, printPatterns, distanceOptions,
    shopTypeOptions
 } from "../configs";
import { v4 as uuidv4 } from 'uuid';
import initialShopType from "../configs/initialShopType";

const { dark } = colors

const paymentGateways = ['kbank','kbankCredit','posxpay','Alipay','Wechat pay'];

const initialCashier = {
    equipment:'', // pos, tablet
    network:'', // lan, wifi คือ อินเตอร์เน็ตที่เข้าเครื่อง
    host:true, // true = server , false = client
    hostedSystem:'', // ระบบการทำงาน host
    printer:'', // ชื่อเครื่องปริ้นท์
    printerMode:'', // lan, wifi, bluetooth
    printerPattern:'', // text, picture
    innerPrinter:false, // ใช้ปริ้นท์ในตัวเครื่อง
    note:'', // หมายเหตุ เช่น เครื่องนี้ ช่องเสียบแลนไม่ค่อยดี
};

const initialKitchenPrinter = {
    name:'',
    printer:'', // ชื่อเครื่องปริ้นท์
    printerMode:'', // lan, wifi, bluetooth
    printerPattern:'', // text, picture
    ipAddress:'', // ใส่เฉพาะเครื่องลูก
    note:'', // หมายเหตุ เช่น เครื่องนี้ ช่องเสียบแลนไม่ค่อยดี
    distance:'', // ระยะห่างจากเราเตอร์
};

const featuresOptions = ['qrCode','staff','language','premium','member','crmPremium'];

function Modal_Shop({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  submit,
  current,
  setCurrent,
}) {
    const { router, shopName, storeSize, paymentGateway = [], cashiersPos = [], kitchenPrinters = [], features = [], shopType = '', note = '', ownerManager = '' } = current;

    function confirm(){
        const ok = window.confirm('คุณต้องการบันทึกร้านค้านี้ใช่หรือไม่?');
        if (!ok) return;
        submit()
    }

    function handleChange(event){
        event.preventDefault();
        const { name, value } = event.target;
        const newCurrent = {...current,[name]:value}
        setCurrent(newCurrent)
    };

    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;

    function addNewCashier(){
        const ok = window.confirm('คุณต้องการเพิ่มแคชเชียร์/เครื่องPOSใหม่ใช่หรือไม่?');
        if (!ok) return;
        setCurrent(prev=>({...prev, cashiersPos:[...prev.cashiersPos, {...initialCashier, id:uuidv4()}]}))
    };

    function addNewKitchenPrinter(){
        const ok = window.confirm('คุณต้องการเพิ่มเครื่องปริ้นครัวใหม่ใช่หรือไม่?');
        if (!ok) return;
        setCurrent(prev=>({...prev, kitchenPrinters:[...prev.kitchenPrinters, {...initialKitchenPrinter, id:uuidv4()}]}))
    };

    function handleDeleteKitchen(index){
        const ok = window.confirm('คุณต้องการลบเครื่องปริ้นครัวนี้ใช่หรือไม่?');
        if (!ok) return;
        const newKitchens = [...kitchenPrinters];
        newKitchens.splice(index,1);
        setCurrent(prev=>({...prev, kitchenPrinters:newKitchens}))
    };

    function handleDeleteCashier(index){
        const ok = window.confirm('คุณต้องการลบแคชเชียร์/เครื่องPOSนี้ใช่หรือไม่?');
        if (!ok) return;
        const newCashiers = [...cashiersPos];
        newCashiers.splice(index,1);
        setCurrent(prev=>({...prev, cashiersPos:newCashiers}))
    }


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
    //   size={size}
    fullscreen
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
            <FloatingText
              name='ownerManager'
              placeholder="ชื่อเจ้าของ/ผู้จัดการ"
              value={ownerManager}
              onChange={handleChange}
            />
            <FloatingText
              name='note'
              placeholder="หมายเหตุ"
              value={note}
              onChange={handleChange}
            />
            <h5>PaymentGateway</h5>
            {paymentGateways.map((gateway)=>(
                <Form.Check 
                    type="checkbox"
                    label={gateway}
                    key={gateway}
                    checked={paymentGateway.includes(gateway)}
                    onChange={(event)=>{
                        if (event.target.checked){
                            setCurrent(prev=>({...prev, paymentGateway:[...prev.paymentGateway, gateway]}))
                        } else {
                            const filtered = paymentGateway.filter(item=>item!==gateway);
                            setCurrent(prev=>({...prev, paymentGateway:filtered}))
                        }
                    }}
                />
            ))}
            <h5>Package ที่ใช้งาน</h5>
            {featuresOptions.map((feature)=>(
                <Form.Check 
                    type="checkbox"
                    label={feature}
                    key={feature}
                    checked={features.includes(feature)}
                    onChange={(event)=>{
                        if (event.target.checked){
                            setCurrent(prev=>({...prev, features:[...prev.features, feature]}))
                        } else {
                            const filtered = features.filter(item=>item!==feature);
                            setCurrent(prev=>({...prev, features:filtered}))
                        }
                    }}
                />
            ))}
            <FloatingLabel
                controlId="floatingSelectShopType"
                label="ประเภทร้านค้า"
                className="mb-3"
            >
                <Form.Select
                    value={shopType}
                    onChange={(event) =>
                    setCurrent(prev => ({ ...prev, shopType: event.target.value }))
                    }
                >
                    <option value="" disabled>เลือกประเภทร้านค้า</option>
                    {initialShopType.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                    ))}
                </Form.Select>
            </FloatingLabel>


                {/* ขนาดร้านค้า */}
                <FloatingLabel
                controlId="floatingSelectStoreSize"
                label="ขนาดร้านค้า"
                className="mb-3"
                >
                <Form.Select
                    value={storeSize}
                    onChange={(event) =>
                    setCurrent(prev => ({ ...prev, storeSize: event.target.value }))
                    }
                >
                    <option value="" disabled>เลือกขนาดร้านค้า</option>
                    <option value="20">20 โต๊ะ</option>
                    <option value="50">50 โต๊ะ</option>
                    <option value="100">100 โต๊ะ</option>
                    <option value="150">150 โต๊ะ</option>
                    <option value="200">200 โต๊ะ</option>
                    <option value="250">250 โต๊ะ</option>
                </Form.Select>
                </FloatingLabel>

                {/* เราเตอร์ */}
                <FloatingLabel
                controlId="floatingSelectRouter"
                label="เราเตอร์"
                className="mb-3"
                >
                <Form.Select
                    value={router}
                    onChange={(event) =>
                    setCurrent(prev => ({ ...prev, router: event.target.value }))
                    }
                >
                    <option value="" disabled>เลือกเราเตอร์</option>
                    {routerSystems.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.label}
                    </option>
                    ))}
                </Form.Select>
                </FloatingLabel>
            <CardComponent title={`แคชเชียร์/เครื่องPOS (${cashiersPos.length} เครื่อง)`} maxWidth={'95vw'} >
                <OneButton {...{ text:'เพิ่มแคชเชียร์/เครื่องPOS', submit:()=>{addNewCashier()} }} />
                <Row>
                    
                    {cashiersPos.map((cashier, index) => (
                        <Col sm='12' md='6' lg='4' >
                            <Card key={index} style={{ padding: '1rem', marginTop: 10 }}>
                                <h5>
                                {`แคชเชียร์/เครื่อง POS ที่ ${index + 1}`}
                                &emsp;
                                <i
                                    onClick={() => handleDeleteCashier(index)}
                                    style={{ fontSize: 20, color: dark, cursor: 'pointer' }}
                                    className="bi bi-trash3"
                                />
                                </h5>

                                {/* อุปกรณ์ */}
                                <FloatingLabel label="อุปกรณ์" className="mb-3">
                                    <Form.Select
                                        value={cashier.equipment}
                                        onChange={(e) => {
                                        const newCashiers = [...cashiersPos];
                                        newCashiers[index].equipment = e.target.value;
                                        setCurrent(prev => ({ ...prev, cashiersPos: newCashiers }));
                                        }}
                                    >
                                        <option value="" disabled>เลือกอุปกรณ์</option>
                                        {cashiersEquipment.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>

                                {/* เชื่อมเน็ต */}
                                <FloatingLabel label="เชื่อมต่ออินเทอร์เน็ต" className="mb-3">
                                    <Form.Select
                                        value={cashier.network}
                                        onChange={(e) => {
                                        const newCashiers = [...cashiersPos];
                                        newCashiers[index].network = e.target.value;
                                        setCurrent(prev => ({ ...prev, cashiersPos: newCashiers }));
                                        }}
                                    >
                                        <option value="" disabled>เลือกวิธีเชื่อมต่อ</option>
                                        {networkSystems.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>

                                {/* เครื่องแม่ */}
                                <FloatingLabel label="เป็นเครื่องแม่หรือไม่" className="mb-3">
                                    <Form.Select
                                        value={cashier.host}
                                        onChange={(e) => {
                                        const newCashiers = [...cashiersPos];
                                        newCashiers[index].host = e.target.value==='true';
                                        setCurrent(prev => ({ ...prev, cashiersPos: newCashiers }));
                                        }}
                                    >
                                        <option value="" disabled>เลือก</option>
                                        <option value="true">ใช่</option>
                                        <option value="false">ไม่ใช่</option>
                                    </Form.Select>
                                </FloatingLabel>

                                {cashier.host && (
                                    <FloatingLabel label="รูปแบบการทำงาน (Host)" className="mb-3">
                                        <Form.Select
                                        value={cashier.hostedSystem}
                                        onChange={(e) => {
                                            const newCashiers = [...cashiersPos];
                                            newCashiers[index].hostedSystem = e.target.value;
                                            setCurrent(prev => ({ ...prev, cashiersPos: newCashiers }));
                                        }}
                                        >
                                        <option value="" disabled>เลือกรูปแบบ</option>
                                        {hostedSystems.map(item => (
                                            <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                        </Form.Select>
                                    </FloatingLabel>
                                )}

                                {/* เครื่องปริ้นในตัว */}
                                <FloatingLabel label="มีเครื่องพิมพ์ในตัวหรือไม่" className="mb-3">
                                    <Form.Select
                                        value={cashier.innerPrinter}
                                        onChange={(e) => {
                                        const newCashiers = [...cashiersPos];
                                        newCashiers[index].innerPrinter = e.target.value==='true';
                                        setCurrent(prev => ({ ...prev, cashiersPos: newCashiers }));
                                        }}
                                    >
                                        <option value="" disabled>เลือก</option>
                                        <option value="true">มี</option>
                                        <option value="false">ไม่มี</option>
                                    </Form.Select>
                                </FloatingLabel>

                                {!cashier.innerPrinter && (
                                <>
                                    <FloatingLabel label="เครื่องพิมพ์ใบเสร็จ" className="mb-3">
                                    <Form.Select
                                        value={cashier.printer}
                                        onChange={(e) => {
                                        const newCashiers = [...cashiersPos];
                                        newCashiers[index].printer = e.target.value;
                                        setCurrent(prev => ({ ...prev, cashiersPos: newCashiers }));
                                        }}
                                    >
                                        <option value="" disabled>เลือกเครื่องพิมพ์</option>
                                        {printers.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </Form.Select>
                                    </FloatingLabel>

                                    <FloatingLabel label="การเชื่อมต่อเครื่องพิมพ์" className="mb-3">
                                    <Form.Select
                                        value={cashier.printerMode}
                                        onChange={(e) => {
                                        const newCashiers = [...cashiersPos];
                                        newCashiers[index].printerMode = e.target.value;
                                        setCurrent(prev => ({ ...prev, cashiersPos: newCashiers }));
                                        }}
                                    >
                                        <option value="" disabled>เลือกวิธีเชื่อมต่อ</option>
                                        {printerModes.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </Form.Select>
                                    </FloatingLabel>

                                    <FloatingLabel label="รูปแบบการพิมพ์" className="mb-3">
                                    <Form.Select
                                        value={cashier.printerPattern}
                                        onChange={(e) => {
                                        const newCashiers = [...cashiersPos];
                                        newCashiers[index].printerPattern = e.target.value;
                                        setCurrent(prev => ({ ...prev, cashiersPos: newCashiers }));
                                        }}
                                    >
                                        <option value="" disabled>เลือกรูปแบบ</option>
                                        {printPatterns.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </Form.Select>
                                    </FloatingLabel>
                                    <FloatingText
                                        name="note"
                                        placeholder="หมายเหตุ"
                                        value={cashier.note}
                                        onChange={(e) => {
                                            const newCashiers = [...cashiersPos];
                                            newCashiers[index].note = e.target.value;
                                            setCurrent(prev => ({ ...prev, cashiersPos: newCashiers }));
                                        }}
                                    />
                                </>
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>
                

            </CardComponent>
            <CardComponent title={`ครัว (${kitchenPrinters.length} เครื่อง)`} maxWidth={'95vw'} accentColor={'#FA8D94'} >
                <OneButton {...{ text:'เพิ่มเครื่องปริ้นครัว', submit:()=>{addNewKitchenPrinter()} }} />
                <Row>
                    {kitchenPrinters.map((printer, index) => (
                        <Col sm='12' md='6' lg='4' >
                            <Card key={index} style={{ padding: '1rem', marginTop: 10 }}>
                                <h5>
                                {`ครัว/เครื่องปริ้น ที่ ${index + 1}`}
                                &emsp;
                                <i
                                    onClick={() => handleDeleteKitchen(index)}
                                    style={{ fontSize: 20, color: dark, cursor: 'pointer' }}
                                    className="bi bi-trash3"
                                />
                                </h5>

                                {/* ชื่อครัว */}
                                <FloatingText
                                    name="ชื่อครัว"
                                    placeholder="ชื่อครัว"
                                    value={printer.name}
                                    onChange={(e) => {
                                        const newPrinters = [...kitchenPrinters];
                                        newPrinters[index].name = e.target.value;
                                        setCurrent(prev => ({ ...prev, kitchenPrinters: newPrinters }));
                                    }}
                                />

                                {/* เครื่องพิมพ์ */}
                                <FloatingLabel label="เครื่องพิมพ์" className="mb-3">
                                    <Form.Select
                                        value={printer.printer}
                                        onChange={(e) => {
                                        const newPrinters = [...kitchenPrinters];
                                        newPrinters[index].printer = e.target.value;
                                        setCurrent(prev => ({ ...prev, kitchenPrinters: newPrinters }));
                                        }}
                                    >
                                        <option value="" disabled>เลือกเครื่องพิมพ์</option>
                                        {printers.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>

                                {/* การเชื่อมต่อ */}
                                <FloatingLabel label="การเชื่อมต่อ" className="mb-3">
                                    <Form.Select
                                        value={printer.printerMode}
                                        onChange={(e) => {
                                        const newPrinters = [...kitchenPrinters];
                                        newPrinters[index].printerMode = e.target.value;
                                        setCurrent(prev => ({ ...prev, kitchenPrinters: newPrinters }));
                                        }}
                                    >
                                        <option value="" disabled>เลือกการเชื่อมต่อ</option>
                                        {printerModes.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>

                                {/* รูปแบบการพิมพ์ */}
                                <FloatingLabel label="รูปแบบการพิมพ์" className="mb-3">
                                    <Form.Select
                                        value={printer.printerPattern}
                                        onChange={(e) => {
                                        const newPrinters = [...kitchenPrinters];
                                        newPrinters[index].printerPattern = e.target.value;
                                        setCurrent(prev => ({ ...prev, kitchenPrinters: newPrinters }));
                                        }}
                                    >
                                        <option value="" disabled>เลือกรูปแบบ</option>
                                        {printPatterns.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>

                                {/* ระยะห่างจากเราเตอร์ */}
                                <FloatingLabel label="ระยะห่างจากเราเตอร์" className="mb-3">
                                    <Form.Select
                                        value={printer.distance}
                                        onChange={(e) => {
                                        const newPrinters = [...kitchenPrinters];
                                        newPrinters[index].distance = e.target.value;
                                        setCurrent(prev => ({ ...prev, kitchenPrinters: newPrinters }));
                                        }}
                                    >
                                        <option value="" disabled>เลือกระยะห่าง</option>
                                        {distanceOptions.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>

                                {/* IP Address */}
                                <FloatingText
                                    name="ipAddress"
                                    placeholder="IP Address"
                                    value={printer.ipAddress}
                                    onChange={(e) => {
                                        const newPrinters = [...kitchenPrinters];
                                        newPrinters[index].ipAddress = e.target.value;
                                        setCurrent(prev => ({ ...prev, kitchenPrinters: newPrinters }));
                                    }}
                                />

                                {/* หมายเหตุ */}
                                <FloatingText
                                    name="note"
                                    placeholder="หมายเหตุ"
                                    value={printer.note}
                                    onChange={(e) => {
                                        const newPrinters = [...kitchenPrinters];
                                        newPrinters[index].note = e.target.value;
                                        setCurrent(prev => ({ ...prev, kitchenPrinters: newPrinters }));
                                    }}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </CardComponent>
      </Modal.Body>
      <FooterButton {...{ onHide, submit:confirm }} />
    </Modal>
  );
};

export default Modal_Shop;
