import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { minusMonth, yearMonth } from "../Utility/dateTime";
import { db } from "../db/firestore";
import { normalSort } from "../Utility/sort";
import { formatTime } from "../Utility/function";
import CommissionDashboard from "../components/CommissionDashboard";
import { Modal_Loading } from "../modal";

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
              ...rest,
              createdAt:formatTime(createdAt),
              requestDate:formatTime(requestDate),
              id:doc.id,
          }
      });
      return normalSort('createdAt',results)
};


function CommissionScreen() {
    
    const { profile } = useSelector(state=>state.profile);
    const { id:profileId, admin = false, saleManagerTeam = '' }  = profile;
    const { office:{ humanRight } } = useSelector(state=>state.office);
    const { warehouse } = useSelector(state=>state.warehouse);
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);

    const [saleId, setSaleId] = useState(profileId);

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


    const sales = useMemo(()=>{
        return humanRight.filter(a=>a.team && !a.saleManagerTeam)
    },[humanRight]);


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


  return (
    <div style={styles.container} >
        <Modal_Loading show={loading} />
      <h1>ค่าคอมมิสชั้น</h1>
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
    <CommissionDashboard {...{ payments, sharingMap }} />

      
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default CommissionScreen;