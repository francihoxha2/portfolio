import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist/wght.css'
import '@fontsource-variable/space-grotesk/wght.css'
import './index.css'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/global.css'
import './styles/utilities.css'
import './styles/motion.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
