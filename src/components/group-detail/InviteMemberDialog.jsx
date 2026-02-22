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
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function InviteMemberDialog({ open, onOpenChange, group, onMemberAdded }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInvite = async () => {
        if (!email.trim()) return;
        const trimmed = email.trim().toLowerCase();

        if (group.owner_email === trimmed || group.members?.includes(trimmed)) {
            toast.error("This person is already in the group.");
            return;
        }

        setLoading(true);
        const updatedMembers = [...(group.members || []), trimmed];
        await base44.entities.Group.update(group.id, { members: updatedMembers });

        // Also invite to the app
        try {
            await base44.users.inviteUser(trimmed, "user");
        } catch (e) {
            // User might already exist
        }

        toast.success(`${trimmed} has been invited!`);
        setEmail("");
        setLoading(false);
        onOpenChange(false);
        onMemberAdded();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                            type="email"
                            placeholder="e.g. partner@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">They'll receive an invite to join the app and this group.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={!email.trim() || loading} className="bg-indigo-600 hover:bg-indigo-700">
                        {loading ? "Inviting..." : "Send Invite"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
