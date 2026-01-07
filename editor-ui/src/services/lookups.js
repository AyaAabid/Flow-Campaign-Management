import api from "../utils/api.js";

export const getIndustries = async () => {
  const { data } = await api.get("/lookups/industries");
  return data?.industries ?? [];
};

export const getCountryCodes = async () => {
  const { data } = await api.get("/lookups/country-codes");
  return data?.countryCodes ?? [];
};
