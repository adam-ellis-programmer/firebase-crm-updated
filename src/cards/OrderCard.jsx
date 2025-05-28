import { formatPrice } from '../CrmFunctions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faUserPen } from '@fortawesome/free-solid-svg-icons'

const getOrderAge = (dateString) => {
  const [date, time] = dateString.split(',')
  const [day, month, year] = date.split('/')
  const orderDate = new Date(year, month - 1, day)

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const diffTime = todayDate - orderDate

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'current'
  if (diffDays === 1) return 'one-day'
  if (diffDays === 2) return 'two-days'
  if (diffDays >= 3 && diffDays < 7) return 'three-seven-days'

  return 'over-seven-days'
}

// get the class dynamically
const getOrderClass = (dateString) => {
  const age = getOrderAge(dateString)


  switch (age) {
    case 'current':
      return {
        class: 'current',
        day: 0,
        pillColor: '#4ade80',
        pillText: 'NEW',
      }

    case 'one-day':
      return {
        class: 'one-day',
        pillColor: '#fbbf24',
        pillText: '1 DAY OLD',
      }

    case 'two-days':
      return {
        class: 'two-days',
        pillColor: '#fb923c',
        pillText: '2 DAYS OLD',
      }

    case 'three-seven-days':
      return {
        class: 'three-seven-days',
        pillColor: '#f87171',
        pillText: '3-7 DAYS',
      }

    case 'over-seven-days':
      return {
        class: 'over-seven-days',
        pillColor: '#ef4444',
        pillText: 'OLD',
      }

    default:
      return {
        class: 'over-seven-days',
        pillColor: '#ef4444',
        pillText: 'OLD',
      }
  }
}
const OrderCard = ({ item, auth, onEdit, isDeleting, onDelete }) => {
  const orderStatus = getOrderClass(item.data.dateOfOrder)

  return (
    <li className={`order-item ${orderStatus.class}`}>
      <div className="order-item-top">
        <div className="order-item-div">
          <span> item</span>
          <span> {item.data.selectItem}</span>
        </div>
        <div className="order-item-div">
          <span>price</span>
          <span>{formatPrice(item.data.price)}</span>
        </div>
        <div className="order-item-div order-item-booked-by">
          <span>sold by</span>
          <span>{auth.currentUser.displayName}</span>{' '}
        </div>

        <div className="order-item-div">
          <span>order date</span>
          <span> {item.data.dateOfOrder.split(' ')[0]}</span>
        </div>
        <div className="order-item-div">
          <span>order time</span>
          <span> {item.data.dateOfOrder.split(' ')[1]}</span>
        </div>
      </div>

      <div className="order-btn-container">
        <button onClick={() => onEdit(item.id)}>
          <FontAwesomeIcon className="order-edit" icon={faUserPen} />
        </button>
        <button
          disabled={isDeleting}
          onClick={() => onDelete(item.id)}
          className="order-delete"
        >
          X
        </button>

        <span
          className="info-pill"
          style={{
            backgroundColor: orderStatus.pillColor,
          }}
        >
          {orderStatus.pillText}
        </span>
      </div>
    </li>
  )
}

export default OrderCard
