import React, { useState, useEffect, useMemo, useRef } from "react";
import { Row, Col, Table, Button } from "react-bootstrap";
import { colors } from "../configs";
import { useDispatch, useSelector } from "react-redux";
import { endCutoff, findInArray, goToTop, startCutoff, summary } from "../Utility/function";
import { NumberYMD, getHoursMinute, plusDays, stringFullDate, stringYMDHMS, stringYMDHMS3 } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { reverseSort } from "../Utility/sort";
import { Modal_Loading } from "../modal";
import { fetchShop } from "../redux/shopSlice";


function Customer() {
  const dispatch = useDispatch();

  const { shops, modal_Shop } = useSelector(state => state.shop)
  const { profile: { yourCode } } = useSelector(state => state.profile)


  const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    let fData = shops.map((item,index)=>{return({...item,no:index})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
      setCurrentDisplay(fData.map(({ vip, ...rest})=>{
        let qrcode = findInArray(vip,'type','qrcode').expire.toDate()
        let staff = findInArray(vip,'type','staff').expire.toDate()
        let language = findInArray(vip,'type','language').expire.toDate()
        return {
          ...rest,
          qrcode,
          staff,
          language
        }
      }))
  },[page,rowsPerPage,shops])


  return (
    <div  >
        <Modal_Loading
         show={modal_Shop}
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
                      <th style={{ width: '10%', textAlign:'center' }}>สแกนสั่งอาหาร</th>
                      <th style={{ width: '10%', textAlign:'center' }}>พนักงานสั่งอาหาร</th>
                      <th style={{ width: '10%', textAlign:'center' }}>วุ้นแปลภาษา</th>
                      <th style={{ width: '10%', textAlign:'center' }}>โน๊ต</th>
                    </tr>
                  </thead>
                  <tbody  >
                    {currentDisplay.map((item, index) => (
                      <tr  style={{cursor: 'pointer'}} key={index} >
                        <td style={{textAlign:'center'}}>{item.no+1}.</td>
                        <td style={{textAlign:'center'}} >{stringFullDate(item.createdDate)}</td>
                        <td style={{textAlign:'center'}}>{item.name}</td>
                        <td style={{textAlign:'center'}}>-</td>
                      <th style={{ textAlign:'center' }}>-</th>
                      <th style={{ textAlign:'center' }}>{stringFullDate(item.qrcode)}</th>
                      <th style={{ textAlign:'center' }}>{stringFullDate(item.staff)}</th>
                      <th style={{ textAlign:'center' }}>{stringFullDate(item.language)}</th>
                      <th style={{ textAlign:'center' }}>สถานะ</th>
 
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
