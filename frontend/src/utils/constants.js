export const ROLES = {
  ADMIN: 'ADMIN',
  FARM: 'FARM',
  RETAILER: 'RETAILER',
  SHIPPING_MANAGER: 'SHIPPING_MANAGER',
  DRIVER: 'DRIVER',
  GUEST: 'GUEST',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.FARM]: 'Farm',
  [ROLES.RETAILER]: 'Retailer',
  [ROLES.SHIPPING_MANAGER]: 'Vận chuyển Manager',
  [ROLES.DRIVER]: 'Driver',
  [ROLES.GUEST]: 'Guest',
}

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.ADMIN]: '/dashboard/admin/control-center',
  [ROLES.FARM]: '/dashboard/farm',
  [ROLES.RETAILER]: '/dashboard/retailer',
  [ROLES.SHIPPING_MANAGER]: '/dashboard/shipping-manager',
  [ROLES.DRIVER]: '/dashboard/driver',
  [ROLES.GUEST]: '/dashboard/guest',
}

export const DEFAULT_ROLE = ROLES.GUEST
