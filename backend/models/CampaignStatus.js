// backend/models/CampaignStatus.js
export const CampaignStatus = {
  DRAFT: "Draft",
  WAITING: "Waiting_for_approval",
  READY_TO_GO: "Ready_to_go",
  RUNNING: "Running",
  COMPLETED: "Completed",
  ABORTED: "Aborted",
};

export const CampaignStatusArray = Object.values(CampaignStatus);
