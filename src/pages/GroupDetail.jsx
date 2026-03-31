import React, { useState, useEffect } from "react";
import { base44 } from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
import { useAuth } from "../lib/AuthContext";

export default function GroupDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get("id");
    const { user } = useAuth();
    const [showInvite, setShowInvite] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const queryClient = useQueryClient();

    const { data: group, isLoading: groupLoading } = useQuery({
        queryKey: ["group", groupId],
        queryFn: async () => {
            const groups = await base44.entities.Group.filter({ id: groupId });
            return groups[0];
        },
        enabled: !!groupId,
    });

    const { data: members = [], isFetching: isFetchingMembers } = useQuery({
        queryKey: ["members", group?.members],
        queryFn: async () => {
            if (!group?.members?.length) return [];
            return base44.entities.Users.filter({ id: { $in: group.members } });
        },
        enabled: !!group?.members?.length,
    });

    const { data: incomes = [], isFetching: isFetchingIncomes } = useQuery({
        queryKey: ["incomes", groupId],
        queryFn: () => base44.entities.Income.filter({ group_id: groupId }),
        enabled: !!groupId,
    });

    const { data: categories = [], isFetching: isFetchingCategories } = useQuery({
        queryKey: ["categories", groupId],
        queryFn: () => base44.entities.BudgetCategory.filter({ group_id: groupId }),
        enabled: !!groupId,
    });

    const { data: expenses = [], isFetching: isFetchingExpenses } = useQuery({
        queryKey: ["expenses", groupId],
        queryFn: () => base44.entities.Expense.filter({ group_id: groupId }, "-date"),
        enabled: !!groupId,
    });

    const refreshIncomes = () => queryClient.invalidateQueries({ queryKey: ["incomes", groupId] });
    const refreshCategories = () => queryClient.invalidateQueries({ queryKey: ["categories", groupId] });
    const refreshExpenses = () => queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
    const refreshMembers = () => {
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
        queryClient.invalidateQueries({ queryKey: ["members", group?.members] });
    };

    const refreshAll = () => {
        refreshIncomes();
        refreshCategories();
        refreshExpenses();
        refreshMembers();
    };

    const handleDeleteGroup = async () => {
        // Delete all related data
        for (const income of incomes) {
            await base44.entities.Income.delete(income.id);
        }
        for (const cat of categories) {
            await base44.entities.BudgetCategory.delete(cat.id);
        }
        for (const expense of expenses) {
            await base44.entities.Expense.delete(expense.id);
        }
        await base44.entities.Group.delete(group.id);
        window.location.href = createPageUrl("Dashboard");
    };

    if (groupLoading || !user) {
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

    const isOwner = group.members?.[0] === user.id;

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
                        <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                            <Target className="w-4 h-4 mr-1.5" />
                            <span className="hidden sm:inline">Saving Goal</span>
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInvite(true)}
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        <UserPlus className="w-4 h-4 mr-1.5" />
                        <span className="hidden sm:inline">Invite</span>
                    </Button>
                    {isOwner && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Members strip */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                {members.map((member, idx) => (
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
                            {idx === 0 && (
                                <span className="text-indigo-500 dark:text-indigo-400 ml-1">• Owner</span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                {/* Left Column: Data Entry */}
                <div className="space-y-4 sm:space-y-6">
                    <IncomeSection
                        group={group}
                        incomes={incomes}
                        user={user}
                        members={members}
                        onRefresh={refreshIncomes}
                        onRefreshMembers={refreshMembers}
                        loading={isFetchingIncomes || isFetchingMembers}
                    />
                    <RemainingBalanceSection
                        categories={categories}
                        incomes={incomes}
                        members={members}
                        expenses={expenses}
                        loading={isFetchingIncomes || isFetchingCategories || isFetchingMembers || isFetchingExpenses}
                    />
                    <ExpensesSection
                        group={group}
                        expenses={expenses}
                        categories={categories}
                        user={user}
                        members={members}
                        onRefresh={refreshExpenses}
                        loading={isFetchingExpenses || isFetchingMembers}
                    />
                    <BudgetTransfersSection
                        expenses={expenses}
                        members={members}
                        loading={isFetchingExpenses || isFetchingMembers}
                    />
                </div>

                {/* Right Column: Analysis & Planning */}
                <div className="space-y-4 sm:space-y-6">
                    <BudgetSection
                        group={group}
                        categories={categories}
                        incomes={incomes}
                        expenses={expenses}
                        members={members}
                        onRefresh={refreshAll}
                        loading={isFetchingCategories || isFetchingIncomes || isFetchingExpenses || isFetchingMembers}
                    />
                </div>
            </div>



            <InviteMemberDialog
                open={showInvite}
                onOpenChange={setShowInvite}
                group={group}
                onMemberAdded={refreshAll}
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
                            onClick={handleDeleteGroup}
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
