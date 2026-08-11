// import React, { useMemo } from "react";
import { summary } from "../Utility/function";
import { minusMonth, yearMonth } from "../Utility/dateTime";
import { normalSort } from "../Utility/sort";

import React, { useMemo } from "react";

// ===== helper =====
function formatCurrency(num = 0) {
  return Number(num || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(num = 0) {
  return `${(Number(num || 0) * 100).toFixed(0)}%`;
}

function monthLabel(date) {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
  });
}

function getSoftwareTier(softwareNet = 0) {
  const tiers = [
    { min: 0, max: 49999, rate: 0.05, label: "Starter", target: 50000 },
    { min: 50000, max: 99999, rate: 0.1, label: "Bronze", target: 100000 },
    { min: 100000, max: 199999, rate: 0.15, label: "Silver", target: 200000 },
    { min: 200000, max: Infinity, rate: 0.2, label: "Gold", target: null },
  ];

  const current =
    tiers.find((tier) => softwareNet >= tier.min && softwareNet <= tier.max) ||
    tiers[0];

  const nextTier = tiers.find((tier) => tier.min > softwareNet) || null;

  let progress = 100;
  if (current.max !== Infinity) {
    const range = current.max - current.min + 1;
    const currentValue = softwareNet - current.min;
    progress = Math.max(0, Math.min(100, (currentValue / range) * 100));
  }

  let remainToNext = 0;
  if (nextTier) {
    remainToNext = Math.max(0, nextTier.min - softwareNet);
  }

  return {
    current,
    nextTier,
    progress,
    remainToNext,
  };
}

const InfoBox = ({ label, value, subValue, highlight = false }) => {
  return (
    <div
      style={{
        ...styles.infoBox,
        ...(highlight ? styles.infoBoxHighlight : {}),
      }}
    >
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value}</div>
      {subValue ? <div style={styles.infoSubValue}>{subValue}</div> : null}
    </div>
  );
};

const TierProgress = ({ softwareNet = 0, rate = 0 }) => {
  const tier = getSoftwareTier(softwareNet);

  return (
    <div style={styles.sectionCard}>
      <div style={styles.sectionTop}>
        <div>
          <div style={styles.sectionTitle}>Software Rate Progress</div>
          <div style={styles.sectionDesc}>
            ตอนนี้อยู่ขั้น <b>{tier.current.label}</b> ได้เรต{" "}
            <b>{formatPercent(rate)}</b>
          </div>
        </div>

        <div style={styles.ratePill}>{formatPercent(rate)}</div>
      </div>

      <div style={styles.tierTrackWrap}>
        <div style={styles.tierTrack}>
          <div
            style={{
              ...styles.tierFill,
              width: `${tier.progress}%`,
            }}
          />
        </div>
      </div>

      <div style={styles.tierStepRow}>
        <div style={styles.tierStep}>
          <div style={styles.tierStepAmount}>0</div>
          <div style={styles.tierStepRate}>5%</div>
        </div>
        <div style={styles.tierStep}>
          <div style={styles.tierStepAmount}>50k</div>
          <div style={styles.tierStepRate}>10%</div>
        </div>
        <div style={styles.tierStep}>
          <div style={styles.tierStepAmount}>100k</div>
          <div style={styles.tierStepRate}>15%</div>
        </div>
        <div style={styles.tierStep}>
          <div style={styles.tierStepAmount}>200k+</div>
          <div style={styles.tierStepRate}>20%</div>
        </div>
      </div>

      <div style={styles.tierBottom}>
        <div>
          Software Net: <b>฿ {formatCurrency(softwareNet)}</b>
        </div>
        <div>
          {tier.nextTier ? (
            <>
              อีก <b>฿ {formatCurrency(tier.remainToNext)}</b> จะขึ้นเป็น{" "}
              <b>{tier.nextTier.label}</b>
            </>
          ) : (
            <b>ถึงเรตสูงสุดแล้ว</b>
          )}
        </div>
      </div>
    </div>
  );
};

