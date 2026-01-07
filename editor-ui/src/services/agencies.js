import api from "../utils/api.js";

export const fetchAgencies = async () => {
  const { data } = await api.get("/agencies");
  return data.agencies || [];
};

export const fetchAgencyById = async (id) => {
  const { data } = await api.get(`/agencies/${id}`);
  return data.agency;
};

export const createAgency = async (payload) => {
  const { data } = await api.post("/agencies", payload);
  return data.agency;
};

export const updateAgency = async (id, payload) => {
  const { data } = await api.put(`/agencies/${id}`, payload);
  return data.agency;
};

export const deleteAgency = async (id) => {
  await api.delete(`/agencies/${id}`);
};
