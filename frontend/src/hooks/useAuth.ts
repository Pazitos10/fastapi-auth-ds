import { useContext } from "react";
import { AuthContext, defaultContextValue } from "../context/AuthContext";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined || context === defaultContextValue) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }

    return context;
};