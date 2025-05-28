import { useState, useEffect } from 'react'
import { getDocument } from '../crm context/CrmAction'

const useGetAgentDoc = (agentId, collection) => {
  const [agentDoc, setAgentDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!agentId || !collection) {
        setLoading(false)
        setError(new Error('Missing agentId or collection'))
        return
      }
      try {
        const data = await getDocument(agentId, collection)
        setAgentDoc(data)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
        setError(error)
      }
    }

    fetchUserData()
    return () => {}
  }, [agentId, collection])
  return { agentDoc, loading, error }
}

export default useGetAgentDoc
