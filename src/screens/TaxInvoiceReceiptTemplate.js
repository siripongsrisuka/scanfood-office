import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  PDFViewer,
  PDFDownloadLink,
  Font,
  pdf,
  Image,
} from "@react-pdf/renderer";

import Sarabun from "../assets/fonts/Sarabun/Sarabun-Regular.ttf";
import Bold from "../assets/fonts/Sarabun/Sarabun-Bold.ttf";
import Prompt from "../assets/fonts/Sarabun/Prompt-Bold.ttf";
import { formatCurrency, numberToThaiText } from "../Utility/function";
import { stringYMDHMS3 } from "../Utility/dateTime";

// =========================
// FONT
// =========================
Font.register({
  family: "Sarabun",
  src: Sarabun,
});

Font.register({
  family: "Bold",
  src: Bold,
});

Font.register({
  family: "Prompt",
  src: Prompt,
});

// =========================
// MOCK DATA
// =========================
// const seller = {
//   company: "บริษัท ช็อปแชมป์ จำกัด",
//   branchText: "(สำนักงานใหญ่)",
//   address1: "61/114 ชั้นที่ 2 ห้องเลขที่ 2บี ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง ",
//   address2: "กรุงเทพ 10310",
//   taxId: "0105566020622",
//   phone: "020556595",
//   website: "www.shopchamp.co",
// };

const installmentRates = {
  "0": '3%',
  "3": '5.73%',
  "4": '6.58%',
  "6": '8.29%',
  "10": '11.77%',
}

const meta = {
  invoiceNo: "INV2026030011",
  date: "09/03/2026",
  sellerName: "ธนัชชา พรหมบุตร",
  contactName: "คุณจุฑาทิพย์ ช่วงเวฬุวรรณ",
  contactPhone: "0659942666",
  contactEmail: "ruaylonfa.center@gmail.com",
};

// const items = [
//   {
//     no: 1,
//     name: "Software Scanfood Full-Package 1",
//     details: [
//       "QR Code (การสแกนสั่งอาหารภายในร้าน)",
//       "Self Pickup (การสแกนสั่งอาหารภายนอกร้าน)",
//       "Staff management (แยกสิทธิ์การใช้งานพนักงาน)",
//     ],
//     qty: "1",
//     unit: "Licence",
//     unitPrice: "4,200.00",
//     discount: "-",
//     total: "4,200.00",
//   },
// ];

const summary = {
  subtotal: "4,200.00",
  vat: "294.00",
  grandTotal: "4,494.00",
  withholdingTax: "126.00",
  paid: "4,368.00",
  thaiText: "(สี่พันสี่ร้อยเก้าสิบสี่บาทถ้วน)",
};

const payment = {
  method: "transfer",
  bank: "กสิกรไทย ออมทรัพย์",
  accountNo: "1532981103",
  date: "09/03/2026",
  amount: "4,368.00",
};

// ถ้ามีโลโก้จริง เปลี่ยน path ตรงนี้ได้
const logoUrl = "/logo-shopchamp.png";

