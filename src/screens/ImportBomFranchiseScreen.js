import React, { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { db } from "../db/firestore";
import { Table,
  Row, Col
 } from "react-bootstrap";
import { Modal_FlatlistSearchFranchise, Modal_Loading } from "../modal";
import { v4 as uuidv4 } from 'uuid';
import { minusDays, plusSecond } from "../Utility/dateTime";
import { findInArray, toastSuccess } from "../Utility/function";
import { CardComponent, OneButton } from "../components";


const initialShop = { id:'', name:'', bomCategory:[] };
const initialBOM = {
    shopId:'',
    name:'',
    category:[],
    unit:[],
    cost:{id:'',cost:''},
    stock:0,  // ตามหน่วยย่อยที่สุด
    minimumStock:{qty:'',status:false,id:''},
    franchiseId:'',
};


const ImportBomFranchiseScreen = () => {
  const [products, setProducts] = useState([]);
  const [search_Modal, setSearch_Modal] = useState(false);
  const [shop, setShop] = useState(initialShop)
  const { id:franchiseId, name, bomCategory:smartCategory } = shop;
  const [category, setCategory] = useState([]);
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
                name: row.getCell(1).value||'', // Assuming name in column A
                smallestUnit: row.getCell(2).value||'', // Assuming name in column A
                category: row.getCell(3).value||'', // Assuming name in column A
                safetyStock: row.getCell(4).value||'', // Assuming name in column A
                stock: row.getCell(5).value||'', // Assuming name in column A
                cost: row.getCell(6).value||'', // Assuming name in column A
                });
            }
            });

            setProducts([...extractedProducts]); // Now update the state
                let catSet = new Set();
                let cat = [];

                for (const item of extractedProducts) {
                    if (!catSet.has(item.category) && item.category) {
                        catSet.add(item.category);
                        cat.push({ id: uuidv4(), category: item.category });
                    }
                }
            setCategory(cat)

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

        const ok = window.confirm(`คุณต้องการเพิ่มสินค้าทั้งหมด ${products.length} รายการ ไปยังร้าน ${name} ใช่หรือไม่?`)
        if(!ok) return;
    
        try {
            setLoading(true);
            const batch = db.batch();
            const yesterday = minusDays(new Date,1)
            // Process products concurrently
            const productPromises = products.map(async ({ name, smallestUnit, safetyStock, category: thisCategory, cost, stock }, index) => {
                const unitId = uuidv4()

                const newItem = {
                    ...initialBOM,
                    name,
                    // timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    timestamp: plusSecond(yesterday,index*5),
                    franchiseId,
                    stock
                };
                if(thisCategory){
                  const categoryId = findInArray(category, 'category', thisCategory)?.id;
                  newItem.category = [{
                      aboveId: [],
                      level: 1,
                      id:categoryId,
                      name: thisCategory,
                  }]
              }
                if(smallestUnit){
                    newItem.unit = [{amount:'1',id:unitId, baseId:unitId, name:smallestUnit }]
                }
                if(safetyStock){
                    newItem.minimumStock = { qty:safetyStock, status:true, id:unitId }
                }
                if(cost){
                    newItem.cost = { id:'', cost }
                }
    
                batch.set(db.collection('franchiseBom').doc(), newItem);
            });
    
            await Promise.all(productPromises);
    
            // Process categories
            if (category.length > 0) {
                const newCategories = category.map(({ id, category }) => ({
                    aboveId: [],
                    level: 1,
                    id,
                    name: category,
                }));
    
                let updatedShopCategory = [...smartCategory];
                const firstLevelCategory = updatedShopCategory.find(a => a.level === 1);
    
                if (firstLevelCategory) {
                    firstLevelCategory.value = [...firstLevelCategory.value, ...newCategories];
                } else {
                    updatedShopCategory.push({ level: 1, value: newCategories });
                }
                batch.update(db.collection('franchise').doc(franchiseId), { bomCategory: updatedShopCategory });
            }
    
            // Commit batch operation
            await batch.commit();
            console.log('Batch write successful');
            toastSuccess('เพิ่มวัตถุดิบสำเร็จ');
            setProducts([]);
            setShop(initialShop);
        } catch (error) {
            console.error('Error adding products:', error);
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
