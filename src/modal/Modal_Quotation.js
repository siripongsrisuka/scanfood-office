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
import { CardComponent, FloatingArea, FloatingText, FooterButton, OneButton, RootImage } from "../components";
import DatePicker from "react-datepicker";
import { SlCalender } from "react-icons/sl";
import { useSelector } from "react-redux";
import { RadioGroup, Radio, Button } from "rsuite";
const { white, dark, theme3, five, one, nine, softWhite, green, six } = colors;

function Modal_Quotation({
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
  manualChecked=false,
  
}) {
    const { profile:{ admin }} = useSelector(state=>state.profile);
    const fileInputRef = useRef(null);
    
    const { 
        storeSize, 
        software, 
        requestDate = '', 
        hardware, 
        note = '', 
        deliveryType = 'normal', 
        oneMonth = false, 
        manualPaidImage,
        marketplaceFranchiseEnable,
        taxAddress = '',
        taxEmail = '',
        taxStep = '0',
        installments = '0',
        card = false,
        juristic = '0',
        vatInfo,
} = current;
    const { name: vatName, address: vatAddress, postcode: vatPostcode, taxId: vatTaxId, branch: vatBranch, email: vatEmail, tel: vatTel, contactName: vatContactName } = vatInfo || {};
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <div  style={{ borderRadius:20 }} onClick={onClick} ref={ref}>
          {value}
        </div>
    ));

  const { display, extraCharge, softwarePrice, net, hardwarePrice, deliveryFee, marketplaceFee, vat, withholdingTax, installmentFee, subtotal } = useMemo(()=>{
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
    const marketplaceFee = marketplaceFranchiseEnable
        ?3000
        :0
    const subtotal = extraCharge + softwarePrice + hardwarePrice  + marketplaceFee 
    let beforeInstallments = subtotal + deliveryFee;
    let installmentFee = 0;
    // ถ้าจ่ายผ่านบัตรเครดิต ต้องบวกค่าธรรมเนียมการผ่อนชำระเข้าไปในราคาทั้งหมด
    if(card){
        const installmentRates = {
            '0': 0.03,
            '3': 0.0573,
            '4': 0.0658,
            '6': 0.0829,
            '10': 0.1177
        };
        installmentFee = beforeInstallments * installmentRates[installments];
        beforeInstallments = beforeInstallments + installmentFee;
    }

    let beforeVat = beforeInstallments;


    let vat = 0;
    let withholdingTax = 0;

    // case ออกใบกำกับภาษีแบบอิเล็กทรอนิกส์(E-Tax) จะต้องบวก VAT 7% เข้าไปในราคาทั้งหมด และถ้าเป็นนิติบุคคลที่ซื้อซอฟต์แวร์ จะต้องหักภาษี ณ ที่จ่าย 3% จากราคาซอฟต์แวร์
    if(['2','3'].includes(taxStep)){
        vat = beforeVat * 0.07; // บวกราคาขึ้นอีก 7% ถ้าลูกค้าต้องการใบกำกับภาษีแบบอิเล็กทรอนิกส์(E-Tax)
    };

    if(juristic === '1' && softwarePrice>0){
        withholdingTax = softwarePrice * 0.03; // หักภาษี ณ ที่จ่าย 3% สำหรับนิติบุคคลที่ซื้อซอฟต์แวร์
    }
    const net = beforeVat + vat - withholdingTax;


    // const net = extraCharge + softwarePrice + hardwarePrice + deliveryFee + marketplaceFee;

      return {
          display,
          extraCharge,
          softwarePrice,
          net,
          hardwarePrice,
          deliveryFee,
          marketplaceFee,
          vat,
          withholdingTax,
          installmentFee,
          subtotal
      }
  },[licenses,storeSize,software,hardware,deliveryType,oneMonth,marketplaceFranchiseEnable,taxStep, juristic, card, installments]);


  function handleSubmit(){
    if(software.length===0 && hardware.length === 0 && !oneMonth && !marketplaceFranchiseEnable) return alert('เลือกอย่างน้อย 1 รายการ');


    if(taxStep !== '0' && !taxEmail) return alert('กรุณากรอกอีเมลสำหรับจัดส่งใบกำกับภาษี');
    if(taxStep ==='3' && !taxAddress) return alert('กรุณากรอกที่อยู่สำหรับจัดส่งใบกำกับภาษี');
    if(card && ['0','3','4'].includes(installments) && net <3000)return alert('ขั้นต่ำ 3,000 บาท')
    if(card && installments ==='6' && net <4000)return alert('ขั้นต่ำ 4,000 บาท')
    if(card && installments ==='10' && net <5000)return alert('ขั้นต่ำ 5,000 บาท')

    const ok = window.confirm('คุณแน่ใจที่จะเปิดบิลใช่หรือไม่?');
    if(!ok) return;

    submit({
        extraCharge,
        softwarePrice,
        hardwarePrice,
        deliveryFee,
        marketplaceFee,
        net,
        vat,
        withholdingTax,
        installmentFee,
        subtotal
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
        <CardComponent title='Software' maxWidth={'95vw'} accentColor={nine} >
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
                        style={{width:'250px'}}
                    >
                        <option value={false}>ไม่ใช่</option>
                        <option value={true} >ใช่</option>
                </Form.Select>
            </div>
            
        </CardComponent>
        <CardComponent title='Hardware' maxWidth={'95vw'} accentColor={one}  >
            <h2>5.1 เลือกอุปกรณ์</h2>
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
            <h2>5.2 การจัดส่ง</h2>
            <Form.Select 
                    aria-label="Default select example" 
                    value={deliveryType} 
                    onChange={(event)=>{
                    event.preventDefault()
                        setCurrent(prev=>({...prev, deliveryType:event.target.value}))
                    }}
                    style={{width:'250px'}}
                >
                    <option value="normal" >ปกติ(DHL)</option>
                    <option value="fast" >รวดเร็ว(ลาล่ามูฟ)</option>
                    <option value="self" >รับเองที่ บ.</option>
            </Form.Select>
            <br/>
            <h2>5.3 โน๊ตแจ้งคลัง</h2>
             <h6>บังคับกรอกข้อมูลต่อไปนี้</h6>
            <ul>
                <li style={{ textDecoration: 'underline' }} >ที่อยู่จัดส่ง ได่แก่ ชื่อผู้รับ ที่อยู่ เบอร์ติดต่อ</li>
                <li>ip address เราเตอร์ของที่ร้าน เพื่อให้คลังตั้งค่าเครื่องปริ้นแลนให้</li>
                <li>ถ้าร้านยังไม่ติดเน็ต ให้แจ้งว่า ip address : ร้านยังไม่ติดเน็ต</li>
            </ul>
            <FloatingArea
                name="note"
                placeholder="ได้แก่ ip address, ที่อยู่จัดส่ง"
                value={note}
                onChange={(event)=>{setCurrent({...current,note:event.target.value})}}
            />
        </CardComponent>
        
        <CardComponent title='ใบกำกับภาษี' maxWidth={'95vw'} accentColor={'#FA8900'}  >
            <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                    <h2>6. ลูกค้าต้องการใบกำกับภาษี/ใบเสร็จรับเงินไหม?</h2>
                </div>
                <Form.Select 
                        aria-label="Default select example" 
                        value={taxStep} 
                        onChange={(event)=>{
                            event.preventDefault()
                            setCurrent(prev=>({...prev, taxStep:event.target.value}))
                        }}
                        style={{width:'350px'}}
                    >
                        <option value="0">ไม่ต้องการ</option>
                        <option value="1" >ต้องการใบเสร็จรับเงิน</option>
                        <option value="2" >ต้องการใบกำกับภาษีแบบอิเล็กทรอนิกส์(E-Tax)</option>
                        <option value="3" >ต้องการ(E-Tax)และแบบกระดาษ</option>
                </Form.Select>
                {taxStep !== '0'
                    ?<React.Fragment>
                        <br/>
                        <h6>6.1 ประเภทลูกค้า</h6>
                        <RadioGroup
                            name="juristic"
                            value={juristic}
                            onChange={(value) =>
                                setCurrent((prev) => ({ ...prev, juristic: value }))
                            }
                            style={{ paddingLeft:20 }}
                            >
                            <Radio value="0">บุคคลธรรมดา</Radio>
                            <Radio value="1">นิติบุคคล</Radio>
                        </RadioGroup>
                        <h6>6.2 กรอกข้อมูลสำหรับออกเอกสาร(กรอกทุกข้อ*)</h6>
                        <Row>
                            <Col sm='12' md='6' >
                                <FloatingText
                                    name="vatName"
                                    placeholder="ชื่อธุรกิจ(ถ้าเป็นบุคคลธรรมดาให้กรอกชื่อ-นามสกุล)"
                                    value={vatName}
                                    onChange={(event)=>{setCurrent({...current,vatInfo:{...vatInfo,name:event.target.value}})}}
                                />
                            </Col>
                            <Col sm='12' md='6' >
                                <FloatingText
                                    name="vatAddress"
                                    placeholder="ที่อยู่"
                                    value={vatAddress}
                                    onChange={(event)=>{setCurrent({...current,vatInfo:{...vatInfo,address:event.target.value}})}}
                                />
                            </Col>
                            {['2','3'].includes(taxStep) &&
                            <Col sm='12' md='6' >
                                    <FloatingText
                                        name="vatPostcode"
                                        placeholder="รหัสไปรษณีย์"
                                        value={vatPostcode}
                                        onChange={(event)=>{setCurrent({...current,vatInfo:{...vatInfo,postcode:event.target.value}})}}
                                    />
                                </Col>}
                            {['2','3'].includes(taxStep) 
                                ?<Col sm='12' md='6' >
                                    <FloatingText
                                        name="vatTaxId"
                                        placeholder="เลขประจำตัวผู้เสียภาษี"
                                        value={vatTaxId}
                                        onChange={(event)=>{setCurrent({...current,vatInfo:{...vatInfo,taxId:event.target.value}})}}
                                    />
                                </Col>
                                :null
                            }
                            {['2','3'].includes(taxStep) 
                                ?<Col sm='12' md='6' >
                                    <FloatingText
                                        name="branch"
                                        placeholder="สาขา(ถ้าไม่ใช่สำนักงานใหญ่ให้กรอกชื่อสาขา)"
                                        value={vatBranch}
                                        onChange={(event)=>{setCurrent({...current,vatInfo:{...vatInfo,vatBranch:event.target.value}})}}
                                    />
                                </Col>
                                :null
                            }
                            {['2','3'].includes(taxStep) 
                                ?<Col sm='12' md='6' >
                                    <FloatingText
                                        name="vatContactName"
                                        placeholder="ชื่อผู้ติดต่อ"
                                        value={vatContactName}
                                        onChange={(event)=>{setCurrent({...current,vatInfo:{...vatInfo,contactName:event.target.value}})}}
                                    />
                                </Col>
                                :null
                            }
                            
                            
                            <Col sm='12' md='6' >
                                <FloatingText
                                    name="vatEmail"
                                    placeholder="อีเมล"
                                    value={vatEmail}
                                    onChange={(event)=>{setCurrent({...current,vatInfo:{...vatInfo,email:event.target.value}})}}
                                />
                            </Col>
                            <Col sm='12' md='6' >
                                <FloatingText
                                    name="vatTel"
                                    placeholder="เบอร์โทรศัพท์สำหรับติดต่อ"
                                    value={vatTel}
                                    onChange={(event)=>{setCurrent({...current,vatInfo:{...vatInfo,tel:event.target.value}})}}
                                />
                            </Col>
                        </Row>
                        <br/>
                        <FloatingText
                            name="taxEmail"
                            placeholder="6.3 อีเมลสำหรับจัดส่งใบกำกับภาษี"
                            value={taxEmail}
                            onChange={(event)=>{setCurrent({...current,taxEmail:event.target.value})}}
                        />
                        {taxStep === '3'
                            ?<FloatingArea
                                name="taxAddress"
                                placeholder={`6.4 ที่อยู่สำหรับจัดส่งใบกำกับภาษี`}
                                value={taxAddress}
                                onChange={(event)=>{setCurrent({...current,taxAddress:event.target.value})}}
                            />
                            :null
                        }
                        <h6>* ทางบัญชีจะส่งใบกำกับภาษี(E-Tax)และใบเสร็จรับเงินทางอีเมลทุกวันศุกร์(ทุกเคส)</h6>
                        <h6>* ทางบัญชีจะส่งใบกำกับภาษี(แบบกระดาษ)ทางไปรษณีย์ทุกวันจันทร์ถัดไป(เฉพาะเคสที่ร้องขอ)</h6>
                     
                    </React.Fragment>
                    :null
                }
            </div>
        </CardComponent>

        <CardComponent title='รูปแบบการชำระเงิน' maxWidth={'95vw'} accentColor={six}  >
            <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                    <h2>7. จ่ายผ่านบัตรเครดิตไหม?</h2>
                </div>
                <Form.Select 
                        aria-label="Default select example" 
                        value={card} 
                        onChange={(event)=>{
                            event.preventDefault()
                            setCurrent(prev=>({...prev, card:event.target.value==='true'}))
                        }}
                        style={{width:'250px'}}
                    >
                        <option value={false}>ไม่ใช่</option>
                        <option value={true} >ใช่</option>
                </Form.Select>
                {card
                    ?<div style={{ paddingLeft:10 }} >
                        <br/>
                        <h6>7.1 เลือก รูปแบบการจ่าย?</h6>

                        <RadioGroup
                            name="installments"
                            value={installments}
                            onChange={(value) =>
                                setCurrent((prev) => ({ ...prev, installments: value }))
                            }
                            >
                            <Radio value="0">จ่ายเต็มจำนวน(+3%)</Radio>
                            <Radio value="3">ผ่อน 3 เดือน(+5.73%)(ขั้นต่ำ 3,000)</Radio>
                            <Radio value="4">ผ่อน 4 เดือน(+6.58%)(ขั้นต่ำ 3,000)</Radio>
                            <Radio value="6">ผ่อน 6 เดือน(+8.29%)(ขั้นต่ำ 4,000)</Radio>
                            <Radio value="10">ผ่อน 10 เดือน(+11.77%)(ขั้นต่ำ 5,000)</Radio>
                        </RadioGroup>
                        <p>*บวกราคาขั้นไปอีก x % เพราะค่าธรรมเนียมการผ่อนชำระ</p>
                    </div>
                    :null
                }
                
            </div>
        </CardComponent>
        {manualPaidImage
            ?<Image style={styles.image} src={manualPaidImage} />
            :null
        }
        {admin &&
            <CardComponent title='marketplace' maxWidth={'95vw'} accentColor={'#D9D9D9'}  >
            <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                    <h2>1. marketplace(เห็นเฉพาะแอดมิน)</h2>
                </div>
                <Form.Select 
                        aria-label="Default select example" 
                        value={marketplaceFranchiseEnable} 
                        onChange={(event)=>{
                            event.preventDefault()
                            setCurrent(prev=>({...prev, marketplaceFranchiseEnable:event.target.value==='true'}))
                        }}
                        style={{width:'250px'}}
                    >
                        <option value={false}>ปิดใช้งาน</option>
                        <option value={true} >เปิดใช้งาน</option>
                </Form.Select>
            </div>
        </CardComponent>}
        
        
    
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
  },
  image : {
      width: '300px',
        objectFit:'contain',
      borderRadius: 10,
      border: '1px solid #ccc',
      cursor: 'pointer'
  }
};

export default Modal_Quotation;
