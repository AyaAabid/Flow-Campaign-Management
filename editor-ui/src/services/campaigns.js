// frontend/editor-ui/src/services/campaigns.js
import api from "../utils/api.js";

export const fetchCampaigns = async () => {
  const { data } = await api.get("/campaigns");
  return data.campaigns || [];
};

export const fetchCampaign = async (id) => {
  const { data } = await api.get(`/campaigns/${id}`);
  return data.campaign;
};

export const createCampaign = async (payload) => {
  const { data } = await api.post("/campaigns", payload);
  return data.campaign;
};

export const updateCampaign = async (id, payload) => {
  const { data } = await api.put(`/campaigns/${id}`, payload);
  return data.campaign;
};

export const deleteCampaign = async (id) => {
  await api.delete(`/campaigns/${id}`);
};

export const updateCampaignStatus = async (id, status) => {
  const { data } = await api.patch(`/campaigns/${id}/status`, { status });
  return data.campaign;
};
