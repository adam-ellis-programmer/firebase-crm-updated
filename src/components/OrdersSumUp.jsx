import { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase.config'

import CrmContext from '../crm context/CrmContext'
import { formatPrice } from '../CrmFunctions'

function OrdersSumUp() {
  const { totalAmountSpent, dispatch } = useContext(CrmContext)

  const [orders, setOrders] = useState(null)
  const params = useParams()

  useEffect(() => {
    const totalSum =
      orders &&
      orders.reduce((value, item) => {
        return value + item.price
      }, 0)

    dispatch({ type: 'SET_TOTAL_AMOUNT_SPENT', payload: totalSum })
  }, [orders])

  useEffect(() => {
    const getPurchases = async () => {
      const collectionRef = collection(db, 'orders')

      const q = query(collectionRef, where('customerUid', '==', params.uid))

      const querySnap = await getDocs(q)
      const purchases = []

      querySnap.forEach((data) => {
        purchases.push({
          id: data.id,
          data: data.data(),
          price: parseInt(data.data().price),
        })
      })
      setOrders(purchases)
    }
    getPurchases()
  }, [params.uid])

  return (
    <div className="order-sum-up-wrap">
      <span>{formatPrice(totalAmountSpent)}</span>
      <span className="total-sales-text">Total Sales </span>
    </div>
  )
}

export default OrdersSumUp
