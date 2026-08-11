const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

let mockLeads = [
  {
    id: "lead_001",
    fullName: "สมชาย",
    restaurantName: "ร้านอร่อย",
    phone: "0812345678",
    createdAt: new Date(),

    saleName: "",
    remarkLatest: "",

    metaEvents: {},
  },
  {
    id: "lead_002",
    fullName: "สมหญิง",
    restaurantName: "ร้านเด็ด",
    phone: "0899999999",
    createdAt: new Date(),

    saleName: "Aom",

    metaEvents: {
      contactSent: true,
    },
  },
];

export const crmService = {
  async getLeads() {
    await delay();
    return [...mockLeads];
  },

  async contactLead({ leadId }) {
    await delay();

    mockLeads = mockLeads.map((l) =>
      l.id === leadId
        ? {
            ...l,
            metaEvents: {
              ...l.metaEvents,
              contactSent: true,
              contactAt: new Date(),
            },
          }
        : l
    );

    return { success: true };
  },

  async purchaseLead({ leadId, value }) {
    await delay();

    mockLeads = mockLeads.map((l) =>
      l.id === leadId
        ? {
            ...l,
            purchaseValue: value,
            metaEvents: {
              ...l.metaEvents,
              purchaseSent: true,
              purchaseAt: new Date(),
            },
          }
        : l
    );

    return { success: true };
  },

  async assignSale({ leadId, saleName }) {
    await delay();

    mockLeads = mockLeads.map((l) =>
      l.id === leadId
        ? { ...l, saleName }
        : l
    );

    return { success: true };
  },

  async addRemark({ leadId, text }) {
    await delay();

    mockLeads = mockLeads.map((l) =>
      l.id === leadId
        ? {
            ...l,
            remarkLatest: text,
          }
        : l
    );

    return { success: true };
  },

  async getTimeline({ leadId }) {
    await delay();

    const lead = mockLeads.find((l) => l.id === leadId);

    return [
      { type: "register", text: "ลงทะเบียน", date: lead.createdAt },
      lead?.metaEvents?.contactAt && {
        type: "contact",
        text: "ติดต่อแล้ว",
        date: lead.metaEvents.contactAt,
      },
      lead?.metaEvents?.purchaseAt && {
        type: "purchase",
        text: "ปิดการขาย",
        date: lead.metaEvents.purchaseAt,
      },
    ].filter(Boolean);
  },
};