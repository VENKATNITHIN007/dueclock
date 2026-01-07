import { ActivityType } from "@/schemas/apiSchemas/activitySchema";

/**
 * Format activity details into clear plain English: "Name has imported 9 clients"
 * Returns simple, readable format
 */
export function formatActivityDetails(activity: ActivityType): { what: string; forWho: string; byWho: string } {
  const action = activity.action || "";
  const actionType = activity.actionType;
  const details = activity.details as Record<string, unknown> | undefined;
  const byWho = activity.userName || "System";
  
  let what = "";
  let forWho = "";
  
  // ========== IMPORT ACTIONS ==========
  if (action.includes("Imported") || action.includes("imported")) {
    const match = action.match(/Imported (\d+) client/i);
    const count = match ? parseInt(match[1], 10) : 0;
    what = count > 0 ? `has imported ${count} client${count !== 1 ? "s" : ""}` : "has imported clients";
    return { what, forWho, byWho };
  }
  
  // ========== EXPORT ACTIONS ==========
  if (action.includes("Exported") || action.includes("exported")) {
    if (action.includes("due date")) {
      const dueDateTitle = activity.dueDateTitle || (action.match(/due date "([^"]+)"/i)?.[1] || "due date");
      what = `has exported due date "${dueDateTitle}"`;
    } else {
      what = "has exported clients";
    }
    return { what, forWho, byWho };
  }
  
  // ========== DELETE ACTIONS ==========
  if (action.includes("Deleted") || action.includes("Removed") || actionType === "deleted") {
    if (action.includes("due date")) {
      const dueDateTitle = activity.dueDateTitle || (action.match(/due date "([^"]+)"/i)?.[1] || "due date");
      what = `has deleted due date "${dueDateTitle}"`;
    } else if (action.includes("client") && activity.clientName) {
      // Client deletion - provide context
      const clientName = activity.clientName;
      const email = typeof details?.email === "string" ? details.email : "";
      if (email) {
        what = `has deleted client "${clientName}" (${email})`;
      } else {
        what = `has deleted client "${clientName}"`;
      }
    } else if (action.includes("client")) {
      const clientName = action.match(/client "([^"]+)"/i)?.[1] || "client";
      what = `has deleted client "${clientName}"`;
    } else if (action.includes("Removed") && action.includes("member")) {
      // Member removed from firm
      const emailMatch = action.match(/member ([^\s]+)/i);
      const email = emailMatch?.[1] || (typeof details?.memberEmail === "string" ? details.memberEmail : "");
      const memberName = typeof details?.memberName === "string" ? details.memberName : "";
      if (memberName && email) {
        what = `has removed member "${memberName}" (${email}) from the firm`;
      } else if (email) {
        what = `has removed member ${email} from the firm`;
      } else {
        what = "has removed a member from the firm";
      }
    } else if (action.includes("Removed") && activity.clientName && activity.dueDateTitle) {
      // Client removed from due date
      what = `has removed client "${activity.clientName}" from due date "${activity.dueDateTitle}"`;
    } else if (action.includes("invite")) {
      const emailMatch = action.match(/invite for ([^\s]+)/i);
      const email = emailMatch?.[1] || (typeof details?.invitedEmail === "string" ? details.invitedEmail : "");
      const role = typeof details?.role === "string" ? details.role : "";
      if (role && email) {
        what = `has deleted invite for ${email} (${role})`;
      } else if (email) {
        what = `has deleted invite for ${email}`;
      } else {
        what = "has deleted an invite";
      }
    } else {
      const match = action.match(/"([^"]+)"/);
      what = match ? `has deleted "${match[1]}"` : "has deleted an item";
    }
    return { what, forWho, byWho };
  }
  
  // ========== STATUS CHANGE ACTIONS (docStatus/workStatus) ==========
  if (action.includes("Updated client") && activity.dueDateTitle && activity.clientName) {
    // Status change for client in due date
    const changes = details?.changes as Record<string, { from?: string; to?: string }> | undefined;
    if (changes) {
      if (changes.docStatus) {
        const from = changes.docStatus.from;
        const to = changes.docStatus.to;
        what = `has changed document status from "${from}" to "${to}"`;
        forWho = `client "${activity.clientName}" in due date "${activity.dueDateTitle}"`;
      } else if (changes.workStatus) {
        const from = changes.workStatus.from;
        const to = changes.workStatus.to;
        what = `has changed work status from "${from}" to "${to}"`;
        forWho = `client "${activity.clientName}" in due date "${activity.dueDateTitle}"`;
      } else if (changes.lastContactedAt) {
        const to = changes.lastContactedAt.to;
        const contactDate = to ? new Date(String(to)).toLocaleDateString() : "";
        what = `has updated last contacted date to ${contactDate}`;
        forWho = `client "${activity.clientName}" in due date "${activity.dueDateTitle}"`;
      } else {
        what = `has updated client "${activity.clientName}"`;
        forWho = `in due date "${activity.dueDateTitle}"`;
      }
    } else {
      what = `has updated client "${activity.clientName}"`;
      forWho = `in due date "${activity.dueDateTitle}"`;
    }
    return { what, forWho, byWho };
  }
  
  // ========== CREATE ACTIONS ==========
  if (action.includes("Created") || actionType === "created") {
    if (action.includes("due date")) {
      const dueDateTitle = activity.dueDateTitle || (action.match(/due date "([^"]+)"/i)?.[1] || "due date");
      const dueDate = activity.dueDateDate ? new Date(String(activity.dueDateDate)).toLocaleDateString() : "";
      if (dueDate) {
        what = `has created due date "${dueDateTitle}" (${dueDate})`;
      } else {
        what = `has created due date "${dueDateTitle}"`;
      }
    } else if (action.includes("client")) {
      const clientName = activity.clientName || (action.match(/client "([^"]+)"/i)?.[1] || "client");
      const email = typeof details?.email === "string" ? details.email : "";
      if (email) {
        what = `has created client "${clientName}" (${email})`;
      } else {
        what = `has created client "${clientName}"`;
      }
    } else if (action.includes("firm")) {
      const firmName = action.match(/firm "([^"]+)"/i)?.[1] || "firm";
      what = `has created firm "${firmName}"`;
    } else if (action.includes("invite")) {
      const emailMatch = action.match(/invite for ([^\s]+)/i);
      const roleMatch = action.match(/as (\w+)/i);
      const email = emailMatch?.[1] || (typeof details?.invitedEmail === "string" ? details.invitedEmail : "");
      const role = roleMatch?.[1] || (typeof details?.role === "string" ? details.role : "");
      if (role && email) {
        what = `has created invite for ${email} as ${role}`;
      } else if (email) {
        what = `has created invite for ${email}`;
      } else {
        what = "has created an invite";
      }
    } else {
      const match = action.match(/"([^"]+)"/);
      what = match ? `has created "${match[1]}"` : "has created an item";
    }
    return { what, forWho, byWho };
  }
  
  // ========== ADD/ATTACH ACTIONS ==========
  if (action.includes("Added") || action.includes("Attached")) {
    if (action.includes("client") && activity.dueDateTitle) {
      // Client added to due date - this is important context
      const clientName = activity.clientName || (action.match(/client "([^"]+)"/i)?.[1] || "client");
      what = `has added client "${clientName}"`;
      forWho = `to due date "${activity.dueDateTitle}"`;
    } else if (action.includes("member")) {
      const emailMatch = action.match(/member ([^\s]+)/i);
      const roleMatch = action.match(/as (\w+)/i);
      const email = emailMatch?.[1] || (typeof details?.email === "string" ? details.email : "");
      const role = roleMatch?.[1] || (typeof details?.role === "string" ? details.role : "");
      const memberName = typeof details?.memberName === "string" ? details.memberName : "";
      if (memberName && role && email) {
        what = `has added member "${memberName}" (${email}) as ${role}`;
      } else if (role && email) {
        what = `has added member ${email} as ${role}`;
      } else if (email) {
        what = `has added member ${email}`;
      } else {
        what = "has added a member";
      }
    } else {
      const match = action.match(/"([^"]+)"/);
      what = match ? `has added "${match[1]}"` : "has added an item";
    }
    return { what, forWho, byWho };
  }
  
  // ========== UPDATE/EDIT ACTIONS ==========
  if (action.includes("Updated") || action.includes("Edited") || actionType === "edited") {
    // Check if we have previous and updated in details for precise changes
    const previous = details?.previous as Record<string, unknown> | undefined;
    const updated = details?.updated as Record<string, unknown> | undefined;
    
    if (action.includes("due date")) {
      const dueDateTitle = activity.dueDateTitle || (action.match(/due date "([^"]+)"/i)?.[1] || "due date");
      
      if (previous && updated) {
        // Extract specific changes
        const changeParts: string[] = [];
        
        if (updated.title !== undefined && previous.title !== updated.title) {
          const oldTitle = String(previous.title || "");
          const newTitle = String(updated.title || "");
          changeParts.push(`renamed due date title from "${oldTitle}" to "${newTitle}"`);
        } else if (updated.title !== undefined) {
          changeParts.push(`renamed due date title to "${updated.title}"`);
        }
        
        if (updated.date !== undefined && previous.date !== updated.date) {
          const oldDate = previous.date ? new Date(String(previous.date)).toLocaleDateString() : "";
          const newDate = updated.date ? new Date(String(updated.date)).toLocaleDateString() : "";
          changeParts.push(`changed due date from ${oldDate} to ${newDate}`);
        }
        
        if (changeParts.length > 0) {
          what = `has ${changeParts.join(" and ")}`;
        } else {
          what = `has updated due date "${dueDateTitle}"`;
        }
      } else {
        what = `has updated due date "${dueDateTitle}"`;
      }
    } else if (action.includes("client") && !activity.dueDateTitle) {
      const clientName = activity.clientName || (action.match(/client "([^"]+)"/i)?.[1] || "client");
      
      if (previous && updated) {
        // Extract specific changes
        const changeParts: string[] = [];
        
        if (updated.name !== undefined && previous.name !== updated.name) {
          const oldName = String(previous.name || "");
          const newName = String(updated.name || "");
          changeParts.push(`renamed client from "${oldName}" to "${newName}"`);
        } else if (updated.name !== undefined) {
          changeParts.push(`renamed client to "${updated.name}"`);
        }
        
        if (updated.email !== undefined && previous.email !== updated.email) {
          const oldEmail = String(previous.email || "");
          const newEmail = String(updated.email || "");
          changeParts.push(`changed email from "${oldEmail}" to "${newEmail}"`);
        }
        
        if (updated.phoneNumber !== undefined && previous.phoneNumber !== updated.phoneNumber) {
          const oldPhone = String(previous.phoneNumber || "");
          const newPhone = String(updated.phoneNumber || "");
          changeParts.push(`changed phone number from "${oldPhone}" to "${newPhone}"`);
        }
        
        if (changeParts.length > 0) {
          what = `has ${changeParts.join(" and ")}`;
        } else {
          what = `has updated client "${clientName}"`;
        }
      } else {
        what = `has updated client "${clientName}"`;
      }
    } else if (action.includes("firm")) {
      const firmName = action.match(/firm "([^"]+)"/i)?.[1] || "firm";
      
      if (previous && updated) {
        const changeParts: string[] = [];
        
        if (updated.firmName !== undefined && previous.firmName !== updated.firmName) {
          const oldName = String(previous.firmName || "");
          const newName = String(updated.firmName || "");
          changeParts.push(`renamed firm from "${oldName}" to "${newName}"`);
        } else if (updated.firmName !== undefined) {
          changeParts.push(`renamed firm to "${updated.firmName}"`);
        }
        
        if (changeParts.length > 0) {
          what = `has ${changeParts.join(" and ")}`;
        } else {
          what = `has updated firm "${firmName}"`;
        }
      } else {
        what = `has updated firm "${firmName}"`;
      }
    } else if (action.includes("member")) {
      const emailMatch = action.match(/member ([^\s]+)/i);
      const email = emailMatch?.[1] || (typeof details?.email === "string" ? details.email : "member");
      
      if (previous && updated) {
        const changeParts: string[] = [];
        
        if (updated.role !== undefined && previous.role !== updated.role) {
          changeParts.push(`changed role from "${previous.role}" to "${updated.role}"`);
        }
        
        if (updated.name !== undefined && previous.name !== updated.name) {
          changeParts.push(`renamed from "${previous.name}" to "${updated.name}"`);
        }
        
        if (changeParts.length > 0) {
          what = `has ${changeParts.join(" and ")} for member ${email}`;
        } else {
          what = `has updated member ${email}`;
        }
      } else {
        what = `has updated member ${email}`;
      }
    } else if (action.includes("user")) {
      const userName = action.match(/user "([^"]+)"/i)?.[1] || (typeof details?.userName === "string" ? details.userName : "user");
      
      if (previous && updated) {
        const changeParts: string[] = [];
        
        if (updated.name !== undefined && previous.name !== updated.name) {
          const oldName = String(previous.name || "");
          const newName = String(updated.name || "");
          changeParts.push(`renamed user from "${oldName}" to "${newName}"`);
        }
        
        if (changeParts.length > 0) {
          what = `has ${changeParts.join(" and ")}`;
        } else {
          what = `has updated user "${userName}"`;
        }
      } else {
        what = `has updated user "${userName}"`;
      }
    } else {
      const match = action.match(/"([^"]+)"/);
      what = match ? `has updated "${match[1]}"` : "has updated an item";
    }
    return { what, forWho, byWho };
  }
  
  // ========== FALLBACK ==========
  const match = action.match(/"([^"]+)"/);
  what = match ? `has performed action on "${match[1]}"` : "has performed an action";
  
  return { what, forWho, byWho };
}
