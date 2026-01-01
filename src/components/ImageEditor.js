import React, { useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { Modal_CropImage, Modal_Loading } from "../modal";
import { db, prepareFirebaseImage, webImageDelete } from "../db/firestore";
import { colors, mainImage } from "../configs";
import { findInArray } from "../Utility/function";
import Resizer from "react-image-file-resizer";
import { CSVLink } from "react-csv";
import { stringYMDHMS3 } from "../Utility/dateTime";

const { logo } = mainImage;
const { white, darkGray } = colors;

function ImageEditor() {
  const [shop, setShop] = useState({ name:'', id:'', smartCategory:[]});
  const { name, id  } = shop;
  const [allShop, setAllShop] = useState([])
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState([]);
  const [crop_Modal, setCrop_Modal] = useState(false);
  const [thisProduct, setThisProduct] = useState({})


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

    async function findProduct(shopId){
        let res = []
        await db.collection('product').where('shopId','==',shopId)
            .get().then((docs)=>{
                docs.forEach((doc)=>{
                    res.push({...doc.data(),id:doc.id})
                })
            })
        setProduct(res)
    };

    function base64ToBytes(base64String) {
        const binaryString = window.atob(base64String.split(',')[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }

    const resizeFile = (file) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
            file,
            300,
            300,
            "WEBP",
            100,
            0,
            (uri) => {
                resolve(uri);
                const img = new Image();

                // Set the source of the image to the base64 string
                img.src = uri

                // When the image is loaded, calculate its size
                img.onload = () => {
                const sizeInBytes = base64ToBytes(uri).length;
                // Convert bytes to kilobytes
                const sizeInKB = sizeInBytes / 1024;
                };
            },
            "base64"
            );
        });


    async function updateImage(value){
        setCrop_Modal(false)
        setLoading(true)
        let thisImage = await resizeFile(value);
        let oldImage = thisProduct.imageId
  
        try{
            const imageId = await prepareFirebaseImage(thisImage,'/scanfoodMenu/')
            await db.collection('product').doc(thisProduct.id).update({ imageId }).then(()=>{
                setProduct(product.map(a=>{
                    return a.id===thisProduct.id
                        ?{...a,imageId}
                        :a
                }))
            })
            if(oldImage){
                webImageDelete(oldImage)
            }
            setLoading(false)
        } catch(err){
            alert(err)
            setLoading(false)
        }
        
    };

    const [thisCategory, setThisCategory] = useState([])

    function selectedShop(item){
      setShop(item);setAllShop([]);setPhoneNumber('');findProduct(item.id)
      if(item.smartCategory.length>0){
        setThisCategory(item.smartCategory[0].value)
      }
    }

  return (
    <div>
        <Modal_Loading show={loading} />
        <Modal_CropImage
            show={crop_Modal}
            onHide={()=>{setCrop_Modal(false)}}
            onClick={updateImage}
        />
   
      <div style={styles.container} >
        <Form.Control 
            type="text" 
            placeholder={`ใส่เบอร์โทรร้านค้า`} 
            onChange={(event)=>{setPhoneNumber(event.target.value)}}
            value={phoneNumber}
            name={'item.name'}
        />
        {allShop.length>0 || id
            ?<div style={{display:'flex'}} >
                <Button onClick={()=>{setShop({ id:'', name:''});setPhoneNumber('');setProduct([]);setAllShop([])}} variant="danger" style={styles.container2} >ล้าง</Button>
                <CSVLink 
                      style={styles.container3}
                      filename={`${name} ${stringYMDHMS3(new Date())} shopId:${id}`}
                      data={
                        product.map((item)=>{
                              return({
                                  ProductId:item.id,
                                  Name:item.name,
                                  Category:item.category.length>0?findInArray(thisCategory,'id',item.category[0])?.name||'':'',
                                })})
                            }
                    >
                        ดึงไฟล์
                </CSVLink>
            </div>
            :<Button onClick={findShop} variant="warning" style={styles.container2} >ค้นหา</Button>
        }
        
        
      </div>
      {allShop.map((item,index)=>{
        return <div onClick={()=>{selectedShop(item)}} key={index} style={styles.container4} >
            <h5>{item.name}</h5>
        </div>
      })}
      {name
        ?<h2 style={styles.text2} >{name}</h2>
        :null
      }
      {product.length>0
          ?<Table striped bordered hover responsive  variant="light"   >
              <thead  >
              <tr>
                <th style={styles.text}>No.</th>
                <th style={styles.text}>ชื่อ</th>
                <th style={styles.text}>รูปภาพ</th>
                <th style={styles.text}>จัดการ</th>
              </tr>
            </thead>
            <tbody  >
              {product.map((item, index) => {
                const { name, imageId } = item;
                return  <tr   key={index} >
                          <td style={styles.text2}>{index+1}.</td>
                          <td style={styles.text2} >{name}</td>
                          <td style={styles.text2} >
                            <img style={styles.image} src={imageId||logo} />
                          </td>
                          <td style={styles.text2}>
                            <Button onClick={()=>{setThisProduct(item);setCrop_Modal(true)}} variant="warning">จัดการ</Button>
                          </td>
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
    display:'flex',margin:'1rem'
  },
  container2 : {
    width:'100px',marginLeft:'1rem',marginRight:'1rem'
  },
  container3 : {
    backgroundColor:darkGray,textDecoration:'none',color:white,padding:10,borderRadius:10,marginLeft:10,width:'100px',display:'flex',justifyContent:'center',alignItems:'center'
  },
  container4 : {
    padding:10,margin:5,backgroundColor:white,borderRadius:20,boxShadow: '0 4px 8px rgba(0,0,0,0.1)',cursor:'pointer'
  },
  text : {
    width:'25%',textAlign:'center'
  },
  text2 : {
    textAlign:'center'
  },
  image : {
    width:'100px',height:'100px'
  }
  
}

export default ImageEditor;
