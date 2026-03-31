import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SavingTargetSection from "@/components/group-detail/SavingTargetSection";
import { useAuth } from "@/lib/AuthContext";

export default function SavingTargetPage() {
    const { user } = useAuth();
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get("id");

    const { data: group, isLoading: groupLoading } = useQuery({
        queryKey: ["group", groupId],
        queryFn: async () => {
            const groups = await base44.entities.Group.filter({ id: groupId });
            return groups[0];
        },
        enabled: !!groupId,
    });

    const { data: members = [], isLoading: membersLoading } = useQuery({
        queryKey: ["members", group?.members],
        queryFn: async () => {
            if (!group?.members?.length) return [];
            return base44.entities.Users.filter({ id: { $in: group.members } });
        },
        enabled: !!group?.members?.length,
    });

    const { data: incomes = [], isLoading: incomesLoading } = useQuery({
        queryKey: ["incomes", groupId],
        queryFn: () => base44.entities.Income.filter({ group_id: groupId }),
        enabled: !!groupId,
    });

    if (groupLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-slate-700">Group not found</h2>
                <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block">
                    Go back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link to={`/GroupDetail?id=${groupId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{group?.name}</h1>
                    <p className="text-sm text-slate-500">Saving Target Calculator</p>
                </div>
            </div>

            {members.length === 0 && !membersLoading ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No members in this group</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Add members to use the saving target calculator.</p>
                </div>
            ) : (
                <SavingTargetSection 
                    members={members} 
                    incomes={incomes} 
                    user={user}
                    loading={membersLoading || incomesLoading} 
                />
            )}
        </div>
    );
}
