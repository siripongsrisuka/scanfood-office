import React from "react";
import { Panel, Stack } from "rsuite";
import { STATUS } from "../modal/crmModel";

const BRAND = {
  red: "#d62828",
  orange: "#f59e0b",
  blue: "#2563eb",
  green: "#16a34a",
  border: "#e5e7eb",
};

function CrmSummaryCards({ leads = [] }) {
  const summary = leads.reduce(
    (acc, lead) => {
      acc.total += 1;

      if (lead?.metaEvents?.purchaseSent || lead?.status === STATUS.PURCHASE) {
        acc.purchase += 1;
      } else if (
        lead?.metaEvents?.contactSent ||
        lead?.status === STATUS.CONTACT
      ) {
        acc.contact += 1;
      } else {
        acc.registered += 1;
      }

      return acc;
    },
    {
      total: 0,
      registered: 0,
      contact: 0,
      purchase: 0,
    }
  );

  return (
    <Stack spacing={14} wrap>
      <Panel bordered style={{ ...styles.card, ...styles.hero }}>
        <div style={styles.heroLabel}>Lead ทั้งหมด</div>
        <div style={styles.heroValue}>{summary.total}</div>
        <div style={styles.heroSub}>ScanFood CRM Pipeline</div>
      </Panel>

      <Panel bordered style={styles.card}>
        <div style={styles.label}>Lead ใหม่</div>
        <div style={{ ...styles.value, color: BRAND.orange }}>
          {summary.registered}
        </div>
        <div style={styles.sub}>ยังไม่ได้ติดต่อ</div>
      </Panel>

      <Panel bordered style={styles.card}>
        <div style={styles.label}>ติดต่อแล้ว</div>
        <div style={{ ...styles.value, color: BRAND.blue }}>
          {summary.contact}
        </div>
        <div style={styles.sub}>กำลัง follow up</div>
      </Panel>

      <Panel bordered style={styles.card}>
        <div style={styles.label}>ลูกค้าแล้ว</div>
        <div style={{ ...styles.value, color: BRAND.green }}>
          {summary.purchase}
        </div>
        <div style={styles.sub}>ปิดการขายสำเร็จ</div>
      </Panel>
    </Stack>
  );
}

export default CrmSummaryCards;

const styles = {
  card: {
    minWidth: 150,
    padding: "16px 18px",
    borderRadius: 18,
    background: "#ffffff",
    border: `1px solid ${BRAND.border}`,
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
  },
  hero: {
    minWidth: 210,
    background: "linear-gradient(135deg, #d62828 0%, #ef4444 45%, #fb7185 100%)",
    color: "#fff",
    border: "none",
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.88)",
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 30,
    fontWeight: 900,
    lineHeight: 1,
    color: "#fff",
  },
  heroSub: {
    marginTop: 8,
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: 700,
  },
  value: {
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 1,
    color: "#111827",
  },
  sub: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
};