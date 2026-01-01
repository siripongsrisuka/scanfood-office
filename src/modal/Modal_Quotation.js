import React, { useEffect, useRef, useState } from "react";
import {
  Modal, Button
} from "react-bootstrap";
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink, Font, Image  } from '@react-pdf/renderer';
import { colors, initialHardware, initialSoftware } from "../configs";
import Sarabun from '../assets/fonts/Sarabun/Sarabun-Regular.ttf';
import Bold from "../assets/fonts/Sarabun/Sarabun-Bold.ttf";
import Prompt from "../assets/fonts/Sarabun/Prompt-Bold.ttf";
import { formatCurrency, summary } from "../Utility/function";
import { db, prepareFirebaseImage } from "../db/firestore";
import { useDispatch, useSelector } from "react-redux";
import { updateFieldStore } from "../redux/careSlice";
import { stringReceiptNumber } from "../Utility/dateTime";
import Modal_Loading from "./Modal_Loading";
import Modal_Success from "./Modal_Success";

const { softWhite, } = colors;
const MyDocument = ({ currentPackage, currentHardware, vatQuotation, tax, orderNumber, createdDate, expireDate, note, saleName, saleTel }) => {
 
    let current = [...currentPackage,...currentHardware]
    const { name, tel, address, taxNumber, branch, fax } = tax;
    let totalPrice = summary(current,'net')
    let vat = vatQuotation?totalPrice*0.07:0
    let totalNet = totalPrice + vat
    return <Document style={styles.container2} >
    <Page size="A4" style={styles.container3} >
        <View style={styles.container4} >
              <View style={styles.container5} >
                    <View style={{flexDirection:'row'}} >
                        <Image style={{width:50,height:50}} source={'/logo512.png'} />
                        <View style={{paddingLeft:10}} >
                            <Text style={{fontSize:22}} >ScanFood</Text>
                            <Text style={{fontSize:18}} >สแกนง่าย ยอดขายพุ่ง</Text>
                        </View>
                    </View>
                    
                        <View style={{flex:1,marginTop:18}} >
                            <Text style={{fontSize:14,fontWeight:'bold'}} >ใบเสนอราคาสำหรับ </Text>
                            <Text style={styles.text} >{name} </Text>
                            <Text style={styles.text} >{address} </Text>
                            <Text style={styles.text} >{taxNumber} </Text>
                            <Text style={styles.text} >{branch} </Text>
                            <Text style={styles.text} >{tel} </Text>
                            <Text style={styles.text} >{fax} </Text>
                        </View>
              </View>
              <View style={styles.container6} >
                  <Text style={{fontSize:20,textAlign:'center'}} >ใบเสนอราคา</Text>
                  <View style={{borderBottomWidth:1,marginVertical:10}} />
                  <View style={{flexDirection:'row',paddingVertical:3}} >
                        <Text style={{width:80}} >เลขที่ใบเสนอราคา</Text>
                        <Text style={{flex:1}} >{orderNumber}</Text>
                  </View>
                  <View style={{flexDirection:'row',paddingVertical:3}} >
                        <Text style={{width:80}} >วันที่ออก</Text>
                        <Text style={{flex:1}} >{createdDate}</Text>
                  </View>
                  <View style={{flexDirection:'row',paddingVertical:3}} >
                        <Text style={{width:80}} >วันที่หมดอายุ</Text>
                        <Text style={{flex:1}} >{expireDate}</Text>
                  </View>
                  <View style={{borderBottomWidth:1,marginVertical:10}} />
                  <View style={{flexDirection:'row',paddingVertical:3}} >
                        <Text style={{width:80}} >ผู้ติดต่อ</Text>
                        <Text style={{flex:1}} >{saleName}</Text>
                  </View>
                  <View style={{flexDirection:'row',paddingVertical:3}} >
                        <Text style={{width:80}} >เบอร์โทร</Text>
                        <Text style={{flex:1}} >{saleTel}</Text>
                  </View>
              </View>
        </View>
        <View style={{flex:1}} >
            <View style={styles.container7} >
                <Text style={styles.text4} >คำอธิบาย </Text>
                <Text style={styles.text3} >ราคาต่อหน่วย </Text>
                <Text style={styles.text3} >จำนวน </Text>
                <Text style={styles.text3} >ราคารวม </Text>
            </View>
            {current.map((item,index)=>{
                const { id, name, price, qty, net } = item;
                return <View key={id} style={styles.container8} >
                        <Text style={{fontSize:12, textAlign:'center',width:50}} >{index+1} </Text>
                        <Text style={styles.text4} >{name} </Text>
                        <Text style={styles.text3} >{formatCurrency(price)} </Text>
                        <Text style={styles.text3} >{qty}</Text>
                        <Text style={styles.text3} >{formatCurrency(net)} </Text>
                </View>
            })}
            <Text style={{fontSize:12}} >หมายเหตุ : {note}</Text>
            <View style={{alignItems:'flex-end'}} >
                <View style={{flexDirection:'row',alignItems:'center',paddingVertical:3}} >
                    <Text style={{fontSize:12}} >ยอดรวม </Text>
                    <Text style={{width:100,textAlign:'center',fontSize:12}} >{formatCurrency(totalPrice)}</Text>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',paddingVertical:3}} >
                    <Text style={{fontSize:12}} >ภาษีมูลค่าเพิ่ม(7%) </Text>
                    <Text style={{width:100,textAlign:'center',fontSize:12}} >{formatCurrency(vat)}</Text>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',paddingVertical:3}} >
                    <Text style={{fontSize:12}} >ยอดที่ต้องชำระ </Text>
                    <Text style={{width:100,textAlign:'center',fontSize:12}} >{formatCurrency(totalNet)}</Text>
                </View>
            </View>
        </View>
        
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}} >
            <View>
                <View style={{flexDirection:'row',alignItems:'center'}} >
                    <View style={{paddingTop:5,borderTopWidth:1,marginRight:5,width:120,justifyContent:'center',alignItems:'center'}} >
                        <Text>ลูกค้า</Text>
                    </View>
                    <View style={{paddingTop:5,borderTopWidth:1,paddingHorizontal:30,marginRight:5}} >
                        <Text>วันที่</Text>
                    </View>
                </View>
                {/* <Text style={{textAlign:'center',alignSelf:'center',paddingTop:10,paddingBottom:40}} >ในนาม {'customerTax.name||shopName'} </Text> */}
            </View>
            {/* <View>
                <View style={{flexDirection:'row',alignItems:'center'}} >
                    <View style={{paddingTop:5,borderTopWidth:1,marginRight:5,width:120,justifyContent:'center',alignItems:'center'}}  >
                        <Text>ผู้อนุมัติ</Text>
                    </View>
                    <View style={{paddingTop:5,borderTopWidth:1,paddingHorizontal:30,marginRight:5}} >
                        <Text>วันที่</Text>
                    </View>
                </View>
                <Text style={{textAlign:'center',alignSelf:'center',paddingTop:10,paddingBottom:40}} >ในนาม {'name'}</Text>
            </View> */}
        </View>
    </Page>
  </Document>
  };

  Font.register({
    family: "Sarabun",
    src: Sarabun,
  });
  Font.register(

    {
      family: "Bold",
      src: Bold,
    }
    );

    Font.register(

        {
          family: "Prompt",
          src: Prompt,
        }
        );


