import { createContext, useReducer } from 'react'
import { CrmReducer } from './CrmReducer'

const CrmContext = createContext()

export const CrmDataContextProvider = ({ children }) => {
  const initialState = {
    deleteBtn: false,
    editPurchase: false,
    editNote: false,
    toggleEmail: false,
    changeDetails: false,
    submitDetails: false,
    showPasswordResetModal: false,
    sendMessageModal: false,
    readMessageModal: false,
    sendTextModal: false,
    navLoginLogoutControl: true,
    custOrders: null,
    ordersData: null,
    notesData: null,
    customerStats: null,
    totalAmountSpent: 0,
    ordersLength: 0,
    notesLength: 0,
    messageCounter: 0,
    profileChartType: 'lineChart',
    custNum: '',

    nameAndPhoneNumber: {
      name: '',
      phome: '',
    },

    subscriptionInfo: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test-user@test.com',
      phone: '07886567654',
      orgName: 'test-account',
      signUpDate: '',
      expDate: '',
      password: '111111',
    },
  }

  const [state, dispatch] = useReducer(CrmReducer, initialState)

  return (
    <CrmContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </CrmContext.Provider>
  )
}

export default CrmContext
