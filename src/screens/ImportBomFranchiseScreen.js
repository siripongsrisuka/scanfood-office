import React, { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { Table,
  Row, Col
 } from "react-bootstrap";
import { Modal_FlatlistSearchFranchise, Modal_Loading } from "../modal";
import { v4 as uuidv4 } from 'uuid';
import { toastSuccess } from "../Utility/function";
import { scanfoodAPI } from "../Utility/api";
import { cellValue, importErrorText, OFFICE_IMPORT } from "../Utility/officeImport";
import { CardComponent, OneButton } from "../components";


const initialShop = { id:'', name:'', bomCategory:[] };


const ImportBomFranchiseScreen = () => {
  const [products, setProducts] = useState([]);
  const [search_Modal, setSearch_Modal] = useState(false);
  const [shop, setShop] = useState(initialShop)
  const { id:franchiseId, name } = shop;
  // 🔁 รหัสรอบนำเข้า (DEV-1266) — ตั้งตอนเลือกไฟล์ · ยิงซ้ำด้วยรหัสเดิม = server ไม่สร้างของซ้ำ
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
            setImportId(uuidv4()); // รอบใหม่ = ไฟล์ใหม่ (หมวดถูกรวมฝั่ง server ตามชื่อ)
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

        if(!franchiseId) return alert('กรุณาเลือกแฟรนไชส์');

        const ok = window.confirm(`คุณต้องการเพิ่มสินค้าทั้งหมด ${products.length} รายการ ไปยังร้าน ${name} ใช่หรือไม่?`)
        if(!ok) return;

        // 🔒 DEV-1266: จอนี้เคยเขียน `franchiseBom` (ทะเบียนแม่) ตรงแล้วจบ ⇒ **สาขาไม่ได้รับสักใบ**
        //   ตอนนี้ยิงเข้า server ที่เดินผ่านกลไก fan-out จริงของบ้าน (ใบงาน + cursor + นับก่อนบอกว่าเสร็จ)
        //   ⇒ ผลตอบกลับบอกจำนวนสาขาที่ได้รับ และบอกตรง ๆ ถ้ากระจายไม่ครบ (ไม่ใช่ขึ้นเขียวลอย)
        try {
            setLoading(true);
            const { data } = await scanfoodAPI.post(OFFICE_IMPORT.bomFranchise, {
                importId,
                franchiseId,
                rows: products,
            });

            setProducts([]);
            setShop(initialShop);
            setImportId('');
            if (data && data.duplicate) {
                toastSuccess('ไฟล์นี้ถูกอัปโหลดไปแล้ว (ไม่ได้เพิ่มซ้ำ)');
            } else if (data && data.state && data.state !== 'done') {
                // กระจายไม่ครบ = ต้องดัง ไม่ใช่บอกว่าสำเร็จ (คลาส "รายงานเขียวทั้งที่แดง")
                alert(`เพิ่มวัตถุดิบแล้ว ${(data && data.created) || 0} รายการ แต่กระจายให้สาขายังไม่ครบ\n`
                    + `(คาดหวัง ${data.expectedDocs} · ลงจริง ${data.countedDocs} · ใบงาน ${data.jobId})\nแจ้งทีมพัฒนาเพื่อสั่งซ่อมใบงานนี้`);
            } else {
                toastSuccess(`เพิ่มวัตถุดิบสำเร็จ ${(data && data.created) || 0} รายการ · กระจายครบ ${(data && data.shopCount) || 0} สาขา`);
            }
        } catch (error) {
            alert(importErrorText(error));
        } finally {
            setLoading(false);
        }
    };



  return (
    <div  >
        <h1>อัปโหลดวัตถุดิบแฟรนไชส์</h1>
        <Modal_Loading show={loading} />
        <Modal_FlatlistSearchFranchise
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
                <OneButton {...{ text:'2. เลือกไฟล์', submit:() => fileInputRef.current.click(), variant:franchiseId?'success':'secondary' }} />
            </Col>
            <Col md='4' sm='6' >
                <OneButton {...{ text:'3. Upload', submit:()=>{addProductsToDatabase()}, variant:franchiseId&&products.length>0?'success':'secondary'  }} />
            </Col>
        </Row>
        {franchiseId
            ?<React.Fragment>
            <CardComponent title="ข้อมูลแฟรนไชส์">
                <h5>แฟรนไชส์ : {name}</h5>
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

export default ImportBomFranchiseScreen;
