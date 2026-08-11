import React, { useMemo, useState } from "react";
import { CrmPurchaseModal, CrmAssignSaleModal, CrmRemarkDrawer, CrmTimelineDrawer, CrmSummaryCards, CrmFilters, CrmLeadTable } from "../components";

import { useCrmLeads } from "../hooks/useCrmLeads";
import { useSelector } from "react-redux";

function CrmLeadScreen() {
  const {
    leads,
    loading,
    contact,
    purchase,
    assignSale,
    addRemark,
    getTimeline,
    refresh,
  } = useCrmLeads();

  const { office:{ humanRight } } = useSelector(state=>state.office);
  const sales = useMemo(()=>{
      // return humanRight.filter(a=>a.team)
      return humanRight.filter(a=>a.team && !a.saleManagerTeam)
  },[humanRight]);

  // ===== FILTER STATE =====
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saleFilter, setSaleFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  // ===== MODAL / DRAWER STATE =====
  const [selectedLead, setSelectedLead] = useState(null);

  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [remarkOpen, setRemarkOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  // ===== OPEN HANDLERS =====
  const openPurchase = (lead) => {
    setSelectedLead(lead);
    setPurchaseOpen(true);
  };

  const openAssign = (lead) => {
    setSelectedLead(lead);
    setAssignOpen(true);
  };

  const openRemark = (lead) => {
    setSelectedLead(lead);
    setRemarkOpen(true);
  };

  const openTimeline = (lead) => {
    setSelectedLead(lead);
    setTimelineOpen(true);
  };

  // ===== ACTION HANDLERS =====
  const handlePurchase = async ({ leadId, value }) => {
    await purchase(leadId, value);
  };

  const handleAssign = async ({ leadId, saleName }) => {
    await assignSale(leadId, saleName);
  };

  const handleRemark = async ({ leadId, text }) => {
    await addRemark(leadId, text);
  };

  const handleLoadTimeline = async ({ leadId }) => {
    return await getTimeline(leadId);
  };

  // ===== FILTER LOGIC =====
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const keyword = String(search || "").trim().toLowerCase();

      const leadStatus =
        lead?.metaEvents?.purchaseSent
          ? "purchase"
          : lead?.metaEvents?.contactSent
          ? "contact"
          : "registered";

      // status filter
      if (statusFilter !== "all" && leadStatus !== statusFilter) {
        return false;
      }

      // sale filter
      if (saleFilter !== "all") {
        if (saleFilter === "__unassigned__") {
          if (lead?.saleName) return false;
        } else if (lead?.saleName !== saleFilter) {
          return false;
        }
      }

      // date filter
      if (selectedDate) {
        const d = new Date(lead.createdAt);
        const sameDay =
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate();

        if (!sameDay) return false;
      }

      // search
      if (keyword) {
        const searchable = [
          lead.fullName,
          lead.restaurantName,
          lead.phone,
          lead.id,
          lead.saleName,
          lead.remarkLatest,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(keyword)) return false;
      }

      return true;
    });
  }, [leads, search, statusFilter, saleFilter, selectedDate]);

  return (
    <div style={styles.container}>
      {/* SUMMARY */}
      <CrmSummaryCards leads={leads} />

      {/* FILTER */}
      <CrmFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        saleFilter={saleFilter}
        onSaleChange={setSaleFilter}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onRefresh={refresh}
        loading={loading}
        salesOptions={[
          { label: "ทั้งหมด", value: "all" },
          { label: "Aom", value: "Aom" },
          { label: "Mint", value: "Mint" },
          { label: "Boss", value: "Boss" },
          { label: "Team ScanFood", value: "Team ScanFood" },
          { label: "ยังไม่ assign", value: "__unassigned__" },
        ]}
      />

      {/* TABLE */}
      <CrmLeadTable
        data={filteredLeads}
        loading={loading}
        onContact={contact}
        onPurchase={openPurchase}
        onAssign={openAssign}
        onRemark={openRemark}
        onTimeline={openTimeline}
        sales={sales}
      />

      {/* PURCHASE */}
      <CrmPurchaseModal
        open={purchaseOpen}
        lead={selectedLead}
        onClose={() => setPurchaseOpen(false)}
        onConfirm={handlePurchase}
      />

      {/* ASSIGN */}
      <CrmAssignSaleModal
        open={assignOpen}
        lead={selectedLead}
        onClose={() => setAssignOpen(false)}
        onConfirm={handleAssign}
        sales={sales}
      />

      {/* REMARK */}
      <CrmRemarkDrawer
        open={remarkOpen}
        lead={selectedLead}
        onClose={() => setRemarkOpen(false)}
        onAddRemark={handleRemark}
      />

      {/* TIMELINE */}
      <CrmTimelineDrawer
        open={timelineOpen}
        lead={selectedLead}
        onClose={() => setTimelineOpen(false)}
        onLoadTimeline={handleLoadTimeline}
      />
    </div>
  );
}

export default CrmLeadScreen;

// ===== STYLE =====
const styles = {
  container: {
    padding: 20,
    background: "linear-gradient(180deg,#fff5f5,#f8fafc)",
    minHeight: "100vh",
  },
};