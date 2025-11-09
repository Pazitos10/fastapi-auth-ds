import './App.css'
import { Outlet } from 'react-router'
import UserProfile from './features/user/UserProfile';

function App() {
  return (
    <UserProfile userId={1} />
  );
}

export default App
