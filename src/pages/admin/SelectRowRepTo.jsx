const SelectRow = ({ data, onChange, name, text, labelText, value = '', id }) => {
  // Setting a default empty string value
  const uniqueId = `${id}-${value}`
  return (
    <div className="select-row-wrap">
      <label htmlFor={uniqueId} className="admin-label">
        {labelText}
      </label>
      <select
        value={value || ''} // Convert null to empty string
        className="admin-select"
        onChange={onChange}
        name={name}
        id={uniqueId}
      >
        <option value="">{text}</option>
        {data?.map((item) => {
          const { id, data } = item
          const fullName = `${data.firstName} ${data.lastName}`
          return (
            <option
              data-reptoid={data.reportsTo.id}
              key={id}
              data-id={id}
              value={fullName}
              name={fullName}
            >
              {fullName}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default SelectRow
