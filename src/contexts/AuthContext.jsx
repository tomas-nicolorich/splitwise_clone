import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { base44 } from '@/api/client';

/**
 * @typedef {Object} AuthContextValue
 * @property {any} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoadingAuth
 * @property {boolean} isLoadingPublicSettings
 * @property {Error|null} authError
 * @property {function} logout
 * @property {function} updateMe
 * @property {function} navigateToLogin
 * @property {function} checkAppState
 */

/** @type {React.Context<AuthContextValue>} */
const AuthContext = createContext(/** @type {AuthContextValue} */ ({}));

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        // Listen for auth changes - this will also trigger INITIAL_SESSION on setup
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            
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

    const updateMe = async (data) => {
        const updatedUser = await base44.auth.updateMe(data);
        // Refresh local user state
        const session = (await supabase.auth.getSession()).data.session;
        const fullUser = await base44.auth.me(session);
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
            checkAppState: async () => {} // Simplified for now
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
