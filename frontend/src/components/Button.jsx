export function Button({ children, type = 'button', variant = 'primary', disabled = false, className = '', ...rest }) {
  return (
    <button className={`button button-${variant} ${className}`.trim()} type={type} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}
