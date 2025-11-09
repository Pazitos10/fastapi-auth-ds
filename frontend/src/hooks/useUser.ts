import { useEffect } from 'react';
import { useUserContext } from '../context/UserContext';
import type { UseUserHookType } from '../types/UserTypes';

export const useUser = (userId: number): UseUserHookType => {
    const { user, isLoading, error, fetchUser } = useUserContext();
    const loadedUserId = user?.id;
    
    useEffect(() => {
        if (!userId || error) return;
        // Pedimos nueva info solo cuando es necesario
        const isDifferentUser = userId !== loadedUserId;
        
        if (isDifferentUser && !isLoading) {
            fetchUser(userId);
        }

    }, [userId, loadedUserId, isLoading, fetchUser]);

    return { user, isLoading, error };
};