import SendMessage from '../drop down modals/SendMessage'
import { useContext, useState, useEffect } from 'react'
import CrmContext from '../crm context/CrmContext'
import DisplayMessages from '../drop down modals/DisplayMessages'
import { useParams } from 'react-router-dom'
import SendText from '../drop down modals/SendText'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
import { getDatabase, ref, onValue } from 'firebase/database'

function DashboardHeader() {
  const params = useParams()
  const { claims } = useAuthStatusTwo()
  const [totalUnreadCount, setTotalUnreadCount] = useState(0)

  const { sendMessageModal, dispatch, readMessageModal, messageCounter } =
    useContext(CrmContext)

  // Listen to real-time unread message count
  useEffect(() => {
    if (!claims?.user_id) return

    const database = getDatabase()
    const userConversationsRef = ref(
      database,
      `users/${claims.user_id}/conversations`
    )

    const unsubscribe = onValue(userConversationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const conversationsData = snapshot.val()
        let totalUnread = 0

        // Sum up all unread counts from all conversations
        Object.values(conversationsData).forEach((conversation) => {
          totalUnread += conversation.unreadCount || 0
        })

        setTotalUnreadCount(totalUnread)
        // Update the context state as well
        dispatch({ type: 'MESSAGE_COUNTER', payload: totalUnread })
      } else {
        setTotalUnreadCount(0)
        dispatch({ type: 'MESSAGE_COUNTER', payload: 0 })
      }
    })

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [claims?.user_id, dispatch])

  const handleToggleModal = (e) => {
    e.preventDefault()

    if (sendMessageModal === false) {
      dispatch({ type: 'TOGGLE_READ_MESSAGES', payload: false })
      dispatch({ type: 'TOGGLE_SEND_MSG_MODAL', payload: true })
    } else {
      dispatch({ type: 'TOGGLE_SEND_MSG_MODAL', payload: false })
    }

    console.log('clicked')
  }

  const handleToggleReadMessages = () => {
    if (readMessageModal === false) {
      dispatch({ type: 'TOGGLE_SEND_MSG_MODAL', payload: false })
      dispatch({ type: 'TOGGLE_READ_MESSAGES', payload: true })
    } else {
      dispatch({ type: 'TOGGLE_READ_MESSAGES', payload: false })
    }
  }

  return (
    <div className='dash-container grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <div className='dash-grid-item'></div>
      <div className='dash-grid-item send-msg-div'>
        <div className='msg-btn-container'>
          <button
            onClick={handleToggleModal}
            className={
              sendMessageModal
                ? 'send-message-button close-messenger'
                : 'send-message-button'
            }
          >
            {sendMessageModal ? 'Close Messenger' : 'Send Message'}
          </button>

          <button
            onClick={handleToggleReadMessages}
            className={
              readMessageModal
                ? 'view-messages-btn close-messages'
                : 'view-messages-btn'
            }
          >
            {readMessageModal ? 'Close Messages' : 'View Messages'}
            <span className='messages-number'>
              {totalUnreadCount > 0 ? totalUnreadCount : messageCounter || 0}
            </span>
          </button>
        </div>
        {sendMessageModal && <SendMessage />}
        {readMessageModal && <DisplayMessages />}
      </div>
      <div className='dash-grid-item'></div>
    </div>
  )
}

export default DashboardHeader
