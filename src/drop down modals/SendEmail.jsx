import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useContext, useState, useEffect, useRef } from 'react'
import CrmContext from '../crm context/CrmContext'
import { submitEmail, getCustomerInfoForEmail } from '../crm context/CrmAction'
import { useParams, useSearchParams } from 'react-router-dom'
import { getFunctions, httpsCallable } from 'firebase/functions'

// app password link
// https://support.google.com/accounts/answer/185833?hl=en

function SendEmail() {
  const params = useParams()
  const modal = useRef()

  useEffect(() => {
    const modalRef = modal.current
    modalRef.focus()
    return () => {}
  }, [])

  const [form, setForm] = useState({
    agent: '',
    agentId: '',
    emailAddress: '',
    emailSubject: '',
    emailBody: '',
    customerName: '', // Make sure we have this field
  })

  const { agent, emailAddress, emailSubject, emailBody, customerName } = form

  const auth = getAuth()

  const { dispatch, toggelEmail } = useContext(CrmContext)

  const handleCloseModal = () => {
    dispatch({ type: 'TOGGLE_EMAIL', payload: false })
  }

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setForm((prevState) => ({
          ...prevState,
          agent: user.displayName,
          agentId: user.uid,
        }))
      }
    })

    const getCurrentCustomer = async () => {
      try {
        const data = await getCustomerInfoForEmail('customers', params.uid)

        setForm((prevState) => ({
          ...prevState,
          emailAddress: data.email,
          emailSubject: `Important information for ${data.name}`,
          custId: data.custId,
          customerName: data.name,
          dateSent: new Date().toLocaleString('en-GB'),
        }))
      } catch (error) {
        console.log(error)
      }
    }

    getCurrentCustomer()
  }, [])

  const onMutate = (e) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const emailData = {
      from: form.agent,
      to: 'ellisadam88@gmail.com', // Use the form state variable directly
      subject: form.emailSubject,
      text: form.emailBody,
      html: '',
      customerName: form.customerName, // Pass customer name for the template
    }

    try {
      const res = await submitEmail('emails', emailData)
      console.log(res)
      send(emailData)
    } catch (error) {
      console.log(error)
    }

    setForm((prevState) => ({
      ...prevState,
      emailBody: '',
    }))

    dispatch({ type: 'TOGGLE_EMAIL', payload: false })
  }

  async function send(emailData) {
    try {
      const functions = getFunctions()
      const sendEmail = httpsCallable(functions, 'sendEmail')
      const res = await sendEmail({ emailData })
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div tabIndex={-1} ref={modal} className="order-edit-modal">
      <form onSubmit={handleSubmit}>
        <input
          className="email-form-input"
          type="text"
          id="emailAddress"
          placeholder="Enter Email Address"
          onChange={onMutate}
          value={emailAddress}
        />
        <input
          className="email-form-input"
          type="text"
          id="emailSubject"
          placeholder="Enter Subject"
          onChange={onMutate}
          value={emailSubject}
        />
        <input
          className="email-form-input"
          type="text"
          id="emailFrom"
          placeholder="Email from"
          onChange={onMutate}
          value={agent}
        />

        <textarea
          className="email-form-body"
          placeholder="Enter Email"
          id="emailBody"
          value={emailBody}
          onChange={onMutate}
        ></textarea>
        <div className="email-btn-container">
          <button className="send-email-btn">Send Email</button>
        </div>
      </form>
      <button onClick={handleCloseModal} className="close-email-modal-btn">
        X
      </button>
    </div>
  )
}

export default SendEmail
