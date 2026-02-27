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
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/client";
import { LayoutGrid, Plus, Trash2, Users } from "lucide-react";

export default function BudgetSection({ group, categories, incomes, expenses, members, onRefresh }) {
    const [showAdd, setShowAdd] = useState(false);
    const [catName, setCatName] = useState("");
    const [catAmount, setCatAmount] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

    const getUserName = (userId) => {
        const member = members.find(m => m.id === userId);
        return member ? member.name : "Unknown User";
    };

    const getCategoryMembers = (cat) => {
        if (!cat.members || cat.members.length === 0) {
            return members.map(m => m.id);
        }
        return cat.members;
    };

    const getShare = (income, category) => {
        const catMembers = getCategoryMembers(category);
        if (!catMembers.includes(income.user)) return 0;

        const relevantIncomes = incomes.filter(i => catMembers.includes(i.user));
        const relevantTotalIncome = relevantIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);

        if (relevantTotalIncome === 0) return 0;
        return (income.amount / relevantTotalIncome) * category.amount;
    };

    const getSpentInCategory = (userId, categoryId) => {
        return expenses
            .filter(e => e.category_id === categoryId && e.paid_by === userId)
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
            members: selectedMembers.length > 0 ? selectedMembers : [],
        });
        setCatName("");
        setCatAmount("");
        setSelectedMembers([]);
        setLoading(false);
        setShowAdd(false);
        onRefresh();
    };

    const toggleMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const totalSharePerMember = incomes.map(income => {
        const share = categories.reduce((sum, cat) => sum + getShare(income, cat), 0);
        return { userId: income.user, share };
    });

    const totalBudget = categories.reduce((sum, c) => sum + (c.amount || 0), 0);

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
                        {categories.map((cat) => {
                            const catMembers = getCategoryMembers(cat);
                            const relevantIncomes = incomes.filter(i => catMembers.includes(i.user));
                            const relevantTotalIncome = relevantIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);

                            return (
                                <div key={cat.id} className="rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                                            {cat.members && cat.members.length > 0 && (
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <Users className="w-2.5 h-2.5" />
                                                    {cat.members.length} members
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                ${Math.round(cat.amount).toLocaleString()}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7"
                                                onClick={() => base44.entities.BudgetCategory.delete(cat.id).then(onRefresh)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    {relevantIncomes.length > 0 && relevantTotalIncome > 0 && (
                                        <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                            {relevantIncomes.map((income, idx) => {
                                                const share = getShare(income, cat);
                                                const spent = getSpentInCategory(income.user, cat.id);
                                                const remaining = share - spent;
                                                const pct = Math.round((income.amount / relevantTotalIncome) * 100);
                                                const colors = [
                                                    "text-indigo-600 bg-indigo-50",
                                                    "text-emerald-600 bg-emerald-50",
                                                    "text-rose-600 bg-rose-50",
                                                    "text-amber-600 bg-amber-50",
                                                    "text-sky-600 bg-sky-50",
                                                ];
                                                return (
                                                    <div key={income.id} className="px-4 py-2.5 space-y-1.5">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                                                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-300">
                                                                        {getUserName(income.user)[0].toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {getUserName(income.user)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[idx % colors.length]}`}>
                                                                    {pct}%
                                                                </span>
                                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 w-20 text-right">
                                                                    ${Math.round(share).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {spent > 0 && (
                                                            <div className="pl-0 sm:pl-8">
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="text-slate-500 dark:text-slate-400">Spent: ${Math.round(spent).toLocaleString()}</span>
                                                                    <span className={`font-medium ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                        {remaining >= 0 ? `$${Math.round(remaining).toLocaleString()} left` : `$${Math.round(Math.abs(remaining)).toLocaleString()} over`}
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
                            );
                        })}

                        {/* Summary */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Monthly Budget</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">${Math.round(totalBudget).toLocaleString()}</span>
                            </div>
                            {totalSharePerMember.length > 0 && (
                                <div className="space-y-2">
                                    {totalSharePerMember.map((m, idx) => {
                                        const colors = [
                                            "bg-indigo-500",
                                            "bg-emerald-500",
                                            "bg-rose-500",
                                            "bg-amber-500",
                                            "bg-sky-500",
                                        ];
                                        return (
                                            <div key={m.userId} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                                                    <span className="text-slate-600 dark:text-slate-400">{getUserName(m.userId)}</span>
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">${Math.round(m.share).toLocaleString()}/mo</span>
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
                <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Add Budget Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="dark:text-slate-300">Category Name</Label>
                            <Input
                                placeholder="e.g. Rent, Groceries, Utilities"
                                value={catName}
                                onChange={(e) => setCatName(e.target.value)}
                                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="dark:text-slate-300">Monthly Amount</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 1500"
                                value={catAmount}
                                onChange={(e) => setCatAmount(e.target.value)}
                                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="dark:text-slate-300">Participating Members (Optional)</Label>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">If none selected, category applies to all group members.</p>
                            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <Checkbox
                                            id={`member-${member.id}`}
                                            checked={selectedMembers.includes(member.id)}
                                            onCheckedChange={() => toggleMember(member.id)}
                                        />
                                        <label
                                            htmlFor={`member-${member.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300 cursor-pointer flex-1"
                                        >
                                            {member.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)} className="dark:text-slate-300 dark:border-slate-700">Cancel</Button>
                        <Button
                            onClick={handleAddCategory}
                            disabled={!catName.trim() || !catAmount || loading}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {loading ? "Adding..." : "Add Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
