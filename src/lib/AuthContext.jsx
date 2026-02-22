import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        checkUserAuth();
    }, []);

    const checkUserAuth = async () => {
        try {
            console.log('[Auth] Checking user auth...');
            setIsLoadingAuth(true);
            const currentUser = await base44.auth.me();
            console.log('[Auth] User fetched:', currentUser);
            setUser(currentUser);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            console.log('[Auth] Auth check complete.');
        } catch (error) {
            console.error('[Auth] User auth check failed:', error);
            setIsLoadingAuth(false);
            setIsAuthenticated(false);
        }
    };

    const logout = (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);
        base44.auth.logout(shouldRedirect ? window.location.origin : null);
    };

    const navigateToLogin = () => {
        base44.auth.redirectToLogin(window.location.href);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            logout,
            navigateToLogin,
            checkAppState: checkUserAuth
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
