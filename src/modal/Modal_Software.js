import React, { useMemo, useState, useRef } from "react";
import { Button, Modal } from "react-bootstrap";
import { FooterButton, MasterCheckBox } from "../components";
import { colorIndex, colors, initialPackage, initialSoftware } from "../configs";
import { formatCurrency2, summary } from "../Utility/function";
import { db, prepareFirebaseImage } from "../db/firestore";
import { useDispatch, useSelector } from "react-redux";
import { stringReceiptNumber } from "../Utility/dateTime";
import { updateFieldStore } from "../redux/careSlice";
import Modal_Loading from "./Modal_Loading";
import Modal_Success from "./Modal_Success";

const { white, one, ten } = colors;

function Modal_Software({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  submit,
}) {
    const dispatch = useDispatch();
    const [currentPackage, setCurrentPackage] = useState([]);
    const { profile:{ yourCode } } = useSelector(state=>state.profile);
    const { demo } = useSelector(state=>state.care);
    const { shopId, storeName, id, softwareOrder, tel, ownerName } = demo;

    const [current, setCurrent] = useState(initialSoftware);
    const { vat, imageId } = current;
    const [loading, setLoading] = useState(false);
    const [success_Modal, setSuccess_Modal] = useState(false);


    const { netPrice, thisPackage } = useMemo(()=>{
        let sumPrice = summary(currentPackage,'price')
        let thisPackage = initialPackage.map((item,index)=>({...item,color:colorIndex[index]}))
        return {
            netPrice:vat?1.07*sumPrice:sumPrice,
            thisPackage
        }
    },[currentPackage,vat]);

    const fileInputRef2 = useRef(null);
    const handleButtonClick2 = () => {
        fileInputRef2.current.click();
      };
      const handleImageChange = (e) => {
        const file = e.target.files[0]; // Get the selected file
    
        if (file) {
    
          // Create a FileReader to read the file
          const reader = new FileReader();
          reader.onloadend = async () => {
              setCurrent(prev=>({...prev,imageId:reader.result}))
          };
    
          reader.readAsDataURL(file); // Convert file to a base64 string
        }
      };

    function handlePackage(item){
        if(currentPackage.some(a=>a.id===item.id)){
            setCurrentPackage(prev=>prev.filter(a=>a.id!==item.id))
        } else {
            setCurrentPackage(prev=>[...prev,item])
        }
    };

    function handleVat(){
      setCurrent(prev=>({...prev,vat:!prev.vat}))
    };

    async function submit(){
      if(!Boolean(imageId)){
          alert('กรุณาแนบหลักฐาน การชำระเงิน')
      } else if(netPrice<1){
          alert('กรุณาเลือกแพ็กเกจใช้งานที่ต้องการ')
      } else {
        setLoading(true)
        let imageUrl = await prepareFirebaseImage(imageId,'/paidEvident/',shopId);
        var sfDocRef = db.collection("admin").doc('packageNumber');
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
                ...initialSoftware,
                shopId,
                shopName:storeName,
                timestamp:new Date(),
                orderNumber,
                imageId:imageUrl,
                net:netPrice,
                packageId:currentPackage.map(a=>a.id),
                suggestCode:yourCode,
                tel,
                profileName:ownerName
            }
            
            const docRef = await db.collection('packageOrder').add(newObj)
            dispatch(updateFieldStore({ doc:id, field:{ softwareOrder:[...softwareOrder,docRef.id] }}))
            setLoading(false)
            setSuccess_Modal(true)
            setTimeout(()=>{
              setSuccess_Modal(false)
              onHide()
            },900)
            setCurrentPackage([])
        })
      }
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
        <h3>เลือก package ที่ต้องการ[{formatCurrency2(netPrice)}]</h3>
      </Modal.Header>
      <Modal.Body   >
        <MasterCheckBox
            status={vat}
            color={vat?one:ten}
            value={`ต้องการใบกำกับภาษี`}
            onClick={handleVat}
        />
        {thisPackage.map((item)=>{
            const { color, id, name, price, table } = item;
            let status = currentPackage.some(a=>a.id===id)
            return <MasterCheckBox
                        key={id}
                        status={status}
                        color={status?color:ten}
                        value={`${table} ${name}[${formatCurrency2(price)}]`}
                        onClick={()=>{handlePackage({...item,net:price,qty:1})}}
                    />
        })}
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

export default Modal_Software;