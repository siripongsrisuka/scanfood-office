import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, SelectPicker, Tag, Divider } from "rsuite";

export function calculateLeadValue(lead = {}) {
  let base = 0;

  if (lead.size === "s") base = 4200;
  else if (lead.size === "m") base = 7200;
  else if (lead.size === "l") base = 9600;
  else if (lead.size === "extra") base = 12600;

  const branch = Number(lead.branchCount) || 1;
  let branchMultiplier = 1;

  if (branch === 1) branchMultiplier = 1;
  else if (branch === 2) branchMultiplier = 1.5;
  else if (branch >= 3) branchMultiplier = 2;

  let intentMultiplier = 1;

  if (lead.posIntent === "never") intentMultiplier = 1;
  else if (lead.posIntent === "used_before") intentMultiplier = 1.2;
  else if (lead.posIntent === "looking") intentMultiplier = 1.4;
  else if (lead.posIntent === "switching") intentMultiplier = 1.7;
  else if (lead.posIntent === "switching_with_pain") intentMultiplier = 2;

  const value = Math.round(base * branchMultiplier * intentMultiplier);
  return value;
}

export function getLeadValueBreakdown(lead = {}) {
  let base = 0;
  let sizeLabel = "-";

  if (lead.size === "s") {
    base = 4200;
    sizeLabel = "ร้านขนาด S";
  } else if (lead.size === "m") {
    base = 7200;
    sizeLabel = "ร้านขนาด M";
  } else if (lead.size === "l") {
    base = 9600;
    sizeLabel = "ร้านขนาด L";
  } else if (lead.size === "extra") {
    base = 12600;
    sizeLabel = "ร้านขนาด Extra";
  }

  const branch = Number(lead.branchCount) || 1;
  let branchMultiplier = 1;
  let branchLabel = "1 สาขา";

  if (branch === 1) {
    branchMultiplier = 1;
    branchLabel = "1 สาขา";
  } else if (branch === 2) {
    branchMultiplier = 1.5;
    branchLabel = "2 สาขา";
  } else if (branch >= 3) {
    branchMultiplier = 2;
    branchLabel = "3+ สาขา";
  }

  let intentMultiplier = 1;
  let intentLabel = "ไม่เคยใช้ POS";

  if (lead.posIntent === "never") {
    intentMultiplier = 1;
    intentLabel = "ไม่เคยใช้ POS";
  } else if (lead.posIntent === "used_before") {
    intentMultiplier = 1.2;
    intentLabel = "เคยใช้ POS มาก่อน";
  } else if (lead.posIntent === "looking") {
    intentMultiplier = 1.4;
    intentLabel = "กำลังมองหา POS";
  } else if (lead.posIntent === "switching") {
    intentMultiplier = 1.7;
    intentLabel = "กำลังย้ายค่าย";
  } else if (lead.posIntent === "switching_with_pain") {
    intentMultiplier = 2;
    intentLabel = "กำลังย้ายค่ายและมี pain point";
  }

  const value = Math.round(base * branchMultiplier * intentMultiplier);

  return {
    sizeLabel,
    base,
    branchLabel,
    branchMultiplier,
    intentLabel,
    intentMultiplier,
    value,
  };
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("th-TH");
}

function getValueTier(value) {
  if (value >= 30000) {
    return {
      label: "Hot Lead",
      color: "#16a34a",
      bg: "linear-gradient(135deg, rgba(22,163,74,0.16), rgba(34,197,94,0.08))",
      border: "rgba(22,163,74,0.22)",
    };
  }

  if (value >= 15000) {
    return {
      label: "Warm Lead",
      color: "#ea580c",
      bg: "linear-gradient(135deg, rgba(249,115,22,0.16), rgba(251,146,60,0.08))",
      border: "rgba(249,115,22,0.22)",
    };
  }

  if (value > 0) {
    return {
      label: "Cold Lead",
      color: "#2563eb",
      bg: "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(59,130,246,0.08))",
      border: "rgba(37,99,235,0.22)",
    };
  }

  return {
    label: "Not Ready",
    color: "#6b7280",
    bg: "linear-gradient(135deg, rgba(107,114,128,0.16), rgba(156,163,175,0.08))",
    border: "rgba(107,114,128,0.22)",
  };
}

