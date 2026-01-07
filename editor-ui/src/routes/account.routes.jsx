import React from "react";
import AccountSettings from "../features/account/AccountSettings";
import ChangePassword from "../features/account/ChangePassword";

export default [
  { path: "/account", element: <AccountSettings /> },
  { path: "/account/password", element: <ChangePassword /> },
];
