import React, { useEffect, useState } from "react";
import {
  Drawer,
  Loader,
  Message,
  toaster,
} from "rsuite";

import { formatDateTime } from "../modal/crmModel";

function CrmTimelineDrawer({
  open,
  onClose,
  lead,
  onLoadTimeline,
}) {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (open && lead?.id) {
      loadTimeline();
    }
  }, [open, lead]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const data = await onLoadTimeline({ leadId: lead.id });
      setTimeline(data || []);
    } catch (err) {
      toaster.push(
        <Message type="error" showIcon>
          โหลด timeline ไม่สำเร็จ
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
        <Drawer.Title>🕒 Timeline</Drawer.Title>
      </Drawer.Header>

      <Drawer.Body>

        {/* Lead Info */}
        <div style={styles.leadBox}>
          <div style={styles.name}>{lead?.fullName}</div>
          <div style={styles.sub}>{lead?.restaurantName}</div>
        </div>

        {loading ? (
          <div style={styles.loader}>
            <Loader vertical content="กำลังโหลด..." />
          </div>
        ) : (
          <div style={styles.timelineWrap}>

            {timeline.length === 0 && (
              <div style={styles.empty}>ไม่มีข้อมูล</div>
            )}

            {timeline.map((item, index) => (
              <div key={index} style={styles.item}>

                {/* dot */}
                <div style={styles.dotWrap}>
                  <div style={styles.dot}></div>
                  {index !== timeline.length - 1 && (
                    <div style={styles.line}></div>
                  )}
                </div>

                {/* content */}
                <div style={styles.content}>
                  <div style={styles.title}>
                    {getIcon(item.type)} {item.text}
                  </div>
                  <div style={styles.date}>
                    {formatDateTime(item.date)}
                  </div>
                </div>

              </div>
            ))}

          </div>
        )}
      </Drawer.Body>
    </Drawer>
  );
}

export default CrmTimelineDrawer;

// ===== ICON =====
const getIcon = (type) => {
  switch (type) {
    case "register":
      return "🆕";
    case "contact":
      return "📞";
    case "purchase":
      return "💰";
    case "assign":
      return "👤";
    case "remark":
      return "📝";
    default:
      return "•";
  }
};

// ===== STYLE =====
const styles = {
  leadBox: {
    marginBottom: 20,
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
  loader: {
    marginTop: 40,
  },
  timelineWrap: {
    marginTop: 10,
  },
  item: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  dotWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#d62828",
  },
  line: {
    width: 2,
    height: 40,
    background: "#eee",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: 700,
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  empty: {
    color: "#999",
    fontSize: 13,
  },
};