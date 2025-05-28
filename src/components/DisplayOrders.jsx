import { useEffect, useState, useContext } from 'react'
import { useSearchParams, useHistory } from 'react-router-dom'

import { useParams, useNavigate, useLocation } from 'react-router-dom'
import CrmContext from '../crm context/CrmContext'
import {
  getCollection,
  newDataBaseEntry,
  getStatsObjToEdit,
  getSingleDoc,
  updateCustomerStats,
  getDocument,
  getProducts,
} from '../crm context/CrmAction'
import { doc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import {
  getPointsEarned1,
  getCustomerRating,
  getRating,
  formatPrice,
} from '../CrmFunctions'
import { db } from '../firebase.config'
import { getAuth } from 'firebase/auth'

import { toast } from 'react-toastify'
import DataSvgIcon from './DataSvgIcon'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
import Loader from '../assets/Loader'
import OrderCard from '../cards/OrderCard'
// import { products } from '../utils'

// for testing
// const {history} = useHistory();

function DisplayOrders({ permissions }) {
  const { loggedInUser, claims } = useAuthStatusTwo()

  // permissions[resource][action]
  // checks permissions[customers][delete] = false
  // resource is the actural object
  // action is the object value name
  // if (!hasPermission('customers', 'delete')) return
  const hasPermission = (resource, action) => {
    if (
      !permissions ||
      !permissions[resource] ||
      !permissions[resource][action]
    ) {
      const msg = `You do not have ${action} permissions for ${resource}`
      console.log(msg)
      toast.error(msg)
      // console.log(permissions[resource])
      return false
    }
    return true
  }

  const auth = getAuth()

  //  *** leave for testing *** //
  const navigate = useNavigate()
  const location = useLocation()
  const searchParamsTest = new URLSearchParams()
  //  *** leave for testing *** //

  const [searchParams, setSearchParams] = useSearchParams()
  const [isDeleting, setIsDeleting] = useState(false)
  const { dispatch, totalAmountSpent, editPurchase, ordersData } =
    useContext(CrmContext)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isSelectOpen, setIsSelectOpen] = useState(false)

  const [initCustId, setInitCustId] = useState('')
  const [products, setProducts] = useState(null)
  const [formData, setFormData] = useState({
    price: 0,
    selectItem: '',
    productId: '',
    orgId: '',
    orgName: '',
  })

  const params = useParams()

  // update the formData when we get the claims data
  useEffect(() => {
    if (claims?.claims?.orgId && claims?.claims?.orgName) {
      setFormData((prev) => ({
        ...prev,
        orgId: claims.claims.orgId,
        orgName: claims.claims.orgName,
      }))
    }
  }, [claims?.claims?.orgId, claims?.claims?.orgName])

  const { price, productId, selectItem } = formData

  useEffect(() => {
    const getData = async () => {
      try {
        const custInfo = await getSingleDoc('customers', params.uid)
        const statsInfo = await getSingleDoc('stats', params.uid)
        dispatch({ type: 'SET_STATS', payload: statsInfo })

        setInitCustId(custInfo.custId)
      } catch (error) {
        console.log(error)
      }
    }

    getData()
  }, [])

  // get orders on page load
  useEffect(() => {
    try {
      const getDbData = async () => {
        const ordersData = await getCollection('orders', params.uid)

        // Create a new copy of the array
        const sortedOrders = [...ordersData].sort(
          (a, b) => b.data.timestamp.seconds - a.data.timestamp.seconds
        )

        const productsData = await getProducts()
        setProducts(productsData)
        dispatch({ type: 'ORDERS', payload: sortedOrders })
        dispatch({ type: 'ORDERS_LENGTH', payload: ordersData.length })
      }
      getDbData()
    } catch (error) {
      console.log(error)
    }
  }, [initCustId])

  useEffect(() => {
    document.addEventListener('click', () => {
      console.log('clicked: add class to check list')
    })
    return () => {}
  }, [])

  // 1: make request for the updated array and ID
  // 2: make new stats object
  // 3: make request to update araay using the ID frompm previous request
  // 4: on delete and on edit make reqest to update

  const onDelete = async (id) => {
    if (!hasPermission('customers', 'delete')) return
    // Prevent multiple simultaneous deletions
    // Then use it like:
    if (isDeleting) {
      return
    }

    try {
      setIsDeleting(true)

      // Filter out the order to be deleted for dom
      const updatedData = ordersData.filter((item) => item.id !== id)
      const deletedItem = ordersData.find((item) => item.id === id)
      const deletedPrice = deletedItem.data.price

      // First, delete from Firebase to ensure database consistency
      await deleteDoc(doc(db, 'orders', id))

      // Get fresh stats after deletion
      const statsOBJ = await getDocument(initCustId, 'stats')

      // Calculate new total from remaining orders
      const newTotalAmountSpent = updatedData.reduce((value, item) => {
        return value + item.data.price
      }, 0)

      // Update goldCustomer status based on new total (now in pence)
      const goldCustomer = newTotalAmountSpent >= 50000 // £500 in pence

      // Calculate points and rating with fresh data
      const newPointsForOrder = getPointsEarned1(newTotalAmountSpent)
      const rating = getRating(newTotalAmountSpent)

      const updatedStats = {
        ...statsOBJ,
        amountSpent: newTotalAmountSpent,
        points: newPointsForOrder,
        numberOfOrders: updatedData.length,
        rating,
        goldCustomer,
      }

      // Update stats in database
      await updateCustomerStats('stats', initCustId, updatedStats)

      // Only update UI after database operations complete
      dispatch({ type: 'ORDERS', payload: updatedData })
      dispatch({ type: 'SET_TOTAL_AMOUNT_SPENT', payload: newTotalAmountSpent })
      dispatch({ type: 'ORDERS_LENGTH', payload: updatedData.length })
      dispatch({ type: 'SET_STATS', payload: updatedStats })

      toast.success('Order deleted successfully')
    } catch (error) {
      console.error('Error deleting order: ', error)
      toast.error('Failed to delete order')
    } finally {
      setIsDeleting(false)
    }
  }

  const openModal = () => {
    if (editPurchase === false) {
      dispatch({ type: 'TOGGLE_EDIT_PURCHASE', payload: true })
    }
  }

  const onEdit = (id) => {
    if (!hasPermission('customers', 'update')) return

    console.log(id)
    // return
    openModal()
    // return
    setSearchParams((prev) => {
      prev.set('editItemId', id)
      return prev
    })
  }

  const onMutate = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!hasPermission('customers', 'create')) return

    if (isSubmitting) return

    if (selectItem === '' || price === 0) {
      toast.error('Please select an item and ensure it has a valid price')
      return
    }

    try {
      setIsSubmitting(true)

      const newOrder = {
        ...formData,
        price,
        customerUid: params.uid,
        agentId: params.agentUid,
        productId,
        timestamp: serverTimestamp(),
        edited: false,
        agentName: loggedInUser?.displayName?.split(' ')[0],
        dateOfOrder: new Date().toLocaleString('en-GB'),
        customerName: params.name,
        customerEmail: searchParams.get('email'),
        pointsForOrder: getPointsEarned1(price),
      }

      // Create new order in database
      const data = await newDataBaseEntry('orders', newOrder, params.uid)

      // sort newest first
      const sortedOrders = [...data].sort(
        (a, b) => b.data.timestamp.seconds - a.data.timestamp.seconds
      )

      // Get updated orders list
      const fetchOrdersWithNewOrder = await getCollection('orders', params.uid)

      // Get stats object for updating
      const getStatsObj = await getStatsObjToEdit('stats', initCustId)
      const statsID = getStatsObj[0].id

      // Calculate new total (in pence)
      const newTotal = totalAmountSpent + price

      // Update customer status and calculate rewards
      const goldCustomer = newTotal >= 50000 // £500 in pence
      const totalPoints = getPointsEarned1(newTotal)
      const ratingAmount = getRating(newTotal)

      const updatedStats = {
        ...getStatsObj[0].data,
        numberOfOrders: fetchOrdersWithNewOrder.length,
        amountSpent: newTotal,
        points: totalPoints,
        goldCustomer,
        rating: ratingAmount,
      }

      // Update database first
      await updateCustomerStats('stats', statsID, updatedStats)

      // Then update UI
      dispatch({ type: 'ORDERS', payload: sortedOrders })
      dispatch({ type: 'SET_TOTAL_AMOUNT_SPENT', payload: newTotal })
      dispatch({ type: 'ORDERS_LENGTH', payload: data.length })
      dispatch({ type: 'SET_STATS', payload: updatedStats })

      // Reset form
      setFormData({
        item: '',
        price: 0,
        selectItem: 'please select',
      })

      toast.success('Order added successfully')
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Failed to submit order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!ordersData) {
    return <Loader />
  }

  const handleSelect = (data) => {
    if (!hasPermission('customers', 'create')) return
    console.log(data)
    setIsSelectOpen(false)

    setFormData((prev) => ({
      ...prev,
      selectItem: data.name,
      price: data.price,
      productId: data.id,
    }))
  }

  return (
    <div>
      <div className='form-container'>
        <form onSubmit={onSubmit} className=''>
          {/* custom select  */}
          <div className='custom-select-div'>
            <button
              onClick={() => setIsSelectOpen((prev) => !prev)}
              type='button'
              className={`custom-select`}
            >
              <span>{selectItem || 'Select an option'}</span>
              <span className={`arrow ${'open'}`}>▼</span>
            </button>

            <div
              className={
                isSelectOpen ? 'select-dropdown show-select' : 'select-dropdown'
              }
            >
              {products &&
                products.map((prod) => {
                  const { id, data } = prod

                  return (
                    <div
                      onClick={() => handleSelect(data)}
                      key={id}
                      className='select-option'
                    >
                      <span>{data.name}</span>
                      <span>{formatPrice(data.price)}</span>
                    </div>
                  )
                })}
            </div>
          </div>

          <div className='page-btn-container'>
            <button className='booking-button' type='submit'>
              {isSubmitting ? 'making order' : 'place order'}
            </button>
          </div>
        </form>
      </div>

      <div className='order-display-div'>
        <ul>
          {ordersData &&
            ordersData.map((item) => {
              return (
                <OrderCard
                  key={item.id}
                  item={item}
                  auth={auth}
                  onEdit={onEdit}
                  isDeleting={isDeleting}
                  onDelete={onDelete}
                />
              )
            })}
        </ul>
      </div>
      {ordersData.length < 3 && <DataSvgIcon />}
    </div>
  )
}

export default DisplayOrders
