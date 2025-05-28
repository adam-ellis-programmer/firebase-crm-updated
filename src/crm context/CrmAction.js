import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  deleteDoc,
} from 'firebase/firestore'

import { db } from '../firebase.config'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const auth = getAuth()
let claims = undefined
// Simple function to get current auth state
export const getCurrentAuthState = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult()
          resolve({
            user,
            claims: idTokenResult.claims.claims,
            orgId: idTokenResult.claims.claims.orgId,
            uid: user.uid,
          })
        } catch (error) {
          console.error('Error getting token:', error)
          resolve({
            user,
            claims: null,
            uid: user.uid,
          })
        }
      } else {
        resolve(null)
      }
    })
  })
}

const authState = await getCurrentAuthState()

export async function getCustomersForMainDataPage(collectionName, params) {
  try {
    //  get a reference
    const usersReference = collection(db, collectionName)

    // create a query for firebase
    const q = query(
      usersReference,
      where('agentUid', '==', params),
      orderBy('timestamp', 'desc')
      // limit(10)
    )

    // execute query
    const querySnap = await getDocs(q)

    const data = []

    querySnap.forEach((doc) => {
      return data.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return data
  } catch (error) {
    console.log(error)
    // toast.error('could not fetch data');
  }
}

export async function getOrdersAfterEdit(collectionName, params) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(
      collectionRef,
      where('customerUid', '==', params),
      orderBy('price', 'desc'),
      limit(10)
    )

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      // console.log(doc.data());
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

export async function getCollection(collectionName, params) {
  try {
    const authState = await getCurrentAuthState()

    // if (!authState || !authState.claims?.orgId) {
    //   console.log('No auth state or orgId available')
    //   return [] // Return empty array instead of undefined
    // }

    const orgId = authState.claims.orgId

    const collectionRef = collection(db, collectionName)
    const q = query(
      collectionRef,
      where('customerUid', '==', params),
      where('orgId', '==', orgId),
      orderBy('price', 'desc'),
      limit(10)
    )

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log('Error in getCollection:', error)
    return [] // ✅ Always return an array, even on error
  }
}

// used on orders page to get specific user
export async function getCustomer(collectionName, params) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(
      collectionRef,
      where('custId', '==', params),
      orderBy('price', 'desc'),
      limit(10)
    )

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

// used in pages: note Edit,
export async function getCollectionNotes(collectionName, params) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(
      collectionRef,
      where('custId', '==', params),
      orderBy('noteDate', 'desc'),
      limit(10)
    )

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

// gets a single doc for the orders page
export async function getSingleDoc(collectionName, orderId) {
  const docRef = doc(db, collectionName, orderId)
  const docSnap = await getDoc(docRef)
  const data = docSnap.data()

  if (docSnap.exists()) {
    return docSnap.data()
  } // else... toast.error()
}

export async function submitUpdatedDocument(collectionName, orderId, formData) {
  const docRef = doc(db, collectionName, orderId)
  const data = await updateDoc(docRef, formData)
  return data
}

// add a doc and get the updated array back
export async function newDataBaseEntry(collectionName, newEntryObj, paramsUid) {
  const docRef = await addDoc(collection(db, collectionName), newEntryObj)
  const userReference = collection(db, collectionName)

  const q = query(
    userReference,
    where('customerUid', '==', paramsUid),
    orderBy('price', 'desc'),
    limit(10)
  )

  const querySnap = await getDocs(q)
  const data = []

  querySnap.forEach((item) => {
    data.push({
      id: item.id,
      data: item.data(),
    })
  })

  return data
}

export async function newNoteEntry(collectionName, newEntryObj, paramsUid) {
  const docRef = await addDoc(collection(db, collectionName), newEntryObj)
  const userReference = collection(db, collectionName)

  const q = query(
    userReference,
    where('custId', '==', paramsUid),
    orderBy('noteDate', 'desc'),
    limit(10)
  )

  const querySnap = await getDocs(q)
  const data = []

  querySnap.forEach((item) => {
    data.push({
      id: item.id,
      data: item.data(),
    })
  })

  return data
}

export async function onSubmit(id, name, phone) {
  console.log('click')
  const userRef = doc(db, 'customers', id)
  await updateDoc(userRef, {
    name,
    phone,
  })
}

// add task to the database
export async function addTaskToDatabase(collectionName, formData) {
  const docRef = await addDoc(collection(db, collectionName), formData)
}

// add email to email collection
export async function submitEmail(collectionName, formData) {
  try {
    const docRef = await addDoc(collection(db, collectionName), formData)
    return docRef
  } catch (error) {
    console.log(error)
  }
}

// used in sendEmail.jsx to get email and place in form
export async function getCustomerInfoForEmail(collectionName, paramsId) {
  const docRef = doc(db, collectionName, paramsId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return docSnap.data()
  }
}

// fetch emails and display in the user profile
export async function getEmailsToDisplayInAgentProfile(
  collectionName,
  paramsId
) {
  // get ref
  const emailRef = collection(db, collectionName)

  //  create a query
  const q = query(
    emailRef,
    where('agentId', '==', paramsId),
    orderBy('dateSent', 'desc'),
    limit(5)
  )

  // Execute Query - get the socs for this specific query
  const querySnap = await getDocs(q)

  const emails = []

  querySnap.forEach((doc) => {
    emails.push({
      id: doc.id,
      data: doc.data(),
    })
  })

  return emails
}

// fetch orders and display in the user profile
export async function getOrdersToDisplayInAgentProfile(
  collectionName,
  paramsId
) {
  // get ref
  const ordersRef = collection(db, collectionName)

  //  create a query
  const q = query(
    ordersRef,
    where('agentId', '==', paramsId),
    // orderBy('dateOfOrder', 'desc'),
    limit(5)
  )

  const querySnap = await getDocs(q)

  const orders = []

  querySnap.forEach((doc) => {
    orders.push({
      id: doc.id,
      data: doc.data(),
    })
  })

  return orders
}

// fetch NOTES and display in the user profile
export async function getNotesToDisplayInAgentProfile(
  collectionName,
  paramsId
) {
  // get ref
  const ordersRef = collection(db, collectionName)

  //  create a query
  const q = query(
    ordersRef,
    where('agentId', '==', paramsId),
    // orderBy('noteWrittenById', 'desc'),
    limit(5)
  )

  const querySnap = await getDocs(q)

  const orders = []

  querySnap.forEach((doc) => {
    // console.log(doc.data())
    orders.push({
      id: doc.id,
      data: doc.data(),
    })
  })

  return orders
}

// fetch TASKS and display in the user profile
export async function getTasksToDisplayInAgentProfile(
  collectionName,
  paramsId
) {
  // get ref
  const tasksRef = collection(db, collectionName)

  const q = query(
    tasksRef,
    where('agentId', '==', paramsId),
    orderBy('timeStamp', 'desc'),
    limit(5)
  )

  const querySnap = await getDocs(q)

  const tasks = []

  querySnap.forEach((doc) => {
    // console.log(doc.data())
    tasks.push({
      id: doc.id,
      data: doc.data(),
    })
  })

  return tasks
}

// this is getting single a document
export async function getTaskToToggleCompleted(taskId, collectionName) {
  const docRef = doc(db, collectionName, taskId)
  const docSnap = await getDoc(docRef)
  const data = docSnap.data()

  if (docSnap.exists()) {
    return docSnap.data()
  } // else... toast.error()
}

export async function updateTaskToCompleted(id, completed) {
  const userRef = doc(db, 'tasks', id)
  await updateDoc(userRef, {
    completed,
  })
}

export async function getStatsObjToEdit(collectionName, params) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, where('custId', '==', params), limit(10))

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

export async function updateCustomerStats(collectionName, custId, formData) {
  try {
    const docRef = doc(db, collectionName, custId)
    const data = await updateDoc(docRef, formData)
    return data
  } catch (error) {
    console.log(error)
  }
}

export async function getAndOrderStatsForStatsPage(collectionName, params) {
  try {
    const collectionRef = collection(db, collectionName)
    // const q = query(
    //   collectionRef,
    //   where('custId', '==', params),
    //   // orderBy('price', 'desc'),
    //   limit(10)
    // );

    const querySnap = await getDocs(collectionRef)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

export async function getStatsForStatsPage(collectionName, params) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(
      collectionRef,
      where('custId', '==', params),
      // orderBy('price', 'desc'),
      limit(10)
    )

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

// used on the admin page to add agent to the dataBase
export async function addAgentToDbFromAdmin(collectionName, uid, newEntryObj) {
  try {
    // Write the document
    await setDoc(doc(db, collectionName, uid), newEntryObj)

    // Return the object that was written
    return {
      success: true,
      data: newEntryObj,
      id: uid,
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function getListOfAgentsForAdminPage(collectionName) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(
      collectionRef,
      orderBy('timestamp', 'desc')
      // limit(10)
    )

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

export async function deleteAgent(collectionName, uid) {
  deleteDoc(doc(db, collectionName, uid))
}

export async function getAgentToDisplayChangeUpdateTaskLengthData(
  collectionName,
  params
) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, where('agentUid', '==', params))

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

export async function submitUpdatedTaskLength(
  collectionName,
  orderId,
  formData
) {
  const docRef = doc(db, collectionName, orderId)
  const data = await updateDoc(docRef, formData)
}

export async function addMsgToDatabase(collectionName, formData) {
  const docRef = await addDoc(collection(db, collectionName), formData)
}

export async function getUsersForMessageModalInitialLoad(
  collectionName,
  params
) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef)

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

export async function getUserForSendMessagePush(collectionName, params) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, where('agentUid', '==', params))

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    console.log(users)
    return users
  } catch (error) {
    console.log(error)
  }
}

export async function getAgentForUpdatingMessagesArrayNumber(
  collectionName,
  params
) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, where('agentUid', '==', params))

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      console.log(doc.data())
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

