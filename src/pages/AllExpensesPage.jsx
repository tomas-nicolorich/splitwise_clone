import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/Layout";
import ExpensesSection from "@/components/group-detail/ExpensesSection";

export default function AllExpensesPage() {
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

    const { data: members = [] } = useQuery({
        queryKey: ["members", group?.members],
        queryFn: async () => {
            if (!group?.members?.length) return [];
            return base44.entities.Users.filter({ id: { $in: group.members } });
        },
        enabled: !!group?.members?.length,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["categories", groupId],
        queryFn: () => base44.entities.BudgetCategory.filter({ group_id: groupId }),
        enabled: !!groupId,
    });

    const { data: expenses = [], isFetching: isFetchingExpenses, refetch } = useQuery({
        queryKey: ["expenses", groupId],
        queryFn: () => base44.entities.Expense.filter({ group_id: groupId }, "-date"),
        enabled: !!groupId,
    });

    if (groupLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link to={`/GroupDetail?id=${groupId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{group?.name}</h1>
                        <p className="text-sm text-slate-500">All Expenses</p>
                    </div>
                </div>
                <ExpensesSection 
                    group={group} 
                    expenses={expenses} 
                    categories={categories} 
                    members={members} 
                    onRefresh={refetch}
                    loading={isFetchingExpenses}
                    fullMode={true} // Add this to tell the component to show all/different UI
                />
            </div>
        </Layout>
    );
}
