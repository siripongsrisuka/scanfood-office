import React, { useState, useEffect, useMemo } from "react";
import { Row, Table, Button } from "react-bootstrap";
import { colors } from "../configs";
import { useDispatch, useSelector } from "react-redux";
import { daysDifference, findInArray, goToTop } from "../Utility/function";
import { minusDays, stringFullDate, stringYMDHMS3 } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { Modal_Information, Modal_Loading, Modal_Product } from "../modal";
import { fetchShop, updateNormalShop } from "../redux/shopSlice";
import { db } from "../db/firestore";

const { white, redOrange, one } = colors;
const initialInfo = { name:'', tel:'', note:'',shopId:'',packageArray:[]};


function Customer() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const { shops, modal_Shop } = useSelector(state => state.shop)
  const { profile: { yourCode } } = useSelector(state => state.profile)
  const [product, setProduct] = useState({ status:false, value:[]})
  const { status, value } = product;

  const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [info_Modal, setInfo_Modal] = useState(false);
  const [info, setInfo] = useState(initialInfo);
  const { name, tel, note, shopId } = info;

  useEffect(()=>{
      if(shops.length===0){
          dispatch(fetchShop(yourCode))
      }
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
    let fData = shops.map((item,index)=>{return({...item,no:index})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
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
  },[page,rowsPerPage,shops]);

  function manageInfo(item){
    if(name){
        setInfo({...item.info,shopId:item.id,packageArray:item.packageArray});setInfo_Modal(true)
    } else {
        db.collection('profile').doc(item.humanResource[0].id).get()
        .then((doc)=>{
            const { name, tel } = doc.data();
            setInfo({...item.info,shopId:item.id,name,tel,packageArray:item.packageArray});setInfo_Modal(true)
        })
    }
  }

  function submit(){
    setInfo_Modal(false)
    setLoading(true)
    setInfo(initialInfo)
    db.collection('shop').doc(shopId).update({info:{ name, tel, note }})
        .then(()=>{
            setLoading(false)
            dispatch(updateNormalShop(info))
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
  }


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
         show={modal_Shop||loading}
        />
              <Row>
                {/* <Table striped bordered hover responsive  variant="light"   > */}
                <Table  bordered   variant="light"   >
                    <thead  >
                    <tr>
                      <th style={{ width: '5%', textAlign:'center' }}>No.</th>
                      <th style={{ width: '10%', textAlign:'center' }}>วันที่</th>
                      <th style={{ width: '10%', textAlign:'center' }}>ร้านอาหาร</th>
                      <th style={{ width: '10%', textAlign:'center' }}>เจ้าของร้าน</th>
                      <th style={{ width: '10%', textAlign:'center' }}>เบอร์</th>
                      <th style={{ width: '5%', textAlign:'center' }}>สแกน</th>
                      <th style={{ width: '5%', textAlign:'center' }}>พนักงาน</th>
                      <th style={{ width: '5%', textAlign:'center' }}>แปลภาษา</th>
                      <th style={{ width: '10%', textAlign:'center' }}>โน๊ต</th>
                      <th style={{ width: '5%', textAlign:'center' }}>สต๊อก</th>
                    </tr>
                  </thead>
                  <tbody  >
                    {currentDisplay.map((item, index) => (
                      <tr  style={{cursor: 'pointer'}} key={index}  >
                        <td onClick={()=>{manageInfo(item)}} style={{textAlign:'center'}}>{item.no+1}.</td>
                        <td onClick={()=>{manageInfo(item)}} style={{textAlign:'center'}} >{stringFullDate(item.createdDate)}</td>
                        <td onClick={()=>{manageInfo(item)}} style={{textAlign:'center'}}>{item.name}</td>
                        <td onClick={()=>{manageInfo(item)}} style={{textAlign:'center'}}>{item.info.name}</td>
                        <th onClick={()=>{manageInfo(item)}} style={{ textAlign:'center' }}>{item.info.tel}</th>
                        <th onClick={()=>{manageInfo(item)}} style={{ textAlign:'center', backgroundColor:item.qrcodeColor }}>{item.qrcodeRemain}</th>
                        <th onClick={()=>{manageInfo(item)}} style={{ textAlign:'center', backgroundColor:item.staffColor  }}>{item.staffRemain}</th>
                        <th onClick={()=>{manageInfo(item)}} style={{ textAlign:'center', backgroundColor:item.languageColor  }}>{item.languageRemain}</th>
                        <th onClick={()=>{manageInfo(item)}} style={{ textAlign:'center' }}>{item.info.note}</th>
                        <th onClick={()=>{fetchProduct(item.id)}} style={{ textAlign:'center' }}><Button>ดู</Button></th>
                      </tr>
                    ))}
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
}

export default Customer;