export async function getAgentMessages(collectionName, params) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, where('agentUid', '==', params))

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

// used in chart dash
export async function getAllCustomersForProfilePageCompanyStats(
  collectionName,
  params
) {
  const authState = await getCurrentAuthState()
  const orgId = authState.claims.orgId

  try {
    const collectionRef = collection(db, collectionName)

    const q = query(collectionRef, where('orgId', '==', orgId))

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    return users
  } catch (error) {
    console.log(error)
  }
}

export async function fetchAgentDataForProfileHeader(collectionName, params) {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, where('agentUid', '==', params))

    const querySnap = await getDocs(q)

    const users = []
    querySnap.forEach((doc) => {
      return users.push({
        id: doc.id,
        data: doc.data(),
      })
    })
    // console.log(users);
    return users
  } catch (error) {
    console.log(error)
  }
}

export function calculateCompanyTotals(statsData) {
  const companyTotals = {}
  for (const personStats of statsData) {
    const company = personStats.data.company

    if (!companyTotals[company]) {
      companyTotals[company] = 0
    }
    companyTotals[company] += personStats.data.amountSpent
  }
  return companyTotals
}

// completed in two stages
export function sumByCompany(peopleAndCompanies) {
  // Create a map of company names to total amount spent.
  const companyTotals = new Map()
  for (const person of peopleAndCompanies) {
    // console.log(person)
    // console.log(peopleAndCompanies)
    const company = person.data.company
    const amount = person.data.amountSpent
    // console.log(company)
    // console.log(amount) // calculates the amountSpent in stats

    if (!companyTotals.has(company)) {
      companyTotals.set(company, amount)
    } else {
      companyTotals.set(company, companyTotals.get(company) + amount)
    }
  }

  // Convert the map to an array of objects with the same format as the input data.
  const companyTotalsArray = []
  for (const [company, total] of companyTotals.entries()) {
    companyTotalsArray.push({
      company,
      amount: total,
    })
  }

  return companyTotalsArray
}

