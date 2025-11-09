import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import AuthLayout from './layouts/AuthLayout.tsx';
//import './index.css'
import App from './App.tsx'
import { Login, Register, RecuperarPassword } from './features/auth';
import { UserProvider } from './context/UserContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route element={<AuthLayout />}>
            <Route path="iniciar-sesion" element={<Login />} />
            <Route path="crear-cuenta" element={<Register />} />
            <Route path="recuperar-contraseña" element={<RecuperarPassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>,
)
