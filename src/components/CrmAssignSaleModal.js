import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Button,
  SelectPicker,
  Message,
  toaster,
} from "rsuite";

const defaultSales = [
  { label: "Aom", value: "Aom" },
  { label: "Mint", value: "Mint" },
  { label: "Boss", value: "Boss" },
  { label: "Team ScanFood", value: "Team ScanFood" },
];

function CrmAssignSaleModal({
  open,
  onClose,
  lead,
  onConfirm,
  salesOptions = defaultSales,
  sales
}) {
  const [saleName, setSaleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pickerData = useMemo(() => {
    return Array.isArray(salesOptions) && salesOptions.length > 0
      ? sales.map(a=>({ label: a.name, value: a.id }))
      // ? salesOptions
      : defaultSales;
  }, [salesOptions]);

  console.log(sales)
  console.log(salesOptions)

  useEffect(() => {
    if (open) {
      setSaleName(lead?.saleName || "");
      setError("");
    }
  }, [open, lead]);

  const handleClose = () => {
    setSaleName("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!lead?.id) {
      setError("ไม่พบ lead");
      return;
    }

    if (!saleName) {
      setError("กรุณาเลือกเซล");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onConfirm({
        leadId: lead.id,
        saleName,
      });

      toaster.push(
        <Message showIcon type="success">
          assign sale สำเร็จ
        </Message>,
        { placement: "topEnd" }
      );

      handleClose();
    } catch (err) {
      toaster.push(
        <Message showIcon type="error">
          assign sale ไม่สำเร็จ
        </Message>,
        { placement: "topEnd" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} size="xs">
      <Modal.Header>
        <Modal.Title>👤 Assign Sale</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div style={styles.leadBox}>
          <div style={styles.name}>{lead?.fullName || "-"}</div>
          <div style={styles.sub}>{lead?.restaurantName || "-"}</div>
          <div style={styles.hint}>
            มอบหมาย lead นี้ให้เซลรับผิดชอบ
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>เลือกเซล *</label>

          <div style={styles.inputWrap}>
            <SelectPicker
              data={pickerData}
              value={saleName}
              onChange={(value) => {
                setSaleName(value || "");
                if (error) setError("");
              }}
              searchable={false}
              cleanable={false}
              style={{ width: "100%" }}
              placeholder="เลือกผู้รับผิดชอบ"
            />
            {error ? <div style={styles.error}>{error}</div> : null}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          loading={loading}
          style={styles.confirmBtn}
        >
          Save Assign
        </Button>

        <Button appearance="subtle" onClick={handleClose}>
          ยกเลิก
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CrmAssignSaleModal;

const styles = {
  leadBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    background: "linear-gradient(180deg,#fff1f2,#fff)",
    border: "1px solid #fecdd3",
  },
  name: {
    fontWeight: 800,
    fontSize: 18,
    color: "#111827",
  },
  sub: {
    fontSize: 14,
    color: "#6b7280",
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: "#d62828",
    fontWeight: 600,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 700,
    fontSize: 14,
    color: "#111827",
  },
  inputWrap: {
    position: "relative",
    marginTop: 6,
  },
  error: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
  },
  confirmBtn: {
    background: "linear-gradient(135deg,#d62828,#ef4444)",
    border: "none",
    color: "#fff",
    fontWeight: 700,
  },
};