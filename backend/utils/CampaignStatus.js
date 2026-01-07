// backend/utils/campaignStatus.js
// Compute the *effective* campaign status for client responses.
export function computeStatus(c) {
  const now = new Date();
  const start = c.launchDate ? new Date(c.launchDate) : null;
  const end = c.endDate ? new Date(c.endDate) : null;
  const current = c.status;

  // If manually set to Aborted, it stays Aborted
  if (current === "Aborted") return "Aborted";
  
  // If campaign has ended, it's Completed
  if (end && now > end) return "Completed";
  
  // If campaign is in Ready_to_go status and start date is reached, it becomes Running
  if (current === "Ready_to_go" && start && now >= start) return "Running";
  
  // If campaign is Running and end date is reached, it becomes Completed
  if (current === "Running" && end && now > end) return "Completed";
  
  // Return current status for all other cases
  return current || "Draft";
}

// Function to check if a campaign needs status update
export function needsStatusUpdate(campaign) {
  const now = new Date();
  const start = campaign.launchDate ? new Date(campaign.launchDate) : null;
  const end = campaign.endDate ? new Date(campaign.endDate) : null;
  const current = campaign.status;

  // If Ready_to_go and start date reached, should be Running
  if (current === "Ready_to_go" && start && now >= start) return "Running";
  
  // If Running and end date reached, should be Completed
  if (current === "Running" && end && now > end) return "Completed";
  
  return null; // No update needed
}
