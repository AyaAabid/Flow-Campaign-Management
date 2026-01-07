// frontend/editor-ui/src/constants/campaigns.js
export const CAMPAIGN_STATUS = {
  DRAFT: "Draft",
  WAITING: "Waiting_for_approval",
  READY_TO_GO: "Ready_to_go",
  RUNNING: "Running",
  COMPLETED: "Completed",
  ABORTED: "Aborted",
};

export const CAMPAIGN_STATUS_OPTIONS = [
  { label: "Draft", value: "Draft" },
  { label: "Waiting for approval", value: "Waiting_for_approval" },
  { label: "Ready to go", value: "Ready_to_go" },
  { label: "Aborted", value: "Aborted" },
  { label: "Running", value: "Running", disabled: true },
  { label: "Completed", value: "Completed", disabled: true },
];

export const CAMPAIGN_CHANNELS = [
  { label: "DOOH", value: "DOOH" },
  { label: "OOH", value: "OOH" },
];

export const CAMPAIGN_TYPES = [
  { label: "Digital", value: "Digital" },
  { label: "Programmatic", value: "Programmatic" },
  { label: "Static", value: "Static" },
];
