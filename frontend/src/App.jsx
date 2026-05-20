import { AppRoutes } from './routes/AppRoutes.jsx'
import { useEffect } from 'react'
import { installTextRepair } from './utils/textRepair.js'

function App() {
  useEffect(() => {
    installTextRepair()
  }, [])

  return <AppRoutes />
}

export default App
