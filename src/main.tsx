import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.tsx'
import { AccentProvider } from './AccentContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccentProvider>
      <App />
    </AccentProvider>
  </StrictMode>,
)
