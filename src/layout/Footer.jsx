import { Link } from 'react-router-dom'

function Footer() {
  const date = new Date().getFullYear()

  return (
    <footer className="footer">
      {/* <div className="footer-div"></div> */}
      <div className="footer-div">
        <div className="footer-date-div">
          <p className='footer-date' >© {date}</p>
          <Link className="footer-link" to="/terms">
            {' '}
            terms and conditions
          </Link>
        </div>
      </div>
      {/* <div className="footer-div"></div> */}
    </footer>
  )
}

export default Footer
