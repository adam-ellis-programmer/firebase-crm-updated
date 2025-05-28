import { useState, useContext, useEffect } from 'react'
import { serverTimestamp } from 'firebase/firestore'
import { useParams } from 'react-router-dom'
import CrmContext from '../crm context/CrmContext'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { deleteDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { ReactComponent as Check } from '../icons/checkBox.svg'

import {
  addTaskToDatabase,
  getTasksToDisplayInAgentProfile,
  getTaskToToggleCompleted,
  updateTaskToCompleted,
  getAgentToDisplayChangeUpdateTaskLengthData,
} from '../crm context/CrmAction'
import Loader from '../assets/Loader'

function AgentToDoList() {
  const auth = getAuth()

  const [markingDone, setMarkingDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const chars = 300
  const [tasksLength, setTasksLength] = useState(0)
  const [agentName, setAgentName] = useState('')

  const params = useParams()
  const [tasks, setTasks] = useState(null)

  useEffect(() => {
    const getTaskListItems = async () => {
      const data = await getTasksToDisplayInAgentProfile('tasks', params.uid)

      setTasks(data)
      setLoading(false)
      setTasksLength(data?.length || 0)
    }
    getTaskListItems()

    auth.onAuthStateChanged((agent) => {
      if (agent) {
        setAgentName(agent.displayName.split(' ')[0])
      }
    })
  }, [])
  const [formData, setFormData] = useState({
    taskText: '',
    day: '',
    month: '',
    year: '',
    taskLength: 0,
    fullDate: '',
  })

  const months = [
    'January',
    'Febuary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const { taskText, day, month, year, taskLength } = formData

  const onMutate = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value.slice(0, 2),
    }))
  }

  // charactor count for text area
  const onMutateTextArea = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      taskText: e.target.value,
      taskLength: e.target.value.length,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (month > 12) {
      console.log('month cannot be more than 12')
      return
    }

    const newData = {
      ...formData,
      fullDate: `${day}/${month}/${year}`,
      timeStamp: serverTimestamp(),
      agentId: params.uid,
      completed: false,
    }

    // -1 to get the right month as 0 based
    // add formatted date to obj
    months.forEach((monthName, index) => {
      if (index === month - 1) {
        return (newData.formattedDate = `${day}-${monthName}-20${year}`)
      }
    })

    try {
      await addTaskToDatabase('tasks', newData)
      const updatedData = await getTasksToDisplayInAgentProfile('tasks', params.uid)

      const agentProfileData = await getAgentToDisplayChangeUpdateTaskLengthData(
        'users',
        params.uid
      )

      const updatedTaskLength = {
        ...agentProfileData[0]?.data,
        taskLength: updatedData.length,
      }

      setTasksLength(updatedTaskLength.taskLength)
      setTasks(updatedData)
    } catch (error) {
      console.log(error)
    }
  }

  const toggleCompleted = async (id) => {
    setMarkingDone(true)
    try {
      const data = await getTaskToToggleCompleted(id, 'tasks')
      await updateTaskToCompleted(id, data.completed === false ? true : false)
      await getTaskToToggleCompleted(id, 'tasks')

      const newData = await getTasksToDisplayInAgentProfile('tasks', params.uid)
      console.log(newData)

      const filteredData = newData.filter((item) => item.data.completed === false)
      console.log(filteredData.length)

      setTasks(newData)
      setMarkingDone(false)
      // console.log(chars - taskLength) // e.target.value.slice
    } catch (error) {
      console.log(error)
    }
  }

  const handleTaskDelete = async (id) => {
    // return
    await deleteDoc(doc(db, 'tasks', id))
    const updatedData = tasks.filter((item) => item.id !== id)
    setTasks(updatedData)

    try {
      const getAgentProfileToUpdate = await getAgentToDisplayChangeUpdateTaskLengthData(
        'users',
        params.uid
      )

      const updateUserProfileTaskLength = {
        ...getAgentProfileToUpdate[0]?.data,
        taskLength: updatedData.length,
      }

      setTasksLength(updateUserProfileTaskLength.taskLength)
    } catch (error) {
      console.log(error)
    }
  }

  if (loading) {
    return <Loader />
  }
  return (
    <div className="agent-task-list-container">
      <p className="task-list-heading">
        <span className="task-head-span">Hey {agentName}! Enter a new task</span>
      </p>

      <div className="agent-task-form-wrap">
        <form onSubmit={handleSubmit} className="todo-form">
          <textarea
            onChange={onMutateTextArea}
            className="task-list-input-text"
            placeholder="Enter Task and completed date"
            id="taskText"
            value={taskText}
          ></textarea>
          <div className="date-container">
            <span className="task-chars-length">{taskLength} chars</span>
            <div>{chars - taskLength} remaining</div>

            <div className="completed-by-container">
              <div className="task-date-heading">
                <span className="to-be-completed-span">completed by: </span>
              </div>

              <div className="task-inputs">
                {' '}
                <input
                  onChange={onMutate}
                  className="task-list-input-date"
                  type="text"
                  id="day"
                  placeholder="dd"
                  value={day}
                />
                <input
                  onChange={onMutate}
                  className="task-list-input-date"
                  type="text"
                  id="month"
                  placeholder="mm"
                  value={month}
                />
                <input
                  onChange={onMutate}
                  className="task-list-input-date"
                  type="text"
                  id="year"
                  placeholder="yy"
                  value={year}
                />
              </div>
            </div>
          </div>

          <div className="task-list-button-container">
            <button className="task-list-button">enter task</button>
          </div>
        </form>
      </div>
      {/* to do: loop to find outstanding tasks */}
      <div className="task-list-container">
        <p className="task-list-heading">
          <span className="agent-task-name-span">
            Agent Task List For {agentName}
            <span className="agent-task-length-span">{tasksLength}</span>
          </span>
        </p>

        <ul className="task-list-ul">
          {!loading &&
            tasks &&
            tasks.map(({ data, id }) => (
              <li
                key={id}
                className={data.completed ? ' task-item-com task-item' : 'task-item'}
              >
                {data.completed && <Check fill="green" className="check-box" />}
                <div className="task-date-container">
                  <p>
                    {' '}
                    <span>completed by: </span> {data.formattedDate}
                  </p>
                </div>
                <div className="task-text">
                  <p className={data.completed ? 'strike-text' : ''}>{data.taskText}</p>
                </div>

                <div className="task-list-buttons-container">
                  <button
                    onClick={() => toggleCompleted(id)}
                    className={data.completed ? 'task-button-completed' : 'task-button'}
                    disabled={markingDone}
                  >
                    {markingDone
                      ? 'Updating...'
                      : data.completed
                      ? 'Completed'
                      : 'Mark as done'}
                  </button>
                  <button onClick={() => handleTaskDelete(id)} className="task-button">
                    delete
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}

export default AgentToDoList
