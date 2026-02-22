import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NumberYMD, plusDays, stringYMDHMS3 } from "../Utility/dateTime";
import { fetchAutoPayment, updateAutoPayment, updateEndDate, updateStartDate } from "../redux/autoPaymentSlice";
import TimeContainer from "./TimeContainer";



function TimeControlAutoPayment() {
    const dispatch = useDispatch()

    const { billDates, modal_AutoPayment, startDate, endDate } = useSelector((state)=> state.autoPayment);

    useEffect(()=>{
        if(billDates.length===0){
            search()
        }
    },[])


    function search(){
        let rewSearch = []
        let newSearch = []
        let start = startDate
        do {
            rewSearch.push(stringYMDHMS3(start))
            start = plusDays(start,1)
        }
        while (NumberYMD(start) <= NumberYMD(endDate));

        for(const item of rewSearch){
            if(!billDates.includes(item)){
                newSearch.push(item)
            }
        }
        
        if(newSearch.length >0){ //มีต้อง fetch เพิ่ม
            dispatch(fetchAutoPayment({
                billDate:newSearch,
                selectedDate:rewSearch 
            }))
        } else {
            dispatch(updateAutoPayment({ selectedDate:rewSearch }))
        }
    }

  return <TimeContainer
            search={search}
            show={modal_AutoPayment}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={(date) => dispatch(updateStartDate(date))}
            onChangeEnd={(date) => dispatch(updateEndDate(date))}
        />
};


export default TimeControlAutoPayment;