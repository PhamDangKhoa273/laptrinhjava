export function LoadingScreen({ message = 'Loading BICAP...' }) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  )
}
