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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";



export default function ProfileModal({ open, onOpenChange }) {
    const { user, updateMe } = useAuth();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && open) {
            setName(user.full_name || "");
            setPassword("");
            setConfirmPassword("");
        }
    }, [user, open]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please enter your name.");
            return;
        }

        if (password && password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            // Update profile in DB
            await updateMe({
                full_name: name.trim()
            });

            // Update password in Supabase if provided
            if (password) {
                const { error: passwordError } = await supabase.auth.updateUser({
                    password: password
                });
                if (passwordError) throw passwordError;
            }

            toast.success("Profile updated!");
            onOpenChange(false);
        } catch (e) {
            console.error("Error updating profile:", e);
            toast.error(e.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Your Name</Label>
                        <Input
                            placeholder="e.g. Jane Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">CHANGE PASSWORD (LEAVE BLANK TO KEEP CURRENT)</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="dark:text-slate-300">New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="dark:text-slate-300">Confirm New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Confirm your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:text-slate-300 dark:border-slate-700">Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
