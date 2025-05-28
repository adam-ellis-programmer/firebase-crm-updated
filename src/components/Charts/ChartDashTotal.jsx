import { useState, useEffect, useCallback, useMemo } from 'react'
import { getAllOrders } from '../../crm context/CrmAction'
import { formatPrice } from '../../CrmFunctions'
import { useAuthStatusTwo } from '../../hooks/useAuthStatusTwo'

const ChartDashTotal = () => {
  const [total, setTotal] = useState(0)
  const [displayTotal, setDisplayTotal] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const { claims } = useAuthStatusTwo()

  // Memoize the orgId to prevent unnecessary re-renders
  const orgId = useMemo(() => claims?.claims?.orgId, [claims?.claims?.orgId])

  // Use useCallback to memoize the logging function
  const logClaims = useCallback(() => {
    if (orgId) {
      // console.log('claims---->', orgId)
    }
  }, [orgId])

  // Call logClaims only when orgId actually changes
  useEffect(() => {
    logClaims()
  }, [logClaims])

  // Memoize the getOrders function to prevent recreating it on every render
  const getOrders = useCallback(async () => {
    try {
      const orders = await getAllOrders(orgId)
      const totalData = orders.reduce((acc, item) => {
        acc += item.price
        return acc
      }, 0)
      setTotal(totalData)
      setIsAnimating(true)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }, [orgId])

  useEffect(() => {
    getOrders()
  }, [getOrders])

  useEffect(() => {
    if (!isAnimating) return

    let startTimestamp
    let animationDuration = 2000 // 2 seconds duration

    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = timestamp - startTimestamp

      // Calculate the current value based on progress
      if (progress < animationDuration) {
        // Easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress / animationDuration, 4)
        const currentValue = Math.min(total * easeOutQuart, total)
        setDisplayTotal(Math.round(currentValue))
        requestAnimationFrame(animate)
      } else {
        setDisplayTotal(total)
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)

    return () => {
      setIsAnimating(false)
    }
  }, [total, isAnimating])

  return (
    <>
      <p>
        total spent:{' '}
        <span className='chart-dash-price'>{formatPrice(displayTotal)}</span>
      </p>
      <p>this year!</p>
    </>
  )
}

export default ChartDashTotal
