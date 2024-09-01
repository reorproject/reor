import React from 'react'

import ReactDOM from 'react-dom/client'
import { toast } from 'react-toastify'
import * as Sentry from '@sentry/electron/renderer'

import App from './App'
import './styles/global.css'
import errorToStringRendererProcess from './utils/error'

Sentry.init({
  integrations: [],
})

window.addEventListener('error', (event) => {
  event.preventDefault()
  toast.error(errorToStringRendererProcess(event.error))
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(event.error)
  }
})

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault()
  toast.error(errorToStringRendererProcess(event.reason))
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(event.reason)
  }
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
