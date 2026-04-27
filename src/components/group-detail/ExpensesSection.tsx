import React, { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Receipt, Plus, Trash2, Pencil, List } from "lucide-react";
import { format } from "date-fns";
import AddExpenseDialog from "./AddExpenseDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import SectionCard from "@/components/ui/SectionCard";
import { getUserName } from "@/utils/utils";
import { base44 } from "@/api/client";
import { Expense, BudgetCategory, User } from "@/api/types";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExpenseRowProps {
    expense: Expense;
    categories: BudgetCategory[] | undefined;
    user: User;
    isOwner: boolean;
    members: User[];
    handleEdit: (expense: Expense) => void;
    handleDelete: (id: string) => Promise<void>;
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({ expense, categories, user, isOwner, members, handleEdit, handleDelete }) => {
    const category = categories?.find(c => String(c.id) === String(expense.category_id));
    return (
        <div
            className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors gap-2"
        >
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {expense.description}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
                        {category?.name || "Unknown"}
                    </span>
                    <span>Paid by {getUserName(expense.paid_by, members)}</span>
                    {expense.date && (
                        <span>• {format(new Date(expense.date), "MMM d, yyyy")}</span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    ${Number(expense.amount).toFixed(2)}
                </span>
                {(expense.paid_by === user.id || isOwner) && (
                    <div className="flex items-center">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleEdit(expense)}
                        >
                            <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 hover:text-indigo-500" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleDelete(expense.id)}
                        >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 hover:text-red-500" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ExpensesSectionProps {
    expenses?: Expense[];
    fullMode?: boolean;
}

const ExpensesSection: React.FC<ExpensesSectionProps> = memo(function ExpensesSection({ expenses: propExpenses, fullMode = false }) {
    const { user } = useAuth();
    const { 
        group, 
        expenses: hookExpenses, 
        categories, 
        isLoading 
    } = useGroup();

    const [showAdd, setShowAdd] = useState(false);
    const [showAllExpenses, setShowAllExpenses] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [loadingClear, setLoadingClear] = useState(false);

    const expenses = propExpenses || hookExpenses || [];
    const members = (group as any)?.membersList || [] as User[];
    const isOwner = group?.members?.[0] === user?.id;

    const handleClearAll = async () => {
        if (!group) return;
        setLoadingClear(true);
        try {
            for (const expense of expenses) {
                await base44.entities.Expense.delete(expense.id, group.id);
            }
            setShowAllExpenses(false);
            window.location.reload();
        } catch (e) {
            console.error("Error clearing expenses:", e);
        } finally {
            setLoadingClear(false);
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setShowAdd(true);
    };

    const handleDelete = async (id: string) => {
        if (!group) return;
        await base44.entities.Expense.delete(id, group.id);
        window.location.reload();
    };

    const sortedExpenses = [...expenses]
        .filter(e => !e.description?.startsWith('[BUDGET_TRANSFER]'))
        .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });

    const displayedExpenses = fullMode ? sortedExpenses : sortedExpenses.slice(0, 5);

    const expenseList = (
        <div className="space-y-2">
            {displayedExpenses.map((expense) => (
                <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    categories={categories}
                    user={user}
                    isOwner={isOwner}
                    members={members}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                />
            ))}
            
            {(!fullMode && sortedExpenses.length > 5) && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 w-full" onClick={() => setShowAllExpenses(true)}>
                        View All Expenses
                    </Button>
                </div>
            )}
        </div>
    );

    const emptyState = (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
            No expenses yet. Add one to track shared costs.
        </p>
    );

    const sectionContent = (
        <>
            {expenses.length === 0 ? emptyState : expenseList}

            <AddExpenseDialog 
                open={showAdd}
                onOpenChange={(open) => {
                    setShowAdd(open);
                    if (!open) setEditingExpense(null);
                }}
                editingExpense={editingExpense}
                groupId={group?.id}
            />

            <Dialog open={showAllExpenses} onOpenChange={setShowAllExpenses}>
                <DialogContent className="sm:max-w-2xl dark:bg-slate-800 dark:border-slate-700 h-[80vh] !flex !flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2 shrink-0 border-b dark:border-slate-700">
                        <DialogTitle className="dark:text-white flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-rose-500" />
                            All Expenses
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-6 space-y-2 py-4">
                            {sortedExpenses.map((expense) => (
                                <ExpenseRow
                                    key={expense.id}
                                    expense={expense}
                                    categories={categories}
                                    user={user}
                                    isOwner={isOwner}
                                    members={members}
                                    handleEdit={handleEdit}
                                    handleDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                    {isOwner && expenses.length > 0 && (
                        <div className="p-4 border-t dark:border-slate-700 shrink-0 bg-slate-50 dark:bg-slate-800/50">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="w-4 h-4 mr-2" /> Clear All Expenses
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete all expenses in this group.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={handleClearAll}
                                            className="bg-red-600 hover:bg-red-700"
                                            disabled={loadingClear}
                                        >
                                            {loadingClear ? "Clearing..." : "Delete All"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );

    if (fullMode) {
        return sectionContent;
    }

    return (
        <SectionCard
            title="Expenses"
            icon={Receipt}
            loading={isLoading}
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="indigo" size="sm" className="h-8 text-xs" onClick={() => setShowAllExpenses(true)}>
                        <List className="w-3.5 h-3.5 mr-1" /> View All
                    </Button>
                    <Button size="sm" className="h-8 text-xs sm:h-9 sm:text-sm" onClick={() => setShowAdd(true)}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                </div>
            }
        >
            {sectionContent}
        </SectionCard>
    );
});

export default ExpensesSection;
