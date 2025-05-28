import { useContext, useEffect, useState, useRef } from 'react'
import CrmContext from '../crm context/CrmContext'
import { useSearchParams, useParams } from 'react-router-dom'
import {
  getDocument,
  getProducts,
  updateOrder,
  getOrdersAfterEdit,
  updateCustomerStats,
} from '../crm context/CrmAction'
import {
  formatPrice,
  getCustomerRating,
  getPointsEarned1,
  getRating,
} from '../CrmFunctions'
import { toast } from 'react-toastify'
import Loader from '../assets/Loader'

function OrderEdit() {
  // Refs and state management
  // USE FOCUS
  // if itemInput then focus
  // to avoid errors
  // Order Card Component with time data
  // in order card split date and time
  // NNED TO WORK ON STATS RATING TODAY

  const itemInputRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [selectItem, setSelectItem] = useState('')
  const [currentOrder, setCurrentOrder] = useState(null)

  const params = useParams()
  const { dispatch } = useContext(CrmContext)
  const [searchParams, setSearchParams] = useSearchParams()

  const [formData, setFormData] = useState(null)
  const [products, setProducts] = useState(null)

  const searchParamsId = searchParams.get('editItemId')
  // bring modal into
  useEffect(() => {
    const editRef = itemInputRef
    editRef.current.focus()
    console.log(editRef)
    return () => {}
  }, [])

  // Load initial data - both products and current order
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true)
        if (!searchParamsId) return

        // Get all products and current order
        const productsData = await getProducts()
        const orderData = await getDocument(searchParamsId, 'orders')

        setProducts(productsData)
        setCurrentOrder(orderData)

        // Set initial selection to current order's item
        setSelectItem(orderData.selectItem || 'Change product')

        if (!productsData || !orderData) {
          toast.error('Could not fetch required data')
          return
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [searchParamsId])

  // Handle product selection from dropdown
  const handleSelect = (data) => {
    setSelectItem(data.name)
    setFormData({
      price: data.price,
      productId: data.id,
      selectItem: data.name,
    })
    setIsSelectOpen(false)
  }

  // Handle form submission with proper error handling
  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    if (isSubmitting || !formData) return

    try {
      setIsSubmitting(true)

      const updatedFormData = {
        price: formData.price,
        productId: formData.productId,
        selectItem: formData.selectItem,
        edited: true,
        editedAt: new Date().toLocaleString('en-GB'),
      }

      // Update the order in the database
      await updateOrder(searchParamsId, updatedFormData)

      // Get fresh orders data to recalculate totals
      const updatedOrders = await getOrdersAfterEdit('orders', params.uid)

      // Calculate new total in pence
      const newTotal = updatedOrders.reduce((total, order) => {
        return total + Number(order.data.price)
      }, 0)

      // Update customer stats
      await updateStats(newTotal)

      // Update UI
      dispatch({ type: 'ORDERS', payload: updatedOrders })
      dispatch({ type: 'SET_TOTAL_AMOUNT_SPENT', payload: newTotal })
      dispatch({ type: 'TOGGLE_EDIT_PURCHASE', payload: false })

      // Clear edit mode
      searchParams.delete('editItemId')
      setSearchParams(searchParams)

      toast.success('Order updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle modal close
  const handleCloseModal = () => {
    dispatch({ type: 'TOGGLE_EDIT_PURCHASE', payload: false })
    searchParams.delete('editItemId')
    setSearchParams(searchParams)
  }

  // Update customer stats
  async function updateStats(updatedValue) {
    console.log('update value 152:->', updatedValue)
    try {
      const statsOBJ = await getDocument(params.uid, 'stats')
      if (!statsOBJ) {
        throw new Error('Could not fetch stats')
      }

      const goldCustomer = updatedValue >= 50000 // £500 in pence
      const newPointsForOrder = getPointsEarned1(updatedValue)
      const rating = getRating(updatedValue)

      console.log('new rating ->', rating)

      const updatedData = {
        ...statsOBJ,
        points: newPointsForOrder,
        goldCustomer,
        rating,
        amountSpent: updatedValue,
      }

      await updateCustomerStats('stats', params.uid, updatedData)

      // Update stats in UI
      dispatch({ type: 'SET_STATS', payload: updatedData })
    } catch (error) {
      console.error('Error updating stats:', error)
      throw error
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="order-edit-modal">
      <form tabIndex={-1} ref={itemInputRef} onSubmit={handleSubmitEdit} className="">
        <div className="custom-select-div">
          <button
            onClick={() => setIsSelectOpen((prev) => !prev)}
            type="button"
            className={`custom-select`}
            disabled={isSubmitting}
          >
            <span>{selectItem}</span>
            <span className={`arrow ${isSelectOpen ? 'open' : ''}`}>▼</span>
          </button>

          <div
            className={isSelectOpen ? 'select-dropdown show-select' : 'select-dropdown'}
          >
            {products?.map((prod) => {
              const { id, data } = prod
              return (
                <div
                  onClick={() => handleSelect(data)}
                  key={id}
                  className="select-option"
                >
                  <span>{data.name}</span>
                  <span>{formatPrice(data.price)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          className="edit-button"
          disabled={isSubmitting || !formData}
        >
          {isSubmitting ? 'Updating...' : 'Update Order'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleCloseModal}
        className="close-update-order-btn"
        disabled={isSubmitting}
      >
        X
      </button>
    </div>
  )
}

export default OrderEdit
