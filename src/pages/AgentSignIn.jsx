import { useContext, useEffect } from 'react';
import CrmContext from '../crm context/CrmContext';
import AgentLogInForm from '../components/AgentLogInForm';
import ForgotPasswordModal from '../drop down modals/ForgotPasswordModal';

function AgentSignIn() {
  const { dispatch } = useContext(CrmContext);
  useEffect(() => {
    console.log(window.location.pathname);
    dispatch({ type: 'SHOW_PASSWORD_RESET_MODAL', payload: false });
  }, []);
  const { showPasswordResetModal } = useContext(CrmContext);
  return (
    <div className="">
      <div className="agent-sign-in-grid-container grid grid-cols-1 md:grid-cols-2">
        <div className="agent-inner-div">
          <AgentLogInForm />
          {showPasswordResetModal && <ForgotPasswordModal />}

          {!showPasswordResetModal && (
            <div className="welcome-back-text-container">
              <p className="welcome-back-text">Welcome Back</p>
            </div>
          )}
        </div>

        <div className="agent-inner-div agent-inner-div-2">
          <div className="agent-inner-div-text">
            <div className="sign-in-text-container">
              <h1 className="sign-in-h1-text">Sign In To See Your Data</h1>
            </div>
            <div className="sign-in-text-container">
              <ul className="sign-in-info">
                <li className="sign-in-list"> See up to date Customer Data</li>
                <li className="sign-in-list"> Make New Orders</li>
                <li className="sign-in-list"> Leave Notes as upu need them </li>
                <li className="sign-in-list">
                  {' '}
                  See the most recent emails and activity from your dashboard{' '}
                </li>
                <li className="sign-in-list">
                  {' '}
                  Send Emails with pre filled forms{' '}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentSignIn;