function Modal_Quotation({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  currentQuotation
}) {
    const dispatch = useDispatch();
    const { demo } = useSelector(state=>state.care);
    const { profile } = useSelector(state=>state.profile);
    const { yourCode } = profile;
    const { id, quotation, shopId, storeName, tel, postcode, hardwareOrder, softwareOrder, ownerName } = demo;
    const [evident, setEvident] = useState('');
    const [loading, setLoading] = useState(false)
    const [success_Modal, setSuccess_Modal] = useState(false)

    useEffect(()=>{
        if(show){
            setEvident(currentQuotation.evident)
        }
    },[show])
    const { currentPackage, currentHardware, vatQuotation, tax, orderNumber, createdDate, expireDate, note, saleName, saleTel  } = currentQuotation;
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
                let imageUrl = await prepareFirebaseImage(reader.result,'/paidEvident/','shopId')
                dispatch(updateFieldStore({ doc:id, field:{ quotation:quotation.map(a=>{
                    return a.orderNumber === orderNumber
                        ?{...a,evident:imageUrl}
                        :a
                }) } }))
                setEvident(imageUrl)
          };
    
          reader.readAsDataURL(file); // Convert file to a base64 string
        }
      };

    async function createOrder() {
        if(!shopId){
            alert('ยังไม่ได้เลือกร้านอาหาร');
            return;
        }
        if (!evident) {
            alert('กรุณาใส่หลักฐานชำระเงิน');
            return;
        }
    
        setLoading(true);
    
        try {
            let updates = [];
            let field = {};
    
            // Helper function for handling transactions
            async function handleTransaction(docRef, initialValue, updateField) {
                const orderNumber = await db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(docRef);
                    let number = stringReceiptNumber(initialValue);
                    if (doc.exists) {
                        const { value } = doc.data();
                        number = stringReceiptNumber(value + 1);
                        transaction.update(docRef, { value: value + 1, timestamp: new Date() });
                    }
                    return number;
                });
                return orderNumber;
            }
    
            // Handling hardware orders
            if (currentHardware) {
                const hardwareDocRef = db.collection("admin").doc('hardwareNumber');
                const orderNumber = await handleTransaction(hardwareDocRef, 1);
    
                const totalPrice = summary(currentHardware, 'totalPrice');
                const deliveryFee = totalPrice >= 4000 ? 0 : 50;
                const net = totalPrice + deliveryFee;
    
                const obj = {
                    ...initialHardware,
                    address: postcode.address,
                    shopId,
                    shopName: storeName,
                    timestamp: new Date(),
                    net,
                    deliveryFee,
                    totalPrice,
                    nameSername: postcode.name,
                    tel: postcode.tel,
                    product: currentHardware.map(a=>({...a,totalPrice:a.net})),
                    imageId: evident,
                    orderNumber,
                    suggestCode:yourCode,
                    profileName:ownerName
                };
    
                const hardwareDoc = await db.collection('hardwareOrder').add(obj);
                field.hardwareOrder = [...hardwareOrder, hardwareDoc.id];
                updates.push(hardwareDoc);
            }
    
            // Handling package orders
            if (currentPackage) {
                const packageDocRef = db.collection("admin").doc('packageNumber');
                const orderNumber = await handleTransaction(packageDocRef, 1);
    
                const obj = {
                    ...initialSoftware,
                    shopId,
                    shopName: storeName,
                    timestamp: new Date(),
                    orderNumber,
                    imageId: evident,
                    net: summary(currentPackage, 'net'),
                    packageId: currentPackage.map((item) => item.id),
                    suggestCode: yourCode,
                    tel,
                    profileName:ownerName
                };
    
                const packageDoc = await db.collection('packageOrder').add(obj);
                field.softwareOrder = [...softwareOrder, packageDoc.id];
                updates.push(packageDoc);
            }
    
            // Update the store
            updates.push(dispatch(updateFieldStore({ doc: id, field })));
    
            // Await all updates
            await Promise.all(updates);
    
            // Success actions
            setLoading(false);
            setSuccess_Modal(true);
            setTimeout(() => {
                setSuccess_Modal(false);
            }, 900);
            onHide()
        } catch (error) {
            console.error("Error creating order:", error);
            setLoading(false);
        }
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
        <Modal_Loading show={loading} />
        <Modal_Success show={success_Modal} />
      <Modal.Header closeButton>
        <PDFDownloadLink document={<MyDocument {...{ currentPackage, currentHardware, vatQuotation, tax, orderNumber, createdDate, expireDate, note, saleName, saleTel }} />} fileName={`${orderNumber}.pdf`}>
            {({ blob, url, loading, error }) =>
            loading ? 'Loading document...' : <Button variant="warning" >บันทึกไฟล์ PDF</Button>

            }
        </PDFDownloadLink>&emsp;
        <input
            type="file"
            ref={fileInputRef2}
            accept="image/*"
            onChange={(e)=>{handleImageChange(e)}}
            style={{ display: 'none' }} // Hide the default file input
        />
        <Button onClick={handleButtonClick2} >แนบหลักฐานชำระเงิน</Button>&emsp;
        <Button onClick={createOrder} variant="success" >สร้างคำสั่ง</Button>
      </Modal.Header>
      <Modal.Body  >
        <PDFViewer style={styles.container}>
            <MyDocument {...{ currentPackage, currentHardware, vatQuotation, tax, orderNumber, createdDate, expireDate, note, saleName, saleTel  }} />
        </PDFViewer>
        <div>
            <h4>หลักฐานการชำระเงิน</h4>
            <img style={{width:'300px'}} src={evident} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: {
        width: '100%', height: '70vh' 
    },
    container2 : {
        fontFamily: "Sarabun", fontSize:10
    },
    container3 : {
        padding:30
    },
    container4 : {
        flexDirection:'row'
    },
    container5 : {
        flex:2
    },
    container6 : {
        flex:1,marginBottom:40
    },
    container7 : {
        flexDirection:'row',backgroundColor:softWhite,paddingVertical:8
    },
    container8 : {
        flexDirection:'row',paddingVertical:7,borderBottomWidth:1,borderColor:softWhite
    },
    text : {
        fontSize:10
    },
    text2 : {
        fontSize:10,fontWeight:'bold',marginTop:10
    },
    text3 : {
        width:100, fontSize:12, textAlign:'center'
    },
    text4 : {
        flex:1,fontSize:12
    }
  });


export default Modal_Quotation;
