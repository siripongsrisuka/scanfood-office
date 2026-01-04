import React, { useEffect, useState, useMemo, useRef, forwardRef } from "react";
import {
  Button,
  Modal,
} from "react-bootstrap";
import { formatCurrency, summary } from "../Utility/function";
import { MdRadioButtonUnchecked, MdRadioButtonChecked } from 'react-icons/md'; // replace with correct MaterialCommunityIcons mapping
import { colors, initialStoreSize } from "../configs";
import { FooterButton } from "../components";
import DatePicker from "react-datepicker";
import { SlCalender } from "react-icons/sl";

const { white, dark, theme3, five } = colors;

function Modal_Package({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  licenses,
  current,
  setCurrent,
  submit
}) {
    const { storeSize, software, requestDate = '', hardware } = current;

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <div style={{ borderRadius:20 }} onClick={onClick} ref={ref}>
          {value}
        </div>
    ));

  
  const { display, extraCharge, softwarePrice, net } = useMemo(()=>{
    const thisSize = storeSize>100?100:storeSize;
    const display = licenses.map(({ name, price, color })=>({ name, ...price.find(b=>b.table===thisSize && b.save!==0), color }));
    const softwarePrice = summary(software,'price')
    // เกิดจากโต็กเกิน 100 โต๊ะ
    const extraCharge = storeSize>100
        ?((storeSize-100)/50)*3000
        :0;
    const net = extraCharge + softwarePrice
      return {
          display,
          extraCharge,
          softwarePrice,
          net
      }
  },[licenses,storeSize,software]);

  function handleSubmit(){
    if(software.length===0 && hardware.length === 0) return alert('เลือกอย่างน้อย 1 รายการ');

    submit({
        extraCharge,
        softwarePrice,
        net
    })
  }




    function manageSoftware(item){
        setCurrent(prev=>({
            ...prev,
            software:prev.software.some(a=>a.id === item.id)
                ?prev.software.filter(a=>a.id !== item.id)
                :[...prev.software,item]
        }))
    };


    function handleStoreSize(value){
        setCurrent(prev=>({...prev, storeSize:value, software:[] }))
    }


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
        <h2><b>เติมแพ็กเกจ {formatCurrency(net)}</b></h2>
      </Modal.Header>
      <Modal.Body  >
      <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
            <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                <h2>1. ขนาดร้าน <span style={{ color:five }}  >{extraCharge>0?`+ ${formatCurrency(extraCharge)}`:''}</span>
                   
                </h2>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {initialStoreSize.map((item) => {
                    const { id, value } = item;
                    const status = storeSize === value

                    return (
                        <div
                        key={id}
                        onClick={() => handleStoreSize(value)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            backgroundColor:white,
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
                            <div style={{ fontSize: 18, fontWeight: 600 }}>{value} โต๊ะ</div>
                        </div>
                        </div>
                    );
                })}
            </div>
            
        </div>
        <br/><br/>
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
                    <div style={{ paddingLeft:10,paddingRight:10 }} >  วันที่จัดส่ง: </div>
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
    
      </Modal.Body>
      <FooterButton {...{ onHide, submit:()=>{handleSubmit()}, rightText:'เปิดบิล' }} />
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

export default Modal_Package;
