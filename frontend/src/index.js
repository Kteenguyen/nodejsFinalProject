// frontend/src/index.js (hoặc main.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './routes/AppRoutes'; // (File AppRoutes.jsx)
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- Import
import { GoogleOAuthProvider } from '@react-oauth/google'; // (Giữ lại nếu dùng Google Login)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        
        {/* 👇 BỌC APP TRONG AUTHPROVIDER 👇 */}
        <AuthProvider> 
          <App />
        </AuthProvider>

      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);