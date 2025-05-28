const ROLES = {
  SALES: 1,
  MANAGER: 2,
  ADMIN: 3,
  CEO: 4,
  TEST: 5,
}

/**
 * Determines if a user can view data based on role level and document access level
 *
 * @param {Object} user - The user attempting to view the data
 * @param {Object} document - The document being accessed
 * @returns {boolean} Whether the user can view the document
 */

export const canViewpage = (user) => {
  if (!user) {
    console.log('Missing user or document data in canViewData')
    return false
  }
  const viewerRoleLevel = user.claims?.roleLevel
  console.log(viewerRoleLevel)
  // console.log(ROLES['TEST'])

  if (viewerRoleLevel >= ROLES['MANAGER']) {
    console.log('Acces granted: your role >= to ' + ROLES['MANAGER'] + ' manager')
    return true
  }

  return false
}
//
//
//
export const canViewData = (user, agent, document) => {
  // console.log(agent)
  // Handle null or undefined inputs
  if (!user || !document || !agent) {
    console.log('Missing user or document data in canViewData')
    return false
  }

  // Get the relevant properties with null checks
  // Make sure we're accessing nested properties safely
  const viewerRoleLevel = user.claims?.roleLevel // ***
  const documentAccessLevel = document.docAccessLevel // ***
  const documentOwnerId = document.ownerId
  const userId = user.user_id

  // Log important values for debugging
  // console.log('Viewer role level:', viewerRoleLevel)
  // console.log('Document access level:', documentAccessLevel)
  // console.log('Document owner ID:', documentOwnerId)
  // console.log('User ID:', userId)

  // If any essential values are missing, deny access by default
  if (viewerRoleLevel === undefined || documentAccessLevel === undefined) {
    console.log('Missing essential role data')
    return false
  }

  // CEO (highest role level) can view everything
  if (viewerRoleLevel === ROLES['CEO']) {
    console.log('Access granted: CEO role')
    return true
  }

  // Document owner can always view their own documents
  if (userId === documentOwnerId) {
    console.log('Access granted: Document owner')
    return true
  }

  // Higher role levels can view documents with lower access levels
  if (viewerRoleLevel > documentAccessLevel) {
    console.log('Access granted: Higher role level')
    return true
  }

  // Check if document owner is a direct subordinate of the viewer
  if (
    agent.subordinates &&
    documentOwnerId &&
    agent.subordinates.includes(documentOwnerId)
  ) {
    console.log('Access granted: Direct subordinate')
    return true
  }
  // look
  // For equal role levels, check if viewer is authorized to see this specific document
  if (viewerRoleLevel === documentAccessLevel) {
    // Additional logic here if needed for same-level access
    // Default: same level cannot view each other's documents
    console.log('Access denied: Same level without specific permission')
    return false
  }

  // Default deny - Lower roles cannot view higher role documents
  console.log('Access denied: Default case')
  return false
}

/**
 * React component wrapper that checks authorization before rendering content
 */
export const AuthorizedView = ({ user, document, children }) => {
  // Skip the check if user or document isn't loaded yet
  if (!user || !document) {
    return null // Return loading state or null instead of unauthorized message
  }

  const canView = canViewData(user, document)

  if (!canView) {
    return (
      <div className="not-authorized">
        <h3>Not Authorized</h3>
        <p>You don't have permission to view this content.</p>
      </div>
    )
  }

  return children
}

/**
 * Hook to check if the current user can access a document
 */
export const useDocumentAccess = (user, document) => {
  // Return null instead of false when data is loading
  // This helps distinguish between "unauthorized" and "still checking"
  if (!user || !document) {
    return null
  }
  return canViewData(user, document)
}

/**
 * Function to filter an array of documents based on user access
 */
export const filterAccessibleDocuments = (user, documents) => {
  if (!user || !documents || !Array.isArray(documents)) {
    return []
  }
  return documents.filter((doc) => doc && canViewData(user, doc))
}
