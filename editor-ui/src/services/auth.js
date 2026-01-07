// frontend/src/services/auth.js
import api from "../utils/api.js";

export const login = async ({ username, password }) => {
  const { data } = await api.post("/auth/login", { username, password });
  localStorage.setItem("pos-token", data.token);
  localStorage.setItem("pos-user", JSON.stringify(data.user));
  return data.user;
};

export const logout = () => {
  localStorage.removeItem("pos-token");
  localStorage.removeItem("pos-user");
};
