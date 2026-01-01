import React, { useState, useEffect } from "react";
import { Row, Table, Button } from "react-bootstrap";
import { findInArray, goToTop } from "../Utility/function";
import { minusMonth, yearMonth } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { useDispatch } from "react-redux";
import { db } from "../db/firestore";


function ManagePasssive() {
  const dispatch = useDispatch();

  const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [current, setCurrent] = useState();
  const [allSale, setAllSale] = useState([])



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
        db.collection('profile')
            .where('wallet','>=',0)
            .get()
            .then((docs)=>{
                let profiles = []
                docs.forEach((doc)=>{
                    const { performance } = doc.data()
                    let findLastMonthSale = findInArray(performance,'yearMonth',yearMonth(minusMonth(new Date(),1)))
                    if(findLastMonthSale && findLastMonthSale.yearMonth){
                        if(findLastMonthSale.thisMonthSale >= 100000){
                            profiles.push({
                                ...doc.data(),
                                id:doc.id,
                                lastMonthSale:findLastMonthSale.thisMonthSale,
                                rawPassiveIncome:findLastMonthSale.rawPassiveIncome,
                            })
                        }
                    }
                })
                setAllSale(profiles)
            })
  },[])


  useEffect(()=>{
    let fData = allSale.map((item,index)=>{return({...item,no:index})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
      setCurrentDisplay(fData)
  },[page,rowsPerPage,allSale])


function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        // alert(reader.result?.toString() || ''),
        setCurrent({...current,imageId:reader.result?.toString()})
      )
      reader.readAsDataURL(e.target.files[0])
    }
  }


  return (
    <div  >
              <Row>
                <Table striped bordered hover responsive  variant="light"   >
                    <thead  >
                    <tr>
                      <th style={{ width: '10%', textAlign:'center' }}>No.</th>
                      <th style={{ width: '10%', textAlign:'center' }}>วันที่</th>
                      <th style={{ width: '10%', textAlign:'center' }}>ชื่อเซล</th>
                      <th style={{ width: '10%', textAlign:'center' }}>tel</th>
                      <th style={{ width: '10%', textAlign:'center' }}>ยอดขายเดือนที่แล้ว</th>
                      <th style={{ width: '10%', textAlign:'center' }}>ยอด passive</th>
                      <th style={{ width: '10%', textAlign:'center' }}>ยืนยัน</th>
                    </tr>
                  </thead>
                  <tbody  >
                    {currentDisplay.map((item, index) => (
                      <tr  style={{cursor: 'pointer'}} key={index} >
                        <td style={{textAlign:'center'}}>{item.no+1}.</td>
                        <td style={{textAlign:'center'}} >{item.name}</td>
                        <td style={{textAlign:'center'}} >{item.tel}</td>
                        <td style={{textAlign:'center'}} >{item.lastMonthSale}</td>
                        <td style={{textAlign:'center'}} >{item.lastMonthSale}</td>
                        <td style={{textAlign:'center'}}>-</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <TablePagination
                    component="div"
                    count={allSale.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Row>
      
    </div>
  );
}

export default ManagePasssive;
