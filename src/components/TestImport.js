import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { minusMinutes, plusSecond } from '../Utility/dateTime';
import { initialProduct } from '../configs';
import { db } from '../db/firestore';
import { findInArray } from '../Utility/function';
import { v4 as uuidv4 } from 'uuid';
import { Button } from 'rsuite';

function parseExcelToArrayOfObjects(file, callback) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const binaryStr = e.target.result;
    const workbook = XLSX.read(binaryStr, { type: 'binary' });
    
    // Process each sheet and store it in an array format
    const sheetsData = workbook.SheetNames.map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const [header, ...rows] = jsonData;
      const data = rows.map((row) => {
        const obj = {};
        header.forEach((key, index) => {
          obj[key] = row[index] || null;
        });
        return obj;
      });
      
      return { sheetName, data };
    });

    // Pass the result to the callback function
    callback(sheetsData);
  };

  reader.readAsBinaryString(file);
}

function TestImport() {
  const [sheetsData, setSheetsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success_Modal, setSuccess_Modal] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    parseExcelToArrayOfObjects(file, setSheetsData);
  };



  async function addProductsToDatabase() {
    if(sheetsData.length===0){
      alert('กรุณาใส่ข้อมูล')
      return;
    } 
    const smartCategory = []
    //   setLoading(true)

        let catSet = new Set();
        let category = [];

        for (const item of sheetsData[0].data.filter(a=>a.ชื่อหมวดหมู่อาหาร)) {
            if (!catSet.has(item.ชื่อหมวดหมู่อาหาร)) {
                catSet.add(item.ชื่อหมวดหมู่อาหาร);
                category.push({ id: uuidv4(), category: item.ชื่อหมวดหมู่อาหาร });
            }
        }
       
    //   const batch = db.batch();

  //   {
  //     id:'alpha',
  //     mainId:'alpha',
  //     name:t('screens.saleChannel.other1'),
  //     status:false,
  // },
      // Iterate over each item in fileContent
      console.log(category)
      const date = minusMinutes(new Date(),10)
      const rawData = sheetsData[1].data.filter(a=>a.ชื่อเมนูอาหาร).map(item => ({
        name: item['ชื่อเมนูอาหาร'],
        category: item['หมวดหมู่'],
        detail: item['รายละเอียด (ถ้ามี)'],
        price: item['ราคาขายหน้าร้าน'],
        Lineman: item['ราคา Lineman'],
        Grab: item['ราคา Grab'],
        Foodpanda: item['ราคา Foodpanda'],
        Shopeefood: item['ราคา Shopeefood'],
        alpha: item['ราคา Robinhood'],
      }))
      const masterData = rawData.map(({ name, category:thisCategory, detail, price, Lineman, Grab, Foodpanda, Shopeefood, alpha }, index) => {
          // Create a new product object with updated properties
          let haveCategory = findInArray(category,'category',thisCategory)?.id || ''
          const newItem = {
              ...initialProduct,
              name,
              shopId:'id',
              price: [
                { id: 1,  price:String(price) },
                { id: 'Lineman',  price:String(Lineman), status:Lineman?true:false },
                { id: 'Grab',  price:String(Grab), status:Grab?true:false },
                { id: 'Foodpanda',  price:String(Foodpanda), status:Foodpanda?true:false },
                { id: 'Shopeefood',  price:String(Shopeefood), status:Shopeefood?true:false },
                { id: 'alpha',  price:String(alpha), status:alpha?true:false },
              ],
              category:haveCategory?[haveCategory]:[],
              detail:detail?detail:'',
              timestamp:plusSecond(date,3*index)
          };
          return newItem
          console.log(newItem)
          // Add the new product to the batch
        //   const newDocRef = db.collection('product').doc();
        //   batch.set(newDocRef, newItem);
      });
      console.log(masterData)
      const channel = [
        {
          id:'Grab',
          mainId:'Grab',
          name:'Grab',
          status:rawData.some(a=>a.Grab),
      },
      {
          id:'Lineman',
          mainId:'Lineman',
          name:'Lineman',
          status:rawData.some(a=>a.Lineman),
      },
      {
          id:'Foodpanda',
          mainId:'Foodpanda',
          name:'Foodpanda',
          status:rawData.some(a=>a.Foodpanda),
      },
      {
          id:'Shopeefood',
          mainId:'Shopeefood',
          name:'Shopeefood',
          status:rawData.some(a=>a.Shopeefood),
      },
      {
          id:'alpha',
          mainId:'alpha',
          name:rawData.some(a=>a.Robinhood)?'Robinhood':'alpha',
          status:rawData.some(a=>a.Robinhood),
      },
      ]
      if(category.length>0){
        category = category.map(( {id, category} )=>({ aboveId:[], level:1, id, name:category}))
        const categorys = smartCategory
              .flatMap(a => a.value)
          
      
            const updatedCategory = Array.from({ length: 9 }, (_, i) => {
              const level = i + 1;
              const value = [...category, ...categorys].filter(a => a.level === level);
              return value.length ? { level, value } : null;
            }).filter(Boolean);
                console.log(updatedCategory)

        }

};


  return (
    <div className="full-screen">
      <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" className="file-input" />
      <Button color="green" appearance="primary" onClick={addProductsToDatabase} >อัปโหลด</Button>
      <div className="data-display">
        {sheetsData.map(({ sheetName, data }) => (
          <div key={sheetName}>
            <h2>{sheetName}</h2>
            <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {data.length > 0 &&
                    Object.keys(data[0]).map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestImport;
