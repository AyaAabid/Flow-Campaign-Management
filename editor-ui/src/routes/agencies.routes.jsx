import React from "react";
import AgencyList from "../features/agencies/AgencyList";
import AgencyForm from "../features/agencies/AgencyForm";
import AgencyDetails from "../features/agencies/AgencyDetails";

export default [
  { path: "/agencies", element: <AgencyList /> },
  { path: "/agencies/:id", element: <AgencyDetails /> },
  { path: "/agencies/new", element: <AgencyForm mode="create" /> },
  { path: "/agencies/:id/edit", element: <AgencyForm mode="edit" /> },
];
