import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
function ForgotPasswordModal() {
  const [email, setEmail] = useState('');
  console.log(email);
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handleClick = (e) => {
    const auth = getAuth();
    e.preventDefault();

    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log('password reset sent');
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });

    console.log('click');
  };

  const handleResetAsync = async () => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      // ...toast success email sent to ...
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="forgot-password-modal">
      <div className="forgot-password-header">
        <h3 className="forgot-password-heading">Agent Password Reset Form</h3>
      </div>

      <div className="forgot-password-body">
        <div className="forgot-password-container">
          <form action="">
            <div className="forgot-password-input-container">
              <input
                onChange={handleEmailChange}
                className="reset-password-input"
                type="text"
                placeholder="Enter Email"
                value={email}
              />
              <button onClick={handleClick} className="reset-password-button">
                ResetPassword
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="forgot-password-footer">
        <h3>check your email for the reset password link </h3>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
