import './App.css'
import { Navigate } from 'react-router';
import { useAuth } from './hooks';
import { MenuPrincipal } from './features/menu/MenuPrincipal';


function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? <MenuPrincipal /> : <Navigate to="/iniciar-sesion" replace /> }
    </>
  )
}

export default App
