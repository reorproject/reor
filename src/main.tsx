import React from 'react'

import ReactDOM from 'react-dom/client'
import { toast } from 'react-toastify'

import App from './App'
import './styles/global.css'

function handleError(error: Error | string | unknown) {
  // eslint-disable-next-line no-console
  console.error(error)
  if (error instanceof Error) {
    toast.error(`${error.name}: ${error.message}`)
  } else {
    toast.error('An unknown error occurred')
  }
}

// Handle synchronous errors (browser context)
window.addEventListener('error', (event) => {
  event.preventDefault()
  handleError(event.error)
})

// Handle Promise rejections (browser context)
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault()
  handleError(event.reason)
})

// // Handle synchronous errors (Node.js context)
// process.on('uncaughtException', (error) => {
//   handleError(error, 'Uncaught Exception')
// })

// // Handle Promise rejections (Node.js context)
// process.on('unhandledRejection', (reason, promise) => {
//   handleError(reason, 'Unhandled Rejection')
// })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
