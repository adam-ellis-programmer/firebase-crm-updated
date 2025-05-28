import { Link } from 'react-router-dom'
import { pricingTiers } from '../billing/data'
//
//
const SignUpTierPage = () => {
  return (
    <div className="page-container tier-grid tier-page-el">
      {pricingTiers.map((tier, i) => (
        <div
          key={tier.id}
          className={`pricing-card tier-page-el${tier.recommended ? 'recommended' : ''}`}
        >
          {tier.recommended && <span className="recommended-badge">Recommended</span>}
          <i className={`pricing-icon tier-page-el ${tier.iconClass}`}></i>
          <h3 className="pricing-name tier-page-el">{tier.name}</h3>
          <p className="pricing-description tier-page-el">{tier.description}</p>
          <div className="pricing-price tier-page-el">
            £{tier.price}
            <span className="pricing-period tier-page-el">/{tier.billingPeriod}</span>
          </div>

          <ul className="features-list tier-page-el">
            {tier.features.map((feature, index) => (
              <li className="tier-page-el" key={index}>
                {feature}
              </li>
            ))}
          </ul>

          {tier.limitations.length > 0 && (
            <ul className="limitations-list tier-page-el">
              {tier.limitations.map((limitation, index) => (
                <li className="tier-page-el" key={index}>
                  {limitation}
                </li>
              ))}
            </ul>
          )}

          <Link
            to={`/payment-page/${tier.id}`}
            className={`pricing-button tier-page-el${tier.id}`}
          >
            {tier.buttonText}
          </Link>
        </div>
      ))}
    </div>
  )
}

export default SignUpTierPage
