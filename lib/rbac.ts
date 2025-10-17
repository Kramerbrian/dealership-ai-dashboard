// Role-Based Access Control (RBAC)
// DealershipAI - Minimal, Reusable Permission System

export type Role = "owner" | "admin" | "manager" | "marketing" | "analyst" | "viewer";

type Gate = { 
  view?: string; 
  run?: string; 
  edit?: string; 
};

// Permission rules by role
const rules: Record<Role, Gate[]> = {
  owner: [
    { view: "*", run: "*", edit: "*" }
  ],
  admin: [
    { view: "*", run: "*", edit: "*" }
  ],
  manager: [
    { view: "*", run: "jobs" }
  ],
  marketing: [
    { view: "quality" },
    { view: "kpis" }
  ],
  analyst: [
    { view: "kpis" }
  ],
  viewer: [
    { view: "kpis" }
  ],
};

/**
 * Check if a role has permission for a specific gate
 */
export const can = (role: Role, gate: Gate): boolean => {
  const roleRules = rules[role] || [];
  
  return roleRules.some(rule => 
    (!gate.view || rule.view === gate.view || rule.view === "*") &&
    (!gate.run || rule.run === gate.run || rule.run === "*") &&
    (!gate.edit || rule.edit === gate.edit || rule.edit === "*")
  );
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: Role): Gate[] => {
  return rules[role] || [];
};

/**
 * Check if role can view a specific resource
 */
export const canView = (role: Role, resource: string): boolean => {
  return can(role, { view: resource });
};

/**
 * Check if role can run a specific operation
 */
export const canRun = (role: Role, operation: string): boolean => {
  return can(role, { run: operation });
};

/**
 * Check if role can edit a specific resource
 */
export const canEdit = (role: Role, resource: string): boolean => {
  return can(role, { edit: resource });
};

/**
 * Get all roles that have a specific permission
 */
export const getRolesWithPermission = (gate: Gate): Role[] => {
  return (Object.keys(rules) as Role[]).filter(role => can(role, gate));
};

/**
 * Check if role is at least as powerful as another role
 * Higher roles inherit permissions from lower roles
 */
export const isRoleAtLeast = (userRole: Role, requiredRole: Role): boolean => {
  const roleHierarchy: Record<Role, number> = {
    viewer: 1,
    analyst: 2,
    marketing: 3,
    manager: 4,
    admin: 5,
    owner: 6
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Get the highest role from a list of roles
 */
export const getHighestRole = (roles: Role[]): Role => {
  const roleHierarchy: Record<Role, number> = {
    viewer: 1,
    analyst: 2,
    marketing: 3,
    manager: 4,
    admin: 5,
    owner: 6
  };
  
  return roles.reduce((highest, current) => 
    roleHierarchy[current] > roleHierarchy[highest] ? current : highest
  );
};

/**
 * Validate if a role string is a valid role
 */
export const isValidRole = (role: string): role is Role => {
  return ["owner", "admin", "manager", "marketing", "analyst", "viewer"].includes(role);
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: Role): string => {
  const displayNames: Record<Role, string> = {
    owner: "Owner",
    admin: "Administrator", 
    manager: "Manager",
    marketing: "Marketing",
    analyst: "Analyst",
    viewer: "Viewer"
  };
  
  return displayNames[role];
};

/**
 * Get role description
 */
export const getRoleDescription = (role: Role): string => {
  const descriptions: Record<Role, string> = {
    owner: "Full system access and ownership",
    admin: "Full administrative access",
    manager: "Management access with job execution rights",
    marketing: "Marketing and quality data access",
    analyst: "Analytics and KPI viewing access",
    viewer: "Read-only access to KPI data"
  };
  
  return descriptions[role];
};

/**
 * Common permission checks for API endpoints
 */
export const permissions = {
  // KPI and analytics access
  viewKPIs: (role: Role) => canView(role, "kpis"),
  
  // Quality and VLI access
  viewQuality: (role: Role) => canView(role, "quality"),
  
  // Job execution (What-if simulator, etc.)
  runJobs: (role: Role) => canRun(role, "jobs"),
  
  // Full system access
  fullAccess: (role: Role) => can(role, { view: "*", run: "*", edit: "*" }),
  
  // Billing and subscription management
  manageBilling: (role: Role) => isRoleAtLeast(role, "admin"),
  
  // User management
  manageUsers: (role: Role) => isRoleAtLeast(role, "admin"),
  
  // System configuration
  configureSystem: (role: Role) => isRoleAtLeast(role, "owner")
};