// =========================
// STYLES
// =========================
const styles = {
  page: {
    fontFamily: "Sarabun",
    fontSize: 8,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 22,
    color: "#222222",
    position: "relative",
  },

  row: {
    flexDirection: "row",
  },

  between: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  topGrid: {
    flexDirection: "row",
    marginBottom: 14,
  },

  leftCol: {
    width: "54%",
    paddingRight: 12,
  },

  rightCol: {
    width: "46%",
    paddingLeft: 8,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  logoBox: {
    width: 78,
    height: 38,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackLogo: {
    fontFamily: "Bold",
    fontSize: 22.4,
    color: "#5C34D6",
  },

  brandText: {
    fontFamily: "Bold",
    fontSize: 17.6,
    color: "#4B4B4B",
  },

  companyBlock: {
    fontSize: 8.4,
    lineHeight: 1.45,
  },

  bold: {
    fontFamily: "Bold",
  },

  title: {
    fontFamily: "Bold",
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
  },

  subTitle: {
    fontSize: 8.4,
    textAlign: "center",
    marginTop: 2,
  },

  hr: {
    borderTopWidth: 1,
    borderTopColor: "#D5D5D5",
    marginVertical: 10,
  },

  metaRow: {
    flexDirection: "row",
    marginBottom: 4,
  },

  metaLabel: {
    width: 80,
    fontFamily: "Bold",
  },

  metaValue: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: "Bold",
    marginBottom: 3,
  },

  table: {
    marginTop: 10,
    // borderWidth: 1,
    borderBottomWidth:1,
    borderColor: "#BEBEBE",
  },

  tableHead: {
    flexDirection: "row",
    backgroundColor: "#AFAFAF",
    color: "#FFFFFF",
    minHeight: 28,
    alignItems: "center",
  },

  headCell: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    fontFamily: "Bold",
    fontSize: 8,
  },

  bodyRow: {
    flexDirection: "row",
    // minHeight: 88,
    // borderTopWidth: 1,
    // borderTopColor: "#D8D8D8",
  },

  cell: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    fontSize: 8,
  },

  center: {
    textAlign: "center",
  },

  right: {
    textAlign: "right",
  },

  itemName: {
    marginBottom: 3,
  },

  itemSub: {
    fontSize: 7.2,
    marginBottom: 2,
    lineHeight: 1.35,
  },

  summaryWrap: {
    flexDirection: "row",
    marginTop: 12,
  },

  summaryLeft: {
    flex: 1,
    paddingTop: 52,
    fontSize: 8.4,
  },

  summaryRight: {
    width: 250,
    marginLeft: "auto",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  summaryLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 14,
  },

  summaryValue: {
    width: 95,
    textAlign: "right",
  },

  summarySeparator: {
    borderTopWidth: 1,
    borderTopColor: "#D4D4D4",
    marginVertical: 10,
  },

  lineFull: {
    borderTopWidth: 1,
    borderTopColor: "#D6D6D6",
    marginTop: 4,
  },

  signaturesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 22,
  },

  signatureArea: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  signatureBox: {
    width: "35%",
    alignItems: "center",
    minHeight: 110,
    position: "relative",
  },

  signatureMid: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },

  signLine: {
    width: "78%",
    borderTopWidth: 1,
    borderTopColor: "#BFBFBF",
    marginTop: 24,
  },

  signLabel: {
    marginTop: 4,
  },

  signDate: {
    marginTop: 12,
    marginBottom: 2,
  },

  blueSign: {
    position: "absolute",
    top: 8,
    color: "#355FD6",
    fontSize: 14.4,
    fontFamily: "Prompt",
  },

  stampText1: {
    fontFamily: "Bold",
    fontSize: 27.2,
    color: "#2147D6",
    lineHeight: 1,
  },

  stampText2: {
    fontFamily: "Bold",
    fontSize: 16,
    color: "#2147D6",
    lineHeight: 1,
    marginTop: 2,
  },

  stampText3: {
    fontSize: 8,
    color: "#2147D6",
    marginTop: 2,
  },

};

// =========================
// HELPERS
// =========================
const CheckboxPdf = ({ checked }) => (
  <View style={styles.checkbox}>
    <Text>{checked ? "✓" : ""}</Text>
  </View>
);

