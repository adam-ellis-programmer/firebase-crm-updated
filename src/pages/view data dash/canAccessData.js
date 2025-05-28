function canAccessData(agentId, ownerId, resource, action) {
  // Find the agent
  const agent = agents.find((a) => a.id === agentId)

  if (!agent) {
    return false
  }

  // Check if agent has permission for the action on the resource
  if (!agent.permissions[resource] || !agent.permissions[resource][action]) {
    return false
  }

  // If agent is trying to access their own data, permission is sufficient
  if (agentId === ownerId) {
    return true
  }

  // Otherwise, check hierarchical access
  return canAccessAgentData(agentId, ownerId)
}
