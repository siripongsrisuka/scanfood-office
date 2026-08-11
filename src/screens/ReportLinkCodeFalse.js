import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import TablePagination from "@mui/material/TablePagination";
import { SearchControl } from "../components";
import { db } from "../db/firestore";
import { formatTime, goToTop, searchMultiFunction } from "../Utility/function";
import { stringDateTimeReceipt } from "../Utility/dateTime";

function ReportLinkCodeFalse() {
  const [masterData, setMasterData] = useState([]);
  const [currentDisplay, setCurrentDisplay] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [resultLength, setResultLength] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    goToTop();
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    goToTop();
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const query = await db
        .collection("hardwareOrder")
        .where("linkCode", "==", false)
        .get();

      const data = query.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: formatTime(doc.data().timestamp),
      }));

      setMasterData(data);
    } catch (error) {
      console.log("fetch linkCode=false error =", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...masterData];

    if (search) {
      result = searchMultiFunction(result, search, [
        "profileName",
        "createdName",
        "shopName",
        "orderNumber",
      ]);
    }

    const fData = result
      .map((item, index) => ({ ...item, no: index + 1 }))
      .filter((item, index) => {
        return (
          index >= page * rowsPerPage &&
          index <= (page + 1) * rowsPerPage - 1
        );
      });

    setCurrentDisplay(fData);
    setResultLength(result.length);
  }, [masterData, search, page, rowsPerPage]);

  return (
    <div style={styles.container}>
      <h1>เซลที่ยังไม่ผูก Code อุปกรณ์</h1>

      <SearchControl
        {...{
          placeholder: "ค้นหาด้วยชื่อเซล / ร้าน / orderNumber",
          search,
          setSearch,
        }}
      />
      <br />

      <h4>
        ค้นพบ {resultLength} รายการ {loading ? "(กำลังโหลด...)" : ""}
      </h4>

      <Table striped bordered hover responsive variant="light">
        <thead>
          <tr>
            <th style={styles.container2}>No.</th>
            <th style={styles.container3}>เลขที่คำสั่งซื้อ</th>
            <th style={styles.container3}>ร้านค้า</th>
            <th style={styles.container3}>วันเวลา</th>
            <th style={styles.container3}>รายละเอียด</th>
            <th style={styles.container3}>เซล</th>
            <th style={styles.container3}>linkCode</th>
            <th style={styles.container3}>สถานะ</th>
            <th style={styles.container3}>หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {currentDisplay.map((item, index) => {
            const {
              timestamp,
              billDate,
              createdDate,
              product = [],
              profileName,
              createdName,
              orderNumber,
              shopName,
              status,
              comment = "",
              linkCode,
            } = item;

            const displayTime = timestamp || billDate || createdDate;

            return (
              <tr key={item.id || index}>
                <td style={styles.container4}>{item.no}.</td>
                <td style={styles.container4}>{orderNumber || "-"}</td>
                <td>{shopName || "-"}</td>
                <td style={styles.container4}>
                  {displayTime ? stringDateTimeReceipt(displayTime) : "-"}
                </td>
                <td>
                  {product.length > 0 ? (
                    product.map((a, i) => (
                      <p key={i}>- {a.name} : {a.qty}</p>
                    ))
                  ) : (
                    "-"
                  )}
                </td>
                <td style={styles.container4}>
                  {profileName || createdName || "-"}
                </td>
                <td style={styles.container4}>
                  {String(linkCode)}
                </td>
                <td style={styles.container4}>{status || "-"}</td>
                <td>{comment || "-"}</td>
              </tr>
            );
          })}

          {!loading && currentDisplay.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: "center", padding: 20 }}>
                ไม่พบข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <TablePagination
        component="div"
        count={resultLength}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
  },
  container2: {
    width: "5%",
    minWidth: "70px",
    textAlign: "center",
  },
  container3: {
    width: "20%",
    minWidth: "150px",
    textAlign: "center",
    maxWidth: "200px",
  },
  container4: {
    textAlign: "center",
  },
};

export default ReportLinkCodeFalse;