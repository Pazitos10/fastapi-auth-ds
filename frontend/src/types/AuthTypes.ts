import type { User } from "./UserTypes";

export interface LoginData {
    username: string;
    password: string;
}

export interface RegisterData extends LoginData {
    email: string
}

export interface RecoverPasswordData {
    email: string
}

export interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (loginData: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    register: (registerData: RegisterData) => Promise<void>;
    // recoverPassword: (recoverPasswordData: RecoverPasswordData) => Promise<null>
}

export interface ValidateUserData {
    access_token: string | null;
}