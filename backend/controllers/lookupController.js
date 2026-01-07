import { INDUSTRIES, COUNTRY_CODES } from "../config/lookups.js";

export const getIndustries = (_req, res) =>
  res.json({ success: true, industries: INDUSTRIES });
export const getCountryCodes = (_req, res) =>
  res.json({ success: true, countryCodes: COUNTRY_CODES });
