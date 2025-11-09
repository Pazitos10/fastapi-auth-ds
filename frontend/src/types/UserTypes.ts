export interface User {
    id: number;
    username: string;
    email: string;
    role_id: number;
}

export interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (userId: number) => Promise<User | null>,
}

export interface UseUserHookType { 
  user: User | null; 
  isLoading: boolean; 
  error: string | null;
}

export interface UserProfileProps {
    userId: number;
}
