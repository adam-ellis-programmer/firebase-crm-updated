import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase.config'
const handleChange = (e) => {
  console.log(e.target.value)
}

// component not yet in use
const UpdateReportToData = () => {
  useEffect(() => {
    const getData = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'))
      querySnapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data())
      })
    }
    return () => {}
  }, [])
  return (
    <form className="update-reports-to">
      <select className="reports-to-select" onChange={handleChange} name="" id="">
        <option value="choose">change reports to</option>
        <option value="choose">change reports to</option>
      </select>
    </form>
  )
}

export default UpdateReportToData
