import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { pricingTiers } from './data'
import { Link } from 'react-router-dom'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import PayPalBtn from './PayPalBtn'
import { getFunctions, httpsCallable } from 'firebase/functions'
import CompanyPaymentForm from './CompanyPaymentForm'

const PaymentPage = () => {
  const { id } = useParams()

  // Find the specific tier that matches the id parameter
  const selectedTier = pricingTiers.find((tier) => tier.id === id)

  // If no matching tier is found, you might want to handle that case
  if (!selectedTier) {
    return <div>No pricing tier found</div>
  }

  return (
    <div className='page-container payment-page-container'>
      <div className='payment-page-div'>
        <div
          className={`pricing-card pay-page-card ${
            selectedTier.recommended ? 'recommended' : ''
          }`}
        >
          {selectedTier.recommended && (
            <span className='recommended-badge'>Recommended</span>
          )}
          <i className={`pricing-icon ${selectedTier.iconClass}`}></i>
          <h3 className='pricing-name tier-page-el'>{selectedTier.name}</h3>
          <p className='pricing-description tier-page-el'>
            {selectedTier.description}
          </p>
          <div className='pricing-price tier-page-el'>
            £{selectedTier.price}
            <span className='pricing-period tier-page-el'>
              /{selectedTier.billingPeriod}
            </span>
          </div>

          <ul className='features-list'>
            {selectedTier.features.map((feature, index) => (
              <li className='tier-page-el' key={index}>
                {feature}
              </li>
            ))}
          </ul>

          {selectedTier.limitations.length > 0 && (
            <ul className='limitations-list'>
              {selectedTier.limitations.map((limitation, index) => (
                <li className='tier-page-el' key={index}>
                  {limitation}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className='payment-page-div'>
        {/* <button className="test-btn" onClick={handleTestBtn}>
          test button
        </button> */}
        <div className='payment-form-div'>
          <CompanyPaymentForm />
          <PayPalBtn price={selectedTier.price} productId={selectedTier.id} />
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
