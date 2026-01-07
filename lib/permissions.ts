import { Session } from "next-auth";

export type UserRole = "owner" | "admin" | "staff";

/**
 * Check if user can perform add/delete operations
 * Only owner and admin can add/delete (staff cannot)
 */
export function canAddOrDelete(role: UserRole | undefined): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if user can edit firm details
 * Only owner can edit firm details
 */
export function canEditFirm(role: UserRole | undefined): boolean {
  return role === "owner";
}

/**
 * Check if user can manage members (add/invite/remove)
 * Only owner can manage members
 */
export function canManageMembers(role: UserRole | undefined): boolean {
  return role === "owner";
}

/**
 * Check if user can edit status and communication (due date clients)
 * All roles can do this
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function canEditStatus(_role: UserRole | undefined): boolean {
  return true;
}

/**
 * Check if user can update entities (general update permission)
 * Owner and admin can update most things (except firm details which only owner can do)
 */
export function canUpdate(_role: UserRole | undefined): boolean {
  return _role === "owner" || _role === "admin";
}

/**
 * Get user role from session
 */
export function getUserRole(session: Session | null): UserRole | undefined {
  return session?.user?.role;
}