export const getAllOrders = async () => {
  // if (!orgId) return
  const authState = await getCurrentAuthState()
  const orgId = authState.claims.orgId

  const data = []
  // Get the current year
  const currentYear = new Date().getFullYear()

  // Create a query with where clause
  const q = query(
    collection(db, 'orders'),
    where('dateOfOrder', '>=', `01/01/${currentYear}`),
    where('dateOfOrder', '<=', `31/12/${currentYear}`),
    where('orgId', '==', orgId)
  )

  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    // Optional: Double check the year in JavaScript if needed
    const orderDate = doc.data().dateOfOrder.split(',')[0] // Gets "19/01/2025"
    const orderYear = orderDate.split('/')[2] // Gets "2025"

    if (orderYear === currentYear.toString()) {
      data.push(doc.data())
    }
  })

  return data
}

export const getAllCustomers = async () => {
  const authState = await getCurrentAuthState()
  const orgId = authState.claims.orgId

  const data = []
  // Get the current year
  const currentYear = new Date().getFullYear()

  const q = query(collection(db, 'customers'), where('orgId', '==', orgId))

  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    // Optional: Double check the year in JavaScript if needed
    data.push(doc.data())
  })

  return data
}

// *** FILTERING PIPELINE ***
// prevents unnecessary check
// First, verify this is a current year order
// Think of it like a funnel,
// where each level filters out orders that couldn't possibly match the more specific time criteria:
// It's like a security checkpoint system:

// The nested if statements create a data drilling or "drill-down" pattern, which is a
// fundamental concept in data analysis.
//  we're drilling down through time periods:
// year level > month level > week level > day level > hour level