const formatDateDMY = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// =========================
// PDF DOCUMENT
// =========================
const InvoiceDocument = ({ data }) => {
  const { logo, items, saleName, seller, orderNumber, vatInfo, createdAt,
    deliveryFee, subtotal, card, installments, installmentFee, vat = 0,
    grandTotal, withholdingTax, net
   } = data;

   const finalItems = deliveryFee>0
    ? [...items, { name:"ค่าจัดส่ง", price:deliveryFee, qty:1, net:deliveryFee }]
    : items
   const subTotal = subtotal +deliveryFee;

   const thaiText = numberToThaiText(net);


  return (
    <Document
      title={meta.invoiceNo}
      author="Shopchamp"
      subject="ใบกำกับภาษี/ใบเสร็จรับเงิน"
    >
      <Page size="A4" style={styles.page}>
        {/* TOP */}
        <View style={styles.topGrid}>
          <View style={styles.leftCol}>
            <View style={styles.brandRow}>
                <Image src={logo} style={{ width: 162, height: 81, objectFit: "contain" }} />
            </View>

            <View style={styles.companyBlock}>
              <Text style={styles.bold}>{seller.company} {seller.branchText}  </Text>
              <Text>{seller.address}  </Text>
              <Text>เลขประจำตัวผู้เสียภาษี {seller.taxId}  </Text>
              <Text>เบอร์มือถือ {seller.phone}  </Text>
              <Text>{seller.website}  </Text>
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={styles.sectionTitle}>ลูกค้า</Text>
              <View style={styles.companyBlock}>
                <Text style={styles.bold}>
                  {vatInfo.name} {vatInfo.branch}  
                </Text>
                <Text>{vatInfo.address}  </Text>
                <Text>เลขประจำตัวผู้เสียภาษี {vatInfo.taxId}  </Text>
              </View>
            </View>
          </View>

          <View style={styles.rightCol}>
            <Text style={styles.title}>ใบเสนอราคา</Text>
            <Text style={styles.subTitle}>ต้นฉบับ (เอกสารออกเป็นชุด)  </Text>

            <View style={styles.hr} />

            <View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>เลขที่  </Text>
                <Text style={styles.metaValue}>{orderNumber}  </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>วันที่  </Text>
                <Text style={styles.metaValue}>{formatDateDMY(createdAt)}  </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>ผู้ขาย  </Text>
                <Text style={styles.metaValue}>{saleName}  </Text>
              </View>
            </View>

            <View style={styles.hr} />

            <View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>ผู้ติดต่อ  </Text>
                <Text style={styles.metaValue}>{vatInfo.contactName}  </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>เบอร์โทร  </Text>
                <Text style={styles.metaValue}>{vatInfo.tel}  </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>อีเมล  </Text>
                <Text style={styles.metaValue}>{vatInfo.email}  </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex:1 }} >
          {/* TABLE */}
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={{ ...styles.headCell, width: "7%", textAlign: "center" }}>#  </Text>
              <Text style={{ ...styles.headCell, width: "42%" }}>รายละเอียด  </Text>
              <Text style={{ ...styles.headCell, width: "16%", textAlign: "center" }}>จำนวน  </Text>
              <Text style={{ ...styles.headCell, width: "15%", textAlign: "right" }}>ราคาต่อหน่วย  </Text>
              <Text style={{ ...styles.headCell, width: "10%", textAlign: "right" }}>ส่วนลด  </Text>
              <Text style={{ ...styles.headCell, width: "10%", textAlign: "right" }}>มูลค่า  </Text>
            </View>

            {finalItems.map((item,index) => (
              <View key={index} style={styles.bodyRow}>
                <Text style={{ ...styles.cell, width: "7%", textAlign: "center" }}>{index + 1}  </Text>

                <View style={{ ...styles.cell, width: "42%" }}>
                  <Text style={styles.itemName}>{item.name}  </Text>
                </View>

                <View style={{ ...styles.cell, width: "16%", textAlign: "center" }}>
                  <Text>{item.qty}  </Text>
                </View>

                <Text style={{ ...styles.cell, width: "15%", textAlign: "right" }}>{formatCurrency(Number(item.price))}  </Text>

                <Text style={{ ...styles.cell, width: "10%", textAlign: "right" }}></Text>

                <Text style={{ ...styles.cell, width: "10%", textAlign: "right" }}>
                  {formatCurrency(Number(item.net))}  
                </Text>
              </View>
            ))}
          </View>
            {/* SUMMARY */}
        <View style={styles.summaryWrap}>
          <View style={styles.summaryLeft}>
            <Text>({thaiText})  </Text>
          </View>

          <View style={styles.summaryRight}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>รวมเป็นเงิน  </Text>
              <Text style={styles.summaryValue}>{formatCurrency(subTotal)} บาท  </Text>
            </View>
            {card && installments ==='0' && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ค่าบริการบัตรเครดิต {installmentRates[installments]} </Text>
                <Text style={styles.summaryValue}>{formatCurrency(installmentFee)} บาท  </Text>
              </View>
            )}
            {card && installments !=='0' && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ค่าบริการผ่อนชำระ {installmentRates[installments]}  </Text>
                <Text style={styles.summaryValue}>{formatCurrency(installmentFee)} บาท  </Text>
              </View>
            )}
            {vat > 0 
              ?<View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ภาษีมูลค่าเพิ่ม 7%  </Text>
                <Text style={styles.summaryValue}>{formatCurrency(vat)} บาท  </Text>
              </View>
              :<View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ภาษีมูลค่าเพิ่ม 7%  </Text>
                <Text style={styles.summaryValue}>0.00 บาท  </Text>
              </View>
            }
            
            <View style={styles.summaryRow}>
              <Text style={{ ...styles.summaryLabel, ...styles.bold }}>จำนวนเงินรวมทั้งสิ้น   </Text>
              <Text style={{ ...styles.summaryValue, ...styles.bold }}>{formatCurrency(grandTotal)} บาท  </Text>
            </View>

            {withholdingTax >0
              ?<View>
                  <View style={styles.summarySeparator} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>หักภาษี ณ ที่จ่าย 3%  </Text>
                    <Text style={styles.summaryValue}>{formatCurrency(withholdingTax)} บาท  </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={{ ...styles.summaryLabel, ...styles.bold }}>ยอดชำระ  </Text>
                    <Text style={{ ...styles.summaryValue, ...styles.bold }}>
                      {formatCurrency(net)} บาท  
                    </Text>
                </View>
              </View>

              :null
            }
          </View>
        </View>

        </View>



      



        {/* SIGNATURES */}
        <View style={styles.signaturesHeader}>
          <Text>ในนาม {vatInfo.name}  </Text>
          <Text>ในนาม {seller.company}  </Text>
        </View>
    
        <View style={{ display:'flex', flexDirection:'row', justifyContent:'space-around',marginBottom:20,paddingVertical:10 }} >
            <View style={{ display:'flex', flexDirection:"column", alignItems:'center' }} >
                <Text>______________________________________</Text>
                <Text style={{paddingVertical:3,marginTop:5, textAlign:'center'}} >ผู้สั่งซื้อสินค้า </Text>
            </View>
            <View style={{ display:'flex', flexDirection:"column", alignItems:'center' }} >
                <Text>______________________________________</Text>
                <Text style={{paddingVertical:3,marginTop:5, textAlign:'center'}} >วันที่ </Text>
            </View>
            {vat > 0 
              ?<View style={{ marginTop:-40 }} >
                  <Image src={"/seal.png"} style={{ width:100, height:50 }} />
              </View>
              :null
            }
            
            <View style={{ display:'flex', flexDirection:"column", alignItems:'center' }} >
                <Text>______________________________________</Text>
                <Text style={{paddingVertical:3,marginTop:5, textAlign:'center'}} >ผู้อนุมัติ </Text>
            </View>
            <View style={{ display:'flex', flexDirection:"column", alignItems:'center' }} >
                <Text>______________________________________</Text>
                <Text style={{paddingVertical:3,marginTop:5, textAlign:'center'}} >วันที่ </Text>
            </View>
        </View>
      </Page>
    </Document>
  );
};

// =========================
// MAIN COMPONENT
// =========================
export default function InvoiceA4ReactPdf({ data }) {
  const handlePrint = async () => {
    try {
      const blob = await pdf(<InvoiceDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Print PDF error:", error);
    }
  };

  return (
    <div style={{ padding: 20, background: "#f3f3f3", minHeight: "100vh" }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
        <button
          onClick={handlePrint}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Print PDF
        </button>

        <PDFDownloadLink
          document={<InvoiceDocument data={data} />}
          fileName={`${data.companyName}_${data.orderNumber}_${data.vatInfo.contactName}_${data.vatInfo.name}.pdf`}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontSize: 12,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {({ loading }) => (loading ? "กำลังสร้าง PDF..." : "Download PDF")}
        </PDFDownloadLink>
      </div>

      <div style={{ width: "100%", height: "88vh", background: "#fff" }}>
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <InvoiceDocument data={data} />
        </PDFViewer>
      </div>
    </div>
  );
}