import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";

function getWeeksOfCurrentYearIncludeCurrent() {
  const result = [];
  const today = new Date();
  const year = today.getFullYear();

  // ISO week 1 = week with Jan 4
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const firstMonday = new Date(jan4);
  firstMonday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));

  let week = 1;
  let currentMonday = new Date(firstMonday);

  while (true) {
    const weekStart = new Date(currentMonday);
    const weekEnd = new Date(currentMonday);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    // ถ้ายังไม่เริ่มถึงวันนี้ → หยุด
    if (weekStart > today) break;

    // เฉพาะสัปดาห์ที่อยู่ในปีนี้
    if (
      weekStart.getUTCFullYear() === year ||
      weekEnd.getUTCFullYear() === year
    ) {
      result.push({
        year,
        week,
        startDate: weekStart.toISOString().slice(0, 10),
        endDate: weekEnd.toISOString().slice(0, 10),
        isCurrentWeek: today >= weekStart && today <= weekEnd,
      });
    }

    currentMonday.setUTCDate(currentMonday.getUTCDate() + 7);
    week++;
  }

  return result;
}


function MarketingBootsScreen() {
    
    const weeks = getWeeksOfCurrentYearIncludeCurrent();
console.log(weeks);



  // ❌ ถอดปุ่ม `test` ออกแล้ว 2026-08-14 — มันรัน transaction.update บน admin/package
  //    แบบ append (`value: [...value, value[4]]`) = เพิ่มแถวแพ็กเกจซ้ำเข้าตารางราคา production
  //    ถูกกดไปแล้วจริงบน production (แถว member ซ้ำอยู่ในฐาน) · ไม่มีที่อื่นเรียกฟังก์ชันนี้
  //    ⇒ ห้ามเอากลับมา · งานเขียนข้อมูลราคาต้องมีจอ/ขั้นยืนยันของตัวเอง ไม่ใช่ปุ่มชื่อ test

  return (
    <div style={styles.container} >
      <h1>Performance</h1>
      <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
            <th style={styles.container2}>สัปดาห์</th>
            <th style={styles.container3}>L</th>
            <th style={styles.container3}>G</th>
            <th style={styles.container3}>C</th>
            <th style={styles.container3}>S</th>
            <th style={styles.container3}>M</th>
            <th style={styles.container3}>L</th>
            <th style={styles.container3}>Transfer</th>
            <th style={styles.container3}>New</th>
            <th style={styles.container3}>Rate</th>
            </tr>
        </thead>
        <tbody  >
            {[].map((item, index) => {
            const { orderNumber, timestamp, net, shopName, adminName, packageName, ownerId, ownerName } = item;
            return  <tr  style={styles.container} key={index} >
                        <td style={styles.text}>
                            <h6>สัปดาห์ที่ 1</h6>
                            <h6>7 - 10 มกราคม</h6>
                        </td>
                        <td style={styles.text}>{orderNumber}</td>
                        <td style={styles.text}>{shopName}</td>
                        <td style={styles.text}>{net}</td>
                        <td style={styles.text}>{packageName}</td>
                        <td style={styles.text}>{adminName}</td>
                    </tr>
            }
            )}
        </tbody>
        </Table>
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  },
  container2 : {
    width:'15%', minWidth:'150px', textAlign:'center'
  },
  container3 : {
    width:'8%', minWidth:'70px', textAlign:'center'
  }
}

export default MarketingBootsScreen;