import React, { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { Table, Row, Col } from "react-bootstrap";
import { colors } from "../configs";
import { Modal_FlatlistSearchShop, Modal_Loading } from "../modal";
import { v4 as uuidv4 } from 'uuid';
import { toastSuccess } from "../Utility/function";
import { scanfoodAPI } from "../Utility/api";
import { cellValue, importErrorText, OFFICE_IMPORT } from "../Utility/officeImport";
import { CardComponent, OneButton } from "../components";
import { stringFullDate } from "../Utility/dateTime";

const { theme3 } = colors;
const initialShop = { id:'', name:'', BOMCategory:[], createdDate:new Date() };


const ImportBomShopScreen = () => {
  const [products, setProducts] = useState([]);
  const [search_Modal, setSearch_Modal] = useState(false);
  const [shop, setShop] = useState(initialShop)
  const { id:shopId, name, createdDate } = shop;
  // 🔁 รหัสรอบนำเข้า — ตั้ง 1 ครั้งตอนเลือกไฟล์ แล้วใช้ตัวเดิมตลอดจนกว่าจะสำเร็จ
  //    ⇒ กดซ้ำ/เน็ตหลุดแล้วยิงใหม่ = server รู้ว่าเป็นรอบเดิม ไม่สร้างของซ้ำ (DEV-1266)
  const [importId, setImportId] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const workbook = new ExcelJS.Workbook();

            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.getWorksheet(1);

            const extractedProducts = [];
            worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header
                extractedProducts.push({
                    name: cellValue(row.getCell(1).value), // Assuming name in column A
                    smallestUnit: cellValue(row.getCell(2).value), // Assuming name in column A
                    category: cellValue(row.getCell(3).value), // Assuming name in column A
                    safetyStock: cellValue(row.getCell(4).value), // Assuming name in column A
                    stock: cellValue(row.getCell(5).value), // Assuming name in column A
                    cost: cellValue(row.getCell(6).value), // Assuming name in column A
                });
            }
            });

            setProducts([...extractedProducts]); // Now update the state
            setImportId(uuidv4()); // รอบใหม่ = ไฟล์ใหม่ (หมวดถูกรวมฝั่ง server ตามชื่อ ไม่ต้องแจก id ที่นี่แล้ว)
        };

        reader.readAsArrayBuffer(file);
        }
    };


    function handleShop(item){
        setSearch_Modal(false)
        setShop(item)
    };

    async function addProductsToDatabase() {
  
        if (products.length === 0) {
            return alert('กรุณาใส่ไฟล์ excel');
        };

        if(!shopId) return alert('กรุณาเลือกร้าน');

        const ok = window.confirm(`คุณต้องการเพิ่มสินค้าทั้งหมด ${products.length} รายการ ไปยังร้าน ${name} ใช่หรือไม่?`)
        if(!ok) return;

        // 🔒 DEV-1266: จอนี้ **ไม่เขียน Firestore เองแล้ว** — ส่งแถวดิบให้ server ตรวจ/เขียนทั้งชุด
        //   server = ตัวที่ตรวจชนิด/ช่วงค่าต่อแถว · กันยิงซ้ำด้วย importId · เปิด ledger + ป้าย `_lastMove`
        //   ⇒ แถวเน่าแถวเดียว = ไม่มีอะไรถูกเขียนเลย และข้อความบอกเลขแถวใน Excel ให้ไปแก้
        try {
            setLoading(true);
            const { data } = await scanfoodAPI.post(OFFICE_IMPORT.bomShop, {
                importId,
                shopId,
                rows: products,
            });

            setProducts([]);
            setShop(initialShop);
            setImportId('');
            toastSuccess(data && data.duplicate
                ? 'ไฟล์นี้ถูกอัปโหลดไปแล้ว (ไม่ได้เพิ่มซ้ำ)'
                : `เพิ่มวัตถุดิบสำเร็จ ${(data && data.created) || 0} รายการ`);
        } catch (error) {
            alert(importErrorText(error));
        } finally {
            setLoading(false);
        }
    };



  return (
    <div  >
        <h1>อัปโหลดวัตถุดิบร้านเดี่ยว</h1>
        <Modal_Loading show={loading} />
        <Modal_FlatlistSearchShop
            show={search_Modal}
            onHide={()=>{setSearch_Modal(false)}}
            onClick={handleShop}
        />
        <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: "none" }}
        />
        <Row>
            <Col md='4' sm='6' >
                <OneButton {...{ text:'1. เลือกร้านค้า', submit:()=>{setSearch_Modal(true)}, variant:'success' }} />
            </Col>
            <Col md='4' sm='6' >
                <OneButton {...{ text:'2. เลือกไฟล์', submit:() => fileInputRef.current.click(), variant:shopId?'success':'secondary' }} />
            </Col>
            <Col md='4' sm='6' >
                <OneButton {...{ text:'3. Upload', submit:()=>{addProductsToDatabase()}, variant:shopId&&products.length>0?'success':'secondary'  }} />
            </Col>
        </Row>
        {shopId
            ?<React.Fragment>
            <CardComponent title="ข้อมูลร้าน">
                <h5>ร้าน : {name}</h5>
                <h6>วันที่สมัคร : {stringFullDate(createdDate)}</h6>
            </CardComponent>
            <CardComponent title="ข้อมูลวัตถุดิบ" maxWidth={'none'} >
                <Table striped bordered hover responsive  variant="light"   >
                    <thead  >
                        <tr>
                        <th style={styles.text2}>No.</th>
                        <th style={styles.text}>name</th>
                        <th style={styles.text}>smallestUnit</th>
                        <th style={styles.text4}>category</th>
                        <th style={styles.text}>safetyStock</th>
                        <th style={styles.text}>stock</th>
                        <th style={styles.text}>cost</th>
                        </tr>
                    </thead>
                    <tbody  >
                        {products.map((item, index) => {
                            const { name, category, smallestUnit, cost, safetyStock, stock } = item;
                            return <tr  key={index} >
                                        <td style={styles.text3}>{index+1}.</td>
                                        <td style={styles.text3} >{name}</td>
                                        <td style={styles.text3} >{smallestUnit}</td>
                                        <td style={styles.text3}>{category}</td>
                                        <td style={styles.text3}>{safetyStock}</td>
                                        <td style={styles.text3}>{stock}</td>
                                        <td style={styles.text3}>{cost}</td>
                                    </tr>
                        })}
                    </tbody>
                </Table>
            </CardComponent>
            </React.Fragment>
            :null
        }
    </div>
  );
};

const styles = {
  container : {
    paddingLeft:'3rem',paddingRight:'3rem'
  },
  container2 : {
    backgroundColor:theme3,borderRadius:20,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column',padding:5,marginBottom:'1rem'
  },
  text : {
    width: '12%', textAlign:'center',minWidth:'120px'
  },
  text2 : {
    width: '4%', textAlign:'center'
  },
  text3 : {
    textAlign:'center'
  },
  text4 : {
    width: '15%', textAlign:'center',minWidth:'150px'
  }
}

export default ImportBomShopScreen;
