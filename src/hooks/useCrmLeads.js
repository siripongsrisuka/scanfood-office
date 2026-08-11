import { useEffect, useState } from "react";
import { crmService } from "../services/crmService";
import { db } from "../db/firestore";
import { formatTime } from "../Utility/function";

export const useCrmLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = await db.collection("leads").get();
      const data = query.docs.map((doc) => {
        const { createdAt, ...rest } = doc.data();
        return {
          id: doc.id,
          ...rest,
          createdAt: formatTime(createdAt)
        }
      });
      setLeads(data);
      
    } catch (error) {
      alert(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const contact = async (leadId) => {
    await crmService.contactLead({ leadId });
    await fetchLeads();
  };

  const purchase = async (leadId, value) => {
    await crmService.purchaseLead({ leadId, value });
    await fetchLeads();
  };

  const assignSale = async (leadId, saleName) => {
    await crmService.assignSale({ leadId, saleName });
    await fetchLeads();
  };

  const addRemark = async (leadId, text) => {
    await crmService.addRemark({ leadId, text });
    await fetchLeads();
  };

  return {
    leads,
    loading,
    contact,
    purchase,
    assignSale,
    addRemark,
    refresh: fetchLeads,
  };
};