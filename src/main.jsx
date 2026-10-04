import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'

// Clickjacking fallback for hosts that cannot send frame-ancestors/X-Frame-Options:
// if the page is embedded in another site, hide it instead of letting it be overlaid.
if (window.top !== window.self) {
  document.documentElement.style.display = 'none'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
