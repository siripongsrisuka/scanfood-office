import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import * as XLSX from 'xlsx';


import TimeControlReport from "../components/TimeCoutrolReport";
import { stringFullDate } from "../Utility/dateTime";
import { CategoryRender, Download } from "../components";

const options = [
    { id:'1', name:"Report" },
    { id:'2', name:"Credit_Card_Report", },
]

function KbankReportScreen() {
    const {  selectedReport, startDate, endDate } = useSelector(state=>state.report);
    const [option, setOption] = useState({ id:'1', name:"Report" });
    const { id:optionId, name } = option;
 

    function csvRowsToObjects(rows) {
        if (!Array.isArray(rows) || rows.length < 2) return [];

        const headers = rows[0].split(",").map(h => h.trim());

        return rows.slice(1).map(row => {
            const values = row.split(",").map(v => v.trim());
            const obj = {};

            headers.forEach((key, i) => {
            obj[key] = values[i] ?? "";
            });

            return { ...obj };
        });
        }

    const data = useMemo(()=>{
        const totalField = selectedReport.flatMap(a=>a.results);
        const rawFiles = optionId==='1'
            ?totalField.filter(a=>!a.file.includes("Credit_Card_Report"))
            :totalField.filter(a=>a.file.includes("Credit_Card_Report"))

        const rawFiles2 = rawFiles.length>1
            ?rawFiles.flatMap((a,i)=>i===0?a.raws:a.raws.shift())
            :rawFiles.flatMap(a=>a.rows)
        const data = csvRowsToObjects(rawFiles2);
        return data

    },[optionId,selectedReport])

    function DynamicTable({ data }) {
        if (!data || data.length === 0) return <div>No Data</div>;

        // ดึง key จาก object ตัวแรกเป็น header
        const headers = Object.keys(data[0]);

        return (
            <Table bordered variant="light">
            <thead>
                <tr>
                <th style={{ textAlign: "center" }}>No.</th>
                {headers.map((header, idx) => (
                    <th key={idx} style={{ textAlign: "center" }}>
                    {header}
                    </th>
                ))}
                </tr>
            </thead>

            <tbody>
                {data.map((item, index) => (
                <tr key={index}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    {headers.map((header, i) => (
                    <td key={i} style={{ textAlign: "center" }}>
                        {item[header]}
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </Table>
        );
        }

    function exportDynamicXlsx() {
        if (!data || data.length === 0) {
            alert("ไม่พบข้อมูลสำหรับดาวน์โหลด");
            return;
        }

        // แปลงเป็น worksheet อัตโนมัติจาก key ของ object
        const worksheet = XLSX.utils.json_to_sheet(data);

        // สร้าง workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // เขียนไฟล์
        XLSX.writeFile(workbook, `${name}${stringFullDate(startDate)}-${stringFullDate(endDate)}.xlsx`);
    }

  return (
    <div style={styles.container} >
        <h1>kbankReport</h1>
        <TimeControlReport/>
        <Download exportToXlsx={exportDynamicXlsx} />
        <CategoryRender {...{ options, option:optionId, setOption }} />
        <DynamicTable data={data} />

    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  }
}

export default KbankReportScreen;