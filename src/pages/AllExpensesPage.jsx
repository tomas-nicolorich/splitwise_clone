import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ExpensesSection from "@/components/group-detail/ExpensesSection";
import AddExpenseDialog from "@/components/group-detail/AddExpenseDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupData } from "@/hooks/use-group-data";
import { GroupDetailSkeleton } from "@/components/ui/GroupDetailSkeleton";

export default function AllExpensesPage() {
    const { user } = useAuth();
    const [showAdd, setShowAdd] = useState(false);
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get("id");

    const { 
        group, 
        isLoading, 
        isFetching,
        members,
        categories,
        expenses
    } = useGroupData(groupId);

    const filteredExpenses = expenses.filter(expense => {
        const userMatch = selectedUser === "all" || String(expense.paid_by) === String(selectedUser);
        const categoryMatch = selectedCategory === "all" || String(expense.category_id) === String(selectedCategory);
        return userMatch && categoryMatch;
    });

    const isFiltered = selectedUser !== "all" || selectedCategory !== "all";

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <GroupDetailSkeleton />
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
            <div className="flex items-center justify-between gap-3">
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
                <Button onClick={() => setShowAdd(true)} size="sm" className="h-9">
                    <Plus className="w-4 h-4 mr-2" /> Add Expense
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block ml-1">Filter by Member</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="All Members" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Members</SelectItem>
                            {members.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block ml-1">Filter by Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isFiltered && (
                    <div className="pt-5">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setSelectedUser("all"); setSelectedCategory("all"); }}
                            className="h-9 text-slate-500 hover:text-slate-900"
                        >
                            Reset
                        </Button>
                    </div>
                )}
            </div>

            {expenses.length === 0 && !isFetching ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-7 h-7 text-rose-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No expenses yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Add your first expense to track shared costs.</p>
                </div>
            ) : (
                <ExpensesSection 
                    groupId={groupId}
                    expenses={filteredExpenses} 
                    fullMode={true}
                />
            )}

            <AddExpenseDialog 
                open={showAdd}
                onOpenChange={setShowAdd}
                groupId={groupId}
            />
        </div>
    );
}
