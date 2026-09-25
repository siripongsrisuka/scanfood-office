// Modal_CloseLeadBill — "ปิดการขาย" ของจอ Leads (DEV-1642 ②) · เลือกบิลอย่างน้อย 1 ใบก่อนยืนยันได้
// บิลที่เสนอให้เลือก (อ่านอย่างเดียว · ไม่เขียนอะไรใน modal นี้ — จอเป็นคนเขียนใน transaction):
//   ① บิลที่ใบชำระเงิน (`autoPayment`) ของ lead นี้สร้างไว้ (`autoPayment.leadId` → `reference`) — เปิดจากหน้า Sale ตามปกติ
//   ② บิลที่ผูกกับ lead นี้ไว้แล้ว (`billRefs`)
//   ③ ค้นเพิ่มด้วยเลขที่บิล (orderNumber) — กรณีเปิดบิลโดยไม่ได้เริ่มจาก lead
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { db } from "../db/firestore";
import { BILL_COLLECTIONS, BILL_LABEL, billBlockReason, billKey, leadRevenue, validateClose } from "../Utility/leadClose";
import { isPaidBill } from "../Utility/leadChannel";

async function readBill(collection, id) {
  const doc = await db.collection(collection).doc(id).get();
  return doc.exists ? { collection, id, data: doc.data() } : null;
}

/** บิลที่ lead นี้เกี่ยวอยู่แล้ว (① + ②) */
export async function loadLeadBills(lead) {
  const out = new Map();
  const put = (b) => { if (b) out.set(billKey(b), b); };
  const aps = await db.collection("autoPayment").where("leadId", "==", lead.id).get();
  const refs = [];
  aps.forEach((d) => (d.data().reference || []).forEach((r) => typeof r === "string" && r && refs.push(r)));
  for (const r of refs) for (const c of BILL_COLLECTIONS) put(await readBill(c, r));
  for (const r of lead.billRefs || []) put(await readBill(r.collection, r.id));
  return [...out.values()];
}

async function findByOrderNumber(orderNumber) {
  const found = [];
  for (const c of BILL_COLLECTIONS) {
    const s = await db.collection(c).where("orderNumber", "==", orderNumber).get();
    s.forEach((d) => found.push({ collection: c, id: d.id, data: d.data() }));
  }
  return found;
}

export default function Modal_CloseLeadBill({ show, lead, onHide, onConfirm }) {
  const [bills, setBills] = useState([]);
  const [picked, setPicked] = useState([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!show || !lead?.id) return;
    let alive = true;
    setBills([]); setPicked([]); setSearch(""); setMsg(""); setBusy(true);
    loadLeadBills(lead)
      .then((list) => {
        if (!alive) return;
        setBills(list);
        setPicked(list.filter((b) => !billBlockReason(lead.id, b) && isPaidBill(b.collection, b.data)).map(billKey));
      })
      .catch((e) => alive && setMsg(`โหลดบิลไม่สำเร็จ: ${e.message || e}`))
      .finally(() => alive && setBusy(false));
    return () => { alive = false; };
  }, [show, lead]);

  async function handleSearch() {
    const q = search.trim();
    if (!q) return;
    setBusy(true); setMsg("");
    try {
      const found = await findByOrderNumber(q);
      if (!found.length) setMsg(`ไม่พบบิลเลขที่ ${q}`);
      setBills((prev) => {
        const m = new Map(prev.map((b) => [billKey(b), b]));
        found.forEach((b) => m.set(billKey(b), b));
        return [...m.values()];
      });
    } catch (e) {
      setMsg(`ค้นไม่สำเร็จ: ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  const selected = bills.filter((b) => picked.includes(billKey(b)));
  const check = validateClose(lead?.id, selected);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="loading-screen">
      <Modal.Header closeButton><h4><b>ปิดการขาย — ผูกบิล</b></h4></Modal.Header>
      <Modal.Body>
        <p style={{ marginTop: 0 }}>ต้องเลือกบิลอย่างน้อย 1 ใบ · ยอดขายของ lead = ผลรวมบิลที่จ่ายแล้ว</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Form.Control placeholder="ค้นเพิ่มด้วยเลขที่บิล เช่น SW26090012" value={search}
            onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
          <Button variant="secondary" disabled={busy} onClick={handleSearch}>ค้น</Button>
        </div>
        {busy ? <p>กำลังโหลด…</p> : null}
        {!busy && bills.length === 0 ? <p>ยังไม่พบบิลของ lead นี้ — เปิดบิลจากหน้า Sale ก่อน หรือค้นด้วยเลขที่บิล</p> : null}
        {bills.length > 0 ? (
          <Table bordered size="sm">
            <thead><tr><th /><th>เลขที่บิล</th><th>ประเภท</th><th>สถานะ</th><th style={{ textAlign: "right" }}>ยอด</th></tr></thead>
            <tbody>
              {bills.map((b) => {
                const k = billKey(b);
                const why = billBlockReason(lead?.id, b);
                return (
                  <tr key={k} style={{ opacity: why ? 0.5 : 1 }}>
                    <td>
                      <Form.Check type="checkbox" disabled={!!why} checked={picked.includes(k)}
                        onChange={() => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))} />
                    </td>
                    <td>{b.data?.orderNumber || b.id}</td>
                    <td>{BILL_LABEL[b.collection]}</td>
                    <td>{why || (isPaidBill(b.collection, b.data) ? `จ่ายแล้ว (${b.data?.status})` : `ยังไม่นับยอด (${b.data?.status || "-"})`)}</td>
                    <td style={{ textAlign: "right" }}>{Number(b.data?.net || 0).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : null}
        <p><b>ยอดขายที่จะนับ: {leadRevenue(selected).toLocaleString()} บาท</b></p>
        {msg ? <p style={{ color: "#c0392b" }}>{msg}</p> : null}
        {!check.ok && selected.length > 0 ? <p style={{ color: "#c0392b" }}>{check.error}</p> : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>ยกเลิก</Button>
        <Button variant="success" disabled={busy || !check.ok} onClick={() => onConfirm(selected)}>
          ยืนยันปิดการขาย ({selected.length} บิล)
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
