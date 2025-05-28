import React from 'react'

const CheckboxRow = ({ name, id, checked, labelext, onChange }) => {
  return (
    <div className="check-row-wrap">
      <label className="admin-check-label" htmlFor={id}>
        {labelext}
      </label>
      <input
        className="admin-check-box"
        onChange={onChange}
        type="checkbox"
        name={name}
        id={id}
        checked={checked}
      />
    </div>
  )
}

export default CheckboxRow
