import React, { useMemo, useState, useRef, useEffect } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { FooterButton, MasterCheckBox } from "../components";
import { colorIndex, colors, initialHardware, initialPackage } from "../configs";
import { formatCurrency2, summary } from "../Utility/function";
import { db, prepareFirebaseImage } from "../db/firestore";
import { useDispatch, useSelector } from "react-redux";
import { stringReceiptNumber } from "../Utility/dateTime";
import { Button } from "rsuite";
import { updateFieldStore } from "../redux/careSlice";
import Modal_Loading from "./Modal_Loading";
import Modal_Success from "./Modal_Success";

const { white, one, green, softWhite, ten } = colors;

function Modal_Hardware({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  submit,
}) {
    const dispatch = useDispatch();
    const { profile:{ yourCode } } = useSelector(state=>state.profile);
    const { demo } = useSelector(state=>state.care);
    const { shopId, storeName, postcode, tax, hardwareOrder, id } = demo;
    const [hardwares, setHardwares] = useState([]);

    const [current, setCurrent] = useState(initialHardware);
    const { vat, imageId } = current;
    const [loading, setLoading] = useState(false);
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [currentHardware, setCurrentHardware] = useState([]);

    useEffect(()=>{
      if(show){
        fetchHardware()
      }
    },[show])

    async function fetchHardware(){
      await db.collection('admin').doc('hardware').get().then((doc)=>{
          if(doc.exists){
              setHardwares(doc.data().value)
          }
      })
  }


    const { netPrice, deliveryFee, vatAmount, totalPrice } = useMemo(()=>{
        let totalPrice = summary(currentHardware,'totalPrice');
        let deliveryFee = totalPrice>=4000?0:50
        let net = totalPrice 
        let vatAmount = 0
        if(vat){
            vatAmount = 0.07*totalPrice
            net = 1.07*totalPrice
        }
        net += deliveryFee
        return {
            netPrice:net,
            deliveryFee,
            vatAmount,
            totalPrice
        }
    },[currentHardware,vat]);

    const fileInputRef2 = useRef(null);
    const handleButtonClick2 = () => {
        fileInputRef2.current.click();
      };
      const handleImageChange = (e) => {
        const file = e.target.files[0]; // Get the selected file
    
        if (file) {
          // Set image size in kilobytes
          // const sizeInKB = (file.size / 1024).toFixed(2); // Convert size to KB and round to 2 decimal places
          // setImageSize(sizeInKB);
    
          // Create a FileReader to read the file
          const reader = new FileReader();
          reader.onloadend = async () => {
              setCurrent(prev=>({...prev,imageId:reader.result}))
          };
    
          reader.readAsDataURL(file); // Convert file to a base64 string
        }
      };




    async function submit(){
      if(!Boolean(imageId)){
          alert('กรุณาแนบหลักฐาน การชำระเงิน')
      } else if(netPrice<1){
          alert('กรุณาเลือกอุปกรณ์ใช้งานที่ต้องการ')
      } else {
        setLoading(true)
        let imageUrl = await prepareFirebaseImage(imageId,'/paidEvident/',shopId);
        var sfDocRef = db.collection("admin").doc('hardwareNumber');
        return db.runTransaction((transaction) => {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(sfDocRef).then((sfDoc) => {
                let orderNumber = stringReceiptNumber(1)
                if (sfDoc.exists) {
                    const { value } = sfDoc.data()
                    orderNumber = stringReceiptNumber(value+1)
                    transaction.update(sfDocRef, { value: value+1, timestamp:new Date()});
                }
                return orderNumber
            });
        }).then(async (orderNumber) => {
            let newObj = {
                ...initialHardware,
                address:postcode.address,
                shopId,
                shopName:storeName,
                timestamp:new Date(),
                net:netPrice,
                deliveryFee,
                totalPrice,
                nameSername:postcode.name,
                tel:postcode.tel,
                product:currentHardware,
                imageId:imageUrl,
                orderNumber,
                vatDetail:'',
                vatAmount,
                tax,
                yourCode
            }
            const docRef = await db.collection('hardwareOrder').add(newObj)
            dispatch(updateFieldStore({ doc:id, field:{ hardwareOrder:[...hardwareOrder,docRef.id] }}))
            setLoading(false)
            setSuccess_Modal(true)
            setTimeout(()=>{
              setSuccess_Modal(false)
              onHide()
            },900)
        })
      }
  };

  function handleHardware({ item, type }){
    switch (type) {
        case 'plus':
            setCurrentHardware(prev=>prev.map(a=>{
              return a.id===item.id
                  ?{...a,qty:a.qty+1,totalPrice:a.totalPrice+Number(a.price)}
                  :a
            }))
            break;
        case 'minus':
            setCurrentHardware(prev=>prev.map(a=>{
              return a.id===item.id
                  ?{...a,qty:a.qty-1,totalPrice:a.totalPrice-Number(a.price)}
                  :a
            }).filter(b=>b.qty>0))
            break;
        case 'add':
          setCurrentHardware(prev=>[...prev,{...item,totalPrice:Number(item.price),qty:1}])
        break;
    
        default:
            break;
    }
 }

  function handleVat(){
    setCurrent(prev=>({...prev,vat:!prev.vat}))
  };

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      className='loading-screen'
      fullscreen={true}
    //   size={size}
    >
            <Modal_Loading show={loading} />
            <Modal_Success show={success_Modal} />
      <Modal.Header closeButton>
        <h3>เลือก Hardware ที่ต้องการ[{formatCurrency2(netPrice)}]</h3>
        <MasterCheckBox
            status={vat}
            color={vat?one:ten}
            value={`ต้องการใบกำกับภาษี`}
            onClick={handleVat}
        />
      </Modal.Header>
      <Modal.Body   >
      
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
                                        {/* <h6 
                                            style={{ lineHeight: '1.8' }}
                                            dangerouslySetInnerHTML={{ __html: detail.replace(/\n/g, '<br />') }} ></h6> */}
                                    </div>
                                    <React.Fragment>
                                        {/* <h6 style={{color:one}} >จัดส่งสินค้าภายใน 5 วัน</h6> */}
                                        {/* <h5 style={{color:green}} >{formatCurrency2(price)}</h5> */}
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
        <input
            type="file"
            ref={fileInputRef2}
            accept="image/*"
            onChange={(e)=>{handleImageChange(e)}}
            style={{ display: 'none' }} // Hide the default file input
        />
        <Button onClick={handleButtonClick2} >แนบหลักฐานชำระเงิน</Button><br/>
        {imageId && <img style={{width:'300px'}} src={imageId} />}
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

const styles = {
  container : {
    backgroundColor:white
  }
}

export default Modal_Hardware;