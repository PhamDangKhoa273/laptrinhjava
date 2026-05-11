export const ROLES = {
  ADMIN: 'ADMIN',
  FARM: 'FARM',
  RETAILER: 'RETAILER',
  SHIPPING_MANAGER: 'SHIPPING_MANAGER',
  DRIVER: 'DRIVER',
  GUEST: 'GUEST',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.FARM]: 'Nông trại',
  [ROLES.RETAILER]: 'Nhà bán lẻ',
  [ROLES.SHIPPING_MANAGER]: 'Quản lý vận chuyển',
  [ROLES.DRIVER]: 'Tài xế',
  [ROLES.GUEST]: 'Khách',
}

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.ADMIN]: '/dashboard/admin/control-center',
  [ROLES.FARM]: '/dashboard/farm',
  [ROLES.RETAILER]: '/dashboard/retailer',
  [ROLES.SHIPPING_MANAGER]: '/dashboard/shipping-manager',
  [ROLES.DRIVER]: '/driver/mobile',
  [ROLES.GUEST]: '/dashboard/guest',
}

export const DEFAULT_ROLE = ROLES.GUEST
