import React from "react";
import {
  Panel,
  Stack,
  Input,
  InputGroup,
  SelectPicker,
  DatePicker,
  Button,
} from "rsuite";

import SearchIcon from "@rsuite/icons/Search";
import ReloadIcon from "@rsuite/icons/Reload";

const STATUS_OPTIONS = [
  { label: "ทั้งหมด", value: "all" },
  { label: "ใหม่", value: "registered" },
  { label: "ติดต่อแล้ว", value: "contact" },
  { label: "ลูกค้าแล้ว", value: "purchase" },
];

const DEFAULT_SALE_OPTIONS = [
  { label: "ทั้งหมด", value: "all" },
  { label: "Aom", value: "Aom" },
  { label: "Mint", value: "Mint" },
  { label: "Boss", value: "Boss" },
  { label: "Team ScanFood", value: "Team ScanFood" },
  { label: "ยังไม่ assign", value: "__unassigned__" },
];

function CrmFilters({
  search = "",
  onSearchChange,
  statusFilter = "all",
  onStatusChange,
  saleFilter = "all",
  onSaleChange,
  selectedDate = null,
  onDateChange,
  onRefresh,
  loading = false,
  salesOptions = DEFAULT_SALE_OPTIONS,
}) {
  const normalizedSaleOptions =
    Array.isArray(salesOptions) && salesOptions.length > 0
      ? salesOptions
      : DEFAULT_SALE_OPTIONS;

  return (
    <Panel bordered style={styles.panel}>
      <div style={styles.title}>ค้นหาและกรอง Lead</div>

      <Stack spacing={12} wrap>
        <InputGroup inside style={styles.searchBox}>
          <InputGroup.Addon>
            <SearchIcon />
          </InputGroup.Addon>
          <Input
            value={search}
            onChange={onSearchChange}
            placeholder="ค้นหาชื่อ / ร้าน / เบอร์โทร / leadId"
          />
        </InputGroup>

        <SelectPicker
          data={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(value) => onStatusChange?.(value || "all")}
          cleanable={false}
          searchable={false}
          style={styles.select}
          placeholder="เลือกสถานะ"
        />

        <SelectPicker
          data={normalizedSaleOptions}
          value={saleFilter}
          onChange={(value) => onSaleChange?.(value || "all")}
          cleanable={false}
          searchable={false}
          style={styles.select}
          placeholder="เลือกเซล"
        />

        <DatePicker
          oneTap
          editable={false}
          value={selectedDate}
          onChange={onDateChange}
          placeholder="เลือกวันที่"
          style={styles.select}
          cleanable
        />

        <Button
          appearance="primary"
          startIcon={<ReloadIcon />}
          onClick={onRefresh}
          loading={loading}
          style={styles.refreshBtn}
        >
          รีเฟรช
        </Button>
      </Stack>
    </Panel>
  );
}

export default CrmFilters;

const styles = {
  panel: {
    marginBottom: 16,
    borderRadius: 18,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
  },
  title: {
    fontSize: 15,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 12,
  },
  searchBox: {
    width: 360,
    maxWidth: "100%",
  },
  select: {
    width: 180,
  },
  refreshBtn: {
    background: "linear-gradient(135deg, #d62828 0%, #ef4444 100%)",
    border: "none",
    color: "#fff",
    fontWeight: 800,
  },
};