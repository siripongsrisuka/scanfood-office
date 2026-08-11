import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { minusMonth, yearMonth } from "../Utility/dateTime";
import { db } from "../db/firestore";
import { normalSort } from "../Utility/sort";
import { formatTime } from "../Utility/function";
import { Modal_Loading } from "../modal";
import ExecutiveSalesDashboard from "../components/ExecutiveSalesDashboard";

async function fetchPayment(profileId){
      const thisYearMonth = yearMonth(new Date());
      const query = await db.collection('autoPayment')
        //   .where('profileId','==',profileId)
          .where('yearMonth','in',[thisYearMonth])
        //   .where('process','in',['success','paid'])
          .get();
        
      const results = query.docs.map(doc=>{
          const { createdAt, requestDate, ...rest } = doc.data();
          return {
              ...rest,
              createdAt:formatTime(createdAt),
              requestDate:formatTime(requestDate),
              id:doc.id,
          }
      });
      return normalSort('createdAt',results)
};


function ExecutiveSalesLeaderboardScreen() {
    
    const { profile } = useSelector(state=>state.profile);
    const { warehouse } = useSelector(state=>state.warehouse);
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);


    const sharingMap = useMemo(()=>{
        const uniqueHardware = new Map(warehouse.filter(a=>!a.stockSetStatus).map(item=>[item.id,item.sharing]));
        warehouse.filter(a=>a.stockSetStatus).forEach(item=>{
            let sharing = 0;
            item.stockSet.forEach(a=>{
                sharing += (uniqueHardware.get(a.id)*Number(a.qty)) || 0;
            })
            uniqueHardware.set(item.id,sharing);
        })
        return uniqueHardware;

    },[warehouse])


    useEffect(()=>{
            handleFetchAll()
    },[]);
    
    async function handleFetchAll(){
            setLoading(true);
            try {
                const payments = await fetchPayment(); // การจ่ายเงินย้อนหลัง 2 เดือน
                setPayments(payments);
            } catch (error) {
                alert(error);
            } finally {
                setLoading(false);
            }
            };


  return (
    <div style={styles.container} >
        <Modal_Loading show={loading} />
    <ExecutiveSalesDashboard {...{ payments, sharingMap }} />

      
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default ExecutiveSalesLeaderboardScreen;