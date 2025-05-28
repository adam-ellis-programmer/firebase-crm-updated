import { useEffect, useState, useContext } from 'react'
import CrmContext from '../crm context/CrmContext'
import { useParams, useSearchParams } from 'react-router-dom'
import { serverTimestamp } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { ReactComponent as EditIcon } from '../icons/edit-icon.svg'

import { toast } from 'react-toastify'
import { newNoteEntry, getCollectionNotes } from '../crm context/CrmAction'
import DataSvgIcon from './DataSvgIcon'
import Loader from '../assets/Loader'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'

function DisplayNotes({ permissions }) {
  const hasPermission = (resource, action) => {
    if (!permissions || !permissions[resource] || !permissions[resource][action]) {
      const msg = `You do not have ${action} permissions for ${resource} data`
      console.log(msg)
      toast.error(msg)
      // console.log(permissions[resource])
      return false
    }
    return true
  }
  const { loggedInUser: user } = useAuthStatusTwo()
  const { dispatch, editNote, notesData } = useContext(CrmContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useParams()

  const [formData, setFormData] = useState({
    noteText: '',
    edited: false,
  })

  const { noteText } = formData
  // get notes
  useEffect(() => {
    const getData = async () => {
      const data = await getCollectionNotes('notes', params.uid)
      dispatch({ type: 'NOTES_LENGTH', payload: data.length })
      dispatch({ type: 'NOTES_DATA', payload: data })
    }

    getData()
  }, [])

  const onDelete = async (id) => {
    await deleteDoc(doc(db, 'notes', id))
    const updatedArr = notesData.filter((note) => note.id !== id)

    dispatch({ type: 'NOTES_LENGTH', payload: updatedArr.length })
    dispatch({ type: 'NOTES_DATA', payload: updatedArr })
  }

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }
  const onSubmit = async (e) => {
    e.preventDefault()
    // FUNCT RET TRUE SO WE INVERT TO GET THE 'RETURN'
    if (!hasPermission('customers', 'create')) return
    const noteData = {
      ...formData,
      noteDate: serverTimestamp(),
      custId: params.uid,
      noteWrittenBy: user.displayName,
      dateOfNote: new Date().toLocaleString('en-GB'),
      agentId: params.agentUid,
      customerName: params.name,
      customerEmail: searchParams.get('email'),
    }

    if (noteText === '') {
      toast('Please enter a note')
      return
    }
    try {
      const data = await newNoteEntry('notes', noteData, params.uid)

      dispatch({ type: 'NOTES_DATA', payload: data })
      dispatch({ type: 'NOTES_LENGTH', payload: data.length })

      setFormData((prevState) => ({
        ...prevState,
        noteText: '',
      }))
    } catch (error) {
      console.log(error)
    }
  }

  const toggleModal = () => {
    if (editNote === false) {
      dispatch({ type: 'TOGGLE_EDIT_NOTE', payload: true })
    }
  }

  const onEdit = (id) => {
    if (!hasPermission('customers', 'update')) return
    toggleModal()
    setSearchParams((prevState) => {
      prevState.set('editedNote', id)
      return prevState
    })
  }

  if (!notesData) {
    return <Loader />
  }

  return (
    <div>
      <div className="form-container">
        <form onSubmit={onSubmit} className="">
          <textarea
            className="note-input"
            type="text"
            id="noteText"
            placeholder="Enter Note"
            onChange={onChange}
            value={noteText}
          ></textarea>

          <div className="page-btn-container">
            <button className="booking-button" type="submit">
              Enter Note
            </button>
          </div>
        </form>
      </div>

      <div className="notes-display-div">
        {/* prettier-ignore */}
        <ul>
          {notesData &&
            notesData.map((item) => (
              <li key={item.id} className="note-item">
                <div className="note-box-top">
                  <span className="note-date-and-agent"> <span>On: {item.data.dateOfNote}  </span>  <span>by {item.data.noteWrittenBy}</span> </span>
                <div className="notes-btn-container">
                <button onClick={()=>onEdit(item.id)} className=""><EditIcon  className="order-edit"/></button>
                <button onClick={() => onDelete(item.id)} className="order-delete"> X </button>
                </div>
                </div>
                <span className="note-span"> {item.data.noteText}</span>
                <div className="note-footer">
                 {item.data.editedBy &&  <span className='note-edit-text'  >Last Edit: {item.data.editedBy}. {item.data.editedAt}</span>} 
                </div>
              </li>
            ))}
        </ul>
      </div>
      {notesData.length < 3 && <DataSvgIcon />}
    </div>
  )
}

export default DisplayNotes