const sizeOptions = [
  { label: "S · 4,200 บาท", value: "s" },
  { label: "M · 7,200 บาท", value: "m" },
  { label: "L · 9,600 บาท", value: "l" },
  { label: "Extra · 12,600 บาท", value: "extra" },
];

const branchOptions = [
  { label: "1 สาขา · x1", value: 1 },
  { label: "2 สาขา · x1.5", value: 2 },
  { label: "3 สาขาขึ้นไป · x2", value: 3 },
];

const posIntentOptions = [
  { label: "ไม่เคยใช้ POS · x1", value: "never" },
  { label: "เคยใช้ POS มาก่อน · x1.2", value: "used_before" },
  { label: "กำลังมองหา POS · x1.4", value: "looking" },
  { label: "กำลังย้ายค่าย · x1.7", value: "switching" },
  { label: "ย้ายค่าย + มี pain point · x2", value: "switching_with_pain" },
];

export default function Modal_ContactValue({
  open,
  onClose,
  onConfirm,
  initialLead = {},
  loading = false,
}) {
  const [form, setForm] = useState({
    size: initialLead?.size || null,
    branchCount: initialLead?.branchCount || 1,
    posIntent: initialLead?.posIntent || null,
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      size: initialLead?.size || null,
      branchCount: initialLead?.branchCount || 1,
      posIntent: initialLead?.posIntent || null,
    });
  }, [open, initialLead]);

  const breakdown = useMemo(() => getLeadValueBreakdown(form), [form]);
  const valueTier = useMemo(() => getValueTier(breakdown.value), [breakdown.value]);

  const canSubmit = !!form.size && !!form.branchCount && !!form.posIntent;

  const handleConfirm = () => {
    if (!canSubmit || loading) return;

    onConfirm?.({
      ...form,
      value: breakdown.value,
      eventName: "Contact",
      currency: "THB",
      breakdown,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      backdrop="static"
      overflow={false}
    >
      <Modal.Header>
        <Modal.Title>
          <div style={styles.headerWrap}>
            <div style={styles.logoBox}>SF</div>
            <div>
              <div style={styles.headerTitle}>Contact Value Calculator</div>
              <div style={styles.headerSubTitle}>
                ประเมินมูลค่า lead ก่อนส่ง Contact Event กลับ Meta
              </div>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={styles.body}>
        <div style={styles.heroCard}>
          <div style={styles.heroBackgroundOrbOne} />
          <div style={styles.heroBackgroundOrbTwo} />

          <div style={styles.heroTopRow}>
            <div>
              <div style={styles.heroCaption}>Predicted Contact Value</div>
              <div style={styles.heroValue}>฿ {formatMoney(breakdown.value)}</div>
            </div>

            <Tag
              style={{
                color: valueTier.color,
                background: valueTier.bg,
                border: `1px solid ${valueTier.border}`,
                borderRadius: 999,
                fontWeight: 700,
                padding: "8px 12px",
              }}
            >
              {valueTier.label}
            </Tag>
          </div>

          <div style={styles.heroEquation}>
            {`฿ ${formatMoney(breakdown.base)} × ${breakdown.branchMultiplier} × ${breakdown.intentMultiplier}`}
          </div>
        </div>

        <div style={styles.formSection}>
          <div style={styles.fieldBlock}>
            <div style={styles.label}>ขนาดร้าน</div>
            <SelectPicker
              block
              cleanable={false}
              searchable={false}
              placeholder="เลือกขนาดร้าน"
              data={sizeOptions}
              value={form.size}
              onChange={(value) => setForm((prev) => ({ ...prev, size: value }))}
            />
          </div>

          <div style={styles.fieldBlock}>
            <div style={styles.label}>จำนวนสาขา</div>
            <SelectPicker
              block
              cleanable={false}
              searchable={false}
              placeholder="เลือกจำนวนสาขา"
              data={branchOptions}
              value={form.branchCount}
              onChange={(value) => setForm((prev) => ({ ...prev, branchCount: value }))}
            />
          </div>

          <div style={styles.fieldBlock}>
            <div style={styles.label}>POS Intent</div>
            <SelectPicker
              block
              cleanable={false}
              searchable={false}
              placeholder="เลือกสถานะการใช้ POS"
              data={posIntentOptions}
              value={form.posIntent}
              onChange={(value) => setForm((prev) => ({ ...prev, posIntent: value }))}
            />
          </div>
        </div>

        <Divider style={{ margin: "18px 0" }} />

        <div style={styles.summaryCard}>
          <div style={styles.summaryTitle}>Calculation Summary</div>

          <div style={styles.summaryRow}>
            <span style={styles.summaryKey}>Base</span>
            <span style={styles.summaryValue}>
              {breakdown.sizeLabel} · ฿ {formatMoney(breakdown.base)}
            </span>
          </div>

          <div style={styles.summaryRow}>
            <span style={styles.summaryKey}>Branch Multiplier</span>
            <span style={styles.summaryValue}>
              {breakdown.branchLabel} · x{breakdown.branchMultiplier}
            </span>
          </div>

          <div style={styles.summaryRow}>
            <span style={styles.summaryKey}>Intent Multiplier</span>
            <span style={styles.summaryValue}>
              {breakdown.intentLabel} · x{breakdown.intentMultiplier}
            </span>
          </div>

          <div style={{ ...styles.summaryRow, borderBottom: "none", paddingBottom: 0 }}>
            <span style={{ ...styles.summaryKey, fontSize: 14, fontWeight: 800 }}>Final Value</span>
            <span style={{ ...styles.summaryValue, fontSize: 18, fontWeight: 800, color: "#dc2626" }}>
              ฿ {formatMoney(breakdown.value)}
            </span>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer style={styles.footer}>
        <Button appearance="subtle" onClick={onClose} style={styles.cancelButton}>
          ยกเลิก
        </Button>
        <Button
          appearance="primary"
          loading={loading}
          disabled={!canSubmit}
          onClick={handleConfirm}
          style={styles.confirmButton}
        >
          ยืนยันและส่ง Contact
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const styles = {
  headerWrap: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 15,
    boxShadow: "0 14px 30px rgba(239,68,68,0.28)",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1.2,
  },
  headerSubTitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#6b7280",
  },
  body: {
    paddingTop: 8,
    paddingBottom: 8,
    background: "linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%)",
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    padding: 20,
    background: "linear-gradient(135deg, #111827 0%, #1f2937 45%, #7f1d1d 100%)",
    boxShadow: "0 24px 60px rgba(17,24,39,0.22)",
  },
  heroBackgroundOrbOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    top: -70,
    right: -60,
    filter: "blur(2px)",
  },
  heroBackgroundOrbTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 999,
    background: "rgba(239,68,68,0.18)",
    bottom: -36,
    left: -18,
    filter: "blur(2px)",
  },
  heroTopRow: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  heroCaption: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    marginBottom: 6,
  },
  heroValue: {
    color: "#fff",
    fontSize: 34,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: -0.6,
  },
  heroEquation: {
    position: "relative",
    marginTop: 16,
    display: "inline-flex",
    alignItems: "center",
    minHeight: 36,
    borderRadius: 999,
    padding: "8px 14px",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 600,
    fontSize: 13,
  },
  formSection: {
    marginTop: 18,
    display: "grid",
    gap: 14,
  },
  fieldBlock: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
  },
  summaryCard: {
    borderRadius: 22,
    padding: 18,
    background: "#ffffff",
    border: "1px solid #f1f5f9",
    boxShadow: "0 16px 30px rgba(15,23,42,0.06)",
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 10,
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px dashed #e5e7eb",
  },
  summaryKey: {
    fontSize: 13,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: 700,
    textAlign: "right",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 14,
    borderTop: "1px solid #f3f4f6",
    background: "#fff",
  },
  cancelButton: {
    minWidth: 120,
    borderRadius: 14,
    fontWeight: 700,
  },
  confirmButton: {
    minWidth: 220,
    borderRadius: 14,
    fontWeight: 800,
    border: "none",
    background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    boxShadow: "0 12px 24px rgba(239,68,68,0.22)",
  },
};
