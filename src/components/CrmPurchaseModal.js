import React, { useState } from "react";
import {
  Modal,
  Button,
  Input,
  SelectPicker,
  Message,
  toaster,
} from "rsuite";

// ===== CONFIG =====
const CURRENCY_OPTIONS = [
  { label: "บาท (THB)", value: "THB" },
  { label: "USD", value: "USD" },
];

const initialForm = {
  price: "",
  currency: "THB",
};

function CrmPurchaseModal({
  open,
  onClose,
  lead,
  onConfirm,
}) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ===== VALIDATE =====
  const validate = () => {
    const newErrors = {};
    const price = Number(form.price);

    if (!form.price || isNaN(price) || price <= 0) {
      newErrors.price = "กรุณากรอกราคาที่ถูกต้อง";
    }

    if (!form.currency) {
      newErrors.currency = "กรุณาเลือกสกุลเงิน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    if (!validate()) {
      setTimeout(() => {
        document.querySelector("[data-error]")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
      return;
    }

    try {
      setLoading(true);

      await onConfirm({
        leadId: lead.id,
        value: Number(form.price),
        currency: form.currency,
      });

      toaster.push(
        <Message showIcon type="success">
          ปิดการขายสำเร็จ 🎉
        </Message>,
        { placement: "topEnd" }
      );

      handleClose();
    } catch (err) {
      toaster.push(
        <Message showIcon type="error">
          ปิดการขายไม่สำเร็จ
        </Message>,
        { placement: "topEnd" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(initialForm);
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="xs">
      <Modal.Header>
        <Modal.Title>💰 ปิดการขาย</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* Lead Info */}
        <div style={styles.leadBox}>
          <div style={styles.name}>{lead?.fullName || "-"}</div>
          <div style={styles.sub}>
            {lead?.restaurantName || "-"}
          </div>
          <div style={styles.hint}>
            ยิง Purchase Event ไป Meta
          </div>
        </div>

        {/* PRICE */}
        <div style={styles.field}>
          <label style={styles.label}>ยอดขาย *</label>

          <div
            style={styles.inputWrap}
            data-error={errors.price ? "true" : undefined}
          >
            <Input
              value={form.price}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, price: val }));
                if (errors.price) {
                  setErrors((prev) => ({ ...prev, price: "" }));
                }
              }}
              placeholder="เช่น 2990"
            />
            {errors.price && (
              <div style={styles.error}>{errors.price}</div>
            )}
          </div>
        </div>

        {/* CURRENCY */}
        <div style={styles.field}>
          <label style={styles.label}>สกุลเงิน *</label>

          <div
            style={styles.inputWrap}
            data-error={errors.currency ? "true" : undefined}
          >
            <SelectPicker
              data={CURRENCY_OPTIONS}
              value={form.currency}
              onChange={(val) => {
                setForm((prev) => ({
                  ...prev,
                  currency: val || "THB",
                }));
                if (errors.currency) {
                  setErrors((prev) => ({ ...prev, currency: "" }));
                }
              }}
              searchable={false}
              cleanable={false}
              style={{ width: "100%" }}
            />
            {errors.currency && (
              <div style={styles.error}>{errors.currency}</div>
            )}
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
          Confirm Purchase
        </Button>

        <Button appearance="subtle" onClick={handleClose}>
          ยกเลิก
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CrmPurchaseModal;

// ===== STYLE =====
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
  },
  sub: {
    fontSize: 14,
    color: "#666",
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: "#d62828",
    fontWeight: 600,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 700,
    fontSize: 14,
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
    background: "linear-gradient(135deg,#16a34a,#22c55e)",
    border: "none",
    color: "#fff",
    fontWeight: 700,
  },
};