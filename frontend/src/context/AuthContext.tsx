import axios from 'axios';
import { createContext, useCallback, useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import type { AuthContextType, LoginData, RegisterData } from "../types/AuthTypes";
import type { User } from "../types/UserTypes";
import { API_BASE_URL, REFRESH_TOKEN_URL, LOGIN_API_URL, VALIDATE_USER_URL, USER_API_URL, LOGOUT_API_URL, REGISTER_API_URL } from "../constants/api";

const defaultContextValue: AuthContextType = {
    currentUser: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    login: async () => null,
    logout: async () => null,
    register: async () => null,
    // recoverPassword: async () => null
}

const AuthContext = createContext<AuthContextType>(defaultContextValue);
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>();
    const tokenRefreshedRef = useRef(false);
    const api = useMemo(() => axios.create({
        baseURL: API_BASE_URL,
        timeout: 5000,
    }), []);


    const fetchCurrentUser = useCallback(async (userId: string) => {
        const response = await api.get(`${USER_API_URL}/${userId}`, { withCredentials: true });
        setCurrentUser(response.data);
        setIsAuthenticated(true);
        setError(null);
    }, []);

    useEffect(() => {
        const validateUser = async () => {
            try {
                setIsLoading(true);
                let res = await api.get(`${VALIDATE_USER_URL}`, { withCredentials: true });
                setToken(res.data.access_token);
                await fetchCurrentUser(res.data.user_id);
            }
            catch (error) {
                setToken(null);
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
            finally {
                setIsLoading(false);
            }
        }
        validateUser();
    }, []);


    useLayoutEffect(() => {
        const authInterceptor = api.interceptors.request.use(
            (config) => {
                config.headers.Authorization =
                    !tokenRefreshedRef.current && token
                        ? `Bearer ${token}`
                        : config.headers.Authorization;
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        )

        return () => {
            api.interceptors.request.eject(authInterceptor);
        };
    }, [token]);


    useLayoutEffect(() => {
        const refreshInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response.status == 403) {
                    try {
                        const response = await api.put(REFRESH_TOKEN_URL);
                        setToken(response.data.access_token);
                        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                        tokenRefreshedRef.current = true;

                        return api.put(originalRequest, { withCredentials: true });
                    }
                    catch {
                        setToken(null);
                    }
                }
            }
        )

        return () => {
            api.interceptors.response.eject(refreshInterceptor);
        };
    }, [token]);


    const login = useCallback(async (loginData: LoginData): Promise<void> => {
        if (!loginData) return;

        setIsLoading(true);
        setError(null);

        if (currentUser) {
            setIsLoading(false);
            setIsAuthenticated(true);
            return;
        }

        try {
            const form = new FormData();
            form.append("username", loginData.username);
            form.append("password", loginData.password);

            const response = await api.postForm(`${LOGIN_API_URL}`, form, { withCredentials: true });
            setToken(response.data.access_token);
            await fetchCurrentUser(response.data.user_id);
        } catch (err: any) {
            const errorMessage = err?.detail || 'Ocurrió un problema al iniciar sesión';
            setError(errorMessage);
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }

    }, [currentUser]);

    const logout = async (): Promise<void> => {
        await api.delete(LOGOUT_API_URL, { withCredentials: true });
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const register = useCallback(async (registerData: RegisterData): Promise<void> => {
        try {
            const res = await api.post(`${REGISTER_API_URL}`, registerData, { withCredentials: true });
            console.log(res);
            setToken(null);
            setCurrentUser(null);
            setIsAuthenticated(false);

            //await fetchCurrentUser(response.data.user_id);
        } catch (err: any) {
            console.log(err);
            const errorMessage = err?.detail || 'Ocurrió un problema al crear la cuenta';
            setError(errorMessage);
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, error, login, logout , register}}>
            {children}
        </AuthContext.Provider>
    );
};

export {
    AuthContext,
    AuthProvider,
    defaultContextValue
}