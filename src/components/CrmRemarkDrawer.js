import React, { useEffect, useState } from "react";
import {
  Drawer,
  Button,
  Input,
  Message,
  toaster,
} from "rsuite";

function CrmRemarkDrawer({
  open,
  onClose,
  lead,
  onAddRemark,
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setText("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      toaster.push(
        <Message type="warning" showIcon>
          กรุณากรอกข้อความ
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    try {
      setLoading(true);

      await onAddRemark({
        leadId: lead.id,
        text,
      });

      toaster.push(
        <Message type="success" showIcon>
          บันทึกโน้ตแล้ว
        </Message>,
        { placement: "topEnd" }
      );

      setText("");
    } catch (err) {
      toaster.push(
        <Message type="error" showIcon>
          บันทึกไม่สำเร็จ
        </Message>,
        { placement: "topEnd" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} size="sm">
      <Drawer.Header>
        <Drawer.Title>📝 Remark / Notes</Drawer.Title>
      </Drawer.Header>

      <Drawer.Body>

        {/* Lead Info */}
        <div style={styles.leadBox}>
          <div style={styles.name}>{lead?.fullName}</div>
          <div style={styles.sub}>{lead?.restaurantName}</div>
        </div>

        {/* Input */}
        <div style={styles.inputWrap}>
          <Input
            as="textarea"
            rows={3}
            placeholder="พิมพ์โน้ต เช่น สนใจ demo / นัดวันพรุ่งนี้"
            value={text}
            onChange={setText}
          />
        </div>

        <Button
          appearance="primary"
          onClick={handleSubmit}
          loading={loading}
          style={styles.addBtn}
        >
          + เพิ่มโน้ต
        </Button>

        {/* ล่าสุด */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>ล่าสุด</div>

          {lead?.remarkLatest ? (
            <div style={styles.latestBox}>
              {lead.remarkLatest}
            </div>
          ) : (
            <div style={styles.empty}>ยังไม่มีโน้ต</div>
          )}
        </div>

      </Drawer.Body>
    </Drawer>
  );
}

export default CrmRemarkDrawer;

const styles = {
  leadBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
  },
  name: {
    fontWeight: 800,
    fontSize: 16,
  },
  sub: {
    fontSize: 13,
    color: "#666",
  },
  inputWrap: {
    marginBottom: 10,
  },
  addBtn: {
    marginBottom: 20,
    background: "#d62828",
    border: "none",
    color: "#fff",
    fontWeight: 700,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: 8,
  },
  latestBox: {
    padding: 10,
    background: "#f9fafb",
    borderRadius: 8,
    fontSize: 13,
  },
  empty: {
    fontSize: 12,
    color: "#999",
  },
};