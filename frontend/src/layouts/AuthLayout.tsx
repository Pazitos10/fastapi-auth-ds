import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks";

const AuthLayout = () => {
    const {isAuthenticated, currentUser, isLoading} = useAuth();

    if (!isAuthenticated || currentUser === null) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    if (isLoading)
        return <div>Cargando datos del usuario...</div>

    return (
        <>
            <Outlet />
        </>
    )
}


export default AuthLayout;