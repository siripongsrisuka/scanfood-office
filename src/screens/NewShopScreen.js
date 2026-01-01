import React, { useState, useEffect, useMemo } from "react";
import { Button, Row, Table, Form } from "react-bootstrap";
import { daysDifference, findInArray, goToTop, searchFilterFunction } from "../Utility/function";
import { minusDays, stringFullDate, stringYMDHMS3 } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { Modal_Information, Modal_Loading, Modal_Product } from "../modal";
import { db } from "../db/firestore";
import { colors } from "../configs";
import { useSelector, useDispatch } from "react-redux";
import { fetchBill } from "../redux/billSlice";

const initialInfo = { name:'', tel:'', note:'',shopId:'',packageArray:[]};
const { white, redOrange, one } = colors;

function NewShopScreen() {
  const dispatch = useDispatch();
  const { selectedBill } = useSelector((state)=> state.bill)
  let today = new Date();
  const cutOff = new Date(2011, 0, 1, 0, 0, 0, 0);
  const [allDate, setAllDate] = useState([today,minusDays(today,1),minusDays(today,2),minusDays(today,3),minusDays(today,4),
    minusDays(today,5)
  ]);
  const [date, setDate] = useState(today)
  const bill = useMemo(()=>{
    return selectedBill.filter(a=>a.billDate===stringYMDHMS3(date))
  },[selectedBill,date])

  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([])
  const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [info_Modal, setInfo_Modal] = useState(false);
  const [info, setInfo] = useState(initialInfo);
  const { name, tel, note, shopId } = info;
  const [product, setProduct] = useState({ status:false, value:[]})
  const { status, value } = product;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด')

  useEffect(()=>{
    setLoading(true)
    db.collection('shop')
    .where('shopChannel','==','scanfood')
    .orderBy('createdDate', 'desc')
    .limit(100) 
    .get()
        .then((docs)=>{
            let data = []
            docs.forEach((doc)=>{
                data.push({
                    packageArray:[],
                    info:{ name:'', tel:'', note:''},
                    id: doc.id,
                    ...doc.data(),
                    createdDate:doc.data().createdDate.toDate()
                  })
            })
            setShops(data)
            setLoading(false)
        })
  },[])


  const handleChangePage = (event, newPage) => {
      setPage(newPage); // start form 0
      goToTop()
  };

  const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
      goToTop()
  };


  useEffect(()=>{
    let thisDay = new Date();
    let fData
    switch (category) {
      case 'ทั้งหมด':
        fData = shops
        break;
       case 'เฉพาะมี package':
        fData = shops.filter(a=>a.packageArray.length>0)
        break;
      case 'น้อยกว่า 30 วัน':
        fData = shops.filter(a=>{
          const time = a.vip.find(b=>b.type==='qrcode').expire.toDate()
          let day = daysDifference(time,new Date())
          return day>0 && day <30 && a.packageArray.length>0
        })
        break;
      case 'น้อยกว่า 10 วัน':
        fData = shops.filter(a=>{
          const time = a.vip.find(b=>b.type==='qrcode').expire.toDate()
          let day = daysDifference(time,new Date())
          return day>0 && day <10 && a.packageArray.length>0
        })
        break;
    
      default:
        break;
    }

    if(search){
      fData = searchFilterFunction(fData.map((item,index)=>{return({...item,no:index})}),search,'name')
    } else {
      fData = fData.map((item,index)=>{return({...item,no:index})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
    }
      
      setCurrentDisplay(fData.map(({ vip, ...rest})=>{
        let qrcode = findInArray(vip,'type','qrcode').expire.toDate()
        let staff = findInArray(vip,'type','staff').expire.toDate()
        let language = findInArray(vip,'type','language').expire.toDate()
        let qrcodeRemain = qrcode>thisDay?daysDifference(qrcode,thisDay):0
        let staffRemain = staff>thisDay?daysDifference(staff,thisDay):0
        let languageRemain = language>thisDay?daysDifference(language,thisDay):0
        let qrcodeColor = qrcodeRemain >30?white:qrcodeRemain >10?redOrange:one
        let staffColor = staffRemain >30?white:staffRemain >10?redOrange:one
        let languageColor = languageRemain >30?white:languageRemain >10?redOrange:one
        return {
          ...rest,
          qrcode,
          staff,
          language,
          qrcodeRemain,
          staffRemain,
          languageRemain,
          qrcodeColor,
          staffColor,
          languageColor
        }
      }))
  },[page,rowsPerPage,shops,search,category]);

  function manageInfo(item){
    dispatch(fetchBill({shopId:item.id,billDate:[stringYMDHMS3(minusDays(today,3)),stringYMDHMS3(minusDays(today,2)),stringYMDHMS3(minusDays(today,1)),stringYMDHMS3(new Date())],cutOff,startDate:minusDays(today,3),endDate:today}))
      .then(()=>{
        if(name){
          setInfo({...item.info,shopId:item.id,packageArray:item.packageArray,shopTel:item.tel});setInfo_Modal(true)
      } else {
          db.collection('profile').doc(item.humanResource[0].id).get()
          .then((doc)=>{
              const { name, tel } = doc.data();
              setInfo({...item.info,shopId:item.id,name,tel,packageArray:item.packageArray,shopTel:item.tel});setInfo_Modal(true)
          })
      }
      })
  };

  function submit(){
    setInfo_Modal(false)
    setLoading(true)
    setInfo(initialInfo)
    db.collection('shop').doc(shopId).update({info:{ name, tel, note }})
        .then(()=>{
            setLoading(false)
            setShops(shops.map(a=>{
                return a.id===shopId
                    ?{...a,info:{ name, tel, note }}
                    :a
            }))
        })
  };

  function fetchProduct(shopId){
    db.collection('product').where('shopId','==',shopId).get()
        .then((docs)=>{
            let data = []
            docs.forEach((doc)=>{
                data.push({id:doc.id,...doc.data()})
            })
            setProduct({status:true,value:data})
        })
  };

  return (
    <div  >
        <Modal_Product
            show={status}
            onHide={()=>{setProduct({status:false,value:[]})}}
            value={value}
        />
        <Modal_Information
            show={info_Modal}
            onHide={()=>{setInfo_Modal(false);setInfo(initialInfo)}}
            info={info}
            setInfo={setInfo}
            submit={submit}
            bill={bill}
            allDate={allDate}
            date={date}
            setDate={setDate}
        />
        <Modal_Loading
            show={loading}
        />
              <Row>
              <div style={styles.container} >
                <Button variant={category==='ทั้งหมด'?'dark':'light'} onClick={()=>{setCategory('ทั้งหมด')}} style={styles.container2} >
                  ทั้งหมด
                </Button>
                <Button variant={category==='เฉพาะมี package'?'dark':'light'} onClick={()=>{setCategory('เฉพาะมี package')}} style={styles.container3}  >
                  เฉพาะมี package
                </Button>
                <Button variant={category==='น้อยกว่า 30 วัน'?'dark':'light'} onClick={()=>{setCategory('น้อยกว่า 30 วัน')}} style={styles.container3}  >
                    น้อยกว่า 30 วัน
                </Button>
                <Button variant={category==='น้อยกว่า 10 วัน'?'dark':'light'} onClick={()=>{setCategory('น้อยกว่า 10 วัน')}} style={styles.container3}  >
                    น้อยกว่า 10 วัน
                </Button>
              </div>
              <div style={styles.container4} >
                <Form.Control 
                    type="text" 
                    placeholder='ค้นหาด้วยชื่อ'
                    onChange={(event)=>{setSearch(event.target.value)}}
                    value={search}
                    style={styles.container5}
                />
              </div>
                <Table  bordered   variant="light"   >
                    <thead  >
                    <tr>
                      <th style={styles.text}>No.</th>
                      <th style={styles.text2}>วันที่</th>
                      <th style={styles.text2}>ร้านอาหาร</th>
                      <th style={styles.text2}>เจ้าของร้าน</th>
                      <th style={styles.text2}>เบอร์</th>
                      <th style={styles.text2}>สแกน</th>
                      <th style={styles.text2}>พนักงาน</th>
                      <th style={styles.text2}>แปลภาษา</th>
                      <th style={styles.text2}>โน๊ต</th>
                      <th style={styles.text2}>สต๊อก</th>
                    </tr>
                  </thead>
                  <tbody  >
                    {currentDisplay.map((item, index) => {
                      const { no, createdDate, name, info, qrcodeColor, staffColor, languageColor, qrcodeRemain, staffRemain, languageRemain, id } = item;
                      return <tr  style={{cursor: 'pointer'}} key={index}  >
                                <td onClick={()=>{manageInfo(item)}} style={styles.text3}>{no+1}.</td>
                                <td onClick={()=>{manageInfo(item)}} style={styles.text3} >{stringFullDate(createdDate)}</td>
                                <td onClick={()=>{manageInfo(item)}} style={styles.text3}>{name}</td>
                                <td onClick={()=>{manageInfo(item)}} style={styles.text3}>{info.name}</td>
                                <th onClick={()=>{manageInfo(item)}} style={styles.text3}>{info.tel}</th>
                                <th onClick={()=>{manageInfo(item)}} style={{ textAlign:'center', backgroundColor:qrcodeColor }}>{qrcodeRemain}</th>
                                <th onClick={()=>{manageInfo(item)}} style={{ textAlign:'center', backgroundColor:staffColor  }}>{staffRemain}</th>
                                <th onClick={()=>{manageInfo(item)}} style={{ textAlign:'center', backgroundColor:languageColor  }}>{languageRemain}</th>
                                <th onClick={()=>{manageInfo(item)}} style={styles.text3}>{info.note}</th>
                                <th onClick={()=>{fetchProduct(id)}} style={styles.text3}><Button variant="warning" >ดู</Button></th>
                              </tr>
                    }
                    )}
                  </tbody>
                </Table>
                <TablePagination
                    component="div"
                    count={shops.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Row>
      
    </div>
  );
};

const styles ={
    container : {
      margin:'1rem'
    },
    container2 : {
      marginBottom:'1rem'
    },
    container3 : {
      marginLeft:'1rem',marginBottom:'1rem'
    },
    container4 : {
      marginLeft:'1rem',marginRight:'1rem',marginBottom:'1rem'
    },
    container5 : {
      width:'90%'
    },
    text : {
      width: '5%', textAlign:'center'
    },
    text2 : {
      width: '10%', textAlign:'center'
    },
    text3 : {
      textAlign:'center'
    }
}

export default NewShopScreen;
