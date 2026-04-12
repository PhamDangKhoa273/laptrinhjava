export function TextAreaField({ label, name, value, onChange, placeholder, error, rows = 4, disabled = false }) {
  return (
    <label className="form-field">
      <span className="form-label">{label}</span>
      <textarea
        className={`form-input form-textarea ${error ? 'is-error' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}
