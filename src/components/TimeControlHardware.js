import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NumberYMD, plusDays, stringYMDHMS3 } from "../Utility/dateTime";
import { fetchHardware, updateEndDate, updateHardware, updateStartDate } from "../redux/hardwareSlice";
import TimeContainer from "./TimeContainer";

function TimeControlHardware() {
    const dispatch = useDispatch()

    const { billDates, modal_Hardware, startDate, endDate } = useSelector((state)=> state.hardware);

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
            dispatch(fetchHardware({
                billDate:newSearch,
                selectedDate:oldSearch 
            }))
        } else {
            dispatch(updateHardware({ selectedDate:oldSearch }))
        }
    };

    return <TimeContainer
            search={search}
            show={modal_Hardware}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={(date) => dispatch(updateStartDate(date))}
            onChangeEnd={(date) => dispatch(updateEndDate(date))}
        />
};


export default TimeControlHardware;
