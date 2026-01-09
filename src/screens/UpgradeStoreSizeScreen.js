import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
} from "react-bootstrap";
import { Modal_FlatlistSearchShop, Modal_Loading, Modal_Qrcode } from "../modal";
import { colors, initialShop, initialStoreSize } from "../configs";
import { MdRadioButtonUnchecked, MdRadioButtonChecked } from 'react-icons/md'; // replace with correct MaterialCommunityIcons mapping
import { db } from "../db/firestore";
import { diffDaysFloor, formatCurrency, formatTime, summary, toastSuccess } from "../Utility/function";
import { Card, OneButton } from "../components";
import { stringFullDate, stringReceiptNumber, stringYMDHMS3 } from "../Utility/dateTime";
import { scanfoodAPI } from "../Utility/api";
import { useSelector } from "react-redux";

const { dark, theme3, white } = colors;

function UpgradeStoreSizeScreen() {
    const [search_Modal, setSearch_Modal] = useState(false);
    const [current, setCurrent] = useState(initialShop);
    const { name, vip, storeSize} = current;
    const [selectedSize, setSelectedSize] = useState(20);
    const [masterPackage, setMasterPackage] = useState([]);
    const [loading, setLoading] = useState(false);
    const [payment_Modal, setPayment_Modal] = useState(false);
    const [qrCode, setQrcode] = useState('');
    const [amount, setAmount] = useState('');
    const { profile:{ id:profileId, name:profileName } } = useSelector(state=>state.profile);


    const { currentStore, vipPrice, net, vipCharge, extraCharge } = useMemo(()=>{
        const currentStore = initialStoreSize.filter(item=>item.value > storeSize);
        const thisSize = selectedSize>100?100:selectedSize;
        const nextPrice = masterPackage.map(({ name, price, color })=>({ name, ...price.find(b=>b.table===thisSize && b.save!==0), color }));
        const prevPrice = new Map(masterPackage.map(({ name, price, color })=>({ name, ...price.find(b=>b.table===storeSize && b.save!==0), color })).map(b=>[b.name,b.price]))
        const diffPrice = nextPrice.map(item=>{
            const price = prevPrice.get(item.name);
            return {
                ...item,
                price:item.price - price

            }
        });
        const diffMap = new Map(diffPrice.map(a=>[a.name,a.price]))
        const packageSet = new Set(['qrcode','staff','language']);
        const translateMap = {
            qrcode:'POS และQR code สแกนสั่งอาหาร',
            language:'วุ้นแปลภาษา',
            staff:'แยกสิทธิ์พนักงาน'

        };
        const day = new Date().getTime()
        const vipPrice = vip.map((item)=>{
            if(!packageSet.has(item.type)) return {...item, price:0};

            const remainDay = item.expire.getTime()>day?diffDaysFloor(day,item.expire.getTime()):0;
            const thisPrice = diffMap.get(translateMap[item.type]) || 0
            const price = remainDay>0
                ?remainDay*thisPrice/365
                :0
            return {
                    ...item,
                    price:Math.ceil(price),
                }
        });

        const extraCharge = selectedSize>100
            ?storeSize>=100
                ?((selectedSize-storeSize)/50)*3000
                :((selectedSize-100)/50)*3000
            :0;
        const vipCharge = Math.ceil(summary(vipPrice,'price'))
        const net = extraCharge + vipCharge
        return {
            currentStore,
            diffPrice,
            vipPrice,
            net,
            extraCharge,
            vipCharge
        }
    },[storeSize,initialStoreSize,masterPackage,selectedSize,vip]);



    useEffect(() => {
        fetchPackage()
   
    }, []);



    async function fetchPackage(){
        setLoading(true);
        try {
            const packageDoc = await db.collection('admin').doc('package').get();
            const { value } = packageDoc.data();
            setMasterPackage(value)
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };



    function handleShop({ vip, ...rest }){
        setSearch_Modal(false);
        setCurrent({
            vip:vip.map(item=>({...item,expire:formatTime(item.expire)})),
            ...rest
        })
        setSelectedSize(rest.storeSize)
   
    };

    async function submit(){
        if(!current.id) return alert('เพิ่มร้านก่อน')
        setLoading(true);
        const amount = ['xL8vqnyJ8OfkVpHJBPJvEei2D3B3','cZ7XkJeZzNOrr5HEZKEPgAjtMrx2'].includes(profileId)
                ?1 // payload.net
                :net
        try {
            const timestamp = new Date();

            const qrCode =  await db.runTransaction( async (transaction) => {
                let orderNumber = stringReceiptNumber(1)
                const upgradeNumberRef = db.collection("admin").doc('upgradeNumber');
                const upgradeNumberDoc = await transaction.get(upgradeNumberRef);
                const { value } = upgradeNumberDoc.data();
                orderNumber = stringReceiptNumber(value+1);

                const upgradeRef = db.collection('autoUpgradeSize').doc();
                const { status, data } = await scanfoodAPI.post(process.env.REACT_APP_API_URL,{ 
                    channelType:'posxpay',
                    shopId:`upgrade:${upgradeRef.id}`,
                    amount,
                    serial:'WQRN002405000023',
                    token:process.env.REACT_APP_API_TOKEN,
                    ref2:'auto'
                });
    
                const { 
                    referenceId,
                    chargeId,
                    qrCode,
                } = data?.data;
                const { id:shopId, storeSize, name } = current;
                transaction.set(upgradeRef,{
                    shopId,
                    shopName:name,
                    storeSize,
                    nextStoreSize:selectedSize,
                    amount,
                    chargeId,
                    qrCode,
                    profileId,
                    profileName,
                    createdAt:timestamp,
                    process:'request', // requst, success, cancel
                    billDate:stringYMDHMS3(timestamp),
                    orderNumber
                })
          
                transaction.update(upgradeNumberRef, { value: value+1, timestamp });
                return qrCode
            })
            
            setQrcode(qrCode);
            setAmount(amount);
            setPayment_Modal(true);
            toastSuccess('สร้างคำขอสำเร็จ');
            setCurrent(initialShop);
            setSelectedSize(20);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    
  return (
    <div style={styles.container} >
        <h1>ปรับขนาดร้าน</h1>
        <Modal_Loading show={loading} />
        <Modal_Qrcode
            show={payment_Modal}
            onHide={()=>{setPayment_Modal(false)}}
            qrCode={qrCode}
            amount={amount}
        />
        <Modal_FlatlistSearchShop
            show={search_Modal}
            onHide={()=>{setSearch_Modal(false)}}
            onClick={handleShop}
        />
        <OneButton {...{ text:'ค้นหาร้านค้า', submit:()=>{setSearch_Modal(true)} }} />
        <Card title={name} >
            <h4>ขนาดโต๊ะ : {storeSize}</h4>
            {vipPrice.map((a,i)=>{
                return  <div key={i} style={{ display:'flex', justifyContent:'flex-start'}} >
                            <h6 style={{ minWidth:'150px'}} >{a.type} </h6>
                            <h6  >: {stringFullDate(a.expire)}({a.price})</h6>
                        </div>
            })}
        </Card>
        <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
            <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                <h2>ขนาดร้าน</h2>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {currentStore.map((item) => {
                    const { id, value } = item;
                    const status = selectedSize === value

                    return (
                        <div
                        key={id}
                        onClick={() => setSelectedSize(value)}
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
        <br/>
        <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
            <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
                <h2>ยอดรวม</h2>
            </div>
            <Button variant="light" style={{ minWidth:'150px' }} >
                <h4>{formatCurrency(vipCharge)}</h4>
                <h6>vip</h6>
            </Button>
            +
            <Button variant="light" style={{ minWidth:'150px' }} >
                <h4>{formatCurrency(extraCharge)}</h4>
                <h6>extra</h6>
            </Button>
            =
            <Button variant="light" style={{ minWidth:'150px' }} >
                <h4>{formatCurrency(net)}</h4>
                <h6>net</h6>
            </Button>
            <OneButton {...{ text:'สร้างการชำระเงิน', submit:()=>{submit()} }} />
            
            
        </div>
      <div>

    </div>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default UpgradeStoreSizeScreen;