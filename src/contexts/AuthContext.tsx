import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase-client';
import { base44 } from '@/api/client';
import { User } from '@/api/types';

export interface AuthContextValue {
    user: (User & { email?: string, full_name?: string }) | null;
    isAuthenticated: boolean;
    isLoadingAuth: boolean;
    isLoadingPublicSettings: boolean;
    authError: string | null;
    logout: (shouldRedirect?: boolean) => Promise<void>;
    updateMe: (data: any) => Promise<any>;
    navigateToLogin: () => void;
    checkAppState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<(User & { email?: string, full_name?: string }) | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            
            if (!isMounted) return;

            if (session?.user) {
                try {
                    const fullUser = await base44.auth.me(session);
                    if (isMounted) {
                        setUser(fullUser);
                        setIsAuthenticated(true);
                        setAuthError(null);
                    }
                } catch (meError) {
                    console.error('[Auth] Error fetching full user data:', meError);
                    if (isMounted) {
                        setUser(null);
                        setIsAuthenticated(false);
                        setAuthError('User not found in database');
                    }
                }
            } else {
                if (isMounted) {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            
            if (isMounted) {
                setIsLoadingAuth(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const logout = async (shouldRedirect = true) => {
        await base44.auth.logout(shouldRedirect);
    };

    const updateMe = async (data: any) => {
        const updatedUser = await base44.auth.updateMe(data);
        const sessionRes = await supabase.auth.getSession();
        const fullUser = await base44.auth.me(sessionRes.data.session);
        setUser(fullUser);
        return updatedUser;
    };

    const navigateToLogin = () => {
        base44.auth.redirectToLogin();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            logout,
            updateMe,
            navigateToLogin,
            checkAppState: async () => {}
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
