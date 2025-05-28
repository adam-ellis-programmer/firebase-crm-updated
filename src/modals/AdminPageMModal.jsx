import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'

const AdminPageMModal = ({ alertData, setShowAlert }) => {
  console.log(alertData)
  return (
    <div className="admin-alert-modal-wrap">
      <div className="admin-alert-modal">
        <div className="admin-alert-header">
          <p className="admin-alert-p-1" >success!</p>
          <p className="admin-alert-p-2" >{alertData.data.message}</p>

        </div>
        <div className="admin-alert-middle">
          <div>
            <p className="admin-alert-info-p">
              <span>admin</span>{' '}
              <span>{alertData.data.customClaims.admin ? <FontAwesomeIcon className='admin-check' icon={faCircleCheck} /> : <FontAwesomeIcon className='admin-x' icon={faCircleXmark} />}</span>
            </p>

            <p className="admin-alert-info-p">
              <span>manager</span>{' '}
              <span>{alertData.data.customClaims.manager ? <FontAwesomeIcon className='admin-check' icon={faCircleCheck} /> : <FontAwesomeIcon className='admin-x' icon={faCircleXmark} />}</span>
            </p>


            <p className="admin-alert-info-p">
              <span>ceo</span>{' '}
              <span>{alertData.data.customClaims.ceo ? <FontAwesomeIcon className='admin-check' icon={faCircleCheck} /> : <FontAwesomeIcon className='admin-x' icon={faCircleXmark} />}</span>
            </p>

            <p className="admin-alert-info-p">
              <span>sales</span>{' '}
              <span>{alertData.data.customClaims.sales ? <FontAwesomeIcon className='admin-check' icon={faCircleCheck} /> : <FontAwesomeIcon className='admin-x' icon={faCircleXmark} />}</span>
            </p>
            <p className="admin-alert-info-p">
              <span>reports to</span>{' '}
              <span>{alertData.data.customClaims.reportsTo.name }</span>
            </p>
          </div>
        </div>
        <div className="admin-alert-footer">
          <button onClick={() => setShowAlert(false)} className="close-admin-modal-btn">
            close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPageMModal
