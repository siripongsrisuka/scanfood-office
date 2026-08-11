import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { minusMonth, stringDateTimeReceipt, yearMonth } from "../Utility/dateTime";
import { db } from "../db/firestore";
import { normalSort } from "../Utility/sort";
import { formatTime } from "../Utility/function";
import CommissionDashboard from "../components/CommissionDashboard";
import { Modal_Loading, Modal_Quotation, Modal_QuotationFull } from "../modal";
import { Table } from "react-bootstrap";
import { OneButton, SlideOptions } from "../components";
import { initialQuotation } from "../configs";

async function fetchPayment(profileId){
      const thisYearMonth = yearMonth(new Date());
      const lastMonth = yearMonth(minusMonth(new Date(),1));
      const query = await db.collection('autoPayment')
          .where('profileId','==',profileId)
          .where('yearMonth','in',[thisYearMonth,lastMonth])
        //   .where('process','in',['success','paid'])
          .get();
        
      const results = query.docs.map(doc=>{
          const { createdAt, requestDate, ...rest } = doc.data();
          return {
            ...initialQuotation,
              ...rest,
              createdAt:formatTime(createdAt),
              requestDate:formatTime(requestDate),
              id:doc.id,
          }
      });
      return normalSort('createdAt',results)
};


function CommissionHistoryScreen() {
    
    const { profile } = useSelector(state=>state.profile);
    const { id:profileId, admin = false, saleManagerTeam = '' }  = profile;
    const { office:{ humanRight } } = useSelector(state=>state.office);
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [option, setOption] = useState({ id:'1',name:'เดือนนี้' });
    const [currentDisplay, setCurrentDisplay] = useState([]);
          const display = useMemo(() => {
        const display = [new Date(),minusMonth(new Date(), 1)].map((item,index) => {
          const data = payments.filter((a) => a.yearMonth === yearMonth(item));
          return {
            id:`${index+1}`,
             data,
          }
        });
    
        return display;
      }, [payments]);


    const options = [
        {id:'1',name:'เดือนนี้', value:'1'},
        {id:'2',name:'เดือนที่แล้ว', value:'2'},
    ];
    const [currentQuotation, setCurrentQuotation] = useState(initialQuotation);
    const [quotation_Modal, setQuotation_Modal] = useState(false);


    useEffect(()=>{
        const current = display.find(a=>a.id === option.id);
        setCurrentDisplay(current?.data || []);
    },[display,option])

    const [saleId, setSaleId] = useState(profileId);



    const sales = useMemo(()=>{
        return humanRight.filter(a=>a.team && !a.saleManagerTeam)
    },[humanRight]);

    const handleChange = (value) => {
      const option = options.find(a=>a.id === value)
        setOption(option);
    };



    useEffect(()=>{
            handleFetchAll()
    },[saleId]);
    
    async function handleFetchAll(){
        setLoading(true);
        try {
            const payments = await fetchPayment(saleId); // การจ่ายเงินย้อนหลัง 2 เดือน
            setPayments(payments);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
        };

    function openQuotation(item){
        setCurrentQuotation(item);
        setQuotation_Modal(true);
    }



  return (
    <div style={styles.container} >
        <Modal_Loading show={loading} />
      <h1>ประวัติค่าคอม</h1>
      <Modal_QuotationFull
            show={quotation_Modal}
            payload={currentQuotation}
            onHide={()=>{setQuotation_Modal(false)}}
        />
        {admin || saleManagerTeam
        ?<div style={{ display:'flex', padding:5, paddingBottom:0, overflowX:'auto' }} >
            {sales.map((item,index)=>{
                const active = item.id === saleId;
                return <div onClick={()=>{setSaleId(item.id)}} key={index} style={{ marginRight: '3px', textAlign: 'center', minWidth:'60px', cursor:'pointer' }} >
                    <img
                        style={{
                            width: '50px',
                            borderRadius: '50%',
                            filter: active ? 'grayscale(0%)' : 'grayscale(100%)'
                        }}
                        src={item.imageId}
                    />
                </div>
            }
            )}
        </div>
        :null
        
    }
    <SlideOptions {...{ value: option.id, handleChange, options,}} />
    <Table striped bordered hover responsive  variant="light"   >
        <thead  >
            <tr>
                <th style={styles.container2} >No.</th>
                <th style={styles.container3} >วันที่สร้าง</th>
                <th style={styles.container3} >ร้านค้า</th>
                <th style={styles.container3} >เซล</th>
                <th style={styles.container3} >software</th>
                <th style={styles.container3} >hardware</th>
                <th style={styles.container3} >รายละเอียด</th>
            </tr>
        </thead>
        <tbody  >
        {currentDisplay.map((item, index) => {
            const { createdAt,  profileName, shopName, email, saleName, softwarePrice, hardwarePrice } = item;
            return <tr  key={index} >
                        <td style={styles.container4}>{index+1}.</td>
                        <td style={styles.container4}>{stringDateTimeReceipt(createdAt)}</td>
                        <td >{shopName}</td>
                        <td >{saleName}</td>
                        <td style={styles.container4}>{softwarePrice}</td>
                        <td style={styles.container4}>{hardwarePrice}</td>
                        <td style={styles.container4}>
                            <OneButton {...{ text:'จัดการ', submit:()=>{openQuotation(item)} }} />
                        </td>
                    </tr>
        })}
        </tbody>
    </Table>

      
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  },
  container2 : {
    width: '5%',
    textAlign: 'center',
  },
  container3 : {
    width: '15%',
    textAlign: 'center',
  },
  container4 : {
    textAlign: 'center',
  }
}

export default CommissionHistoryScreen;