// aggregated data
export const getAllOrdersStructured = async () => {
  const authState = await getCurrentAuthState()
  const orgId = authState.claims.orgId

  // Initialize result object with all our time-based arrays
  const result = {
    yearOrders: [],
    monthOrders: [],
    weekOrders: [],
    todayOrders: [],
    hourOrders: [], // New array for current hour's orders
  }

  // Get current date and time information
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const todayDate = now.getDate()
  const currentHour = now.getHours() // Get current hour (0-23)
  // console.log(currentHour)

  // Calculate week boundaries
  const curr = new Date()
  const first = curr.getDate() - curr.getDay()
  const last = first + 6

  const weekStart = new Date(curr.setDate(first))
  const weekEnd = new Date(curr.setDate(last))
  weekStart.setHours(0, 0, 0, 0)
  weekEnd.setHours(23, 59, 59, 999)

  // Create query for the current year
  const q = query(
    collection(db, 'orders'),
    where('dateOfOrder', '>=', `01/01/${currentYear}`),
    where('dateOfOrder', '<=', `31/12/${currentYear}`),
    where('orgId', '==', orgId)
  )

  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    const orderData = doc.data()

    // Parse the date and time from the order
    // First, split into date and time parts
    const [datePart, timePart] = orderData.dateOfOrder.split(',')
    // console.log(timePart)
    // Parse the date
    const [day, month, year] = datePart.split('/')
    const orderDate = new Date(year, month - 1, day)

    // Parse the time if it exists
    let orderHour = null
    if (timePart) {
      // Assuming time is in§ format "HH:MM" or "HH:MM:SS"
      const [hours] = timePart.trim().split(':')
      // console.log(hours)
      orderHour = parseInt(hours)
    }

    if (orderDate.getFullYear() === currentYear) {
      result.yearOrders.push(orderData)

      // Check if this is a current month order
      if (orderDate.getMonth() + 1 === currentMonth) {
        result.monthOrders.push(orderData)
      }

      // Check if order falls within current week
      if (orderDate >= weekStart && orderDate <= weekEnd) {
        result.weekOrders.push(orderData)
      }

      // Check if order is from today
      if (
        orderDate.getDate() === todayDate &&
        orderDate.getMonth() + 1 === currentMonth &&
        orderDate.getFullYear() === currentYear
      ) {
        result.todayOrders.push(orderData)

        // If we have a valid hour and it matches current hour, add to hourOrders
        if (orderHour !== null && orderHour === currentHour) {
          result.hourOrders.push(orderData)
        }
      }
    }
  })

  return result
}

export async function getProducts(params) {
  const data = []

  const q = query(collection(db, 'products'), where('show', '==', true))

  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    const docObj = {
      id: doc.id,
      data: doc.data(),
    }
    data.push(docObj)
  })

  return data
}

//
export async function updateOrder(orderId, formData) {
  const docRef = doc(db, 'orders', orderId)
  try {
    await updateDoc(docRef, formData)
    const updatedDoc = await getDoc(docRef)
    return updatedDoc.data()
  } catch (error) {
    console.error('Error updating order:', error)
    throw error // Propagate error to caller
  }
}

export async function getManagers(orgId) {
  // console.log(orgId)
  const data = []

  // 2 = manager
  const accessLevel = 2
  try {
    const q = query(
      collection(db, 'agents'),
      where('roleLevel', '>=', accessLevel),
      where('orgId', '==', orgId)
    )

    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      const dataObj = {
        id: doc.id,
        data: doc.data(),
      }
      data.push(dataObj)
    })
  } catch (error) {
    console.log(error)
  }

  return data
}

//  get all org agents
export async function getAgents(orgId) {
  // console.log(orgId)
  const data = []

  try {
    const q = query(collection(db, 'agents'), where('orgId', '==', orgId))

    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      const dataObj = {
        id: doc.id,
        data: doc.data(),
      }
      data.push(dataObj)
    })
  } catch (error) {
    console.log(error)
  }

  return data
}

// get by role level
export async function getAllAgents(orgId, roleLevel) {
  const data = []

  try {
    const q = query(
      collection(db, 'agents'),
      where('orgId', '==', orgId),
      where('roleLevel', '<=', roleLevel)
    )

    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      const dataObj = {
        id: doc.id,
        data: doc.data(),
      }
      data.push(dataObj)
    })
  } catch (error) {
    console.log(error)
  }

  return data
}

// get doc with hard array first
// where('country', 'in', ['USA', 'Japan'])
export async function getAgentsCustomers(orgId, roleLevel) {
  const data = []

  try {
    const q = query(
      collection(db, 'customers'),
      where('orgId', '==', orgId),
      // if agent repTo higher manager
      where('docAccessLevel', '<=', roleLevel)
    )

    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      const dataObj = {
        id: doc.id,
        data: doc.data(),
      }
      data.push(dataObj)
    })
  } catch (error) {
    console.log(error)
  }

  return data
}

