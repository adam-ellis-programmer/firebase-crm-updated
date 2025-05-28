import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useContext, useState, useEffect } from 'react'
import CrmContext from '../crm context/CrmContext'
import { ReactComponent as Arrow } from '../icons/selectArrow.svg'
import { useParams, useSearchParams } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { getDatabase, ref, set, push, get } from 'firebase/database'
import { getAllAgentsForChat } from '../crm context/CrmAction'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'

function SendMessage() {
  const [sendingAgent, setSendingAgent] = useState(null)
  const [message, setMessage] = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const { dispatch } = useContext(CrmContext)
  const params = useParams()
  const auth = getAuth()
  const [options, setOptions] = useState(null) // agents names for select tag
  const { claims } = useAuthStatusTwo()

  // getAllAgentsForChat()
  console.log(claims)

  useEffect(() => {
    if (!claims && !claims?.claims) return
    const getAgentData = async () => {
      const res = await getAllAgentsForChat(claims?.claims?.orgId)
      setOptions(res)
      console.log(res)

      const senderData = {
        name: claims?.name,
        id: claims?.user_id,
      }

      setSendingAgent(senderData)
    }

    getAgentData()
    return () => {}
  }, [claims])

  const date = new Date()
  const dateAndTime = date.toLocaleString('en-GB', {
    dateStyle: 'long',
    timeStyle: 'long',
  })

  const handleCloseModal = () => {
    dispatch({ type: 'TOGGLE_SEND_MSG_MODAL', payload: false })
  }

  const onMutate = (e) => {
    setMessage(e.target.value)
  }

  const handleSelect = (e) => {
    const agentName = e.target.value
    const agentId = e.target.selectedOptions[0].dataset.id
    setRecipientId(agentId)
    setRecipientName(agentName)
    console.log({ agentName, agentId })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!sendingAgent || !recipientId || !message || message.trim() === '') {
      alert('Please select a recipient and enter a message')
      return
    }

    const database = getDatabase()

    // Create a unique conversation ID by sorting and combining user IDs
    const conversationId = [sendingAgent.id, recipientId].sort().join('_')

    // Generate a unique message ID with push()
    const newMessageRef = push(ref(database, `conversations/${conversationId}/messages`))

    // Set message data
    await set(newMessageRef, {
      senderId: sendingAgent.id,
      senderName: sendingAgent.name,
      recipientId: recipientId,
      recipientName: recipientName,
      message: message,
      timestamp: Date.now(),
      read: false,
    })

    // Update latest message in conversation metadata
    await set(ref(database, `conversations/${conversationId}/metadata`), {
      lastMessage: message,
      lastMessageTimestamp: Date.now(),
      participants: {
        [sendingAgent.id]: sendingAgent.name,
        [recipientId]: recipientName,
      },
    })

    // Add this conversation to each user's conversations list
    await set(ref(database, `users/${sendingAgent.id}/conversations/${conversationId}`), {
      with: recipientId,
      withName: recipientName, // convo with
      lastMessage: message,
      lastMessageTimestamp: Date.now(),
      unreadCount: 0,
    })

    // First, try to get the current unread count
    const recipientConvoRef = ref(
      database,
      `users/${recipientId}/conversations/${conversationId}`
    )
    try {
      // Check if the conversation exists for the recipient
      const currentData = await get(recipientConvoRef)
      let currentUnreadCount = 0

      // If the conversation exists, get the current unread count
      if (currentData.exists()) {
        currentUnreadCount = currentData.val().unreadCount || 0
      }

      // Now set the data with the incremented unread count
      await set(recipientConvoRef, {
        with: sendingAgent.id,
        withName: sendingAgent.name,
        lastMessage: message,
        lastMessageTimestamp: Date.now(),
        unreadCount: currentUnreadCount + 1,
      })
    } catch (error) {
      console.error('Error updating recipient conversation:', error)
      // Fallback: just set without incrementing if there's an error
      await set(recipientConvoRef, {
        with: sendingAgent.id,
        withName: sendingAgent.name,
        lastMessage: message,
        lastMessageTimestamp: Date.now(),
        unreadCount: 1,
      })
    }

    // Clear message input and close modal
    setMessage('')
    dispatch({ type: 'TOGGLE_SEND_MSG_MODAL', payload: false })
  }

  return (
    <div className="send-msg-modal">
      <div className="order-edit-modal">
        <p className="messenger-heading-text">Send a Message to another agent!</p>
        <form onSubmit={handleSubmit}>
          <div className="select-possition-container">
            <select
              onChange={(e) => handleSelect(e)}
              className="select-agent"
              name="cars"
              id="agents"
            >
              <option>Choose Agent</option>
              {options?.map((item) => {
                const { id, data } = item
                const agentId = data.docId
                const name = `${data.firstName} ${data.lastName}`
                return (
                  <option data-id={agentId} key={id}>
                    {name}
                  </option>
                )
              })}
            </select>
            <div className="select-arrow">
              <Arrow className="select-arrow" />
            </div>
          </div>

          <input
            className="email-form-input"
            type="text"
            id="from"
            placeholder="Msg from"
            onChange={onMutate}
            value={sendingAgent?.name || ''}
            disabled={true}
          />

          <textarea
            className="email-form-body"
            placeholder="Enter Message"
            id="msg"
            onChange={onMutate}
            value={message}
          ></textarea>
          <div className="email-btn-container">
            <button className="send-email-btn">Send Message</button>
          </div>
        </form>
        <button onClick={handleCloseModal} className="close-email-modal-btn">
          X
        </button>
      </div>
    </div>
  )
}

export default SendMessage
