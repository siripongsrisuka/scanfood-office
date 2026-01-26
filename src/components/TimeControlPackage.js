import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NumberYMD, plusDays, stringYMDHMS3 } from "../Utility/dateTime";
import { fetchPackage, updateEndDate, updatePackages, updateStartDate } from "../redux/packageSlice";
import TimeContainer from "./TimeContainer";

function TimeControlPackage() {
    const dispatch = useDispatch()

    const { billDates, modal_Package, startDate, endDate } = useSelector((state)=> state.package);

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
            dispatch(fetchPackage({
                billDate:newSearch,
                selectedDate:oldSearch 
            }))
        } else {
            dispatch(updatePackages({ selectedDate:oldSearch }))
        }
    };

    return <TimeContainer
            search={search}
            show={modal_Package}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={(date) => dispatch(updateStartDate(date))}
            onChangeEnd={(date) => dispatch(updateEndDate(date))}
        />
};


export default TimeControlPackage;
