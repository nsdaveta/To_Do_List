import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import  App from './app.jsx'
import { HashRouter } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import { DialogProvider } from './components/Dialog/DialogContext.jsx'
import Dialog from './components/Dialog/Dialog.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DialogProvider>
      <HashRouter>
        <App />
        <Dialog />
      </HashRouter>
    </DialogProvider>
  </StrictMode>
)