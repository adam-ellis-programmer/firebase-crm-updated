import { getAuth } from 'firebase/auth'
import { useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import CrmContext from '../crm context/CrmContext'
import EmailSignUpModal from '../components/EmailSignUpModal'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
import DemoButton from '../components/buttons/DemoButton'

function Home() {
  const { dispatch } = useContext(CrmContext)
  const { loggedIn, loggedInUser } = useAuthStatusTwo()
  const auth = getAuth()
  return (
    <div className='page-container-home'>
      <EmailSignUpModal />

      {/* Hero Section */}
      <section className='hero-section'>
        <div className='hero-content'>
          <h1>Streamline Your Customer Relationships</h1>
          <p className='hero-subtitle'>
            All-in-one CRM solution for sales teams and businesses of all sizes
          </p>

          {!loggedIn ? (
            <div className='hero-cta'>
              <Link to='/agent-sign-in' className='btn btn-primary'>
                <i className='fas fa-sign-in-alt'></i> Sign In
              </Link>
              <Link to='/sign-up-acc' className='btn btn-secondary'>
                <i className='fas fa-user-plus'></i> Create Account
              </Link>
              <DemoButton home />
            </div>
          ) : (
            <div className='hero-cta'>
              <Link
                to={`/data/${loggedInUser?.uid}`}
                className='btn btn-primary'
              >
                <i className='fas fa-chart-line'></i> Go to Dashboard
              </Link>
            </div>
          )}
        </div>
        <div className='hero-image'>
          <i className='fas fa-analytics hero-icon'></i>
        </div>
      </section>

      {/* Features Section */}
      <section className='features-section'>
        <h2 className='section-title'>Why Choose Our CRM</h2>

        <div className='features-grid'>
          <div className='feature-card'>
            <div className='feature-icon'>
              <i className='fas fa-chart-pie'></i>
            </div>
            <h3>Data Visualization</h3>
            <p>
              Transform your customer data into actionable insights with
              powerful analytics
            </p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>
              <i className='fas fa-tasks'></i>
            </div>
            <h3>Task Management</h3>
            <p>
              Never miss a follow-up with integrated task tracking and reminders
            </p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>
              <i className='fas fa-users'></i>
            </div>
            <h3>Team Collaboration</h3>
            <p>
              Seamlessly work together with role-based access and shared
              workspaces
            </p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>
              <i className='fas fa-file-alt'></i>
            </div>
            <h3>Document Management</h3>
            <p>
              Store and access all customer-related documents in one secure
              location
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='stats-section'>
        <div className='stat-item'>
          <span className='stat-number'>85%</span>
          <span className='stat-description'>
            Increase in team productivity
          </span>
        </div>

        <div className='stat-item'>
          <span className='stat-number'>65%</span>
          <span className='stat-description'>Higher customer retention</span>
        </div>

        <div className='stat-item'>
          <span className='stat-number'>40%</span>
          <span className='stat-description'>
            Less time on administrative tasks
          </span>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className='testimonial-section'>
        <h2 className='section-title'>What Our Customers Say</h2>

        <div className='testimonial-card'>
          <div className='testimonial-content'>
            <i className='fas fa-quote-left testimonial-quote-icon'></i>
            <p>
              This CRM has transformed how our sales team operates. We've seen a
              dramatic increase in conversions and the insights help us make
              better decisions daily.
            </p>
            <div className='testimonial-author'>
              <i className='fas fa-user-circle testimonial-author-icon'></i>
              <div>
                <p className='testimonial-name'>Sarah Johnson</p>
                <p className='testimonial-title'>Sales Director, TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='cta-section'>
        <h2>Ready to Boost Your Business?</h2>
        <p>Join thousands of companies using our CRM to grow their business</p>
        <Link to='/sign-up-acc' className='btn btn-primary btn-large'>
          <i className='fas fa-rocket'></i> Get Started Today
        </Link>
      </section>
    </div>
  )
}

export default Home
