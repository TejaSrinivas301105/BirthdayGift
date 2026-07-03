import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import emailjs from '@emailjs/browser';

// Initialize EmailJS with public key from .env
const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'n7lRUFeyKGyusRYEG';
if (emailjsPublicKey && emailjsPublicKey !== 'YOUR_PUBLIC_KEY_HERE') {
  emailjs.init(emailjsPublicKey);
  console.log('EmailJS initialized with key:', emailjsPublicKey.substring(0, 8) + '...');
} else {
  console.log('EmailJS not configured - check .env file');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
