import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/gaegu/latin-400.css'
import './styles.css'
import './hover.css'
import './astra-window.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
