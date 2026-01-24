import React, { useMemo, forwardRef, useRef } from "react";
import {
//   Button,
  Modal,
  Row,
  Col,
  Form,
  Image
} from "react-bootstrap";
import { formatCurrency, formatCurrency2, summary } from "../Utility/function";
import { MdRadioButtonUnchecked, MdRadioButtonChecked } from 'react-icons/md'; // replace with correct MaterialCommunityIcons mapping
import { colors } from "../configs";
import { Card, FloatingArea, FooterButton, OneButton, RootImage } from "../components";
import DatePicker from "react-datepicker";
import { SlCalender } from "react-icons/sl";
import { Button } from "rsuite";
const { white, dark, theme3, five, one, nine, softWhite, green, six } = colors;

function Modal_So({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  licenses,
  current,
  setCurrent,
  submit,
  hardwares,
  disabled,
  manualChecked=false
}) {
    const fileInputRef = useRef(null);
    
    const { storeSize, software, requestDate = '', hardware, note = '', deliveryType = 'normal', oneMonth = false, manualPaid, manualPaidImage } = current;
    
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <div  style={{ borderRadius:20 }} onClick={onClick} ref={ref}>
          {value}
        </div>
    ));

  
  const { display, extraCharge, softwarePrice, net, hardwarePrice, deliveryFee } = useMemo(()=>{
    const thisSize = storeSize>100?100:storeSize;
    const display = licenses.map(({ name, price, color })=>({ name, ...price.find(b=>b.table===thisSize && b.save!==0), color }));
    const softwarePrice = oneMonth?1000:summary(software,'price')
    // เกิดจากโต็กเกิน 100 โต๊ะ
    const extraCharge = storeSize>100 && !oneMonth
        ?((storeSize-100)/50)*3000
        :0;

    const hardwarePrice = summary(hardware, 'net');
    const deliveryFee = deliveryType ==='normal' && hardwarePrice >0 && hardwarePrice <4000
        ?100
        :0

    const net = extraCharge + softwarePrice + hardwarePrice + deliveryFee;

      return {
          display,
          extraCharge,
          softwarePrice,
          net,
          hardwarePrice,
          deliveryFee
      }
  },[licenses,storeSize,software,hardware,deliveryType,oneMonth]);


  function handleSubmit(){
    if(software.length===0 && hardware.length === 0 && !oneMonth) return alert('เลือกอย่างน้อย 1 รายการ');

    if(manualPaid && !manualPaidImage) return alert('กรุณาแนบสลิปการชำระเงิน');

    submit({
        extraCharge,
        softwarePrice,
        hardwarePrice,
        deliveryFee,
        net
    })
  };

    function handleManualPaidChange(action){
        // action = approcved / rejected
        const ok = window.confirm(`คุณแน่ใจที่จะ${action==='approved'?'อนุมัติ':'ปฏิเสธ'}แพ็กเกจนี้หรือไม่?`);
        if(!ok) return;
        submit({...current, action })
    }




    function manageSoftware(item){
        if(oneMonth) return alert('ไม่สามารถเลือกซอฟต์แวร์ในโหมด 1 เดือน') ; // ถ้าเป็นโหมด 1 เดือน ห้ามเลือกซอฟต์แวร์
        setCurrent(prev=>({
            ...prev,
            software:prev.software.some(a=>a.id === item.id)
                ?prev.software.filter(a=>a.id !== item.id)
                :[...prev.software,item]
        }))
    };


    function handleHardware({ item, type }){
        switch (type) {
            case 'plus':
                setCurrent(prev=>({
                    ...prev,
                    hardware:prev.hardware.map(a=>
                        a.id === item.id
                            ?{
                                ...a, qty:a.qty +1, net:a.net + Number(a.price)
                            }
                            :a
                    )
                }))
                break;
            case 'minus':
                setCurrent(prev=>({
                    ...prev,
                    hardware:prev.hardware.map(a=>
                        a.id === item.id
                            ?{
                                ...a, qty:a.qty -1, net:a.net - Number(a.price)
                            }
                            :a
                    ).filter(b=>b.qty>0)
                }))
                break;
            case 'add':
                setCurrent(prev=>({
                    ...prev,
                    hardware:[
                        ...prev.hardware,
                        {
                            ...item,
                            net:Number(item.price),
                            qty:1
                        }
                    ]
                }))
            break;
        
            default:
                break;
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0]; // Get the selected file

        if (file) {

        // Create a FileReader to read the file
        const reader = new FileReader();
        reader.onloadend = async () => {
            // setImage(reader.result); // Set the image data as the result of FileReader
            setCurrent(prev=>({...prev,manualPaidImage:reader.result}))
        };

        reader.readAsDataURL(file); // Convert file to a base64 string
        }
    };


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      fullscreen={true}
    >
      <Modal.Header closeButton>
        <h2><b>เปิดบิล : {formatCurrency(net)}</b></h2>
      </Modal.Header>
      <Modal.Body  >
        <Card title='Software' maxWidth={'95vw'} accentColor={nine} >
            <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                    <h2>1. ขนาดร้าน : {storeSize}โต๊ะ <span style={{ color:five }}  >{extraCharge>0?`+ ${formatCurrency(extraCharge)}`:''}</span>
                    
                    </h2>
                </div>
            </div>
            <br/>
            <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                    <h2>2. เลือกแพ็กเกจ({software.length} แพ็กเกจ)</h2>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {display.map((item) => {
                        const { id, name, price: itemPrice, color } = item;
                        const status = software.some((a) => a.id === id);
                        const backgroundColor = status ? color : white;

                        return (
                            <div
                            key={id}
                            onClick={() => manageSoftware(item)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                backgroundColor,
                                padding: 12,
                                borderRadius: 10,
                                cursor: 'pointer',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                minWidth: 250,
                            }}
                            >
                            {status ? (
                                <MdRadioButtonChecked size={30} color={dark} />
                            ) : (
                                <MdRadioButtonUnchecked size={30} color={theme3} />
                            )}

                            <div>
                                <div style={{ fontSize: 18, fontWeight: 600 }}>{name}</div>
                                <div>ราคา : {itemPrice}</div>
                            </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <br/>
            <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                    <h2>3. วันที่ต้องการเพิ่มแพ็กเกจ</h2>
                </div>
                <div style={{ width:'350px' }} >
                    <div style={{ display:'flex',padding:5,borderRadius:10,border: '1px solid grey',backgroundColor:white,alignItems:'center' }} >
                        <SlCalender />
                        <div style={{ paddingLeft:10,paddingRight:10 }} >  วันที่: </div>
                        <DatePicker
                            dateFormat="dd/MM/yyyy"
                            selected={requestDate}
                            onChange={(date)=>{(setCurrent(prev=>({...prev, requestDate:date })))}}
                            selectsStart
                            minDate={new Date()}     // ⛔ ห้ามเลือกวันที่ผ่านมาแล้ว
                            customInput={<ExampleCustomInput />}
                            withPortal
                            
                        />
                    </div>
                </div>
            </div>
            <br/>
            <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                    <h2>4. ซื้อทดลองใช้ 1 เดือน</h2>
                </div>
                <Form.Select 
                        aria-label="Default select example" 
                        value={oneMonth} 
                        onChange={(event)=>{
                            event.preventDefault()
                            if(event.target.value==='true'){
                                setCurrent(prev=>({...prev, oneMonth:event.target.value==='true', software:[]}))
                            } else {
                                setCurrent(prev=>({...prev, oneMonth:event.target.value==='true'}))
                            }
                        }}
                        style={{width:'180px'}}
                    >
                        <option value={false}>ไม่ใช่</option>
                        <option value={true} >ใช่</option>
                </Form.Select>
            </div>
            
        </Card>
        <Card title='Hardware' maxWidth={'95vw'} accentColor={one}  >
            <h2>1. เลือกอุปกรณ์</h2>
            <Row>
                {hardwares.map((item,index)=>{
                    const { imageId, price, detail, name, id } = item;
                    let { qty } = hardware.find(a=>a.id===id) || { qty:''}
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
                                        </div>
                                        <React.Fragment>
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
            <h2>2. การจัดส่ง</h2>
            <Form.Select 
                    aria-label="Default select example" 
                    value={deliveryType} 
                    onChange={(event)=>{
                    event.preventDefault()
                        setCurrent(prev=>({...prev, deliveryType:event.target.value}))
                    }}
                    style={{width:'180px'}}
                >
                    <option value="normal" >ปกติ(DHL)</option>
                    <option value="fast" >รวดเร็ว(ลาล่ามูฟ)</option>
                    <option value="self" >รับเองที่ บ.</option>
            </Form.Select>
            <br/>
            <h2>3. โน๊ตแจ้งคลัง</h2>
            <FloatingArea
                name="note"
                placeholder="เช่น ip address, ที่อยู่จัดส่ง"
                value={note}
                onChange={(event)=>{setCurrent({...current,note:event.target.value})}}
            />
        </Card>
         <Card title='รูปแบบการชำระเงิน' maxWidth={'95vw'} accentColor={six}  >
            <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                    <h2>1. รูปแบบการชำระเงิน</h2>
                </div>
                <Form.Select 
                        aria-label="Default select example" 
                        value={manualPaid} 
                        onChange={(event)=>{
                            event.preventDefault()
                            setCurrent(prev=>({...prev, manualPaid:event.target.value==='true'}))
                        }}
                        style={{width:'180px'}}
                    >
                        <option value={false}>ชำระเงินอัตโนมัติ</option>
                        <option value={true} >ชำระเงินแบบแนบสลิป</option>
                </Form.Select>
                {manualPaid
                    ?<form >
                        <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }} // Hide the default file input
                        />
                        <Button onClick={handleButtonClick} variant="light">
                        {manualPaidImage
                            ?<Image style={styles.image} src={manualPaidImage} />
                            :<RootImage style={styles.image} />
                        }
                        
                        </Button>
                    </form>
                    :null
                }
            </div>
            
        </Card>
        
        
    
      </Modal.Body>
        {manualChecked
            ?<Modal.Footer>
                <OneButton {...{ text:'ปิด', submit:onHide, variant:'secondary' }} />
                <OneButton {...{ text:'อนุมัติแพ็กเกจ', submit:()=>{handleManualPaidChange('approved')}, variant:'success' }} />
                <OneButton {...{ text:'ปฏิเสธแพ็กเกจ', submit:()=>{handleManualPaidChange('rejected')}, variant:'danger' }} />
            </Modal.Footer>
            :disabled
            ?<Modal.Footer>
                <OneButton {...{ text:'ปิด', submit:onHide, variant:'secondary' }} />
            </Modal.Footer>
            :<FooterButton {...{ onHide, submit:()=>{handleSubmit()}, rightText:'เปิดบิล' }} />
        
        }
      
    </Modal>
  );
};

const styles = {
  container : {
      textAlign:'center', width: '9%', minWidth:'50px'
  },
  container2 : {
      textAlign:'center', width:'13%', textAlign:'center',minWidth:'150px'
  }
};

export default Modal_So;
