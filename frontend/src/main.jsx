import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { CommandCenterProvider } from './context/CommandCenterContext'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <CommandCenterProvider>
          <AuthProvider>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <App />
          </AuthProvider>
        </CommandCenterProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>,
)