import React from 'react'

import ReactDOM from 'react-dom/client'
import { toast } from 'react-toastify'

import App from './App'
import './styles/global.css'
import errorToStringRendererProcess from './utils/error'

window.addEventListener('error', (event) => {
  event.preventDefault()
  toast.error(errorToStringRendererProcess(event.error))
})

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault()
  toast.error(errorToStringRendererProcess(event.reason))
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
