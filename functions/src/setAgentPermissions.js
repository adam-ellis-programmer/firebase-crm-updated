function setAccess(role) {
  const RESOURCES = {
    CUSTOMERS: 'customers',
    ORDERS: 'orders',
    PRODUCTS: 'products',
    INVOICES: 'invoices',
    USERS: 'users',
    REPORTS: 'reports',
    ADMIN: 'admin',
  }
  let permissions
  // prettier-ignore
  switch (role) {
        case 'CEO':
            permissions = {
            [RESOURCES.CUSTOMERS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.ORDERS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.PRODUCTS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.INVOICES]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.USERS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.REPORTS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.ADMIN]: { disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            }
            break;
    
            case 'ADMIN':
            permissions = {
            [RESOURCES.CUSTOMERS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.ORDERS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.PRODUCTS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.INVOICES]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.USERS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.REPORTS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.ADMIN]: { disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            }
            break;

            case 'MANAGER':
            permissions = {
            [RESOURCES.CUSTOMERS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.ORDERS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.PRODUCTS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.INVOICES]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.USERS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.REPORTS]: {disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            [RESOURCES.ADMIN]: { disabled: false, hasFullAccess: true, create: true, read: true, update: true, delete: true },
            }
            break;

            case 'SALES':
            permissions = {
            [RESOURCES.CUSTOMERS]: {disabled: false, hasFullAccess: false, create: false, read: false, update: false, delete: false },
            [RESOURCES.ORDERS]: {disabled: false, hasFullAccess: false, create: false, read: false, update: false, delete: false },
            [RESOURCES.PRODUCTS]: {disabled: false, hasFullAccess: false, create: false, read: false, update: false, delete: false },
            [RESOURCES.INVOICES]: {disabled: false, hasFullAccess: false, create: false, read: false, update: false, delete: false },
            [RESOURCES.USERS]: {disabled: false, hasFullAccess: false, create: false, read: false, update: false, delete: false },
            [RESOURCES.REPORTS]: {disabled: false, hasFullAccess: false, create: false, read: false, update: false, delete: false },
            [RESOURCES.ADMIN]: { disabled: false, hasFullAccess: false, create: false, read: false, update: false, delete: false },
            }
            break;
        default:
            break;
    }
  return permissions
}

module.exports = {
  setAccess,
}
