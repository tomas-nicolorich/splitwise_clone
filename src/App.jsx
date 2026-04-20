import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './pages/PageNotFound';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import UserNotRegisteredError from '@/components/auth/UserNotRegisteredError';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import SavingTargetPage from './pages/SavingTargetPage';
import AllExpensesPage from './pages/AllExpensesPage';
import Login from './pages/Login';
import Layout from './Layout';
import ErrorBoundary from './components/ErrorBoundary';

const AuthenticatedApp = () => {
    const { isLoadingAuth, isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated and not already on login page
    if (!isAuthenticated && location.pathname !== '/login') {
        return <Navigate to="/login" replace />;
    }

    // Redirect to dashboard if authenticated and trying to access login page
    if (isAuthenticated && location.pathname === '/login') {
        return <Navigate to="/" replace />;
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/Dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/GroupDetail" element={<Layout><GroupDetail /></Layout>} />
            <Route path="/SavingTarget" element={<Layout><SavingTargetPage /></Layout>} />
            <Route path="/AllExpenses" element={<Layout><AllExpensesPage /></Layout>} />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};


function App() {
    const isDev = import.meta.env.DEV;

    return (
        <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
                <Router>
                    <ErrorBoundary>
                        <AuthenticatedApp />
                    </ErrorBoundary>
                </Router>
                {isDev && <ReactQueryDevtools initialIsOpen={false} />}
                <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    )
}

export default App
