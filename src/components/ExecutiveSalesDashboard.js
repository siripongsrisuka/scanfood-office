import React, { useMemo, useState } from "react";
import { yearMonth } from "../Utility/dateTime";

const SOFTWARE_TARGET_PER_SELLER = 200000;
const HARDWARE_TARGET_PER_SELLER = 500000;

function formatCurrency(num = 0) {
  return Number(num || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(num = 0) {
  return `${Number(num || 0).toFixed(1)}%`;
}

function monthLabel(date) {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
  });
}

function getSoftwareCommissionRate(softwareNet = 0) {
  return softwareNet >= 200000
    ? 0.2
    : softwareNet >= 100000
    ? 0.15
    : softwareNet >= 50000
    ? 0.1
    : 0.05;
}

function getRankBadge(index) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
}

const theme = {
  primary: "#E31B23",
  primaryDark: "#B31217",
  primarySoft: "#FFF1F2",
  primaryBorder: "#FBCFD2",
  text: "#202124",
  textSoft: "#6B7280",
  bg: "#FFF8F8",
  white: "#FFFFFF",
  green: "#16A34A",
  orange: "#F97316",
  red: "#DC2626",
  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  blueBorder: "#BFDBFE",
  shadow: "0 12px 32px rgba(227, 27, 35, 0.10)",
};

const StatCard = ({ label, value, subValue, tone = "red" }) => {
  const toneStyle =
    tone === "blue"
      ? {
          border: `1px solid ${theme.blueBorder}`,
          background: theme.white,
        }
      : {
          border: `1px solid ${theme.primaryBorder}`,
          background: theme.white,
        };

  return (
    <div style={{ ...styles.statCard, ...toneStyle }}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      {subValue ? <div style={styles.statSub}>{subValue}</div> : null}
    </div>
  );
};

const ProgressBar = ({ value = 0, color = theme.primary, trackColor = "#F7D8DA" }) => {
  const width = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div style={{ ...styles.progressTrack, background: trackColor }}>
      <div
        style={{
          ...styles.progressFill,
          width: `${width}%`,
          background: color,
        }}
      />
    </div>
  );
};

const MiniCompanyBar = ({ value = 0 }) => {
  const width = Math.max(6, Math.min(100, Number(value || 0)));
  return (
    <div style={styles.miniBarTrack}>
      <div
        style={{
          ...styles.miniBarFill,
          width: `${width}%`,
        }}
      />
    </div>
  );
};

const SellerCard = ({ item, index }) => {
  const softwareColor =
    item.softwareTargetPercent >= 100
      ? theme.green
      : item.softwareTargetPercent >= 70
      ? theme.orange
      : theme.red;

  const hardwareColor =
    item.hardwareTargetPercent >= 100
      ? theme.green
      : item.hardwareTargetPercent >= 70
      ? theme.orange
      : theme.blue;

  return (
    <div style={styles.sellerCard}>
      <div style={styles.sellerTop}>
        <div style={styles.rankCircle}>{getRankBadge(index)}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.sellerName}>{item.saleName}</div>
          <div style={styles.sellerMeta}>
            {item.cases} เคส • Software ฿ {formatCurrency(item.softwareNet)} •{" "}
            Hardware ฿ {formatCurrency(item.hardwareNet)}
          </div>
        </div>

        <div style={styles.totalBox}>
          <div style={styles.totalBoxLabel}>ยอดรวม</div>
          <div style={styles.totalBoxValue}>฿ {formatCurrency(item.totalNet)}</div>
        </div>
      </div>

      <div style={styles.kpiGrid}>
        <div style={styles.kpiBox}>
          <div style={styles.kpiLabel}>Software Target</div>
          <div style={{ ...styles.kpiValue, color: softwareColor }}>
            {formatPercent(item.softwareTargetPercent)}
          </div>
          <ProgressBar
            value={item.softwareTargetPercent}
            color={softwareColor}
            trackColor="#F7D8DA"
          />
          <div style={styles.kpiSub}>
            เป้า ฿ {formatCurrency(item.softwareTarget)} / ทำได้ ฿{" "}
            {formatCurrency(item.softwareNet)}
          </div>
          <div style={styles.kpiSub}>
            Commission Rate {formatPercent(item.softwareCommissionRate * 100 === 0 ? 0 : item.softwareCommissionRate*100).replace(".0","")}
          </div>
        </div>

        <div style={styles.kpiBoxBlue}>
          <div style={styles.kpiLabel}>Hardware Target</div>
          <div style={{ ...styles.kpiValue, color: hardwareColor }}>
            {formatPercent(item.hardwareTargetPercent)}
          </div>
          <ProgressBar
            value={item.hardwareTargetPercent}
            color={hardwareColor}
            trackColor="#DBEAFE"
          />
          <div style={styles.kpiSub}>
            เป้า ฿ {formatCurrency(item.hardwareTarget)} / ทำได้ ฿{" "}
            {formatCurrency(item.hardwareNet)}
          </div>
          <div style={styles.kpiSub}>Commission แบบ sharing ตามสินค้า</div>
        </div>

        <div style={styles.kpiBox}>
          <div style={styles.kpiLabel}>สัดส่วนของบริษัท</div>
          <div style={styles.kpiValue}>
            {formatPercent(item.companyPercent)}
          </div>
          <MiniCompanyBar value={item.companyPercent} />
          <div style={styles.kpiSub}>contribution ต่อยอดรวมบริษัท</div>
        </div>

        <div style={styles.kpiBox}>
          <div style={styles.kpiLabel}>ค่าคอมรวม</div>
          <div style={styles.kpiValue}>
            ฿ {formatCurrency(item.totalCommission)}
          </div>
          <div style={styles.kpiSub}>
            software ฿ {formatCurrency(item.softwareCommission)} + hardware ฿{" "}
            {formatCurrency(item.hardwareCommission)}
          </div>
        </div>
      </div>
    </div>
  );
};

