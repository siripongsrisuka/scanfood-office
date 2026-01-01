import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";

import { colors } from "../configs";
import TablePagination from '@mui/material/TablePagination';
import { goToTop } from "../Utility/function";

const { dark, white, softWhite } = colors;

function CustomerCareScreen() {
    

    const filterGraduates = [
        { id:'a', name:'1 เดือน'},
        { id:'b', name:'2 เดือน'},
        { id:'c', name:'3-6 เดือน'},
        { id:'d', name:'6 - 12 เดือน'},
        { id:'e', name:'12 เดือนขึ้นไป'},
        { id:'f', name:'ทั้งหมด'},
    ]
    const [filterGraduate, setFilterGraduate] = useState('a');

    const shopTypes = [
        { id:'a', name:'ทั้งหมด'},
        { id:'b', name:'ร้านอาหารตามสั่ง'},
        { id:'c', name:'คาเฟ่'},
        { id:'d', name:'ร้านในหมู่บ้าน'},
    ]
    const [shopType, setShopType] = useState('a');

    const items = [
        { id:'a', name:'1 package'},
        { id:'b', name:'2 package'},
        { id:'c', name:'3 package'},
        { id:'d', name:'4 package'},
        { id:'5', name:'5 package'},
    ]
    const [item, setItem] = useState('a');

    const sizes = [
        { id:'a', name:'ทั้งหมด'},
        { id:'b', name:'S'},
        { id:'c', name:'M'},
        { id:'d', name:'L'},
    ]
    const [size, setSize] = useState('a');

    const packageTypes = [
        { id:'a', name:'ทั้งหมด'},
        { id:'b', name:'S'},
        { id:'c', name:'M'},
        { id:'d', name:'L'},
    ]
    const [thisPackage, setThisPackage] = useState('a');


    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า

    const [option_Show, setOption_Show] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);

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
        let fData = [].map((item,index)=>{return({...item,no:index})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
          setCurrentDisplay(fData)
    },[page,rowsPerPage])

  return (
    <div >
      <h1>คุณลูกค้าที่น่ารัก</h1>
      <div className="custom-scrollbar" >
        <div style={{ display:'flex', alignItems:'center' }} >
            <div onClick={()=>{setOption_Show(prev=>!prev)}} style={{padding:10,margin:10,fontSize:30,cursor:'pointer'}} >
                <i class="bi bi-sort-up"></i>
            </div>
            {filterGraduates.map((a,i)=>{
                const { id, name } = a;
                const status = id===filterGraduate
                return <div onClick={()=>{setFilterGraduate(id)}} key={id} style={{padding:10,margin:10,borderRadius:20,backgroundColor:status?dark:softWhite,color:status?white:dark,cursor:'pointer',minWidth:'150px',textAlign:"center"}} >
                            {name}
                        </div>
            })}
        </div>
        {option_Show
            ?<React.Fragment>
                <div style={{ display:'flex' }} >
                    {shopTypes.map((a)=>{
                        const { id, name } = a;
                        const status = id===shopType
                        return <div onClick={()=>{setShopType(id)}} key={id} style={{padding:10,margin:10,borderRadius:20,backgroundColor:status?dark:softWhite,color:status?white:dark,cursor:'pointer',minWidth:'150px',textAlign:"center"}} >
                                    {name}
                                </div>
                    })}
                </div>
                <div style={{ display:'flex' }} >
                    {items.map((a)=>{
                        const { id, name } = a;
                        const status = id===item
                        return <div  onClick={()=>{setItem(id)}} key={id} style={{padding:10,margin:10,borderRadius:20,backgroundColor:status?dark:softWhite,color:status?white:dark,cursor:'pointer',minWidth:'150px',textAlign:"center"}} >
                                    {name}
                                </div>
                    })}
                </div>
                <div style={{ display:'flex' }} >
                    {packageTypes.map((a)=>{
                        const { id, name } = a;
                        const status = id===thisPackage
                        return <div  onClick={()=>{setThisPackage(id)}} key={id} style={{padding:10,margin:10,borderRadius:20,backgroundColor:status?dark:softWhite,color:status?white:dark,cursor:'pointer',minWidth:'150px',textAlign:"center"}} >
                                    {name}
                                </div>
                    })}
                </div>
                <div style={{ display:'flex' }} >
                    {sizes.map((a,i)=>{
                        const { id, name } = a;
                        const status = id===size
                        return <div onClick={()=>{setSize(id)}} key={id} style={{padding:10,margin:10,borderRadius:20,backgroundColor:status?dark:softWhite,color:status?white:dark,cursor:'pointer',minWidth:'150px',textAlign:"center"}} >
                                    {name}
                                </div>
                    })}
                </div>
            </React.Fragment>
            :null
        }

<Table  bordered   variant="light"   >
                    <thead  >
                    <tr>
                      <th style={styles.text}>No.</th>
                      <th style={styles.text2}>ร้านอาหาร</th>
                      <th style={styles.text2}>LTV</th>
                      <th style={styles.text2}>cycle</th>
                      <th style={styles.text2}>Grade</th>
                      <th style={styles.text2}>ขนาดร้าน</th>
                      <th style={styles.text2}>วันที่ปิดร้าน</th>
                      <th style={styles.text2}>ความเสี่ยงหลุด</th>
                    </tr>
                  </thead>
                  <tbody  >
                    {currentDisplay.map((item, index) => {
                      const { no, createdDate, name, info, qrcodeColor, staffColor, languageColor, qrcodeRemain, staffRemain, languageRemain, id } = item;
                      return <tr  style={{cursor: 'pointer'}} key={index}  >
                              <td  style={styles.text3}>{no+1}.</td>
                              <td  style={styles.text3} ></td>
                              <td  style={styles.text3}>{name}</td>
                              <td  style={styles.text3}>{info.name}</td>
                              <th  style={styles.text3}>{info.tel}</th>
                              <th  style={{ textAlign:'center', backgroundColor:qrcodeColor }}>{qrcodeRemain}</th>
                              <th  style={{ textAlign:'center', backgroundColor:staffColor  }}>{staffRemain}</th>
                              <th  style={{ textAlign:'center', backgroundColor:languageColor  }}>{languageRemain}</th>
                              <th  style={styles.text3}>{info.note}</th>
                              <th style={styles.text3}><Button variant="warning" >ดู</Button></th>
                            </tr>
                    }
                  )}
                  </tbody>
                </Table>
                <TablePagination
                    component="div"
                    count={[].length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
        
      </div>
      <div>

    </div>
    </div>
  );
};

const styles = {
    container : {
      margin:'1rem',marginBottom:'0'
    },
    container2 : {
      marginBottom:'1rem'
    },
    container3 : {
      marginBottom:'1rem',marginLeft:'1rem'
    },
    container4 : {
      margin:'1rem'
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
    },
}

export default CustomerCareScreen;