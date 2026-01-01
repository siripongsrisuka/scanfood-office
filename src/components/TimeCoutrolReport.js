import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NumberYMD, plusDays, stringYMDHMS3 } from "../Utility/dateTime";
import { fetchReport, updateReport, updateEndDate, updateStartDate } from "../redux/reportSlice";
import TimeContainer from "./TimeContainer";



function TimeControlReport() {
    const dispatch = useDispatch()

    const { billDates, modal_Report, startDate, endDate } = useSelector((state)=> state.report);

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
            dispatch(fetchReport({
                billDate:newSearch,
                selectedDate:rewSearch 
            }))
        } else {
            dispatch(updateReport({ selectedDate:rewSearch }))
        }
    }

  return <TimeContainer
            search={search}
            show={modal_Report}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={(date) => dispatch(updateStartDate(date))}
            onChangeEnd={(date) => dispatch(updateEndDate(date))}
        />
};


export default TimeControlReport;
