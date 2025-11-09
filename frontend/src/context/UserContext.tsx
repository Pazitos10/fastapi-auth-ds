import { createContext, useContext, useCallback,  useState } from "react";
import type { User, UserContextType } from "../types/UserTypes";

const API_BASE_URL: string = "http://localhost:8000";

const defaultContextValue: UserContextType = {
    user: null,
    isLoading: false,
    error: null,
    fetchUser: async () => null
}

const UserContext = createContext<UserContextType>(defaultContextValue);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async (userId: number): Promise<User | null> => {
        if (!userId) return null;
        
        setIsLoading(true);
        setError(null);

        if (user && user.id === userId) {
            setIsLoading(false);
            return user;
        }

        try {
            // Devolvemos el usuario actual si userId no ha cambiado
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error HTTP - status: ${response.status}`);
            }
            const userData: User = await response.json();

            setUser(userData);
            return userData;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch user';
            setError(errorMessage);
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, isLoading, error, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
};

const useUserContext = () => {
    const context = useContext(UserContext);

    if (context === defaultContextValue) {
        throw new Error('useUserContext debe usarse dentro de UserProvider');
    }
    return context;
};

export {
    type UserContextType,
    useUserContext,
    UserProvider,
    defaultContextValue
}