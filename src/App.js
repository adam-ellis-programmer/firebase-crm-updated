import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

import { CrmDataContextProvider } from './crm context/CrmContext'

import AppContent from './AppContent'

// PROTECT THE ROUTES
function App() {
  return (
    // special App context to handle state inside app for alerts etc
    <CrmDataContextProvider>
      <AppContent />
    </CrmDataContextProvider>
  )
}

export default App
