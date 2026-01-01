import React, { useState } from "react";
import Papa from 'papaparse';
import { Button, Form, Table } from "react-bootstrap";
import { Modal_Loading } from "../modal";
import { db } from "../db/firestore";
import { admin, colors, initialProduct } from "../configs";
import { v4 as uuidv4 } from 'uuid';
import { findInArray } from "../Utility/function";
import { minusMinutes, plusSecond } from "../Utility/dateTime";
import { useSelector } from "react-redux";

const { white } = colors;

function ManageImport() {
  const [fileContent, setFileContent] = useState([]);
  const [shop, setShop] = useState({ name:'', id:''});
  const { name, id } = shop;
  const [allShop, setAllShop] = useState([])
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(false)
  const { profile: { id:profileId, yourCode } } = useSelector(state => state.profile)

  const handleFileChange = (event) => {

      const file = event.target.files[0];
      if (file) {
        if (file.type === 'text/csv') {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target.result;
            Papa.parse(text, {
              header: true, // Use the first row as header row.So, will use header column as key filed to be object value in result
              complete: (parsedData) => {
                const rawData = convertDataToObject(parsedData);
                setFileContent(rawData);

                let catSet = new Set();
                let cat = [];

                for (const item of rawData) {
                    if (!catSet.has(item.category) && item.category) {
                        catSet.add(item.category);
                        cat.push({ id: uuidv4(), category: item.category });
                    }
                }
                setCategory(cat)
              },
              error: (error) => {
                alert('Error parsing CSV file');
                console.error('Error parsing CSV file:', error);
              },
            });
          };
          reader.readAsText(file);
        } else {
          alert('Unsupported file type');
        }
      }
  };

  const convertDataToObject = (parsedData) => {
    return parsedData.data; // No conversion needed if header is true
  };

  async function addProductsToDatabase() {
    if(!name){
      alert('กรุณาเลือกร้านค้า')
    } else if(fileContent.length===0){
      alert('กรุณาใส่ไฟล์ csv')
    } else {
      setLoading(true)
      const batch = db.batch();

      // Iterate over each item in fileContent
      const date = minusMinutes(new Date(),10)
      fileContent.forEach(({ name, price, category:thisCategory, detail }, index) => {
          // Create a new product object with updated properties
          const newItem = {
              ...initialProduct,
              name,
              shopId:id,
              price: [{ id: 1, price:String(price) }],
              category:findInArray(category,'category',thisCategory)?.id?[findInArray(category,'category',thisCategory)?.id]:[],
              detail:detail?detail:'',
              timestamp:plusSecond(date,3*index)
          };
          // Add the new product to the batch
          const newDocRef = db.collection('product').doc();
          batch.set(newDocRef, newItem);
      });
      if(category.length>0){
        const newCate = category.map(( {id, category} )=>({ aboveId:[], level:1, id, name:category}))
        let newSmartCat = shop.smartCategory
        let findFirstlevel = newSmartCat.filter(a=>a.level===1)
        if(findFirstlevel && findFirstlevel.level){
          findFirstlevel.value = [...findFirstlevel.value,...newCate]
        } else {
          newSmartCat = [
            {
              level:1,
              value:newCate
            }
          ]
        }
        const newDocRef = db.collection('shop').doc(shop.id);
          batch.update(newDocRef, { smartCategory:newSmartCat});
      }

      // Commit the batch operation
      return batch.commit().then(() => {
          console.log('Batch write successful');
          setLoading(false)
          setFileContent([])
          setShop({ name:'', id:''})
          alert('Batch write successful')
      }).catch(error => {
        alert('Error writing batch')
        setFileContent([])
        setLoading(false)
        setShop({ name:'', id:''})

          console.error('Error writing batch', error);
          throw error; // Propagate the error to the caller
      });
    }
};

    function findShop(){
      setLoading(true)
      db.collection('shop').where('tel','==',phoneNumber).get().then((qsnapshot)=>{
        let data = []
          if(qsnapshot.docs.length>0){
            qsnapshot.forEach((doc)=>{
              data.push({...doc.data(),id:doc.id})
            })
            setAllShop(data)
          } else {
            alert('ไม่เจอข้อมูล')
          }
          setLoading(false)
      }).catch(()=>{
        setLoading(false)
      })
    };

  function checkRight(item){
    if(admin.includes(profileId)){
      setShop(item)
      setAllShop([])
      setPhoneNumber('')
    } else {
      if(item.suggester===yourCode){
        setShop(item)
        setAllShop([])
        setPhoneNumber('')
      } else {
        alert('ร้านนี้ ไม่ใช่ร้านภายใต้การดูแลของท่าน')
      }
    }
  };


  return (
    <div>
        <Modal_Loading show={loading} />
      <div style={styles.container} >
        <Form.Control 
            type="text" 
            placeholder={`ใส่เบอร์โทรร้านค้า`} 
            onChange={(event)=>{setPhoneNumber(event.target.value)}}
            value={phoneNumber}
            name={'item.name'}
        />
        {allShop.length>0 || id
            ?<Button onClick={()=>{setShop({ id:'', name:''});setFileContent([]);setPhoneNumber('');setAllShop([])}} variant="danger" style={styles.container2} >ล้าง</Button>
            :<Button onClick={findShop} variant="warning" style={styles.container2} >ค้นหา</Button>
        }
        
        
      </div>
      {allShop.map((item,index)=>{
        return <div onClick={()=>{checkRight(item)}} key={index} style={styles.container3} >
            <h4>{item.name}</h4>
        </div>
      })}
      {name
        ?<h3 style={styles.text3} >{name}</h3>
        :null
      }
      {name
        ?fileContent.length>0 
          ?<div style={styles.container5} >
            <Button onClick={addProductsToDatabase}  variant="success" >ยืนยันการเพิ่มรายการ</Button>
          </div>
          :<div style={styles.container4} >
            เลือกไฟล์ csv&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="file" accept=".csv" onChange={handleFileChange} />
          </div>
        :null
      }

      {fileContent.length>0
          ?<Table striped bordered hover responsive  variant="light"   >
              <thead  >
              <tr>
                <th style={styles.text}>No.</th>
                <th style={styles.text2}>ชื่อ</th>
                <th style={styles.text2}>ราคา</th>
                <th style={styles.text2}>หมวดหมู่</th>
                <th style={styles.text2}>รายละเอียด</th>
              </tr>
            </thead>
            <tbody  >
              {fileContent.map((item, index) => {
                const { name, price, category, detail } = item;
                return <tr  style={{cursor: 'pointer'}} key={index} >
                        <td style={styles.text3}>{index+1}.</td>
                        <td style={styles.text3} >{name}</td>
                        <td style={styles.text3} >{price}</td>
                        <td style={styles.text3}>{category}</td>
                        <td style={styles.text3}>{detail}</td>
                      </tr>
              }
              )}
            </tbody>
          </Table>
          :null
      }
    </div>
  );
};

const styles = {
    container : {
      display:'flex',margin:10
    },
    container2 : {
      marginLeft:'1rem',width:'100px'
    },
    container3 : {
      padding:10,margin:5,backgroundColor:white,borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)',cursor:'pointer'
    },
    container4 : {
      padding:10,margin:10,backgroundColor:white,borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    container5 : {
      display:'flex',justifyContent:'center',margin:'1rem'
    },
    text : {
      width:'5%',textAlign:'center'
    },
    text2 : {
      width:'20%',textAlign:'center'
    },
    text3 : {
      textAlign:'center'
    }
}

export default ManageImport;
