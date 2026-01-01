import React from "react";
import {
  Modal
} from "react-bootstrap";
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink, Font, Image  } from '@react-pdf/renderer';
import { colors } from "../configs";
import Sarabun from '../assets/fonts/Sarabun/Sarabun-Regular.ttf';
import Bold from "../assets/fonts/Sarabun/Sarabun-Bold.ttf";
import Prompt from "../assets/fonts/Sarabun/Prompt-Bold.ttf";

const companyAddress = {
    tel:"086-058-5186",
    nameSername:"ช็อปแชมป์",
    address:'61/114 ซอยทวีมิตร 12 ถนนพระราม 9 ห้วยขวาง ห้วยขวาง กรุงเทพมหานคร 10310'
}

const { softWhite, } = colors;
const MyDocument = ({ destination }) => {
    const { tel:Rtel, nameSername:RnameSername, address:Raddress } = destination;
    const { tel, nameSername, address } = companyAddress;

    return  <Document style={styles.container2} >
                <Page size="A5" style={styles.container3} >
                    <View style={{flexDirection:'row',alignItems:'center'}} >
                        <Image style={{width:50,height:50}} source={'/logo512.png'} />
                        <View style={{paddingLeft:10}} >
                            <Text style={{fontWeight:'bold',fontSize:30}} >ScanFood</Text>
                            <Text style={{fontSize:18}} > สแกนง่าย ยอดขายพุ่ง</Text>
                        </View>
                    </View>
                    <View style={{padding:10,borderRadius:20,borderWidth:1,fontSize:20,marginBottom:10}} >
                        <Text>ผู้ส่ง : {tel}</Text>
                        <Text>{nameSername}</Text>
                        <Text>{address}</Text>
                    </View>
                    <View style={{padding:10,borderRadius:20,borderWidth:1,fontSize:25}} >
                        <Text>ผู้รับ : {Rtel}</Text>
                        <Text>{RnameSername}</Text>
                        <Text>{Raddress}</Text>
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


function Modal_Sticker({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  destination
}) {

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
    //   fullscreen={true}
    >
      <Modal.Header closeButton>
        {/* <PDFDownloadLink document={<MyDocument {...{ currentPackage, currentHardware, vatQuotation, tax, orderNumber, createdDate, expireDate, note, saleName, saleTel }} />} fileName={`${orderNumber}.pdf`}>
            {({ blob, url, loading, error }) =>
            loading ? 'Loading document...' : <Button variant="warning" >บันทึกไฟล์ PDF</Button>

            }
        </PDFDownloadLink>&emsp; */}
      </Modal.Header>
      <Modal.Body  >
        <PDFViewer style={styles.container}>
            <MyDocument {...{ destination  }} />
        </PDFViewer>
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
    text : {
        fontSize:10
    },
  });


export default Modal_Sticker;
