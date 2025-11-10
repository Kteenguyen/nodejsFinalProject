// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './routes/AppRoutes';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-datepicker/dist/react-datepicker.css'; // 👈 THÊM DÒNG NÀY
// --- IMPORT CÁC CONTEXT ---
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // 👈 ĐÂY LÀ ĐƯỜNG DẪN MỚI (Trở lại như cũ)
// Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <App />
          <ToastContainer autoClose={3000} pauseOnHover={false} />
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
  // </React.StrictMode>
);