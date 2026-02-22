import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { LayoutGrid, Plus, Trash2 } from "lucide-react";

export default function BudgetSection({ group, categories, incomes, expenses, onRefresh }) {
    const [showAdd, setShowAdd] = useState(false);
    const [catName, setCatName] = useState("");
    const [catAmount, setCatAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalBudget = categories.reduce((sum, c) => sum + (c.amount || 0), 0);

    const getShare = (income, categoryAmount) => {
        if (totalIncome === 0) return 0;
        return (income.amount / totalIncome) * categoryAmount;
    };

    const getSpentInCategory = (email, categoryId) => {
        return expenses
            .filter(e => e.category_id === categoryId && e.paid_by_email === email)
            .reduce((sum, e) => sum + e.amount, 0);
    };

    const handleAddCategory = async () => {
        const amount = parseFloat(catAmount);
        if (!catName.trim() || isNaN(amount) || amount <= 0) return;
        setLoading(true);
        await base44.entities.BudgetCategory.create({
            group_id: group.id,
            name: catName.trim(),
            amount,
        });
        setCatName("");
        setCatAmount("");
        setLoading(false);
        setShowAdd(false);
        onRefresh();
    };

    const handleDelete = async (id) => {
        await base44.entities.BudgetCategory.delete(id);
        onRefresh();
    };

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-white">
                        <LayoutGrid className="w-5 h-5 text-violet-500" />
                        Budget Categories
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowAdd(true)}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {categories.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                        No budget categories yet. Add one to see how expenses should be split.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {categories.map((cat) => (
                            <div key={cat.id} className="rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50">
                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                            ${cat.amount.toLocaleString()}
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7"
                                            onClick={() => handleDelete(cat.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                                {incomes.length > 0 && totalIncome > 0 && (
                                    <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                        {incomes.map((income, idx) => {
                                            const share = getShare(income, cat.amount);
                                            const spent = getSpentInCategory(income.user_email, cat.id);
                                            const remaining = share - spent;
                                            const pct = ((income.amount / totalIncome) * 100).toFixed(1);
                                            const colors = [
                                                "text-indigo-600 bg-indigo-50",
                                                "text-violet-600 bg-violet-50",
                                                "text-rose-600 bg-rose-50",
                                                "text-amber-600 bg-amber-50",
                                                "text-emerald-600 bg-emerald-50",
                                            ];
                                            return (
                                                <div key={income.id} className="px-4 py-2.5 space-y-1.5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                                                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-300">
                                                                    {(income.user_name || income.user_email)[0].toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                {income.user_name || income.user_email}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[idx % colors.length]}`}>
                                                                {pct}%
                                                            </span>
                                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 w-20 text-right">
                                                                ${share.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {spent > 0 && (
                                                        <div className="pl-0 sm:pl-8">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-slate-500 dark:text-slate-400">Spent: ${spent.toFixed(2)}</span>
                                                                <span className={`font-medium ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                    {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all ${remaining >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${Math.min((spent / share) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Summary */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Monthly Budget</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">${totalBudget.toLocaleString()}</span>
                            </div>
                            {incomes.length > 0 && totalIncome > 0 && (
                                <div className="space-y-2">
                                    {incomes.map((income, idx) => {
                                        const totalShare = categories.reduce((sum, cat) => sum + getShare(income, cat.amount), 0);
                                        const colors = [
                                            "bg-indigo-500",
                                            "bg-violet-500",
                                            "bg-rose-400",
                                            "bg-amber-400",
                                            "bg-emerald-500",
                                        ];
                                        return (
                                            <div key={income.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                                                    <span className="text-slate-600 dark:text-slate-400">{income.user_name || income.user_email}</span>
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">${totalShare.toFixed(2)}/mo</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Budget Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input
                                placeholder="e.g. Rent, Groceries, Utilities"
                                value={catName}
                                onChange={(e) => setCatName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Monthly Amount</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 1500"
                                value={catAmount}
                                onChange={(e) => setCatAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button
                            onClick={handleAddCategory}
                            disabled={!catName.trim() || !catAmount || loading}

                        >
                            {loading ? "Adding..." : "Add Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
