import React, { useEffect, useState, useContext } from 'react'
import FormRow from '../components/FormRow'
import CrmContext from '../crm context/CrmContext'
import { generateTenDigitNumber } from '../CrmFunctions'
import { calculateFutureDates } from './calculateDates'

const CompanyPaymentForm = () => {
  const { dispatch, subscriptionInfo } = useContext(CrmContext)
  // console.log(subscriptionInfo)

  // Initialize form data when component mounts

  const generateOrgId = (orgName) => {
    return orgName.slice(0, 3).toUpperCase() + '--' + generateTenDigitNumber()
  }
  const orgId = generateOrgId(subscriptionInfo.orgName)

  const handleChange = (e) => {
    const { name, value } = e.target

    // Create new payload
    const newPayload = {
      ...subscriptionInfo,
      [name]: value,
      signUpDate: calculateFutureDates().current.milliseconds,
      expDate: calculateFutureDates().oneYear.milliseconds,
    }

    // Only change if organization changes
    if (name === 'organization') {
      newPayload.organizationId = generateOrgId(value)
    }

    dispatch({
      type: 'SET_SUBSCRIPTION_INFO',
      payload: newPayload,
    })
  }

  const arr = Array.from({ length: 5 }, (_, i) => {
    return subscriptionInfo[i]
  })

  // Method 1: Using Object.keys() and Object.values()
  const keys = Object.keys(subscriptionInfo)
  const values = Object.values(subscriptionInfo)
  // console.log(keys)

  const formatFieldName = (camelCase) => {
    // Add space before capital letters and capitalize first letter
    return camelCase
      .replace(/([A-Z])/g, ' $1') // Add space before capitals
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
  }

  console.log(formatFieldName('helloThere'))

  return (
    <div className="max-w-md mx-auto p-6 mb-8">
      <form id="company-payment-form" className="space-y-4 company-payment-form">
        <FormRow
          type="text"
          name="firstName"
          labelText="First Name"
          defaultValue={subscriptionInfo.firstName}
          onChange={handleChange}
        />
        <FormRow
          type="text"
          name="lastName"
          labelText="Last Name"
          defaultValue={subscriptionInfo.lastName}
          onChange={handleChange}
        />
        <FormRow
          type="email"
          name="email"
          labelText="Company Email"
          defaultValue={subscriptionInfo.email}
          onChange={handleChange}
        />
        <FormRow
          type="tel"
          name="phone"
          labelText="Phone Number"
          defaultValue={subscriptionInfo.phone}
          onChange={handleChange}
        />
        <FormRow
          type="text"
          name="orgName"
          labelText="OrgName"
          defaultValue={subscriptionInfo.orgName}
          onChange={handleChange}
        />
        <FormRow
          type="text"
          name="password"
          labelText="Password"
          defaultValue={subscriptionInfo.password}
          onChange={handleChange}
        />

        {/* <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit
        </button> */}
      </form>
    </div>
  )
}

export default CompanyPaymentForm
