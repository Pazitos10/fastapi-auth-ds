import axios, { AxiosError } from 'axios';
import { createContext, useCallback, useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import type { AuthContextType, LoginData, RegisterData, ResetPasswordData } from "../types/AuthTypes";
import type { User } from "../types/UserTypes";
import { API_BASE_URL, REFRESH_TOKEN_URL, LOGIN_API_URL, VALIDATE_USER_URL, USER_API_URL, LOGOUT_API_URL, REGISTER_API_URL, RESET_PASSWORD_API_URL } from "../constants/api";

const defaultContextValue: AuthContextType = {
    currentUser: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    setIsLoading: () => null,
    setError: () => null,
    login: async () => false,
    logout: async () => null,
    register: async () => false,
    resetPassword: async () => false
}

const AuthContext = createContext<AuthContextType>(defaultContextValue);
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>();
    const tokenRefreshedRef = useRef(false);
    const isRefreshingRef = useRef(false);
    const api = useMemo(() => axios.create({
        baseURL: API_BASE_URL,
        timeout: 5000,
    }), []);


    const fetchCurrentUser = useCallback(async (userId: string, tempToken: string | null = null) => {
        const headers = tempToken ? { Authorization: `Bearer ${tempToken}` } : {};
        const response = await api.get(`${USER_API_URL}/${userId}`, { headers: headers, withCredentials: true });
    
        setCurrentUser(response.data);
        setIsAuthenticated(true);
        setError(null);
    }, [setCurrentUser, setIsAuthenticated, setError]);

    useEffect(() => {
        const validateUser = async () => {
            try {
                setIsLoading(true);
                let res = await api.get(`${VALIDATE_USER_URL}`, { withCredentials: true });
                setToken(res.data.access_token);
                await fetchCurrentUser(res.data.user_id, res.data.access_token);
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
        // Añadiremos el header "Authorization: Bearer <access token>"" en cada request que hagamos a la api.
        const authInterceptor = api.interceptors.request.use(
            (config) => {
                // Solo agregamos la cabecera Authorization si no estamos en el endpoint de login o refresh token.
                const isAuthEndpoint = [LOGIN_API_URL, REFRESH_TOKEN_URL].some(
                    url => config.url?.endsWith(url)
                );

                if (!isAuthEndpoint && token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                config.withCredentials = true;

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
                
                setError(null);
                if ((error.response.status == 403 || error.response.status == 401) && originalRequest.url != REFRESH_TOKEN_URL) {
                    try {
                        const response = await api.put(REFRESH_TOKEN_URL);
                        setToken(response.data.access_token);
                        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                        tokenRefreshedRef.current = true;
                        return api(originalRequest, { withCredentials: true });
                    }
                    catch (err) {
                        const refreshError = err as AxiosError;
                        console.log(refreshError.response?.data.detail);
                        setError(refreshError.response?.data.detail);
                        setToken(null);
                        setIsAuthenticated(false);
                        //setIsLoading(false);
                    } 
                }
                return Promise.reject(error);
            }
        )

        return () => {
            api.interceptors.response.eject(refreshInterceptor);
        };
    }, [token, setToken, setIsAuthenticated, setError]);


    const login = useCallback(async (loginData: LoginData): Promise<boolean> => {
        if (!loginData) return false;

        setIsLoading(true);
        setError(null);

        if (currentUser) {
            setIsLoading(false);
            setIsAuthenticated(true);
            return true;
        }

        try {
            const form = new FormData();
            form.append("username", loginData.username);
            form.append("password", loginData.password);

            const response = await api.postForm(`${LOGIN_API_URL}`, form, { withCredentials: true });
            setToken(response.data.access_token);
            await fetchCurrentUser(response.data.user_id, response.data.access_token);
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Ocurrió un problema al iniciar sesión';
            setError(errorMessage);
            setCurrentUser(null);
            return false;
        } finally {
            setIsLoading(false);
        }

    }, [currentUser, fetchCurrentUser, setToken, setCurrentUser, setIsAuthenticated, setError, setIsLoading]);

    const logout = async (): Promise<void> => {
        await api.delete(LOGOUT_API_URL, { withCredentials: true });
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const register = useCallback(async (registerData: RegisterData): Promise<boolean> => {
        if (!registerData) return false;

        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post(`${REGISTER_API_URL}`, registerData, { withCredentials: true });
            console.log(res);
            setToken(null);
            setCurrentUser(null);
            setIsAuthenticated(false);
            return true;
        } catch (err: any) {
            console.log(err);
            const errorMessage = err.response?.data?.detail || 'Ocurrió un problema al crear la cuenta';
            setError(errorMessage);
            setCurrentUser(null);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [setToken, setCurrentUser, setIsAuthenticated, setError, setIsLoading]);

    const resetPassword = useCallback(async (resetPasswordData: ResetPasswordData): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post(`${RESET_PASSWORD_API_URL}`, resetPasswordData, { withCredentials: true });
            console.log({ res: res.data.msg });
            return true;
        } catch (err: any) {
            console.log({ err: err.response.data })
            const errorMessage = err.response?.data?.detail || 'Ocurrió un problema al cambiar la contraseña de la cuenta';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [setError, setIsLoading]);

    return (
        <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, setIsLoading, error, setError, login, logout, register, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export {
    AuthContext,
    AuthProvider,
    defaultContextValue
}