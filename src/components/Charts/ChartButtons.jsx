import React from 'react'
import { useContext } from 'react'
import CrmContext from '../../crm context/CrmContext'

const btnsArr = [
  { id: crypto.randomUUID(), buttonText: 'pie', chartTypt: 'pieChart' },
  { id: crypto.randomUUID(), buttonText: 'line', chartTypt: 'lineChart' },
  { id: crypto.randomUUID(), buttonText: 'bar', chartTypt: 'barChart' },
]

const ChartButtons = () => {
  const { dispatch, profileChartType } = useContext(CrmContext)
  
  const handleChartClick = (type) => {
    dispatch({ type: 'SET_PROFILE_CHART', payload: type })
  }

  return (
    <div className="profile-chart-btn-container">
      {btnsArr.map((btn) => {
        return (
          <button
            key={btn.id}
            onClick={() => handleChartClick(btn.chartTypt)}
            className="profile-chart-btn"
          >
            {btn.buttonText}
          </button>
        )
      })}
    </div>
  )
}

export default ChartButtons
