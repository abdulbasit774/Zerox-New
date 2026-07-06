import { User } from 'firebase/auth';
import { getUserRole, isAdmin, logAdminAction } from './firebase';

// Admin role definitions with permissions
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  SUPPORT: 'support',
  WAREHOUSE: 'warehouse',
  MARKETING: 'marketing',
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['*'], // All permissions
  admin: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'manage_users',
    'manage_coupons',
    'manage_categories',
    'manage_brands',
    'view_analytics',
    'manage_returns',
    'manage_refunds',
    'manage_support',
    'send_notifications',
    'view_reports',
    'manage_settings',
  ],
  manager: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'view_analytics',
    'manage_returns',
    'manage_refunds',
    'view_reports',
  ],
  editor: [
    'view_dashboard',
    'manage_products',
    'manage_categories',
    'manage_brands',
    'view_analytics',
  ],
  support: [
    'view_dashboard',
    'manage_orders',
    'manage_returns',
    'manage_support',
    'view_reports',
  ],
  warehouse: [
    'view_dashboard',
    'manage_products', // Inventory only
    'view_analytics',
  ],
  marketing: [
    'view_dashboard',
    'manage_coupons',
    'send_notifications',
    'view_analytics',
    'view_reports',
  ],
};

// Check if user has admin access
export async function checkAdminAccess(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    return await isAdmin(user.uid);
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

// Check if user has specific permission
export async function hasPermission(user: User | null, permission: string): Promise<boolean> {
  if (!user) return false;
  try {
    const role = await getUserRole(user.uid);
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

// Check if user has any of the given permissions
export async function hasAnyPermission(user: User | null, permissions: string[]): Promise<boolean> {
  if (!user) return false;
  try {
    const role = await getUserRole(user.uid);
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    if (rolePermissions.includes('*')) return true;
    return permissions.some(p => rolePermissions.includes(p));
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

// Log admin action with user and activity details
export async function logAdminActivity(
  user: User | null,
  action: string,
  description: string,
  details?: any
) {
  if (!user) return;
  try {
    const role = await getUserRole(user.uid);
    await logAdminAction(action, description, {
      userId: user.uid,
      userEmail: user.email,
      userRole: role,
      ...details,
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}

// Validate admin access before sensitive operations
export async function validateAdminAction(user: User | null, requiredPermission: string): Promise<{ valid: boolean; error?: string }> {
  if (!user) {
    return { valid: false, error: 'User not authenticated' };
  }

  try {
    const role = await getUserRole(user.uid);
    const permissions = ROLE_PERMISSIONS[role] || [];

    if (!permissions.includes('*') && !permissions.includes(requiredPermission)) {
      await logAdminActivity(user, 'unauthorized_access', `Attempted to perform ${requiredPermission} without permission`);
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating admin action:', error);
    return { valid: false, error: 'Validation failed' };
  }
}
