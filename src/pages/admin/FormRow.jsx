const FormRow = ({ type, name, value, onChange, placeholder, formId = '' }) => {
  // Create unique id by combining formId and name
  const uniqueId = formId ? `${formId}-${name}` : name

  return (
    <div className="form-row">
      <label htmlFor={uniqueId} className="admin-label">
        {name}
      </label>
      <input
        type={type}
        id={uniqueId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="admin-input"
        autoComplete={type === 'password' ? 'current-password' : 'off'}
      />
    </div>
  )
}

export default FormRow