const SellerTable = ({ rows = [] }) => {
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.thCenter}>อันดับ</th>
            <th style={styles.th}>เซล</th>
            <th style={styles.thRight}>Software</th>
            <th style={styles.thRight}>Hardware</th>
            <th style={styles.thRight}>ยอดรวม</th>
            <th style={styles.thRight}>% Software</th>
            <th style={styles.thRight}>% Hardware</th>
            <th style={styles.thRight}>% บริษัท</th>
            <th style={styles.thRight}>ค่าคอมรวม</th>
            <th style={styles.thCenter}>เคส</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((item, index) => (
              <tr key={item.saleId || index} style={styles.tr}>
                <td style={styles.tdCenter}>{getRankBadge(index)}</td>
                <td style={styles.td}>{item.saleName}</td>
                <td style={styles.tdRight}>฿ {formatCurrency(item.softwareNet)}</td>
                <td style={styles.tdRight}>฿ {formatCurrency(item.hardwareNet)}</td>
                <td style={styles.tdRight}>฿ {formatCurrency(item.totalNet)}</td>
                <td style={styles.tdRight}>
                  {formatPercent(item.softwareTargetPercent)}
                </td>
                <td style={styles.tdRight}>
                  {formatPercent(item.hardwareTargetPercent)}
                </td>
                <td style={styles.tdRight}>{formatPercent(item.companyPercent)}</td>
                <td style={styles.tdRight}>
                  ฿ {formatCurrency(item.totalCommission)}
                </td>
                <td style={styles.tdCenter}>{item.cases}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} style={styles.emptyCell}>
                ไม่มีข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function ExecutiveSalesDashboard({
  payments = [],
  sharingMap = new Map(),
  sellerIdKey = "saleId",
  sellerNameKey = "saleName",
}) {
  const [selectedDate] = useState(new Date());

  const report = useMemo(() => {
    const ym = yearMonth(selectedDate);
    const currentPayments = payments.filter((a) => a.yearMonth === ym);

    const grouped = new Map();

    currentPayments.forEach((payment) => {
      const saleId = payment[sellerIdKey] || "";
      const saleName = saleId?payment[sellerNameKey] || "ไม่ระบุชื่อ":'Organic/ต่ออายุ'

      if (!grouped.has(saleId)) {
        grouped.set(saleId, {
          saleId,
          saleName,
          cases: 0,
          softwareNet: 0,
          hardwareNet: 0,
          hardwareCommission: 0,
          softwareCommission: 0,
          totalCommission: 0,
          totalNet: 0,
        });
      }

      const row = grouped.get(saleId);

      row.cases += 1;
      row.softwareNet += Number(payment.softwarePrice || 0);
      row.hardwareNet += Number(payment.hardwarePrice || 0);

      const hardwares = payment.hardwares || [];
      let currentHardwareCommission = 0;

      hardwares.forEach((hardware) => {
        const sharing = Number(sharingMap.get(hardware.id) || 0);
        currentHardwareCommission += sharing * Number(hardware.qty || 0);
      });

      row.hardwareCommission += currentHardwareCommission;
    });

    const sellerRows = [...grouped.values()].map((item) => {
      const softwareCommissionRate = getSoftwareCommissionRate(item.softwareNet);
      const softwareCommission = item.softwareNet * softwareCommissionRate;
      const totalCommission = softwareCommission + item.hardwareCommission;
      const totalNet = item.softwareNet + item.hardwareNet;

      const softwareTarget = SOFTWARE_TARGET_PER_SELLER;
      const hardwareTarget = HARDWARE_TARGET_PER_SELLER;

      const softwareTargetPercent =
        softwareTarget > 0 ? (item.softwareNet / softwareTarget) * 100 : 0;

      const hardwareTargetPercent =
        hardwareTarget > 0 ? (item.hardwareNet / hardwareTarget) * 100 : 0;

      return {
        ...item,
        softwareCommissionRate,
        softwareCommission,
        totalCommission,
        totalNet,
        softwareTarget,
        hardwareTarget,
        softwareTargetPercent,
        hardwareTargetPercent,
      };
    });

    const sellerCount = sellerRows.length;

    const companySoftwareTarget = sellerCount * SOFTWARE_TARGET_PER_SELLER;
    const companyHardwareTarget = sellerCount * HARDWARE_TARGET_PER_SELLER;

    const companySoftwareNet = sellerRows.reduce(
      (sum, item) => sum + Number(item.softwareNet || 0),
      0
    );

    const companyHardwareNet = sellerRows.reduce(
      (sum, item) => sum + Number(item.hardwareNet || 0),
      0
    );

    const companyTotalNet = sellerRows.reduce(
      (sum, item) => sum + Number(item.totalNet || 0),
      0
    );

    const companyTotalCommission = sellerRows.reduce(
      (sum, item) => sum + Number(item.totalCommission || 0),
      0
    );

    const companySoftwareTargetPercent =
      companySoftwareTarget > 0
        ? (companySoftwareNet / companySoftwareTarget) * 100
        : 0;

    const companyHardwareTargetPercent =
      companyHardwareTarget > 0
        ? (companyHardwareNet / companyHardwareTarget) * 100
        : 0;

    const ranked = sellerRows
      .map((item) => ({
        ...item,
        companyPercent:
          companyTotalNet > 0 ? (item.totalNet / companyTotalNet) * 100 : 0,
      }))
      .sort((a, b) => Number(b.totalNet || 0) - Number(a.totalNet || 0));

    const topSeller = ranked[0] || null;

    const hitSoftwareTargetCount = ranked.filter(
      (a) => a.softwareTargetPercent >= 100
    ).length;

    const hitHardwareTargetCount = ranked.filter(
      (a) => a.hardwareTargetPercent >= 100
    ).length;

    return {
      monthText: monthLabel(selectedDate),
      ranked,
      sellerCount,
      companySoftwareNet,
      companyHardwareNet,
      companyTotalNet,
      companyTotalCommission,
      companySoftwareTarget,
      companyHardwareTarget,
      companySoftwareTargetPercent,
      companyHardwareTargetPercent,
      topSeller,
      hitSoftwareTargetCount,
      hitHardwareTargetCount,
    };
  }, [payments, selectedDate, sellerIdKey, sellerNameKey, sharingMap]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>ScanFood Executive Sales Overview</h1>
          <p style={styles.pageDesc}>
            ภาพรวมอันดับเซล เป้า Software / Hardware และ contribution ต่อทั้งบริษัท
          </p>
        </div>

        <div style={styles.monthBadge}>{report.monthText}</div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          label="Software บริษัท"
          value={`฿ ${formatCurrency(report.companySoftwareNet)}`}
          subValue={`เป้า ${report.sellerCount} คน × ฿ ${formatCurrency(
            SOFTWARE_TARGET_PER_SELLER
          )} = ฿ ${formatCurrency(report.companySoftwareTarget)} • ${formatPercent(
            report.companySoftwareTargetPercent
          )}`}
        />
        <StatCard
          label="Hardware บริษัท"
          value={`฿ ${formatCurrency(report.companyHardwareNet)}`}
          subValue={`เป้า ${report.sellerCount} คน × ฿ ${formatCurrency(
            HARDWARE_TARGET_PER_SELLER
          )} = ฿ ${formatCurrency(report.companyHardwareTarget)} • ${formatPercent(
            report.companyHardwareTargetPercent
          )}`}
          tone="blue"
        />
        <StatCard
          label="ยอดรวมบริษัท"
          value={`฿ ${formatCurrency(report.companyTotalNet)}`}
          subValue="Software + Hardware รวมทั้งทีม"
        />
        <StatCard
          label="ค่าคอมรวมทีม"
          value={`฿ ${formatCurrency(report.companyTotalCommission)}`}
          subValue="software commission + hardware sharing"
        />
        <StatCard
          label="ถึงเป้า Software"
          value={`${report.hitSoftwareTargetCount} คน`}
          subValue={`จากทั้งหมด ${report.ranked.length} คน`}
        />
        <StatCard
          label="ถึงเป้า Hardware"
          value={`${report.hitHardwareTargetCount} คน`}
          subValue={`จากทั้งหมด ${report.ranked.length} คน`}
          tone="blue"
        />
      </div>

      {report.topSeller ? (
        <div style={styles.heroCard}>
          <div style={styles.heroLeft}>
            <div style={styles.heroTag}>Top Seller</div>
            <div style={styles.heroName}>{report.topSeller.saleName}</div>
            <div style={styles.heroMeta}>
              อันดับ 1 ของเดือนนี้ • contribution{" "}
              {formatPercent(report.topSeller.companyPercent)} ของบริษัท
            </div>
          </div>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricBox}>
              <div style={styles.heroMetricLabel}>ยอดรวม</div>
              <div style={styles.heroMetricValue}>
                ฿ {formatCurrency(report.topSeller.totalNet)}
              </div>
            </div>
            <div style={styles.heroMetricBox}>
              <div style={styles.heroMetricLabel}>Software %</div>
              <div style={styles.heroMetricValue}>
                {formatPercent(report.topSeller.softwareTargetPercent)}
              </div>
            </div>
            <div style={styles.heroMetricBox}>
              <div style={styles.heroMetricLabel}>Hardware %</div>
              <div style={styles.heroMetricValue}>
                {formatPercent(report.topSeller.hardwareTargetPercent)}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div style={styles.sectionTitle}>Leaderboard</div>
      <div style={styles.cardList}>
        {report.ranked.map((item, index) => (
          <SellerCard key={item.saleId || index} item={item} index={index} />
        ))}
      </div>

      <div style={styles.sectionTitle}>Executive Table View</div>
      <SellerTable rows={report.ranked} />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(180deg, ${theme.bg} 0%, #fff 55%, ${theme.primarySoft} 100%)`,
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  pageTitle: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 800,
    color: theme.primaryDark,
  },
  pageDesc: {
    marginTop: "8px",
    marginBottom: 0,
    color: theme.textSoft,
    fontSize: "14px",
  },
  monthBadge: {
    background: theme.white,
    border: `1px solid ${theme.primaryBorder}`,
    color: theme.primaryDark,
    borderRadius: "999px",
    padding: "10px 16px",
    fontWeight: 800,
    boxShadow: theme.shadow,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    borderRadius: "20px",
    padding: "18px",
    boxShadow: theme.shadow,
  },
  statLabel: {
    fontSize: "13px",
    color: theme.textSoft,
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 800,
    color: theme.primaryDark,
  },
  statSub: {
    marginTop: "6px",
    fontSize: "12px",
    color: theme.textSoft,
    lineHeight: 1.5,
  },

  heroCard: {
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
    color: "#fff",
    borderRadius: "24px",
    padding: "22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    boxShadow: "0 16px 34px rgba(227, 27, 35, 0.22)",
    marginBottom: "22px",
  },
  heroLeft: {
    flex: 1,
    minWidth: "260px",
  },
  heroTag: {
    fontSize: "12px",
    fontWeight: 700,
    opacity: 0.85,
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  heroName: {
    fontSize: "30px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  heroMeta: {
    fontSize: "14px",
    opacity: 0.9,
  },
  heroMetrics: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  heroMetricBox: {
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "18px",
    padding: "14px 16px",
    minWidth: "160px",
  },
  heroMetricLabel: {
    fontSize: "12px",
    opacity: 0.8,
    marginBottom: "6px",
  },
  heroMetricValue: {
    fontSize: "22px",
    fontWeight: 800,
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: theme.primaryDark,
    marginBottom: "12px",
    marginTop: "6px",
  },

  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "22px",
  },
  sellerCard: {
    background: theme.white,
    border: `1px solid ${theme.primaryBorder}`,
    borderRadius: "22px",
    padding: "18px",
    boxShadow: theme.shadow,
  },
  sellerTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  rankCircle: {
    minWidth: "56px",
    height: "56px",
    borderRadius: "50%",
    background: theme.primarySoft,
    border: `1px solid ${theme.primaryBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 800,
    color: theme.primaryDark,
    padding: "0 8px",
  },
  sellerName: {
    fontSize: "20px",
    fontWeight: 800,
    color: theme.text,
  },
  sellerMeta: {
    fontSize: "13px",
    color: theme.textSoft,
    marginTop: "4px",
  },
  totalBox: {
    background: theme.primarySoft,
    border: `1px solid ${theme.primaryBorder}`,
    borderRadius: "16px",
    padding: "12px 14px",
    minWidth: "180px",
  },
  totalBoxLabel: {
    fontSize: "12px",
    color: theme.textSoft,
    marginBottom: "4px",
  },
  totalBoxValue: {
    fontSize: "22px",
    fontWeight: 800,
    color: theme.primaryDark,
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  kpiBox: {
    background: "#fff",
    border: `1px solid #F4D7D9`,
    borderRadius: "18px",
    padding: "14px",
  },
  kpiBoxBlue: {
    background: "#fff",
    border: `1px solid ${theme.blueBorder}`,
    borderRadius: "18px",
    padding: "14px",
  },
  kpiLabel: {
    fontSize: "12px",
    color: theme.textSoft,
    marginBottom: "6px",
  },
  kpiValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: theme.primaryDark,
    marginBottom: "10px",
  },
  kpiSub: {
    fontSize: "12px",
    color: theme.textSoft,
    marginTop: "8px",
    lineHeight: 1.45,
  },

  progressTrack: {
    width: "100%",
    height: "12px",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },

  miniBarTrack: {
    width: "100%",
    height: "10px",
    background: "#F7D8DA",
    borderRadius: "999px",
    overflow: "hidden",
  },
  miniBarFill: {
    height: "100%",
    borderRadius: "999px",
    background: `linear-gradient(90deg, #FF7A7F 0%, ${theme.primary} 60%, ${theme.primaryDark} 100%)`,
  },

  tableWrap: {
    overflowX: "auto",
    border: `1px solid ${theme.primaryBorder}`,
    borderRadius: "18px",
    background: "#fff",
    boxShadow: theme.shadow,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    background: theme.primarySoft,
    borderBottom: `1px solid ${theme.primaryBorder}`,
    color: theme.primaryDark,
    fontWeight: 800,
    fontSize: "13px",
  },
  thCenter: {
    textAlign: "center",
    padding: "14px",
    background: theme.primarySoft,
    borderBottom: `1px solid ${theme.primaryBorder}`,
    color: theme.primaryDark,
    fontWeight: 800,
    fontSize: "13px",
  },
  thRight: {
    textAlign: "right",
    padding: "14px",
    background: theme.primarySoft,
    borderBottom: `1px solid ${theme.primaryBorder}`,
    color: theme.primaryDark,
    fontWeight: 800,
    fontSize: "13px",
  },
  tr: {
    borderBottom: "1px solid #F7DFE1",
  },
  td: {
    padding: "14px",
    fontSize: "14px",
    color: theme.text,
  },
  tdCenter: {
    padding: "14px",
    fontSize: "14px",
    color: theme.text,
    textAlign: "center",
  },
  tdRight: {
    padding: "14px",
    fontSize: "14px",
    color: theme.text,
    textAlign: "right",
    fontWeight: 700,
  },
  emptyCell: {
    padding: "20px",
    textAlign: "center",
    color: theme.textSoft,
    fontSize: "14px",
  },
};