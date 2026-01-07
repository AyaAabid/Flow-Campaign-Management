import api from "../utils/api.js";

export const fetchBrands = async () => {
  const { data } = await api.get("/brands"); // alias handles baseURL + token
  return data.brands || [];
};

export const fetchBrandById = async (id) => {
  const { data } = await api.get(`/brands/${id}`);
  return data.brand;
};

export const createBrand = async (payload) => {
  const { data } = await api.post("/brands", payload);
  return data.brand;
};

export const updateBrand = async (id, payload) => {
  const { data } = await api.put(`/brands/${id}`, payload);
  return data.brand;
};

export const deleteBrand = async (id) => {
  await api.delete(`/brands/${id}`);
};
