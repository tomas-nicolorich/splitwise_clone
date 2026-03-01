import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/client";
import { toast } from "sonner";
import { Loader2, Smile } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "@/lib/supabase-client";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const EMOJIS = ["👤", "🐱", "🐶", "🦊", "🦁", "🐸", "🐵", "🦄", "🌈", "⭐", "🔥", "💎", "🍕", "🎨", "🚀"];

export default function SetupProfileModal() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            // If name is just email prefix or "New User", or if it contains @ (email fallback)
            // we should ask for a real name.
            const isGeneric = !user.name ||
                             user.name === 'New User' ||
                             user.name === user.email?.split('@')[0] ||
                             user.name.includes('@');

            if (isGeneric) {
                setName(user.name === 'New User' ? '' : user.name);
                setOpen(true);
            }
        }
    }, [user]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please enter your name.");
            return;
        }
        if (!password) {
            toast.error("Please enter a password.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            // Update name and icon in DB
            await base44.auth.updateMe({
                full_name: name.trim()
            });

            // Update password in Supabase
            const { error: passwordError } = await supabase.auth.updateUser({
                password: password
            });

            if (passwordError) throw passwordError;

            toast.success("Profile updated!");
            setOpen(false);
            // Refresh page to update everything
            window.location.reload();
        } catch (e) {
            console.error("Error updating profile:", e);
            toast.error(e.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="dark:text-white">Complete Your Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Welcome to SplitWise! Please tell us your name and set a password so you can log in later.
                    </p>
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Your Full Name</Label>
                        <Input
                            placeholder="e.g. Jane Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="off"
                            data-1p-ignore
                            data-lpignore="true"
                            className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Set Password</Label>
                        <Input
                            type="password"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Confirm Password</Label>
                        <Input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={!name.trim() || !password || loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Get Started
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
