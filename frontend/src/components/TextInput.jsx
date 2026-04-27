export function TextInput({
  label,
  name,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
}) {
  return (
    <label className="form-field">
      <span className="form-label">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        className={`form-input ${error ? 'is-error' : ''}`}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}
