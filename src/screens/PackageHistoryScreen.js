import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { SearchControl, TimeControlPackage } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { goToTop, isApproverPen, searchMultiFunction } from "../Utility/function";
import { Modal_FlatListTwoColumn, Modal_Loading } from "../modal";
import { initialSo } from "../configs";
import { db } from "../db/firestore";
import { updateNormalFieldPackage } from "../redux/packageSlice";


function PackageHistoryScreen() {
    const dispatch = useDispatch();
    const { displayPackages } = useSelector((state)=> state.package);
    const { profile:{ id:profileId, admin } } = useSelector(state=>state.profile);
    const { office:{ humanRight } } = useSelector((state)=> state.office);  

    const saleTeam = useMemo(() => {
        return humanRight
            .filter(a=>a.team)
    }, [humanRight]);

    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [resultLength, setResultLength] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [sale_modal, setSale_Modal] = useState(false);
    const [current, setCurrent] = useState(initialSo);

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
        let result = admin
            ? displayPackages
            : displayPackages.filter(a=>a.saleId === profileId);
        if(search){
          result = searchMultiFunction(result,search,['saleName','shopName'])
        }
        const fData = result.map((item,index)=>{return({ ...item, no:index +1 })}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
        setCurrentDisplay(fData);
        setResultLength(result.length)

    },[page,rowsPerPage,displayPackages,search,admin,profileId]);

    async function addSaleToPackage({ id:saleId, name:saleName }){
        setSale_Modal(false);
        setLoading(true);
        const { id:orderId } = current;
        try {
            const orderRef = db.collection('packageOrder').doc(orderId);
            await orderRef.update({ saleName, saleId });
            dispatch(updateNormalFieldPackage({ id:orderId, updatedField:{ saleName, saleId } }))
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    function openSaleModal(item){
        if(!admin)return alert('คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลนี้');

        setSale_Modal(true);
        setCurrent(item);
    };

    async function handleCancelPackage(item){
        if(!admin)return alert('คุณไม่มีสิทธิ์ในการยกเลิกคำสั่งซื้อแพ็คเกจนี้');
        const ok = window.confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกคำสั่งซื้อแพ็คเกจนี้?');
        if(!ok)return;
        setLoading(true);
        const { id:orderId } = item;
        try {
            const orderRef = db.collection('packageOrder').doc(orderId);
            await orderRef.update({ status:'cancel' });
            dispatch(updateNormalFieldPackage({ id:orderId, updatedField:{ status:'cancel' } }))
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    }


  return (
    <div style={styles.container} >
        <h1>Package History</h1>
        <Modal_Loading show={loading} />
        <Modal_FlatListTwoColumn 
            show={sale_modal}
            header='เลือกเซลล์ที่ต้องการ'
            onHide={()=>{setSale_Modal(false)}}
            onClick={addSaleToPackage}
            value={saleTeam}
        />
        <TimeControlPackage  />
        <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อเซลหรือร้านค้า', search, setSearch }} />
        <br/>
        <h4>ค้นพบ {resultLength} รายการ</h4> 
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
                <tr>
                    <th style={styles.container2} >No.</th>
                    <th style={styles.container3} >วันเวลา</th>
                    <th style={styles.container3} >ร้านค้า</th>
                    <th style={styles.container3} >มูลค่า</th>
                    <th style={styles.container3} >เซล</th>

                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { timestamp, saleName, net, shopName } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>{stringDateTimeReceipt(timestamp)}</td>
                            <td onClick={()=>{handleCancelPackage(item)}} >{shopName}<i class="bi bi-trash" ></i></td>
                            <td style={styles.container4}>{net}</td>
                            <td onClick={()=>{openSaleModal(item)}} style={styles.container4}>{saleName}{isApproverPen(profileId)}</td>
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

export default PackageHistoryScreen;