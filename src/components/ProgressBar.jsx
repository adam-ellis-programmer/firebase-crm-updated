import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.config'

const ProgressBar = () => {
  const { uid } = useParams()

  const [progress, setProgress] = useState(0)
  const [activeButton, setActiveButton] = useState(null)
  const [percentage, setPercentage] = useState(0)

  const buttons = [
    { label: 'new', fraction: 0.1 },
    { label: 'converting', fraction: 0.5 },
    { label: 'on board', fraction: 1 },
  ]

  useEffect(() => {
    const getData = async () => {
      const docRef = doc(db, 'customers', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        // console.log('Document data:', docSnap.data())
        const progressValue = docSnap.data().progress
        setProgress(progressValue)
        setPercentage(progressValue) // Set initial percentage value

        // Determine which button should be active based on the progress value
        const activeIndex = buttons.findIndex(
          (button) => button.fraction * 100 === progressValue
        )

        setActiveButton(activeIndex)
      } else {
        console.log('No such document!')
      }
    }

    getData()
  }, [uid])

  function animateValue(currentPercentage, targetPercentage, duration) {
    let startTime = null

    function animateNumber(timeStamp) {
      if (!startTime) startTime = timeStamp
      const progress = timeStamp - startTime // timestamp

      // gets fraction using /
      const percentageAsFraction = Math.min(progress / duration, 1)

      // prettier-ignore
      // 67 - 33 * 1 + 67 linnear interpritation
      const current = currentPercentage + (targetPercentage - currentPercentage) * percentageAsFraction

      console.log(current)

      setPercentage(Math.round(current)) // Update the percentage state

      if (percentageAsFraction < 1) {
        requestAnimationFrame(animateNumber)
      }
    }

    requestAnimationFrame(animateNumber)
  }

  const updateProgress = async (fraction, index) => {
    const width = fraction * 100 + '%'
    console.log(width)
    setProgress(fraction * 100)
    setActiveButton(index) // Set the active button

    const customerRef = doc(db, 'customers', uid)
    await updateDoc(customerRef, {
      progress: fraction * 100,
    })

    const currentPercentage = progress
    const targetPercentage = Math.round(fraction * 100)
    animateValue(currentPercentage, targetPercentage, 500)
  }

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-outer">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="progress-buttons">
        {buttons.map((button, index) => (
          <button key={index} onClick={() => updateProgress(button.fraction, index)}>
            {button.label}
            {activeButton === index && <div className="convert-active-div"></div>}
          </button>
        ))}
      <div className="percentage-div">{percentage}%</div>
      </div>
    </div>
  )
}

export default ProgressBar
