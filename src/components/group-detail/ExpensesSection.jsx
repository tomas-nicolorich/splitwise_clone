import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from "@/api/client";
import { Receipt, Plus, Trash2, Pencil, Loader2, List } from "lucide-react";
import { format } from "date-fns";

const ExpenseRow = ({ expense, categories, user, isOwner, getUserName, handleEdit, handleDelete }) => {
    const category = categories.find(c => c.id === expense.category_id);
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
                    <span>Paid by {getUserName(expense.paid_by)}</span>
                    {expense.date && (
                        <span className="hidden sm:inline">• {format(new Date(expense.date), "MMM d, yyyy")}</span>
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

export default function ExpensesSection({ group, expenses, categories, user, members, onRefresh, loading }) {
    const [showAdd, setShowAdd] = useState(false);
    const [showAllExpenses, setShowAllExpenses] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [paidByUserId, setPaidByUserId] = useState("");
    const [loadingAction, setLoadingAction] = useState(false);

    const isOwner = group.members?.[0] === user.id;

    const getUserName = (userId) => {
        const member = members.find(m => m.id === userId);
        return member ? member.name : "Unknown User";
    };

    const handleAddExpense = async () => {
        const parsedAmount = parseFloat(amount);
        if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !categoryId) return;
        if (isOwner && !paidByUserId) return;

        const targetUserId = isOwner ? paidByUserId : user.id;

        setLoadingAction(true);

        try {
            if (editingExpense) {
                await base44.entities.Expense.update(editingExpense.id, {
                    category_id: categoryId,
                    description: description.trim(),
                    amount: parsedAmount,
                    paid_by: targetUserId,
                });
            } else {
                await base44.entities.Expense.create({
                    group_id: group.id,
                    category_id: categoryId,
                    description: description.trim(),
                    amount: parsedAmount,
                    paid_by: targetUserId,
                    date: new Date().toISOString().split("T")[0],
                });
            }

            setDescription("");
            setAmount("");
            setCategoryId("");
            setPaidByUserId("");
            setEditingExpense(null);
            setLoadingAction(false);
            setShowAdd(false);
            onRefresh();
        } catch (e) {
            console.error("Error saving expense:", e);
            setLoadingAction(false);
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setDescription(expense.description);
        setAmount(expense.amount.toString());
        setCategoryId(expense.category_id);
        setPaidByUserId(expense.paid_by);
        setShowAdd(true);
    };

    const handleDelete = async (id) => {
        await base44.entities.Expense.delete(id);
        onRefresh();
    };

    const displayedExpenses = expenses.slice(0, 3);

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden">
            <CardHeader className="p-4 sm:pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 dark:text-white">
                        <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                        Expenses
                    </CardTitle>
                    <Button size="sm" className="h-8 text-xs sm:h-9 sm:text-sm" onClick={() => setShowAdd(true)}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 min-h-[100px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                )}
                {expenses.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                        No expenses yet. Add one to track shared costs.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {displayedExpenses.map((expense) => (
                            <ExpenseRow
                                key={expense.id}
                                expense={expense}
                                categories={categories}
                                user={user}
                                isOwner={isOwner}
                                getUserName={getUserName}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        ))}
                        
                        {expenses.length > 3 && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm h-8 mt-1"
                                onClick={() => setShowAllExpenses(true)}
                            >
                                <List className="w-3.5 h-3.5 mr-1.5" />
                                See All ({expenses.length})
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Add/Edit Modal */}
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {isOwner && (
                            <div className="space-y-2">
                                <Label>Paid By</Label>
                                <Select value={paidByUserId} onValueChange={setPaidByUserId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select who paid" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members.map(member => (
                                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a budget category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {categories.length === 0 && (
                                <p className="text-xs text-amber-600">Add a budget category first</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="e.g. Weekly groceries"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 150"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowAdd(false);
                            setEditingExpense(null);
                            setDescription("");
                            setAmount("");
                            setCategoryId("");
                            setPaidByUserId("");
                        }}>Cancel</Button>
                        <Button
                            onClick={handleAddExpense}
                            disabled={!description.trim() || !amount || !categoryId || (isOwner && !paidByUserId) || loading}

                        >
                            {loading ? (editingExpense ? "Saving..." : "Adding...") : (editingExpense ? "Save" : "Add Expense")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View All Modal */}
            <Dialog open={showAllExpenses} onOpenChange={setShowAllExpenses}>
                <DialogContent className="sm:max-w-2xl dark:bg-slate-800 dark:border-slate-700 max-h-[90vh] flex flex-col">
                    <DialogHeader className="shrink-0">
                        <DialogTitle className="dark:text-white flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-rose-500" />
                            All Expenses
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 -mr-4 pr-4">
                        <div className="space-y-2 py-2">
                            {expenses.map((expense) => (
                                <ExpenseRow
                                    key={expense.id}
                                    expense={expense}
                                    categories={categories}
                                    user={user}
                                    isOwner={isOwner}
                                    getUserName={getUserName}
                                    handleEdit={(exp) => {
                                        handleEdit(exp);
                                    }}
                                    handleDelete={(id) => {
                                        // Optional: Keep modal open or close it? 
                                        // If we delete, the list changes. 
                                        // Let's keep it open for now, but handleEdit closes it to show the Edit form.
                                        handleDelete(id);
                                    }}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