const MiniBarChart = ({ previous = 0, current = 0 }) => {
  const max = Math.max(previous, current, 1);
  const prevHeight = (previous / max) * 140;
  const currentHeight = (current / max) * 140;

  return (
    <div style={styles.sectionCard}>
      <div style={styles.sectionTitle}>Commission Compare</div>
      <div style={styles.sectionDesc}>เทียบค่าคอมรวม 2 เดือนล่าสุด</div>

      <div style={styles.chartWrap}>
        <div style={styles.chartYAxis}>
          <span>สูง</span>
          <span>กลาง</span>
          <span>ต่ำ</span>
        </div>

        <div style={styles.chartArea}>
          <div style={styles.chartColumn}>
            <div style={styles.chartValue}>฿ {formatCurrency(previous)}</div>
            <div style={{ ...styles.chartBar, height: `${prevHeight}px` }} />
            <div style={styles.chartLabel}>เดือนก่อน</div>
          </div>

          <div style={styles.chartColumn}>
            <div style={styles.chartValue}>฿ {formatCurrency(current)}</div>
            <div
              style={{
                ...styles.chartBar,
                ...styles.chartBarActive,
                height: `${currentHeight}px`,
              }}
            />
            <div style={styles.chartLabel}>เดือนนี้</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopHardware = ({ data = [] }) => {
  const top3 = [...data]
    .sort((a, b) => Number(b.sharing || 0) - Number(a.sharing || 0))
    .slice(0, 3);

  return (
    <div style={styles.sectionCard}>
      <div style={styles.sectionTitle}>Top 3 Hardware Commission</div>
      <div style={styles.sectionDesc}>อุปกรณ์ที่ทำ commission สูงสุด</div>

      <div style={styles.topList}>
        {top3.length > 0 ? (
          top3.map((item, index) => (
            <div key={`${item.id}-${index}`} style={styles.topItem}>
              <div style={styles.topRank}>#{index + 1}</div>

              <div style={styles.topContent}>
                <div style={styles.topName}>{item.name || "-"}</div>
                <div style={styles.topMeta}>
                  จำนวน {Number(item.qty || 0)} ชิ้น
                </div>
              </div>

              <div style={styles.topValue}>
                ฿ {formatCurrency(item.sharing || 0)}
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>ไม่มีข้อมูล hardware commission</div>
        )}
      </div>
    </div>
  );
};

const HardwareTable = ({ data = [] }) => {
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ชื่ออุปกรณ์</th>
            <th style={styles.thCenter}>จำนวน</th>
            <th style={styles.thRight}>Commission</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={`${item.id}-${index}`} style={styles.tr}>
                <td style={styles.td}>{item.name || "-"}</td>
                <td style={styles.tdCenter}>{Number(item.qty || 0)}</td>
                <td style={styles.tdRight}>
                  ฿ {formatCurrency(item.sharing || 0)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={styles.emptyCell} colSpan={3}>
                ไม่มีข้อมูล Hardware Sharing
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const MonthCard = ({ title, data, date }) => {
  const totalCommission =
    Number(data?.softwareCommission || 0) + Number(data?.hardwareCommission || 0);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{title}</div>
          <div style={styles.cardSubTitle}>{monthLabel(date)}</div>
        </div>

        <div style={styles.badge}>{Number(data?.cases || 0)} เคส</div>
      </div>

      <div style={styles.summaryBanner}>
        <div style={styles.summaryBannerLabel}>ค่าคอมรวม</div>
        <div style={styles.summaryBannerValue}>
          ฿ {formatCurrency(totalCommission)}
        </div>
      </div>

      <div style={styles.grid}>
        <InfoBox
          label="Software Net"
          value={`฿ ${formatCurrency(data?.softwareNet)}`}
        />
        <InfoBox
          label="Commission Rate"
          value={formatPercent(data?.softwareCommissionRate)}
        />
        <InfoBox
          label="Software Commission"
          value={`฿ ${formatCurrency(data?.softwareCommission)}`}
          highlight
        />
        <InfoBox
          label="Hardware Net"
          value={`฿ ${formatCurrency(data?.hardwareNet)}`}
        />
        <InfoBox
          label="Hardware Commission"
          value={`฿ ${formatCurrency(data?.hardwareCommission)}`}
          highlight
        />
        <InfoBox label="Cases" value={`${Number(data?.cases || 0)} รายการ`} />
      </div>

      <TierProgress
        softwareNet={data?.softwareNet || 0}
        rate={data?.softwareCommissionRate || 0}
      />

      <div style={styles.inlineSectionGrid}>
        <TopHardware data={data?.hardwareWithSharing || []} />
      </div>

      <div style={styles.sectionTitleOutside}>Hardware Sharing Detail</div>
      <HardwareTable data={data?.hardwareWithSharing || []} />
    </div>
  );
};

export default function CommissionDashboard({
  payments = [],
  sharingMap = new Map(),
}) {
  const dates = useMemo(() => {
    return [minusMonth(new Date(), 1), new Date()];
  }, []);

  const display = useMemo(() => {
    const display = dates.map((item) => {
      const data = payments.filter((a) => a.yearMonth === yearMonth(item));

      const softwareNet = summary(data, "softwarePrice");
      const softwareCommissionRate =
        softwareNet >= 200000
          ? 0.2
          : softwareNet >= 100000
          ? 0.15
          : softwareNet >= 50000
          ? 0.1
          : 0.05;

      const softwareCommission = softwareNet * softwareCommissionRate;
      const hardwareNet = summary(data, "hardwarePrice");

      const hardwares = data.flatMap((a) => a.hardware || []);
      const uniqueHardware = new Map();

      hardwares.forEach((item) => {
        if (uniqueHardware.has(item.id)) {
          const exist = uniqueHardware.get(item.id);
          uniqueHardware.set(item.id, {
            ...item,
            qty: Number(exist.qty) + Number(item.qty),
          });
        } else {
          uniqueHardware.set(item.id, item);
        }
      });

      const hardwareWithSharing = [...uniqueHardware.values()].map((item) => {
        const sharing = sharingMap.get(item.id) || 0;
        return {
          ...item,
          sharing: Number(sharing || 0) * Number(item.qty || 0),
        };
      });

      const hardwareCommission = summary(hardwareWithSharing, "sharing");

      return {
        softwareNet,
        softwareCommissionRate,
        softwareCommission,
        hardwareNet,
        hardwareCommission,
        hardwareWithSharing: normalSort("sharing", hardwareWithSharing),
        cases: data.length,
      };
    });

    return display;
  }, [payments, sharingMap, dates]);

  const previousTotal =
    Number(display?.[0]?.softwareCommission || 0) +
    Number(display?.[0]?.hardwareCommission || 0);

  const currentTotal =
    Number(display?.[1]?.softwareCommission || 0) +
    Number(display?.[1]?.hardwareCommission || 0);

  const diff = currentTotal - previousTotal;
  const diffPercent =
    previousTotal > 0 ? ((diff / previousTotal) * 100).toFixed(1) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Commission Dashboard</h1>
          <p style={styles.pageDesc}>
            สรุปยอด Software / Hardware และค่าคอมของ 2 เดือนล่าสุด
          </p>
        </div>

        <div style={styles.compareCard}>
          <div style={styles.compareLabel}>เทียบเดือนล่าสุด</div>
          <div
            style={{
              ...styles.compareValue,
              color: diff >= 0 ? "#16a34a" : "#dc2626",
            }}
          >
            {diff >= 0 ? "+" : ""}฿ {formatCurrency(diff)}
          </div>
          <div style={styles.compareSub}>
            {diff >= 0 ? "เพิ่มขึ้น" : "ลดลง"} {Math.abs(Number(diffPercent))}%
          </div>
        </div>
      </div>

      <div style={styles.topDashboardGrid}>
        <MiniBarChart previous={previousTotal} current={currentTotal} />
      </div>

      <div style={styles.cardGrid}>
        <MonthCard title="เดือนนี้" data={display?.[1]} date={dates?.[1]} />
        <MonthCard title="เดือนที่แล้ว" data={display?.[0]} date={dates?.[0]} />

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  pageTitle: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    color: "#111827",
  },
  pageDesc: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
  compareCard: {
    minWidth: "240px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
    border: "1px solid #e5e7eb",
  },
  compareLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  compareValue: {
    fontSize: "28px",
    fontWeight: 700,
  },
  compareSub: {
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "13px",
  },
  topDashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    border: "1px solid #e5e7eb",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#111827",
  },
  cardSubTitle: {
    marginTop: "4px",
    fontSize: "14px",
    color: "#6b7280",
  },
  badge: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "13px",
  },
  summaryBanner: {
    background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    color: "#fff",
    borderRadius: "18px",
    padding: "18px",
    marginBottom: "18px",
  },
  summaryBannerLabel: {
    fontSize: "13px",
    opacity: 0.8,
    marginBottom: "6px",
  },
  summaryBannerValue: {
    fontSize: "30px",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  infoBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "14px",
  },
  infoBoxHighlight: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  infoValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#111827",
    wordBreak: "break-word",
  },
  infoSubValue: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#6b7280",
  },

  sectionCard: {
    background: "#fbfcfe",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "16px",
    marginBottom: "18px",
  },
  sectionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "4px",
  },
  sectionTitleOutside: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "12px",
  },
  sectionDesc: {
    fontSize: "13px",
    color: "#6b7280",
  },
  ratePill: {
    background: "#111827",
    color: "#fff",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 700,
  },

  tierTrackWrap: {
    marginBottom: "10px",
  },
  tierTrack: {
    width: "100%",
    height: "14px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  tierFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #60a5fa 0%, #2563eb 100%)",
    transition: "width 0.3s ease",
  },
  tierStepRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginBottom: "12px",
  },
  tierStep: {
    textAlign: "center",
  },
  tierStepAmount: {
    fontSize: "12px",
    color: "#111827",
    fontWeight: 700,
  },
  tierStepRate: {
    fontSize: "11px",
    color: "#6b7280",
  },
  tierBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    fontSize: "13px",
    color: "#374151",
  },

  chartWrap: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-end",
    minHeight: "190px",
    marginTop: "14px",
  },
  chartYAxis: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "170px",
    fontSize: "11px",
    color: "#9ca3af",
    paddingBottom: "16px",
  },
  chartArea: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: "32px",
    height: "170px",
    borderLeft: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 20px 0 20px",
  },
  chartColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
    width: "120px",
    gap: "8px",
  },
  chartValue: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#111827",
    textAlign: "center",
  },
  chartBar: {
    width: "56px",
    minHeight: "8px",
    borderRadius: "14px 14px 0 0",
    background: "#cbd5e1",
    transition: "all 0.3s ease",
  },
  chartBarActive: {
    background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
  },
  chartLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: 600,
    paddingBottom: "6px",
  },

  inlineSectionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  },

  topList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "12px",
  },
  topItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
  },
  topRank: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 700,
    flexShrink: 0,
  },
  topContent: {
    flex: 1,
    minWidth: 0,
  },
  topName: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#111827",
    wordBreak: "break-word",
  },
  topMeta: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "2px",
  },
  topValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#16a34a",
    textAlign: "right",
    whiteSpace: "nowrap",
  },

  tableWrap: {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "420px",
    background: "#fff",
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#374151",
  },
  thCenter: {
    textAlign: "center",
    padding: "12px 14px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#374151",
  },
  thRight: {
    textAlign: "right",
    padding: "12px 14px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#374151",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "12px 14px",
    fontSize: "14px",
    color: "#111827",
  },
  tdCenter: {
    padding: "12px 14px",
    fontSize: "14px",
    color: "#111827",
    textAlign: "center",
  },
  tdRight: {
    padding: "12px 14px",
    fontSize: "14px",
    color: "#111827",
    textAlign: "right",
    fontWeight: 600,
  },
  emptyCell: {
    padding: "18px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "14px",
  },
  emptyState: {
    fontSize: "13px",
    color: "#9ca3af",
    paddingTop: "8px",
  },
};