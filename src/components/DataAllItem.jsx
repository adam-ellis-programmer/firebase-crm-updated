import { Link } from 'react-router-dom'

const DataAllItem = ({ customer, i, loggedInUser, claims }) => {
  const { name, company, email, phone, dateOfSignUp, signUpagent, urlData, reportsTo } =
    customer.data

  return (
    <>
      <Link
        to={`/single-customer/${loggedInUser.uid}/${customer.id}/${name}/?email=${email}`}
      >
        <div className="all-data-item-container">
          <div className="data-all-item">
            {' '}
            <div className="item-div">ID</div> <div>{i + 1}</div>
          </div>
          <div className="data-all-item">
            {' '}
            <img
              className="all-data-img"
              src={urlData?.url || 'https://picsum.photos/200'}
              alt=""
            />{' '}
          </div>
          <div className="data-all-item">
            <div className="item-div">access level</div>
            <span>level </span> <span> {claims?.claims?.roleLevel}</span>
          </div>
          <div className="data-all-item">
            <div className="item-div">Name</div>
            {name}
          </div>
          <div className="data-all-item">
            <div className="item-div">Email</div>
            {email}
          </div>
          <div className="data-all-item">
            <div className="item-div">Company</div>
            {company}
          </div>
          <div className="data-all-item">
            <div className="item-div">Phone</div>
            {phone}
          </div>
          <div className="data-all-item">
            <div className="item-div">Reg Date</div>
            {dateOfSignUp.split(',')[0]}
          </div>
          <div className="data-all-item">
            <div className="item-div">Owner</div>
            {signUpagent}
          </div>
          <div className="data-all-item">
            <div className="item-div">Rep TO</div>
            {reportsTo.name}
          </div>
        </div>
      </Link>
    </>
  )
}

export default DataAllItem
