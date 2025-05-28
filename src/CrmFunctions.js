import { getAllOrdersStructured } from './crm context/CrmAction'

// used in add product to databse
//  set for every £100
// not in use keep for refer
export function getCustomerRating(amountSpentInPence) {
  // counter
  let rating = 0
  while (amountSpentInPence > 0) {
    if (amountSpentInPence >= 10000) {
      // Check for 10000 pence (£100)
      rating++
      amountSpentInPence -= 10000 // Subtract 10000 pence (£100)
      if (rating >= 5) {
        rating = 5
      }
    } else {
      break
    }
  }
  return rating
}

// un-capped points
export function getPointsEarned(amountSpentInPence, points) {
  while (amountSpentInPence > 0) {
    if (amountSpentInPence >= 10000) {
      // Check for 10000 pence (£100)
      points += 10
      amountSpentInPence -= 10000 // Subtract 10000 pence (£100)
    } else {
      break
    }
  }
  return points
}

// used wnen we update the stats object and calculate
// deletion of points
// in display orders
export function getPointsEarned1(amountSpentInPence) {
  const pointsPerHundred = 1 // 1 point for every £100 spent
  // Convert pence to hundreds of pounds (10000 pence = £100)
  return Math.floor(amountSpentInPence / 10000) * pointsPerHundred
}

// used wnen we update the stats object
// in display orders
// export function getRating(amountSpentInPence) {
//   const ratingPerFiveHundred = 1 // 1 rating point for every £500 (50000 pence) spent
//   return Math.floor(amountSpentInPence / 50000) * ratingPerFiveHundred
// }

export function getRating(amountSpentInPence) {
  const ratingPerFiveHundred = 1 // 1 rating point for every £500 (50000 pence) spent

  // First calculate the raw rating based on spending
  const calculatedRating = Math.floor(amountSpentInPence / 50000) * ratingPerFiveHundred

  console.log(calculatedRating)
  // Then use Math.min to ensure the rating doesn't exceed 5
  return Math.min(calculatedRating, 5)
}

//  ***** old funciton keep for referenct *****
// export function getRating(amountSpent) {
//   const ratingPerTwelveHundred = 1 // 1 rating point for every $500 spent
//   return Math.floor(amountSpent / 500) * ratingPerTwelveHundred
// }

// export const formatPrice = (price) => {
//   // Handle null, undefined, or invalid inputs
//   if (!price && price !== 0) return '-'

//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'GBP',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(price)
// }

// To get a 10-digit number, we need to:
// 1. Start with a minimum of 1000000000 (to ensure 10 digits)
// 2. Add a random number up to 8999999999 (to stay under 10 digits)

export const generateTenDigitNumber = () => {
  // 1000000000 ensures we start with 10 digits
  // Math.random() * 9000000000 gives us a range of 0 to 8999999999
  // Adding these together gives us a range of 1000000000 to 9999999999
  return Math.floor(1000000000 + Math.random() * 9000000000)
}

export const formatPrice = (pence) => {
  const poundsDecimal = pence / 100

  // Now we use Intl.NumberFormat to format the pounds value with proper currency symbol
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(poundsDecimal)
}

// aggregate up to a year + down to a week
// The issue with starting at 0 becomes clear when we think about what these numbers represent:

// If a coffee costs $5, that's a real price
// If a coffee costs $0, that's also theoretically a real price (though unlikely)
// But undefined means "we haven't seen any prices yet"

// This is why we made the following modification when switching to 0:
// aggeregated SPELLING ****
// Aggregate
export const aggregateData = async () => {
  const data = await getAllOrdersStructured()
  const yearOrders = data?.yearOrders
  const monthData = data?.monthOrders
  const weekhData = data?.weekOrders
  const todayData = data?.todayOrders
  const hourData = data?.hourOrders

  // First comparison: Math.max(-Infinity, 25)
  // -Infinity is smaller than 25, so 25 becomes our new max
  // Math.max(-Infinity, 25) → 25 always bigger then
  const getMonthly = () => {
    // First, check if we have any data to process
    if (!monthData || monthData.length === 0) {
      // Return an object with all numeric values set to 0
      return { prices: [], count: 0, total: 0, min: 0, max: 0, average: 0 }
    }

    // If we do have data, proceed with our reduce operation
    return monthData.reduce(
      (acc, item) => {
        acc.prices.push(item.price)
        acc.total += item.price
        acc.count += 1
        acc.min = Math.min(acc.min, item.price)
        acc.max = Math.max(acc.max, item.price)
        acc.average = acc.total / acc.count
        return acc
      },
      {
        prices: [],
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        average: 0,
      }
    )
  }

  const getWeekly = () => {
    // First, check if we have any data to process
    if (!weekhData || weekhData.length === 0) {
      // Return an object with all numeric values set to 0
      return { prices: [], count: 0, total: 0, min: 0, max: 0, average: 0 }
    }

    // If we do have data, proceed with our reduce operation
    return weekhData.reduce(
      (acc, item) => {
        acc.prices.push(item.price)
        acc.total += item.price
        acc.count += 1
        acc.min = Math.min(acc.min, item.price)
        acc.max = Math.max(acc.max, item.price)
        acc.average = acc.total / acc.count
        return acc
      },
      {
        prices: [],
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        average: 0,
      }
    )
  }
  const getYearly = () => {
    // First, check if we have any data to process
    if (!yearOrders || yearOrders.length === 0) {
      // Return an object with all numeric values set to 0
      return { prices: [], count: 0, total: 0, min: 0, max: 0, average: 0 }
    }
    //Aggregate
    // If we do have data, proceed with our reduce operation
    return yearOrders.reduce(
      (acc, item) => {
        acc.prices.push(item.price)
        acc.total += item.price
        acc.count += 1
        acc.min = Math.min(acc.min, item.price)
        acc.max = Math.max(acc.max, item.price)
        acc.average = acc.total / acc.count
        return acc
      },
      {
        prices: [],
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        average: 0,
      }
    )
  }

  const getToday = () => {
    // First, check if we have any data to process
    if (!todayData || todayData.length === 0) {
      // Return an object with all numeric values set to 0
      return { prices: [], count: 0, total: 0, min: 0, max: 0, average: 0 }
    }

    // If we do have data, proceed with our reduce operation
    return todayData.reduce(
      (acc, item) => {
        acc.prices.push(item.price)
        acc.total += item.price
        acc.count += 1
        acc.min = Math.min(acc.min, item.price)
        acc.max = Math.max(acc.max, item.price)
        acc.average = acc.total / acc.count
        return acc
      },
      {
        prices: [],
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        average: 0,
      }
    )
  }

  const getByHour = () => {
    const defaultValues = {
      prices: [],
      count: 0,
      total: 0,
      min: 0,
      max: 0,
      average: 0,
    }

    if (!hourData || hourData.length === 0) {
      return defaultValues
    }

    return hourData.reduce((acc, item) => {
      const newTotal = (acc.total || 0) + item.price
      const newCount = (acc.count || 0) + 1

      return {
        prices: [...(acc.prices || []), item.price],
        count: newCount,
        total: newTotal,
        min: acc.min === 0 ? item.price : Math.min(acc.min, item.price),
        max: acc.max === 0 ? item.price : Math.max(acc.max, item.price), // Fixed to Math.max
        average: newTotal / newCount, // Calculated using the new total and count
      }
    }, defaultValues)
  }

  return {
    monthData: getMonthly,
    weekData: getWeekly,
    yearData: getYearly,
    todayData: getToday,
    hourData: getByHour,
  }
}
