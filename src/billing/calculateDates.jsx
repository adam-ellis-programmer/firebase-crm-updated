// Helper functions for date calculations and formatting
const calculateFutureDates = () => {
  // Get current date
  const currentDate = new Date()

  // Calculate 30 days from now
  const thirtyDaysFromNow = new Date(currentDate)
  thirtyDaysFromNow.setDate(currentDate.getDate() + 30)

  // Calculate one year from now
  const oneYearFromNow = new Date(currentDate)
  oneYearFromNow.setFullYear(currentDate.getFullYear() + 1)

  // Format options for date strings
  const dateFormatOptions = {
    weekday: 'long', // e.g., "Monday"
    year: 'numeric', // e.g., "2024"
    month: 'long', // e.g., "February"
    day: 'numeric', // e.g., "12"
  }

  return {
    current: {
      milliseconds: currentDate.getTime(),
      formatted: currentDate.toLocaleDateString('en-US', dateFormatOptions),
      isoString: currentDate.toISOString(),
    },
    thirtyDays: {
      milliseconds: thirtyDaysFromNow.getTime(),
      formatted: thirtyDaysFromNow.toLocaleDateString('en-US', dateFormatOptions),
      isoString: thirtyDaysFromNow.toISOString(),
    },
    oneYear: {
      milliseconds: oneYearFromNow.getTime(),
      formatted: oneYearFromNow.toLocaleDateString('en-US', dateFormatOptions),
      isoString: oneYearFromNow.toISOString(),
    },
  }
}

// Helper function to format any date in milliseconds to a readable string
const formatMillisecondsToDate = (milliseconds) => {
  const date = new Date(milliseconds)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Helper function to get milliseconds for a specific future date
const getMillisecondsForDays = (days) => {
  const currentDate = new Date()
  const futureDate = new Date(currentDate)
  futureDate.setDate(currentDate.getDate() + days)
  return futureDate.getTime()
}

export { calculateFutureDates, formatMillisecondsToDate, getMillisecondsForDays }
