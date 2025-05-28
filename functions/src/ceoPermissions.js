const ceoPermissions = () => {
  // Define permissions based on role
  const RESOURCES = {
    CUSTOMERS: 'customers',
    ORDERS: 'orders',
    PRODUCTS: 'products',
    INVOICES: 'invoices',
    USERS: 'users',
    REPORTS: 'reports',
    ADMIN: 'admin',
  }
  // prettier-ignore
  const permissions = {
    [RESOURCES.CUSTOMERS]: {hasFullAccess: true, create: true, read: true, update: true, delete: true },
    [RESOURCES.ORDERS]: {hasFullAccess: true, create: true, read: true, update: true, delete: true },
    [RESOURCES.PRODUCTS]: {hasFullAccess: true, create: true, read: true, update: true, delete: true },
    [RESOURCES.INVOICES]: {hasFullAccess: true, create: true, read: true, update: true, delete: true },
    [RESOURCES.USERS]: {hasFullAccess: true, create: true, read: true, update: true, delete: true },
    [RESOURCES.REPORTS]: {hasFullAccess: true, create: true, read: true, update: true, delete: true },
    [RESOURCES.ADMIN]: { hasFullAccess: true, create: true, read: true, update: true, delete: true },
  }

  return permissions
}

module.exports = {
  ceoPermissions,
}
