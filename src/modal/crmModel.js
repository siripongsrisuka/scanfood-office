export const STATUS = {
  REGISTERED: "registered",
  CONTACT: "contact",
  PURCHASE: "purchase",
};

export const SCANFOOD_THEME = {
  red: "#d62828",
  redSoft: "#fff1f2",
  blue: "#2563eb",
  green: "#16a34a",
  orange: "#f59e0b",
};

export const getLeadStatus = (lead) => {
  if (lead?.metaEvents?.purchaseSent) return STATUS.PURCHASE;
  if (lead?.metaEvents?.contactSent) return STATUS.CONTACT;
  return STATUS.REGISTERED;
};

export const formatDateTime = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleString("th-TH");
};