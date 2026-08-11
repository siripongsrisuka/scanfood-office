import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { SearchControl, TimeControlInbound } from "../components";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { goToTop, searchMultiFunction, toastSuccess } from "../Utility/function";
import { db } from "../db/firestore";
import { Modal_Loading } from "../modal";
import { updateNormalWarehouse } from "../redux/warehouseSlice";
import { updateNormalFieldInbound } from "../redux/inboundSlice";


function ReportInbound() {
  const dispatch = useDispatch();
    const { displayInbounds } = useSelector((state)=> state.inbound);
    const { profile:{ id:profileId, name:profileName } } = useSelector(state=>state.profile)
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [resultLength, setResultLength] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

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

    async function handleReverseInbound(inboundItems){
        const ok = window.confirm("ต้องการยกเลิกรับเข้าสินค้านี้หรือไม่?");
        if (!ok) return;
        setLoading(true);
        const { items = [], id } = inboundItems;
        try {
          const warehouseUpdates = await db.runTransaction(async (transaction) => {
          const warehouseUpdates = [];
          const inboundRef = db.collection('inbound').doc(id);

          // ดึงเอกสาร warehouse ทั้งหมดพร้อมกัน
          const stockDocs = await Promise.all(
            items.map(item =>
              transaction.get(db.collection('warehouse').doc(item.id))
            )
          );

          // อัปเดต stock
          for (let i = 0; i < items.length; i++) {
            const { id, qty } = items[i];
            const stockDoc = stockDocs[i];

            if (stockDoc.exists) {
              const { stock = 0 } = stockDoc.data();
              const newStock = Number(stock) - Number(qty);

              transaction.update(db.collection('warehouse').doc(id), {
                stock: newStock,
              });

              warehouseUpdates.push({ id, stock: newStock });
            }
          }
          transaction.update(inboundRef, {
            status:'canceled',
            canceledAt: new Date(),
            cancelBy: profileId,
            cancelName: profileName,
          });
    

          return warehouseUpdates;
        });
            warehouseUpdates.forEach(update => {
                dispatch(updateNormalWarehouse({ id: update.id, updatedField: { stock: update.stock } }));
            });
            dispatch(updateNormalFieldInbound({
                id,
                updatedField:{
                    status:'canceled',
                    canceledAt: new Date(),
                    cancelBy: profileId,
                    cancelName: profileName,
                }
            }))
            toastSuccess('ยกเลิกรับเข้าสินค้าสำเร็จ');
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };


  return (
    <div style={styles.container} >
        <h1>ประวัติรับเข้า</h1>
        <Modal_Loading show={loading} />
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
                    <th style={styles.container3} >สถานะ</th>
                    <th style={styles.container3} >ผู้ดำเนินการ</th>

                </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { timestamp,  items, createdName, status = 'normal', cancelName } = item;
                return <tr  key={index} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td style={styles.container4}>{stringDateTimeReceipt(timestamp)}</td>
                            <td >
                              {items.map((a,i)=>(
                                <p key={i} >- {a.name} : {a.qty} </p>
                              ))}
                            </td>
                            {status === 'canceled'
                                ?<td style={styles.container4}>{status} ({cancelName})</td>
                                :<td onClick={()=>{handleReverseInbound(item)}} style={{...styles.container4, color:'blue', cursor:'pointer'}}>{status}(กดเพื่อยกเลิกการรับเข้า)</td>
                            }
                            <td style={styles.container4}>{createdName}</td>
                        </tr>
            })}
            </tbody>
        </Table>
                            {/* <td style={styles.container4}>{status}</td>
                            <td style={styles.container4}>{createdName}</td>
                        </tr>
            })}
            </tbody>
        </Table> */}
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