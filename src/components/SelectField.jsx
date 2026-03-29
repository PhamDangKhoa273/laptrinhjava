export function SelectField({ label, name, value, onChange, options, error, disabled = false }) {
  return (
    <label className="form-field">
      <span className="form-label">{label}</span>
      <select className={`form-input ${error ? 'is-error' : ''}`} name={name} value={value} onChange={onChange} disabled={disabled}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}