export async function getAgentCustomersByID(orgId, agentId, roleLevel) {
  const data = []

  try {
    const q = query(
      collection(db, 'customers'),
      where('orgId', '==', orgId),
      // change to docOwner
      where('agentUid', '==', agentId),
      // if agent repTo higher manager
      where('docAccessLevel', '<=', roleLevel)
    )

    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      const dataObj = {
        id: doc.id,
        data: doc.data(),
      }
      data.push(dataObj)
    })
  } catch (error) {
    console.log(error)
  }

  return data
}

export async function getAgent(id) {
  try {
    const docRef = doc(db, 'agents', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      // console.log('Document data:', docSnap.data())
      return { success: true, data: docSnap.data(), id: docSnap.id }
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getDocument(id, collectionName) {
  const docRef = doc(db, collectionName, id)
  const docSnap = await getDoc(docRef)
  const data = docSnap.data()

  if (docSnap.exists()) {
    return docSnap.data()
  }
}

// --1: get manager with logged in claims id
// --2:
// --1:
export async function getTeamData(managerId) {
  const data = []
  // 1 get agent
  const agentRef = doc(db, 'agents', managerId)
  const agentSnap = await getDoc(agentRef)

  if (agentSnap.exists()) {
    // console.log('Document data:', agentSnap.data())
    const subArr = agentSnap.data().subordinates
    // 2 get cusomers collection
    const q = query(collection(db, 'customers'))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      // find all customers where reportsTo.id matches the logged in user
      if (subArr.includes(doc.data().reportsTo.id)) {
        const obj = { id: doc.id, data: doc.data() }
        // push each customer to dataArray
        data.push(obj)
      }
    })
    // final return
    return { data: agentSnap.data(), subArr, data }
  }
}

export async function updateAgentPermissions(agentId, updatedPermissions) {
  try {
    const agentRef = doc(db, 'agents', agentId)

    // Set the "capital" field of the city 'DC'
    await updateDoc(agentRef, {
      permissions: updatedPermissions,
    })
  } catch (error) {
    console.log(error)
  }
}

// ===== test  =====
export async function getAgentById(agentId) {
  try {
    const docRef = doc(db, 'agents', agentId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      console.log(`No agent found with ID: ${agentId}`)
      return null
    }
  } catch (error) {
    console.error(`Error fetching agent ${agentId}:`, error)
    return null
  }
}

// get managers with a sub array
export async function managersWithSubs(orgId, roleLevel) {
  const data = []

  try {
    // Use array-contains-any or array-not-empty constraint
    // Option 1: Check if the array is not empty (requires a different approach)
    const q = query(
      collection(db, 'agents'),
      where('orgId', '==', orgId)
      // where('roleLevel', '<=', roleLevel)
      // Firestore doesn't have a direct "array not empty" query operator
    )

    const querySnapshot = await getDocs(q)

    // Filter results after fetching to find agents with non-empty subordinates array
    querySnapshot.forEach((doc) => {
      const agentData = doc.data()

      // Check if subordinates array exists and has items
      if (
        agentData.subordinates &&
        Array.isArray(agentData.subordinates) &&
        agentData.subordinates.length > 0
      ) {
        const dataObj = {
          id: doc.id,
          data: agentData,
        }
        data.push(dataObj)
      }
    })
  } catch (error) {
    console.log(error)
  }

  return data
}

/**
 * Fetches documents from Firestore that belong to a specific customer
 * @param {string} custId - The customer ID to filter documents by
 * @returns {Promise<Array>} - A promise that resolves to an array of document objects
 */
export const getDocumentsByCustId = async (custId) => {
  try {
    // Initialize Firestore

    // Create a reference to the documents collection
    const documentsRef = collection(db, 'documents')

    // Create a query against the collection
    const q = query(documentsRef, where('custId', '==', custId))

    // Execute the query
    const querySnapshot = await getDocs(q)

    // Map the results to an array of document objects
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(
      `Retrieved ${documents.length} documents for customer ${custId}`
    )
    return documents
  } catch (error) {
    console.error('Error fetching documents:', error)
    throw error // Re-throw to allow handling by the caller
  }
}

export async function getAllAgentsForChat(orgId) {
  const data = []
  const q = query(collection(db, 'agents'), where('orgId', '==', orgId))

  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    console.log(doc.id, ' => ', doc.data())
    const dataObj = { id: doc.id, data: doc.data() }
    data.push(dataObj)
  })

  return data
}
