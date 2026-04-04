export function Button({ children, type = 'button', variant = 'primary', disabled = false, onClick }) {
  return (
    <button className={`button button-${variant}`} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
