import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NumberYMD, plusDays, stringYMDHMS3 } from "../Utility/dateTime";
import { fetchReport, updateReport, updateEndDate, updateStartDate } from "../redux/reportSlice";
import TimeContainer from "./TimeContainer";



function FacebookSearchBar({ startDate, endDate, onChangeStart, onChangeEnd, search }) {


  return <TimeContainer
            search={search}
            show={false}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={onChangeStart}
            onChangeEnd={onChangeEnd}
        />
};


export default FacebookSearchBar;
