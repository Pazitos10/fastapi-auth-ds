import type { User } from "./UserTypes";

export interface LoginData {
    username: string;
    password: string;
}

export interface RegisterData extends LoginData {
    email: string
}

export interface ResetPasswordData {
    current_password: string,
    new_password: string
}

export interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    setIsLoading: (value: boolean | null) => void;
    setError: (value: string | null) => void;
    login: (loginData: LoginData) => Promise<boolean>;
    logout: () => Promise<void>;
    register: (registerData: RegisterData) => Promise<boolean>;
    resetPassword: (resetPasswordData: ResetPasswordData) => Promise<boolean>;
}

export interface ValidateUserData {
    access_token: string | null;
}