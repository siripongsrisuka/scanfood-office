import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { SearchControl, TimeControlInbound } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { goToTop, searchMultiFunction } from "../Utility/function";


function ReportInbound() {
    const { displayInbounds } = useSelector((state)=> state.inbound);


    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [resultLength, setResultLength] = useState(0);
    const [search, setSearch] = useState('');

    const handleChangePage = (event, newPage) => {
        setPage(newPage); // start form 0
        goToTop()
    };
  
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        goToTop()
    };

    // 200%
    useEffect(()=>{
        let result = displayInbounds;
        if(search){
          result = searchMultiFunction(result,search,['createdName'])
        }
        const fData = result.map((item,index)=>{return({ ...item, no:index +1 })}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
        setCurrentDisplay(fData);
        setResultLength(result.length)

    },[page,rowsPerPage,displayInbounds,search]);


  return (
    <div style={styles.container} >
        <h1>ประวัติรับเข้า</h1>
        <TimeControlInbound  />
        <SearchControl {...{ placeholder:'ค้นหาด้วยผู้รับ', search, setSearch }} />
        <br/>
        <h4>ค้นพบ {resultLength} รายการ</h4> 
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >No.</th>
                    <th style={styles.container3} >วันเวลา</th>
                    <th style={styles.container3} >รายละเอียด</th>
                    <th style={styles.container3} >ผู้ดำเนินการ</th>

                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { timestamp,  items, createdName,  } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>{stringDateTimeReceipt(timestamp)}</td>
                            <td >
                              {items.map((a,i)=>(
                                <p key={i} >- {a.name} : {a.qty} </p>
                              ))}
                            </td>
                            <td style={styles.container4}>{createdName}</td>
                        </tr>
            })}
            </tbody>
        </Table>
        <TablePagination
            component="div"
            count={resultLength}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  },
  container2 : {
    width:'5%', minWidth:'70px', textAlign:'center'
  },
  container3 : {
    width:'20%', minWidth:'150px', textAlign:'center'
  },
  container4 : {
    textAlign:'center'
  }
}

export default ReportInbound;