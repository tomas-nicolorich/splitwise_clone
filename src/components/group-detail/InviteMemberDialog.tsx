import React, { useState } from "react";
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
import { useGroupData } from "@/hooks/use-group-data";

interface InviteMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: string;
}

export default function InviteMemberDialog({ open, onOpenChange, groupId }: InviteMemberDialogProps) {
    const { group, actions } = useGroupData(groupId);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInvite = async () => {
        if (!email.trim() || !email.includes('@')) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (!group) return;
        
        const trimmed = email.trim().toLowerCase();

        setLoading(true);

        try {
            // 1. Invite via Supabase Admin (Backend)
            const inviteResult = await base44.auth.inviteUserByEmail(trimmed);
            const invitedUser = inviteResult.user;

            // 2. Find or create the user record in public.Users
            let dbUsers = await base44.entities.Users.filter({ auth_id: invitedUser.id });
            let userId;

            if (dbUsers.length > 0) {
                userId = dbUsers[0].id;
            } else {
                // Use "New User" as placeholder so they are prompted to set their name on login
                const newUser = await base44.entities.Users.create({
                    auth_id: invitedUser.id,
                    name: "New User"
                });
                userId = newUser.id;
            }

            if (group.members?.includes(userId)) {
                toast.error("This person is already in the group.");
                setLoading(false);
                return;
            }

            await actions.inviteMember(userId);

            toast.success(`Invitation sent to ${trimmed}!`);
            setEmail("");
            onOpenChange(false);
        } catch (e) {
            console.error("Error adding member:", e);
            toast.error("Failed to send invitation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">Invite Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Email Address</Label>
                        <Input
                            type="email"
                            placeholder="e.g. jane@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">An invitation email will be sent to this address.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:text-slate-300 dark:border-slate-700">Cancel</Button>
                    <Button onClick={handleInvite} disabled={!email.trim() || loading} className="bg-indigo-600 hover:bg-indigo-700">
                        {loading ? "Sending..." : "Send Invite"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
