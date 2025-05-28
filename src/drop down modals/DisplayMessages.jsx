import { useState, useEffect, useContext } from 'react'
import CrmContext from '../crm context/CrmContext'
import { useParams } from 'react-router-dom'
import { db } from '../firebase.config'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
import {
  getDatabase,
  ref,
  onValue,
  update,
  query,
  orderByChild,
  get,
} from 'firebase/database'

function DisplayMessages() {
  const [loggedInId, setLoggedInId] = useState(null)
  const [loggedInName, setLoggedInName] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const { claims, loggedInUser } = useAuthStatusTwo()
  const { uid } = useParams()

  // Set logged in user details
  useEffect(() => {
    if (!claims) return
    setLoggedInId(claims?.user_id)
    setLoggedInName(claims?.name)
    console.log(claims)
    return () => {}
  }, [claims])

  // Load user's conversations
  useEffect(() => {
    if (!loggedInId) return

    const database = getDatabase()
    const userConversationsRef = ref(database, `users/${loggedInId}/conversations`)

    const unsubscribe = onValue(userConversationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const conversationsData = snapshot.val()
        const conversationsList = Object.keys(conversationsData).map((key) => ({
          id: key,
          ...conversationsData[key],
        }))

        // Sort conversations by most recent message
        conversationsList.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)

        setConversations(conversationsList)
        setLoading(false)

        // Select first conversation if none is selected
        if (!selectedConversation && conversationsList.length > 0) {
          setSelectedConversation(conversationsList[0].id)
        }
      } else {
        setConversations([])
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [loggedInId, selectedConversation])

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !loggedInId) return

    const database = getDatabase()
    const messagesRef = ref(database, `conversations/${selectedConversation}/messages`)

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val()
        const messagesList = Object.keys(messagesData).map((key) => ({
          id: key,
          ...messagesData[key],
        }))

        // Sort messages by timestamp (oldest first)
        messagesList.sort((a, b) => a.timestamp - b.timestamp)

        setMessages(messagesList)

        // Mark messages as read
        const updates = {}
        messagesList.forEach((msg) => {
          if (msg.recipientId === loggedInId && !msg.read) {
            updates[
              `conversations/${selectedConversation}/messages/${msg.id}/read`
            ] = true
          }
        })

        // Reset unread count for this conversation
        updates[
          `users/${loggedInId}/conversations/${selectedConversation}/unreadCount`
        ] = 0

        if (Object.keys(updates).length > 0) {
          update(ref(database), updates)
        }
      } else {
        setMessages([])
      }
    })

    return () => unsubscribe()
  }, [selectedConversation, loggedInId])

  const handleSelectConversation = (conversationId) => {
    setSelectedConversation(conversationId)
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    })
  }

  if (loading) {
    return <div className="loading-messages">Loading conversations...</div>
  }

  return (
    <div className="display-messages-container">
      <div className="messages-header">
        <p>Your Messages!</p>
      </div>

      <div className="messages-content">
        <div className="conversations-sidebar">
          <h3>Conversations</h3>
          {conversations.length === 0 ? (
            <p className="no-conversations">No conversations yet</p>
          ) : (
            <ul className="conversations-list">
              {conversations.map((convo) => (
                <li
                  key={convo.id}
                  className={`conversation-item ${
                    selectedConversation === convo.id ? 'selected' : ''
                  }`}
                  onClick={() => handleSelectConversation(convo.id)}
                >
                  <div className="conversation-contact">{convo.withName}</div>
                  <div className="conversation-preview">{convo.lastMessage}</div>
                  <div className="conversation-time">
                    {formatTimestamp(convo.lastMessageTimestamp)}
                  </div>
                  {convo.unreadCount > 0 && (
                    <div className="unread-badge">{convo.unreadCount}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="messages-view">
          {selectedConversation ? (
            <>
              <div className="selected-conversation-header">
                <h3>
                  {selectedConversation &&
                    conversations.find((c) => c.id === selectedConversation)?.withName}
                </h3>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <p className="no-messages">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-bubble ${
                        msg.senderId === loggedInId ? 'sent' : 'received'
                      }`}
                    >
                      <div className="message-content">{msg.message}</div>
                      <div className="message-time">
                        {formatTimestamp(msg.timestamp)}
                        {msg.senderId === loggedInId && (
                          <span className="read-status">{msg.read ? ' ✓✓' : ' ✓'}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DisplayMessages
