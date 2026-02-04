import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NumberYMD, plusDays, stringYMDHMS3 } from "../Utility/dateTime";
import { fetchEtax, updateEndDate, updateEtax, updateStartDate } from "../redux/etaxSlice";
import TimeContainer from "./TimeContainer";

function TimeControlEtax() {
    const dispatch = useDispatch()

    const { billDates, modal_Etax, startDate, endDate } = useSelector((state)=> state.etax);

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
            dispatch(fetchEtax({
                billDate:newSearch,
                selectedDate:oldSearch 
            }))
        } else {
            dispatch(updateEtax({ selectedDate:oldSearch }))
        }
    };

    return <TimeContainer
            search={search}
            show={modal_Etax}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={(date) => dispatch(updateStartDate(date))}
            onChangeEnd={(date) => dispatch(updateEndDate(date))}
        />
};


export default TimeControlEtax;
