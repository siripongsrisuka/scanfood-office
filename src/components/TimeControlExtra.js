import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NumberYMD, plusDays, stringYMDHMS3 } from "../Utility/dateTime";
import { fetchExtraDay, updateEndDate, updateExtraDays, updateStartDate } from "../redux/extraSlice";
import TimeContainer from "./TimeContainer";

function TimeControlExtra() {
    const dispatch = useDispatch()

    const { billDates, modal_ExtraDay, startDate, endDate } = useSelector((state)=> state.extra);

    useEffect(()=>{
        if(billDates.length===0){
            search()
        }
    },[]);

    function search(){
        let oldSearch = []
        let newSearch = []
        let start = startDate
        do {
            oldSearch.push(stringYMDHMS3(start))
            start = plusDays(start,1)
        }
        while (NumberYMD(start) <= NumberYMD(endDate));

        for(const item of oldSearch){
            if(!billDates.includes(item)){
                newSearch.push(item)
            }
        }
        if(newSearch.length >0){
            dispatch(fetchExtraDay({
                billDate:newSearch,
                selectedDate:oldSearch 
            }))
        } else {
            dispatch(updateExtraDays({ selectedDate:oldSearch }))
        }
    };

    return <TimeContainer
            search={search}
            show={modal_ExtraDay}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={(date) => dispatch(updateStartDate(date))}
            onChangeEnd={(date) => dispatch(updateEndDate(date))}
        />
};


export default TimeControlExtra;
