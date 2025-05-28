import React from 'react'
import FormRow from './FormRow'
import { useState, useEffect } from 'react'
import ComponentHeader from './ComponentHeader'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useAuthStatusTwo } from '../../hooks/useAuthStatusTwo'
const DeleteAgent = ({ data }) => {
  // console.log(data)
  const { claims } = useAuthStatusTwo()
  // console.log(claims)

  useEffect(() => {
    if (claims?.claims) {
      // console.log(claims.claims.orgId)
      setFormData((prev) => ({
        ...prev,
        orgId: claims.claims.orgId,
        agentId: claims?.user_id,
        handBackData: {
          id: claims.defaultHandBack.id,
          name: claims.defaultHandBack.name,
        },
      }))
    }
    return () => {}
  }, [claims])

  const [loading, setLoading] = useState({
    delete: false,
  })
  const [formData, setFormData] = useState({
    email: '',
    orgId: '',
  })

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const formArr = Object.entries(formData)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // getReports to data for id (sub)
    console.log(formData)
    // return
    // after succes filter out agent and update the dom
    try {
      handleLoading('delete', true)
      const functions = getFunctions()
      const deleteAgent = httpsCallable(functions, 'deleteAgent')
      const data = await deleteAgent({
        email: formData.email,
        orgId: formData.orgId,
        agentId: formData.agentId,
        handBackData: formData.handBackData,
      })
      handleReset()
      console.log(data)
      handleLoading('delete', false)
    } catch (error) {
      handleLoading('delete', false)
      console.log(error)
    }
  }

  function handleLoading(field, value) {
    setLoading((prevState) => ({
      ...prevState,
      [field]: value,
    }))
  }

  function handleReset() {
    setFormData((prev) => {
      const resetData = Object.entries(prev).reduce((acc, [key, _]) => {
        acc[key] = ''
        return acc
      }, {})
      return resetData
    })
  }

  /**
   *
   * delete agent
   * move all customers of deleted user into the
   * org owners acc
   *
   * the orders (sales) will
   * automaticly follow
   * we just have to change ids
   * we do not have to move anything
   *
   * filter the active agents to update the dom
   *
   * make origSales field for aggregated data
   * make a fromDel field set to true
   *
   *
   * on signup and new agent we need
   * to add to the claims
   * orgDetails:{
   * id,"",
   * name:"",
   * }
   *
   * we used this in the other firebase project
   * look up promise.aall([
   * one,two,three,four
   * ])
   *
   *
   * add  in abilaty to go in and change reports
   * to so a new manager can take over that
   * customer
   *
   * change the reports to on agent
   * and customer
   *
   * check for admin active agents loading bug
   */
  return (
    <div>
      <form id="form" onSubmit={handleSubmit} className="admin-form">
        <ComponentHeader text={`delete agent`} />
        {formArr.slice(0, 1).map((item) => {
          const [key, value] = item
          return (
            <FormRow
              key={key}
              type={'text'}
              name={key}
              value={value}
              placeholder={`Enter ${key}`}
              onChange={onChange}
              // added to stop duplicate on page
              formId="delete-agent"
            />
          )
        })}

        <div className="admin-btn-container">
          <button
            disabled={loading.delete}
            className={`${
              loading.delete
                ? 'admin-add-agent-btn admin-btn-disabled'
                : 'admin-add-agent-btn'
            }`}
          >
            {loading.delete ? 'deleting...' : 'delete'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DeleteAgent
