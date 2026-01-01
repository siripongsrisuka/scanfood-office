import React, { useState } from "react";
import ExcelJS from "exceljs";
import { db, prepareFirebaseImage } from "../db/firestore";
import { Table } from "react-bootstrap";
import { colors, initialWarehouseItem } from "../configs";
import { Modal_FlatlistSearchFranchise, Modal_Loading, Modal_Success } from "../modal";
import { Button } from "rsuite";
import { v4 as uuidv4 } from 'uuid';
import { minusMinutes, plusSecond } from "../Utility/dateTime";
import { findInArray } from "../Utility/function";

const { theme3 } = colors;
const initialShop = { id:'', name:'', warehouseCategory:[] }

const ImportMarketPlaceFranchise = () => {
  const [products, setProducts] = useState([]);
  const [search_Modal, setSearch_Modal] = useState(false);
  const [shop, setShop] = useState(initialShop)
  const { id:franchiseId, name, warehouseCategory:smartCategory } = shop;
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success_Modal, setSuccess_Modal] = useState(false);


  const processImage = async (imgBuffer, imgType) => {
    return new Promise((resolve) => {
      const blob = new Blob([imgBuffer], { type: imgType });
      const img = new Image();
  
      img.onload = async () => {
        let width = 300; // Initial width
        let height = (img.height / img.width) * width;
        let quality = 0.8; // Initial quality
        let resizedBlob;
  
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        do {
          // Set new dimensions
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
  
          // Try reducing quality if needed
          resizedBlob = await new Promise((resolve) => 
            canvas.toBlob(resolve, imgType, quality)
          );
  
          if (resizedBlob.size > 50 * 1024) {
            if (width > 150) {
              width -= 30; // Reduce width (step-by-step)
              height = (img.height / img.width) * width;
            } else {
              quality -= 0.1; // If width is too small, lower quality
            }
          }
        } while (resizedBlob.size > 50 * 1024 && quality > 0.1);
  
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ 
            resizedBase64: reader.result, 
            resizedSize: resizedBlob.size 
          });
        };
        reader.readAsDataURL(resizedBlob);
      };
  
      img.src = URL.createObjectURL(blob);
    });
  };
  
  // Usage
  const handleImageProcessing = async (img) => {
    const imageSize = img.buffer.byteLength;
    const MAX_SIZE = 50 * 1024; // 50KB  
  
    if (imageSize > MAX_SIZE) {
      console.log(`Resizing image. Original size: ${imageSize} bytes`);
      const { resizedBase64, resizedSize } = await processImage(img.buffer, img.type);
      console.log(`Resized image size: ${resizedSize} bytes`);
      return resizedBase64
    } else {
      const base64Image = `data:${img.type};base64,${img.buffer.toString("base64")}`;
      return base64Image  
    } 
  };
  

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
                    sku: row.getCell(1).value||'', // Assuming name in column A
                    barcode: row.getCell(2).value||'', // Assuming name in column A
                    name: row.getCell(3).value||'', // Assuming name in column A
                    category: row.getCell(4).value||'', // Assuming name in column A
                    unit: row.getCell(5).value||'', // Assuming name in column A
                    weight: row.getCell(6).value||'', // Assuming name in column A
                    price: row.getCell(7).value||'', // Assuming name in column A
                    discount: row.getCell(8).value||'', // Assuming name in column A
                    point: row.getCell(9).value||'', // Assuming name in column A
                    minimum: row.getCell(10).value||'', // Assuming name in column A
                    maximum: row.getCell(11).value||'', // Assuming name in column A
                    stock: row.getCell(12).value||'', // Assuming name in column A
                    image: '',
                });
            }
            });

            workbook.eachSheet(async (sheet) => {
                const imagePromises = sheet.getImages().map(async (image) => {
                    const img = workbook.model.media.find((m) => m.index === image.imageId);
                    if (img && img.buffer) {
                    const processedImage = await handleImageProcessing(img);
                    extractedProducts[image.range.tl.nativeRow - 1].image = processedImage;
                    }
                });
                
                await Promise.all(imagePromises); // Wait for all images to be processed
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

            });
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
        }
    
        try {
            setLoading(true);
            const batch = db.batch();
            const date = minusMinutes(new Date(), 10);
    
            // Process products concurrently
            const productPromises = products.map(async ({ 
                name, price, category: thisCategory, detail, image, sku,
                barcode, unit, weight, discount, point, minimum, maximum, stock
            }, index) => {
                const imageId = image ? await prepareFirebaseImage(image, '/scanfoodMenu/', `${franchiseId}${index+1}`) : image;
                
                
                const newItem = {
                    ...initialWarehouseItem,
                    sku,
                    barcode,
                    name,
                    price,
                    detail: detail || '',
                    timestamp: plusSecond(date, 3 * index),
                    franchiseId,
                    imageId,
                    unit,
                    weight,
                    discount,
                    point,
                    minimum,
                    maximum,
                    stock,
                    saleStatus:'available'
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
                batch.set(db.collection('warehouseItem').doc(), newItem);
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
                batch.update(db.collection('franchise').doc(franchiseId), { warehouseCategory: updatedShopCategory });
            }
    
            // Commit batch operation
            await batch.commit();
            console.log('Batch write successful');
    
            setProducts([]);
            setShop(initialShop)
            setSuccess_Modal(true);
            setTimeout(() => setSuccess_Modal(false), 900);
        } catch (error) {
            console.error('Error adding products:', error);
        } finally {
            setLoading(false);
        }
    };

    function test(){
      const date = new Date()
      const productPromises = products.map( ({ 
        name, price, category: thisCategory, detail, image, sku,
        barcode, unit, weight, discount, point, minimum, maximum, stock
    }, index) => {
        const newItem = {
            ...initialWarehouseItem,
            sku,
            barcode,
            name,
            price,
            // category: categoryId ? [categoryId] : [],
            detail: detail || '',
            timestamp: plusSecond(date, 3 * index),
            franchiseId,
            imageId:image,
            unit,
            weight,
            discount,
            point,
            minimum,
            maximum,
            stock,
            image:image,
            saleStatus:'available'
        };

        if(category){
            const categoryId = findInArray(category, 'category', thisCategory)?.id;
            newItem.category = [{
                aboveId: [],
                level: 1,
                id:categoryId,
                name: category,
            }]
        }
        const undefinedFields = Object.entries(newItem)
          .filter(([key, value]) => value === undefined)
          .map(([key]) => key);

        if (undefinedFields.length > 0) {
          console.error(`❌ Undefined fields at index ${index}:`, undefinedFields);
          console.log("Full item:", newItem);
        }
        return newItem
    });
   
    
    // console.log(results);
    }

    const results = products.map((item, index) => {
      const undefinedFields = Object.keys(item).filter(key => item[key] === undefined);
      return { index, undefinedFields };
    }).filter(result => result.undefinedFields.length > 0);
    console.log('results')
    console.log(results)


  return (
    <div style={{padding:10}} >
        <Modal_Loading show={loading} />
        <Modal_Success show={success_Modal} />
        <Modal_FlatlistSearchFranchise
            show={search_Modal}
            onHide={()=>{setSearch_Modal(false)}}
            onClick={handleShop}
        />
        <div>
            <Button color="red" appearance="primary" onClick={()=>{setSearch_Modal(true)}}>1. เลือกร้านค้า</Button>
            {name
                ?<p><h2>ร้าน : {name}</h2></p>
                :null
            }
        </div>
        {/* <Button onClick={test} >test</Button> */}
       {name
            ?<React.Fragment>
                <h2>2.Upload Excel File with Images</h2>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
                <Button color="orange" appearance="primary" onClick={addProductsToDatabase}>3. Upload</Button>
                <Table striped bordered hover responsive  variant="light"   >
                    <thead  >
                    <tr>
                    <th style={styles.text2}>No.</th>
                    <th style={styles.text}>sku</th>
                    <th style={styles.text}>barcode</th>
                    <th style={styles.text}>name</th>
                    <th style={styles.text}>category</th>
                    <th style={styles.text}>unit</th>
                    <th style={styles.text}>weight(kg)</th>
                    <th style={styles.text}>price</th>
                    <th style={styles.text4}>discount</th>
                    <th style={styles.text}>point</th>
                    <th style={styles.text}>minimum</th>
                    <th style={styles.text}>maximum</th>
                    <th style={styles.text}>stock</th>
                    <th style={styles.text}>image</th>
                    </tr>
                </thead>
                <tbody  >
                    {products.map((item, index) => {
                    const { name, category, discount, price, image, sku, barcode, unit, weight,
                        point, minimum, maximum, stock
                     } = item;
                    return <tr  key={index} >
                            <td style={styles.text3}>{index+1}.</td>
                            <td style={styles.text3} >{sku}</td>
                            <td style={styles.text3} >{barcode}</td>
                            <td style={styles.text3}>{name}</td>
                            <td style={styles.text3}>{category}</td>
                            <td style={styles.text3}>{unit}</td>
                            <td style={styles.text3}>{weight}</td>
                            <td style={styles.text3}>{price}</td>
                            <td style={styles.text3}>{discount}</td>
                            <td style={styles.text3}>{point}</td>
                            <td style={styles.text3}>{minimum}</td>
                            <td style={styles.text3}>{maximum}</td>
                            <td style={styles.text3}>{stock}</td>
                            <td style={styles.text3}>
                                <img style={{width:'100px'}} src={image} />
                            </td>
                            </tr>
                    })}
                </tbody>
                </Table>
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

export default ImportMarketPlaceFranchise;
