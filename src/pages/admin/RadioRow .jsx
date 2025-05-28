import React from 'react'

const RadioRow = ({
  name,
  id,
  value,
  checked,
  labelText,
  onChange,
  groupName,
  rowKey,
}) => {
  return (
    <div className="radio-row-wrap">
      <label className="admin-radio-label" htmlFor={id}>
        {labelText}
      </label>
      <input
        className="admin-radio-input"
        onChange={onChange}
        type="radio"
        name={groupName}
        id={id}
        value={value}
        checked={checked}
        data-role={value}
        data-rolelevel={rowKey}
      />
    </div>
  )
}

export default RadioRow
