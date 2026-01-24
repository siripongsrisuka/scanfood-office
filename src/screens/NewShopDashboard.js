import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { daysDifference, findInArray, formatTime, goToTop, searchFilterFunction } from "../Utility/function";
import { stringFullDate } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { Modal_Information, Modal_Loading } from "../modal";
import { db } from "../db/firestore";
import { colors } from "../configs";
import { SearchControl } from "../components";
import { scanfoodAPI } from "../Utility/api";

const initialInfo = { name:'', tel:'', note:'',shopId:'',packageArray:[]};
const { white, one } = colors;

function NewShopDashboard() {

    const [loading, setLoading] = useState(false);
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [info_Modal, setInfo_Modal] = useState(false);
    const [info, setInfo] = useState(initialInfo);
    const { name, tel, note, shopId } = info;
    const [search, setSearch] = useState('');
    const [allElement, setAllElement] = useState(9999);
    const [masterData, setMasterData] = useState([]);
    const [lastCreatedDate, setLastCreatedDate] = useState(null);

    useEffect(()=>{
        setTimeout(()=>{
            fetchPagination(null)
        },500)
    },[]);


    async function fetchPagination(lastCreatedDate){
        setLoading(true)
        try {
            const { status, data } = await scanfoodAPI.post(
                "/office/shop/",
                {
                    lastCreatedDate:lastCreatedDate?formatTime(lastCreatedDate):null,
                }
            );
            const { 
                results,
                newLastCreatedDate,
                hasMore,
                thisTime:thisLastCreatedDate
            } = data;
            
            setLastCreatedDate(newLastCreatedDate);
            setMasterData([...masterData,...results]);
            if(!hasMore){
                setAllElement(masterData.length + results.length);
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
   
  };
  

  const handleChangePage = (event, newPage) => {
    // start form 0
    if(newPage>page){
        let wantedElement = (newPage+1)*rowsPerPage
        if(wantedElement>masterData.length){
            if(masterData.length<allElement){
                fetchPagination(lastCreatedDate)
                setPage(newPage)
                goToTop()
            } else {
                if(masterData.length-(newPage*rowsPerPage)>0){
                    setPage(newPage)
                    goToTop()
                } else {
                    alert('สิ้นสุดแล้ว')
                }
            }
        } else {
            setPage(newPage)
            goToTop()
        }
    } else {
        setPage(newPage)
        goToTop()
    }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        goToTop()
    };



  useEffect(()=>{
    const thisDay = new Date();
    const searchedData = search
      ?searchFilterFunction(masterData,search,'name')
      :[...masterData];

      const pageData = searchedData.map((item,index)=>{return({...item,no:index+1})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
      setCurrentDisplay(pageData.map(({ vip, ...rest})=>{
        const qrcode = formatTime(findInArray(vip,'type','qrcode').expire)
        const qrcodeRemain = qrcode>thisDay?daysDifference(qrcode,thisDay):0
        const qrcodeColor = qrcodeRemain >30?white:one
        return {
          ...rest,
          qrcode,
          qrcodeRemain,
          qrcodeColor,
        }
      }))
  },[page,rowsPerPage,masterData,search]);

  async function manageInfo(item){
    setLoading(true)
    try {
        const profileRef = db.collection('profile').doc(item.humanResource[0].id);
        const profileDoc = await profileRef.get();
        const profileData = profileDoc.data();
        const { name, tel } = profileData;
        setInfo({...item.info,shopId:item.id,name,tel,packageArray:item.packageArray,shopTel:item.tel})
        setInfo_Modal(true)
    } catch (error) {
        alert(error)
    } finally {
        setLoading(false)
    }
    
  };

  // 200%
  async function submit(){
    setInfo_Modal(false)
    setLoading(true)
    try {
        const shopRef = db.collection('shop').doc(shopId);
        await shopRef.update({info:{ name, tel, note }})    
        setMasterData(masterData.map(a=>{
            return a.id===shopId
                ?{...a,info:{ name, tel, note }}
                :a
        }))
    } catch (error) {
        alert(error)
    } finally {
        setLoading(false);
        setInfo(initialInfo);

    }
  };


  return (
    <div style={{ minHeight:'100vh' }}  >
        <Modal_Information
            show={info_Modal}
            onHide={()=>{setInfo_Modal(false);setInfo(initialInfo)}}
            info={info}
            setInfo={setInfo}
            submit={submit}
        />
        <Modal_Loading
            show={loading}
        />
        <h1>ร้านใหม่ ใกล้ฉัน</h1>
            <SearchControl {...{ search, setSearch, placeholder:'ค้นหาด้วยชื่อร้านอาหารหรือเจ้าของร้าน' }} />
        <h4>ร้านทั้งหมด : {masterData.length}</h4>
        <br/>
                <Table  bordered   variant="light"   >
                    <thead  >
                    <tr>
                      <th style={styles.text}>No.</th>
                      <th style={styles.text2}>วันที่สร้าง</th>
                      <th style={styles.text2}>ร้านอาหาร</th>
                      <th style={styles.text2}>เจ้าของร้าน</th>
                      <th style={styles.text2}>เบอร์</th>
                      <th style={styles.text2}>นับถอยหลัง(วัน)</th>
                      <th style={styles.text2}>โน๊ต</th>
                    </tr>
                  </thead>
                  <tbody  >
                    {currentDisplay.map((item, index) => {
                      const { no, createdDate, name, info, qrcodeColor, qrcodeRemain } = item;
                      return <tr  style={{cursor: 'pointer'}} key={index}  >
                                <td onClick={()=>{manageInfo(item)}} style={styles.text3}>{no}.</td>
                                <td onClick={()=>{manageInfo(item)}} style={styles.text3} >{stringFullDate(createdDate)}</td>
                                <td onClick={()=>{manageInfo(item)}} >{name}</td>
                                <td onClick={()=>{manageInfo(item)}} style={styles.text3}>{info.name}</td>
                                <td onClick={()=>{manageInfo(item)}} style={styles.text3}>{info.tel}</td>
                                <td onClick={()=>{manageInfo(item)}} style={{ textAlign:'center', backgroundColor:qrcodeColor }}>{qrcodeRemain}</td>
                                <td onClick={()=>{manageInfo(item)}} style={styles.text3}>{info.note}</td>
                              </tr>
                    }
                    )}
                  </tbody>
                </Table>
                    <TablePagination
                        component="div"
                        count={masterData.length+1}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
      
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

export default NewShopDashboard;
