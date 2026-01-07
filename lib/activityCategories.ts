/**
 * Determine activity category based on action and related IDs
 */
export function getActivityCategory(activity: {
  action: string;
  dueDateId?: any;
  clientId?: any;
  dueDateClientId?: any;
}): "clients" | "duedates" | "firm" {
  const action = activity.action?.toLowerCase() || "";
  
  // Firm category: member, invite, firm updates
  if (
    action.includes("member") ||
    action.includes("invite") ||
    action.includes("firm")
  ) {
    return "firm";
  }
  
  // Due Dates category: due date actions, attaching clients, due date client updates
  if (
    action.includes("due date") ||
    action.includes("attached client") ||
    activity.dueDateId ||
    activity.dueDateClientId
  ) {
    return "duedates";
  }
  
  // Clients category: client actions without due date context
  if (action.includes("client") && !activity.dueDateId) {
    return "clients";
  }
  
  // Default to clients if clientId exists
  if (activity.clientId && !activity.dueDateId) {
    return "clients";
  }
  
  // Default to duedates if dueDateId exists
  if (activity.dueDateId) {
    return "duedates";
  }
  
  // Default fallback
  return "firm";
}

