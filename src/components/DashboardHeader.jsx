import SendMessage from '../drop down modals/SendMessage'
import { useContext, useState, useEffect } from 'react'
import CrmContext from '../crm context/CrmContext'
import DisplayMessages from '../drop down modals/DisplayMessages'
import { fetchAgentDataForProfileHeader } from '../crm context/CrmAction'
import { useParams } from 'react-router-dom'
import SendText from '../drop down modals/SendText'

function DashboardHeader() {
  const params = useParams()
  useEffect(() => {
    const getAgentDataToDisplayMsgNumber = async () => {
      const data = await fetchAgentDataForProfileHeader('users', params.uid)

      dispatch({ type: 'MESSAGE_COUNTER', payload: data[0]?.data?.msgLength })
    }
    getAgentDataToDisplayMsgNumber()
  }, [])
  const { sendMessageModal, dispatch, readMessageModal, messageCounter } =
    useContext(CrmContext)

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

  const getMsgtest = () => {
    const getAgentDataToDisplayMsgNumber = async () => {
      const data = await fetchAgentDataForProfileHeader('users', params.uid)
      dispatch({ type: 'MESSAGE_COUNTER', payload: data[0].data.msgLength })
    }
    getAgentDataToDisplayMsgNumber()
  }

  // used to pulse the server for updated msgs: ToDo: update to use sockets
  setInterval(() => {
    // getMsgtest();
  }, 10000)
  return (
    <div className="dash-container grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="dash-grid-item"></div>
      <div className="dash-grid-item send-msg-div">
        <div className="msg-btn-container">
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
              readMessageModal ? 'view-messages-btn close-messages' : 'view-messages-btn'
            }
          >
            {readMessageModal ? 'Close Messages' : 'View Messages'}
            <span className="messages-number">{messageCounter || 0}</span>
          </button>
        </div>
        {sendMessageModal && <SendMessage />}
        {readMessageModal && <DisplayMessages />}
      </div>
      <div className="dash-grid-item"></div>
    </div>
  )
}

export default DashboardHeader
