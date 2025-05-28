import CrmContext from '../crm context/CrmContext'
import { useContext, useEffect } from 'react'
//  set up server funciton
const SendText = () => {
  const { sendTextModal, dispatch, custNum } = useContext(CrmContext)
  console.log(custNum)

  useEffect(() => {
    console.log(custNum)
    return () => {}
  }, [custNum])
  console.log('object......')

  return (
    <div className="send-text-modal">
      <div className="text-modal-heading-div">
        <button
          onClick={() =>
            dispatch({
              type: 'TOGGLE_TEXT_MODAL',
              payload: !sendTextModal,
            })
          }
          className="close-text-modal-btn"
        >
          X
        </button>
        <h3 className="send-text-header">send text to Sally Sue</h3>
      </div>
      <div>
        <textarea
          className="text-msg-textarea"
          name=""
          id=""
          placeholder="Enter Text Message"
        ></textarea>
      </div>
      <div>
        <button>send</button>
      </div>
    </div>
  )
}

export default SendText
