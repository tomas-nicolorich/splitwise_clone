import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Loader2, Trash2, Target } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import InviteMemberDialog from "../components/group-detail/InviteMemberDialog";
import IncomeSection from "../components/group-detail/IncomeSection";
import BudgetSection from "../components/group-detail/BudgetSection";
import ExpensesSection from "../components/group-detail/ExpensesSection";
import BudgetTransfersSection from "../components/group-detail/BudgetTransfersSection";
import RemainingBalanceSection from "../components/group-detail/RemainingBalanceSection";
import { useAuth } from "../contexts/AuthContext";
import { GroupProvider, useGroup } from "../contexts/GroupContext";

function GroupDetailContent() {
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get("id");
    const { user } = useAuth();
    const [showInvite, setShowInvite] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { group, isLoading } = useGroup();

    if (isLoading || !user) {
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
                <Link to={createPageUrl("Dashboard")} className="text-indigo-600 text-sm mt-2 inline-block">
                    Go back to Dashboard
                </Link>
            </div>
        );
    }

    const isOwner = group.ownerId === user.id;

    return (
        <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Link to={createPageUrl("Dashboard")}>
                    <Button variant="ghost" size="icon" className="shrink-0">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {group.name}
                    </h1>
                    {group.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{group.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Link to={`/SavingTarget?id=${groupId}`}>
                        <Button variant="indigo" size="sm">
                            <Target className="w-4 h-4 mr-1.5" />
                            <span className="hidden sm:inline">Saving Goal</span>
                        </Button>
                    </Link>
                    <Button
                        variant="indigo"
                        size="sm"
                        onClick={() => setShowInvite(true)}
                    >
                        <UserPlus className="w-4 h-4 mr-1.5" />
                        <span className="hidden sm:inline">Invite</span>
                    </Button>
                    {isOwner && (
                        <Button
                            variant="destructive-outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Members strip */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                {(group.membersList || []).map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                    >
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                                {member.name[0].toUpperCase()}
                            </span>
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {member.name}
                            {group.members?.[0] === member.id && (
                                <span className="text-indigo-500 dark:text-indigo-400 ml-1">• Owner</span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                {/* Left Column: Data Entry */}
                <div className="space-y-4 sm:space-y-6">
                    <IncomeSection />
                    <RemainingBalanceSection />
                    <ExpensesSection />
                    <BudgetTransfersSection />
                </div>

                {/* Right Column: Analysis & Planning */}
                <div className="space-y-4 sm:space-y-6">
                    <BudgetSection />
                </div>
            </div>



            <InviteMemberDialog
                open={showInvite}
                onOpenChange={setShowInvite}
                groupId={groupId}
            />

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Group</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this group, all income entries, and budget categories. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            // onClick={actions.deleteGroup}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function GroupDetail() {
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get("id");
    return (
        <GroupProvider groupId={groupId}>
            <GroupDetailContent />
        </GroupProvider>
    );
}
