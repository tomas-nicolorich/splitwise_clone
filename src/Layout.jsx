import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { LogOut, PieChart, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import SetupProfileModal from "./components/auth/SetupProfileModal";
import ProfileModal from "./components/auth/ProfileModal";
import { useAuth } from "./contexts/AuthContext";

export default function Layout({ children, currentPageName }) {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            <style>{`
        :root {
          --color-primary: #1e293b;
          --color-accent: #6366f1;
          --color-accent-light: #818cf8;
        }
      `}</style>

            <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                                <PieChart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Calculoides</span>
                        </Link>

                        <div className="hidden sm:flex items-center gap-4">
                            <Link
                                to={createPageUrl("Dashboard")}
                                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                My Groups
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDarkMode(!darkMode)}
                                className="text-slate-600 dark:text-slate-300"
                            >
                                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </Button>
                            {user && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setProfileOpen(true)}
                                        className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center hover:ring-2 hover:ring-indigo-500 transition-all overflow-hidden"
                                    >
                                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                        </span>

                                    </button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => logout()}
                                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="sm:hidden border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 space-y-2">
                        <Link
                            to={createPageUrl("Dashboard")}
                            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                            onClick={() => setMenuOpen(false)}
                        >
                            My Groups
                        </Link>
                        {user && (
                            <button
                                onClick={() => {
                                    setProfileOpen(true);
                                    setMenuOpen(false);
                                }}
                                className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Profile
                            </button>
                        )}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                        >
                            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <button
                            onClick={() => logout()}
                            className="block py-2 text-sm font-medium text-slate-500 dark:text-slate-400"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </nav>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {children}
            </main>
            <SetupProfileModal />
            <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
        </div>
    );
}
