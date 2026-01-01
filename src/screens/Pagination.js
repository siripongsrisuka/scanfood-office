import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
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
import TablePagination from '@mui/material/TablePagination';
import { db, prepareFirebaseImage } from "../db/firestore";
import { goToTop } from "../Utility/function";
import { stringDateTime, stringDateTime3 } from "../Utility/dateTime";
import { Button } from "rsuite";
import { Modal_FlatListTwoColumn } from "../modal";

const PAGE_SIZE = 50; // Number of documents per page

function SoftwareHistory() {

    const [masterData, setMasterData] = useState([])
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [lastDoc, setLastDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
  
      useEffect(()=>{
        fetchData()
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
      let fData = masterData.map((item,index)=>{return({...item,no:index+1})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
        setCurrentDisplay(fData)
    },[page,rowsPerPage,masterData]);


    const fetchData = async (nextPage = false) => {
        if (isLoading) return;
        setIsLoading(true);

        let query = db
            .collection("packageOrder")
            // .where("status", "==", "success")
            .orderBy("timestamp", "desc")
            .limit(PAGE_SIZE);

        if (nextPage && lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();
        if (!snapshot.empty) {
            const newData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp.toDate(),
                packageName: convertPackageName(doc.data().packageId)
            })).filter(b=>b.status==='success')

            setMasterData(prevData => (nextPage ? [...prevData, ...newData] : newData));
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

            if (snapshot.docs.length < PAGE_SIZE) {
                setHasMore(false); // No more data to load
            }
        } else {
            setHasMore(false);
        }

        setIsLoading(false);
    };

    function convertPackageName(packages) {
        const packageMap = {
            qrcode: new Set(['1','2','3','4','5','6','7','8','9']),
            staff: new Set(['10','11','12','13','14','15','16','17','18']),
            language: new Set(['19','20','21','22','23','24','25','26','27']),
            premium: new Set(['28','29','30','31','32','33']),
        };
    
        return packages.map(item => 
            packageMap.qrcode.has(item) ? 'qrcode' :
            packageMap.staff.has(item) ? 'staff' :
            packageMap.language.has(item) ? 'language' :
            packageMap.premium.has(item) ? 'premium' :
            'member' // Default case
        ).join('\n/');
    };

    const [current, setCurrent] = useState({ id:'' });
    const { id } = current;
    const [owner_Modal, setOwner_Modal] = useState(false);

    function handleOwner(){
        setOwner_Modal(false)
        setLoading(true)
        try {
            db.collection('packageOrder').doc(id).update({ ownerId })
            setMasterData(prev=>prev.map(a=>{
                return a.id===id
                    ?{...a,ownerId}
                    :a
            }))
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

  return (
    <div  >
        <Modal_FlatListTwoColumn
            show={owner_Modal}
            onHide={()=>{setOwner_Modal(false)}}
            header='เลือกผู้ครบครอง'
            onClick={handleStore}
            value={stores}
        />
        <Row style={{position:"sticky", top:0 , padding:10, width:'100%', backgroundColor:"white"}} >
            <Col xs='3' >
                <Button color="red" appearance="primary" >ทั้งหมด</Button>
            </Col>
            <Col xs='3' >
                <Button color="orange" appearance="primary" >ยังไม่แบ่ง</Button>
            </Col>
            <Col xs='3' >
                <Button color="yellow" appearance="primary" >หลุย</Button>
            </Col>
            <Col xs='3' >
                <Button color="green" appearance="primary" >ต้น</Button>
            </Col>
        </Row>
              <Row>
                <Table striped bordered hover responsive  variant="light"   >
                    <thead  >
                    <tr>
                      <th style={styles.text}>No.</th>
                      <th style={styles.text}>orderNumber</th>
                      <th style={styles.text}>วันที่</th>
                      <th style={styles.text}>ร้าน</th>
                      <th style={styles.text}>ยอดชำระ</th>
                      <th style={styles.text}>แพ็กเกจ</th>
                      <th style={styles.text}>แอดมิน</th>
                      <th style={styles.text}>ของรักของข้า</th>
                    </tr>
                  </thead>
                  <tbody  >
                    {currentDisplay.map((item, index) => {
                      const { no, orderNumber, timestamp, net, shopName, adminName, packageName, ownerId } = item;
                      console.log(packageName)
                      return  <tr  style={styles.container} key={index} >
                                <td style={styles.text}>{no}.</td>
                                <td style={styles.text}>{orderNumber}</td>
                                <td style={styles.text}>{stringDateTime3(timestamp)}</td>
                                <td style={styles.text}>{shopName}</td>
                                <td style={styles.text}>{net}</td>
                                <td style={styles.text}>{packageName}</td>
                                <td style={styles.text}>{adminName}</td>
                                {ownerId
                                    ?<td style={styles.text}>{adminName}</td>
                                    :<td style={styles.text}>ของหลวง</td>
                                }
                              </tr>
                    }
                    )}
                  </tbody>
                </Table>
                <TablePagination
                    component="div"
                    count={masterData.length}
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
      cursor: 'pointer'
    },
      text: {
        width: '10%', textAlign:'center', minWidth:'100px', maxWidth:'100px'
      },
      text2 : {
        textAlign:'center'
      }
      
  }
  

export default SoftwareHistory;