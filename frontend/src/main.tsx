import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import AuthLayout from './layouts/AuthLayout.tsx';
import App from './App.tsx'
import { Login, NoAutorizado, NuevaPassword, RecuperarPassword, Registrar } from './features/auth';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import {Encuestas, InformesAC, InformesSinteticos, PerfilUsuario} from './features/user';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
            
              <Route element={<ProtectedRoute allowedRoles={["alumno"]} />}>
                <Route path="/encuestas" element={<Encuestas />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["docente"]} />}>
                <Route path="/informes" element={<InformesAC />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["secretaria-academica"]} />}>
                <Route path="/informes" element={<InformesSinteticos />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["admin", "alumno", "docente", "secretaria"]} />}>
                <Route path="/" element={<App />} />
                <Route path="/perfil" element={<PerfilUsuario />} />
              </Route>
            
            </Route>

            <Route path="iniciar-sesion" element={<Login />} />
            <Route path="crear-cuenta" element={<Registrar />} />
            <Route path="recuperar-contraseña" element={<RecuperarPassword />} />
            <Route path="nueva-contraseña" element={<NuevaPassword />} />
            <Route path="*" element={<NoAutorizado />}/>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  </StrictMode>,
)
