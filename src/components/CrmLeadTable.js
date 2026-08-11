import React from "react";
import {
  Table,
  Button,
  ButtonToolbar,
  Tag,
  Whisper,
  Tooltip,
} from "rsuite";
// ===== ICON SAFE ZONE =====
import CopyIcon from "@rsuite/icons/Copy";
import PhoneIcon from "@rsuite/icons/legacy/Phone";
import CheckIcon from "@rsuite/icons/Check";

import { getLeadStatus, STATUS, formatDateTime } from "../modal/crmModel";

const { Column, HeaderCell, Cell } = Table;



// fallback emoji (กัน icon หาย)
const ICON = {
  phone: <PhoneIcon />,
  check: <CheckIcon />,
  copy: <CopyIcon />,
  fire: "🔥",
};

// ===== STATUS STYLE =====
const getStatusUI = (status) => {
  switch (status) {
    case STATUS.PURCHASE:
      return { label: "ลูกค้าแล้ว", color: "green" };
    case STATUS.CONTACT:
      return { label: "ติดต่อแล้ว", color: "blue" };
    default:
      return { label: "ใหม่", color: "orange" };
  }
};

// ===== MAIN COMPONENT =====
function CrmLeadTable({
  data = [],
  loading = false,
  onContact,
  onPurchase,
  onAssign,
  onRemark,
  onTimeline,
  sales
}) {
  const copy = (text) => {
    navigator.clipboard.writeText(text || "");
  };

  const canContact = (lead) => {
    const status = getLeadStatus(lead);
    return status === STATUS.REGISTERED;
  };

  const canPurchase = (lead) => {
    const status = getLeadStatus(lead);
    return status !== STATUS.PURCHASE;
  };

  return (
    <Table
      height={500}
      data={data}
      loading={loading}
      bordered
      cellBordered
      rowHeight={70}
      headerHeight={50}
      wordWrap="break-word"
    >
      {/* วันที่ */}
      <Column width={180} fixed>
        <HeaderCell>วันที่</HeaderCell>
        <Cell>
          {(row) => formatDateTime(row.createdAt)}
        </Cell>
      </Column>

      {/* ชื่อ */}
      <Column width={200}>
        <HeaderCell>ลูกค้า</HeaderCell>
        <Cell>
          {(row) => {
            const status = getLeadStatus(row);
            return (
              <div style={styles.nameWrap}>
                <div style={styles.name}>{row.fullName}</div>

                {status === STATUS.REGISTERED && (
                  <div style={styles.newBadge}>
                    {ICON.fire} NEW
                  </div>
                )}
              </div>
            );
          }}
        </Cell>
      </Column>

      {/* ร้าน */}
      <Column width={220}>
        <HeaderCell>Email</HeaderCell>
        <Cell>
          {(row) => (
            <div style={styles.subText}>
              {row.email}
            </div>
          )}
        </Cell>
      </Column>

      {/* เบอร์ */}
      <Column width={160}>
        <HeaderCell>โทร</HeaderCell>
        <Cell>
          {(row) => (
            <div style={styles.phoneWrap}>
              <a href={`tel:${row.phone}`} style={styles.phone}>
                {row.phone}
              </a>

              <Button
                size="xs"
                appearance="subtle"
                onClick={() => copy(row.phone)}
              >
                {ICON.copy}
              </Button>
            </div>
          )}
        </Cell>
      </Column>

      {/* เซล */}
      <Column width={140}>
        <HeaderCell>Sale</HeaderCell>
        <Cell>
          {(row) => (
            <div style={styles.sale}>
              {row.saleName || "-"}
            </div>
          )}
        </Cell>
      </Column>

      {/* remark */}
      <Column width={200}>
        <HeaderCell>Note</HeaderCell>
        <Cell>
          {(row) => (
            <div style={styles.remark}>
              {row.remarkLatest || "-"}
            </div>
          )}
        </Cell>
      </Column>

      {/* สถานะ */}
      <Column width={140}>
        <HeaderCell>สถานะ</HeaderCell>
        <Cell>
          {(row) => {
            const status = getLeadStatus(row);
            const ui = getStatusUI(status);

            return <Tag color={ui.color}>{ui.label}</Tag>;
          }}
        </Cell>
      </Column>

      {/* ยอด */}
      <Column width={140}>
        <HeaderCell>ยอด</HeaderCell>
        <Cell>
          {(row) =>
            row.purchaseValue
              ? `${row.purchaseValue} บาท`
              : "-"
          }
        </Cell>
      </Column>

      {/* ACTION */}
      <Column flexGrow={1} minWidth={300} fixed="right">
        <HeaderCell>Action</HeaderCell>
        <Cell>
          {(row) => (
            <ButtonToolbar>

              {/* Contact */}
              <Button
                size="sm"
                color="blue"
                appearance="primary"
                disabled={!canContact(row)}
                onClick={() => onContact(row.id)}
              >
                {ICON.phone} Contact
              </Button>

              {/* Purchase */}
              <Button
                size="sm"
                color="green"
                appearance="primary"
                disabled={!canPurchase(row)}
                onClick={() => onPurchase(row)}
              >
                {ICON.check} Purchase
              </Button>

              {/* Assign */}
              <Whisper
                speaker={<Tooltip>Assign Sale</Tooltip>}
              >
                <Button
                  size="sm"
                  appearance="subtle"
                  onClick={() => onAssign(row)}
                >
                  👤
                </Button>
              </Whisper>

              {/* Note */}
              <Whisper speaker={<Tooltip>Note</Tooltip>}>
                <Button
                  size="sm"
                  appearance="subtle"
                  onClick={() => onRemark(row)}
                >
                  📝
                </Button>
              </Whisper>

              {/* Timeline */}
              <Whisper speaker={<Tooltip>Timeline</Tooltip>}>
                <Button
                  size="sm"
                  appearance="subtle"
                  onClick={() => onTimeline(row)}
                >
                  🕒
                </Button>
              </Whisper>

            </ButtonToolbar>
          )}
        </Cell>
      </Column>
    </Table>
  );
}

export default CrmLeadTable;

// ===== STYLES =====
const styles = {
  nameWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  name: {
    fontWeight: 800,
    color: "#111",
  },
  newBadge: {
    fontSize: 11,
    color: "#d97706",
  },
  subText: {
    fontSize: 13,
    color: "#555",
  },
  phoneWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  phone: {
    color: "#d62828",
    fontWeight: 700,
  },
  sale: {
    fontWeight: 700,
  },
  remark: {
    fontSize: 12,
    color: "#666",
  },
};