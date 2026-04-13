import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SavingTargetSection from "@/components/group-detail/SavingTargetSection";
import SavingTargetSkeleton from "@/components/group-detail/SavingTargetSkeleton";
import { useAuth } from "@/contexts/AuthContext";

import { useGroupData } from "../hooks/use-group-data";

export default function SavingTargetPage() {
    const { user } = useAuth();
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get("id");

    const { 
        group, 
        isLoading, 
        isFetching,
        members,
        incomes
    } = useGroupData(groupId);

    if (!isLoading && !group) {
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

            {isLoading ? (
                <SavingTargetSkeleton />
            ) : members.length === 0 && !isFetching ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No members in this group</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Add members to use the saving target calculator.</p>
                </div>
            ) : (
                <SavingTargetSection 
                    groupId={groupId}
                />
            )}
        </div>
    );
}
