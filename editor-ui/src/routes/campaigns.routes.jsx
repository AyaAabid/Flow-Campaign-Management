// frontend/editor-ui/src/routes/campaigns.routes.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import CampaignsList from "../features/campaigns/CampaignList";
import CampaignForm from "../features/campaigns/CampaignForm";

export default [
  { path: "/campaigns", element: <CampaignsList /> },
  { path: "/campaigns/new", element: <CampaignForm mode="create" /> },
  { path: "/campaigns/:id/edit", element: <CampaignForm mode="edit" /> },
];
