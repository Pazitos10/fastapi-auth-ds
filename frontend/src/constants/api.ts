const API_BASE_URL: string = "https://localhost:8000";
const USER_API_URL: string = `${API_BASE_URL}/users`;
const LOGIN_API_URL: string = `${API_BASE_URL}/auth/token`;
const LOGOUT_API_URL: string = `${API_BASE_URL}/auth/token`;
const REFRESH_TOKEN_URL: string = `${API_BASE_URL}/auth/token`;
const REGISTER_API_URL: string = `${API_BASE_URL}/auth/register`;
const FORGOT_PASSWORD_API_URL: string = `${API_BASE_URL}/auth/forgot-password`;
const PASSWORD_RECOVERY_API_URL: string = `${API_BASE_URL}/auth/password-recovery`;
const VALIDATE_USER_URL: string = `${API_BASE_URL}/auth/validate-user`;

export {
    API_BASE_URL,
    USER_API_URL,
    LOGIN_API_URL,
    LOGOUT_API_URL,
    REGISTER_API_URL,
    REFRESH_TOKEN_URL,
    VALIDATE_USER_URL,
    FORGOT_PASSWORD_API_URL,
    PASSWORD_RECOVERY_API_URL
}