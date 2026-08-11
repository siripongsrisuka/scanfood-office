import React, { useState } from "react";
import {
  Modal,
  Table,
  Form,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { db } from "../db/firestore";

function Modal_SearchHardware({
  backdrop = true,
  animation = true,
  show,
  onHide,
  centered = true,
  onSubmit,
}) {
  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [data, setData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      if (!searchOrderNumber.trim()) {
        alert("กรุณากรอก Order Number");
        return;
      }

      setLoading(true);
      setSelectedOrder(null);
      setData([]);

      const snapshot = await db
        .collection("hardwareOrder")
        .where("orderNumber", "==", searchOrderNumber.trim())
        .get();

      const result = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));

      setData(result);

      if (result.length === 1) {
        setSelectedOrder(result[0]);
      }

      if (result.length === 0) {
        alert("ไม่พบข้อมูล Order Number นี้");
      }
    } catch (error) {
      console.log("handleSearch error =", error);
      alert("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedOrder) {
      alert("กรุณาเลือกออเดอร์");
      return;
    }

    onSubmit?.(selectedOrder);
    handleClose();
  };

  const handleClose = () => {
    setSearchOrderNumber("");
    setData([]);
    setSelectedOrder(null);
    setLoading(false);
    onHide?.();
  };

  const displayData = data.length > 0 ? data : [];

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={handleClose}
      centered={centered}
      fullscreen
    >
      <Modal.Header closeButton>
        <h2><b>อุปกรณ์ที่ซื้อจาก Scanfood</b></h2>
      </Modal.Header>

      <Modal.Body>
        <Row className="mb-3">
          <Col md={5}>
            <Form.Group>
              <Form.Label><b>ค้นหาด้วย Order Number</b></Form.Label>
              <Form.Control
                type="text"
                placeholder="กรอก Order Number"
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </Form.Group>
          </Col>

          <Col md={7} className="d-flex align-items-end gap-2 mt-3 mt-md-0">
            <Button variant="primary" onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  กำลังค้นหา...
                </>
              ) : (
                "ค้นหา"
              )}
            </Button>

            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={!selectedOrder}
            >
              Submit
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                setSearchOrderNumber("");
                setData([]);
                setSelectedOrder(null);
              }}
            >
              ล้างค่า
            </Button>
          </Col>
        </Row>

        <h4>
          ทั้งหมด {displayData.length} รายการ
          {selectedOrder?.orderNumber
            ? ` | เลือกแล้ว: ${selectedOrder.orderNumber}`
            : ""}
        </h4>

        <Table striped bordered hover responsive variant="light">
          <thead>
            <tr>
              <th style={styles.container2}>เลือก</th>
              <th style={styles.container2}>No.</th>
              <th style={styles.container3}>วันเวลา</th>
              <th style={styles.container3}>Order Number</th>
              <th style={styles.container3}>รายละเอียด</th>
              <th style={styles.container3}>เซล</th>
              <th style={styles.container3}>รูปภาพ</th>
              <th style={styles.container3}>หมายเหตุ</th>
            </tr>
          </thead>

          <tbody>
            {displayData.length > 0 ? (
              displayData.map((item, index) => {
                const {
                  timestamp,
                  product = [],
                  profileName,
                  orderNumber,
                  imageUrls = [],
                  comment = "",
                } = item;

                const isSelected = selectedOrder?.id === item.id;

                return (
                  <tr
                    key={item.id || index}
                    onClick={() => setSelectedOrder(item)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#d9f2ff" : "",
                    }}
                  >
                    <td style={styles.container4}>
                      <Form.Check
                        type="radio"
                        name="selectedOrder"
                        checked={isSelected}
                        onChange={() => setSelectedOrder(item)}
                      />
                    </td>

                    <td style={styles.container4}>{index + 1}.</td>

                    <td style={styles.container4}>
                      {stringDateTimeReceipt(timestamp)}
                    </td>

                    <td style={styles.container4}>
                      <b>{orderNumber || "-"}</b>
                    </td>

                    <td>
                      {product.map((a, i) => (
                        <p key={i} style={{ marginBottom: 4 }}>
                          - {a.name} : {a.qty}
                        </p>
                      ))}
                    </td>

                    <td style={styles.container4}>{profileName}</td>

                    <td style={styles.container4}>
                      {imageUrls.map((a, i) => (
                        <img
                          key={i}
                          src={a}
                          alt="img"
                          width={100}
                          style={{ marginRight: 5, marginBottom: 5 }}
                        />
                      ))}
                    </td>

                    <td>{comment}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 24 }}>
                  ยังไม่มีข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
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
    verticalAlign: "middle",
  },
};

export default Modal_SearchHardware;