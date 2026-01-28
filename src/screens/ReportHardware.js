import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { SearchControl, TimeControlHardwareOrder } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { goToTop, searchMultiFunction } from "../Utility/function";
import { Modal_WarehouseImage } from "../modal";
import { db, prepareFirebaseImage } from "../db/firestore";


function ReportHardware() {
    const { displayHardwareOrders } = useSelector((state)=> state.hardwareOrder);


    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [resultLength, setResultLength] = useState(0);
    const [search, setSearch] = useState('');
    const [oldImageUrls, setOldImageUrls] = useState(null);
    const [image_Modal, setImage_Modal] = useState(false);
    

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
        let result = displayHardwareOrders.filter(a=>['sent','success'].includes(a.status));
        if(search){
          result = searchMultiFunction(result,search,['createdName'])
        }
        const fData = result.map((item,index)=>{return({ ...item, no:index +1 })}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
        setCurrentDisplay(fData);
        setResultLength(result.length)

    },[page,rowsPerPage,displayHardwareOrders,search]);



  return (
    <div style={styles.container} >
        <h1>ประวัติงาน</h1>
  
        <TimeControlHardwareOrder  />
        <SearchControl {...{ placeholder:'ค้นหาด้วยผู้รับ', search, setSearch }} />
        <br/>
        <h4>ค้นพบ {resultLength} รายการ</h4> 
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >No.</th>
                    <th style={styles.container3} >เลขที่คำสั่งซื้อ</th>
                    <th style={styles.container3} >ร้านค้า</th>
                    <th style={styles.container3} >วันเวลา</th>
                    <th style={styles.container3} >รายละเอียด</th>
                    <th style={styles.container3} >เซล</th>
                    <th style={styles.container3} >สถานะ</th>
                    <th style={styles.container3} >ลิงก์</th>
                    <th style={styles.container3} >รูปภาพ</th>
                    <th style={styles.container3} >หมายเหตุ</th>
                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { timestamp,  product = [], profileName, orderNumber, shopName, status, link, imageUrls = [], comment = '' } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>{orderNumber}</td>
                            <td >{shopName}</td>
                            <td style={styles.container4}>{stringDateTimeReceipt(timestamp)}</td>
                            <td >
                              {product.map((a,i)=>(
                                <p key={i} >- {a.name} : {a.qty} </p>
                              ))}
                            </td>
                            <td style={styles.container4}>{profileName}</td>
                            <td style={styles.container4}>{status}</td>
                            <td style={{ width:'20%', maxWidth:'300px' }}  >
                              <p style={{ maxWidth:'300px', wordWrap: 'break-word' }} >{link}</p>
                            </td>
                            <td   style={styles.container4}>
                                {imageUrls.map((a,i)=><img key={i} src={a} alt="img" width={50} style={{ marginRight:5 }} />)}
                            </td>
                            <td  style={styles.container4} >{comment}</td>
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
    width:'20%', minWidth:'150px', textAlign:'center', maxWidth:'200px'
  },
  container4 : {
    textAlign:'center'
  }
}

export default ReportHardware;