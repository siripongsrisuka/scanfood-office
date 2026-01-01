import React, { useState, useEffect, useMemo } from "react";
import { Row, Table, Col } from "react-bootstrap";
import { goToTop, summary } from "../Utility/function";
import { NumberYMD, firstDayOfMonth, lastDayOfMonth, minusMonth, plusDays, stringDateTime, stringFullDate, yearMonth } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import TripleChart from "./TripleChart";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrder } from "../redux/orderSlice";
import { colors } from "../configs";

const { theme3 } = colors;
function Commission() {
  const dispatch = useDispatch();

  const { profile : { yourCode, performance, id } } = useSelector(state => state.profile)
  const { orders } = useSelector(state => state.order)
  const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);


  const { datasets } = useMemo(()=>{
    let firstDay = firstDayOfMonth(new Date())
    let lastDay = lastDayOfMonth(new Date())
    let sOrder = orders.filter(a=>a.status==='success').filter(b=>NumberYMD(b.timestamp)>=NumberYMD(firstDay))
    let totalNet = summary(sOrder,'net')
    
    let datasets = [] // ยอดขายรายวัน
        let start = firstDay
    
        do {
          let data = sOrder.filter(b=>NumberYMD(b.timestamp)==NumberYMD(start))
          datasets.push({
            name:stringFullDate(start),
            ค่าคอมพื้นฐาน:summary(data,'baseSale'),
            โบนัสProsale:summary(data,'bonus'),
            รายได้ต่อเนื่อง:summary(data,'passive'),
            ค่าอุปกรณ์:summary(data,'hardware'),
          })
          start = plusDays(start,1)
        }

        while (NumberYMD(start) <= NumberYMD(lastDay));
    return {
      thisMonthSale:totalNet,
      percent:totalNet>0?(totalNet/300000)*100:0,
      datasets
    }
  },[orders])

  useEffect(()=>{
    if(orders.length===0){
        dispatch(fetchOrder(yourCode))
    }
},[]);

  const { achieve, percentAchieve, thisMonthLicense } = useMemo(()=>{
      let threeMonth = yearMonth(minusMonth(new Date(),2))
      let achieve =  summary(performance.filter(a=>Number(a.yearMonth) >= threeMonth),'totalLicense')
      let percent = ((achieve*100)/90).toFixed(2)
      let { totalLicense } = performance.find(a=>Number(a.yearMonth)==yearMonth(new Date())) || { totalLicense:0 }
      return {
        achieve,
        percentAchieve:percent,
        thisMonthLicense:totalLicense
      }
  },[performance])

useEffect(() => {
  const handleBeforeUnload = (event) => {
    // Perform actions before the component unloads
    event.preventDefault();
    event.returnValue = '';
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, []);


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
    let fData = orders.map((item,index)=>{return({...item,no:index})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
      setCurrentDisplay(fData)
  },[page,rowsPerPage,orders])

  return (
    <div  >
            <div style={styles.container} >
                <h4>License สะสมเดือนนี้ : {thisMonthLicense}</h4>
                <h4>License ย้อนหลัง 3 เดือน </h4>
                <Row>
                  <Col md='4' sm='6' xs='12'  >
                    <div style={styles.container2} >
                      <h6>Target</h6>
                      <h3>90</h3>
                    </div>
                  </Col>
                  <Col md='4' sm='6' xs='12'  >
                    <div style={styles.container2} >
                      <h6>Achieve</h6>
                      <h3>{achieve}</h3>
                    </div>
                  </Col>
                  <Col md='4' sm='6' xs='12'  >
                    <div style={styles.container2} >
                      <h6>%Achieve</h6>
                      <h3>{percentAchieve}</h3>
                    </div>
                  </Col>
                </Row>
            </div>
            <div style={{height:'400px'}} >
            <TripleChart datasets={datasets} bar={['ค่าคอมพื้นฐาน','โบนัสProsale','รายได้ต่อเนื่อง','ค่าอุปกรณ์']}  />

            </div>

              <Row>
                <Table striped bordered hover responsive  variant="light"   >
                    <thead  >
                    <tr>
                      <th style={styles.text2}>No.</th>
                      <th style={styles.text}>วันที่</th>
                      <th style={styles.text4}>ร้านอาหาร</th>
                      <th style={styles.text}>ค่าคอมพื้นฐาน</th>
                      <th style={styles.text}>โบนัสProsale</th>
                      <th style={styles.text}>รายได้ต่อเนื่อง</th>
                      <th style={styles.text}>ค่าอุปกรณ์</th>
                      <th style={styles.text}>รายได้รวม</th>
                    </tr>
                  </thead>
                  <tbody  >
                    {currentDisplay.map((item, index) => (
                      <tr  key={index} >
                        <td style={styles.text3}>{item.no+1}.</td>
                        <td style={styles.text3} >{stringDateTime(item.timestamp)}</td>
                        <td style={styles.text3}>{item.shopName}</td>
                        <td style={styles.text3}>{item.baseSale?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</td>
                        <td style={styles.text3}>{item.bonus?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</td>
                        <td style={styles.text3}>{item.passive?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</td>
                        <td style={styles.text3}>{item.hardware?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</td>
                        <td style={styles.text3}>{(item.baseSale+item.bonus+item.passive+item.hardware)?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <TablePagination
                    component="div"
                    count={orders.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Row>
      
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

export default Commission;
