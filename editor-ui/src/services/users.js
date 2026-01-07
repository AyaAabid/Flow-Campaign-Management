import api from "../utils/api.js";

export const getMe = async () => {
  const { data } = await api.get("/users/me");
  localStorage.setItem("pos-user", JSON.stringify(data.user));
  return data.user;
};

export const updateMe = async (payload) => {
  const { data } = await api.put("/users/me", payload);
  localStorage.setItem("pos-user", JSON.stringify(data.user));
  return data.user;
};

export const changePassword = async (payload) => {
  const { data } = await api.put("/users/me/password", payload);
  return data;
};

export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append("avatar", file);
  const { data } = await api.post("/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  localStorage.setItem("pos-user", JSON.stringify(data.user));
  return data.user;
};
