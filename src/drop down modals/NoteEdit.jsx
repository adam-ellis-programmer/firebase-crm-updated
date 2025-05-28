import { useContext, useState, useEffect } from 'react'
import CrmContext from '../crm context/CrmContext'

import { useSearchParams, useParams } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getDocument,
  submitUpdatedDocument,
  getCollectionNotes,
} from '../crm context/CrmAction'
import { serverTimestamp } from 'firebase/firestore'

function NoteEdit() {
  const auth = getAuth()
  const params = useParams()

  const [loggedInUser, setLoggedInUser] = useState('')
  const { dispatch, notesData } = useContext(CrmContext)
  const [searchParams, setSearchParams] = useSearchParams()

  const test = searchParams.forEach((item) => {
    return item
  })

  const [formData, setFormData] = useState({
    noteText: '',
    edited: true,
  })

  useEffect(() => {
    const fetchNote = async () => {
      const searchParamsId = searchParams.get('editedNote')
      const data = await getDocument(searchParamsId, 'notes')

      setFormData({ ...data })
    }
    fetchNote()

    onAuthStateChanged(auth, (user) => {
      setLoggedInUser(user.displayName)
    })
  }, [searchParams.get('editItemId')])

  const onMutate = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const { noteText } = formData

  const updatedData = {
    ...formData,
    timeStamp: serverTimestamp(),
    editedAt: new Date().toLocaleString('en-GB'),
    editedBy: loggedInUser,
    edited: true,
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // 1. submit data to the db
    const submitData = async () => {
      const id = searchParams.get('editedNote')
      try {
        await submitUpdatedDocument('notes', id, updatedData)
      } catch (error) {
        console.log(error)
      }
    }

    submitData()
    // 2. get data from the db to display in the DOM
    const getUpdatedData = async () => {
      const updatedData = await getCollectionNotes('notes', params.uid)

      dispatch({ type: 'NOTES_DATA', payload: updatedData })
    }

    getUpdatedData()
    dispatch({ type: 'TOGGLE_EDIT_NOTE', payload: false })
    searchParams.delete('editedNote')
    setSearchParams(searchParams)
  }

  const toggleNoteEdit = () => {
    dispatch({ type: 'TOGGLE_EDIT_NOTE', payload: false })
  }

  // set search params but controlled so not to get an error
  const handleCloseModal = () => {
    toggleNoteEdit()
    // setSearchParams({}); // clears all
    searchParams.delete('editedNote')
    setSearchParams(searchParams)
  }
  return (
    <div className="note-edit-modal">
      <form onSubmit={handleSubmit} className="">
        <textarea
          onChange={onMutate}
          className="note-input"
          type="text"
          id="noteText"
          placeholder="Enter Note"
          value={noteText}
        ></textarea>
        <button className="edit-button" type="submit">
          Edit Note
        </button>
      </form>
      <button onClick={handleCloseModal} className="close-update-order-btn">
        X
      </button>
    </div>
  )
}

export default NoteEdit
