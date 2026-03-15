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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/client";
import { LayoutGrid, Plus, Trash2, Users, Pencil, Smile, Loader2, ArrowRightLeft } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { calculateCategorySplits } from "@/lib/financial-utils";

const EMOJIS = ["🏠", "🛒", "🔌", "🚗", "🍔", "🍿", "🏥", "💡", "🛡️", "📱", "🧹", "🎒", "🎁", "🐾", "✈️"];

export default function BudgetSection({ group, categories, incomes: rawIncomes, expenses, members, onRefresh, loading }) {
    const incomes = React.useMemo(() => {
        const map = new Map();
        (rawIncomes || []).forEach(inc => {
            if (inc && inc.user) map.set(inc.user.toString(), inc);
        });
        return Array.from(map.values());
    }, [rawIncomes]);

    const getCategoryMembers = (cat) => {
        if (!cat.members || cat.members.length === 0) {
            return members.map(m => m.id);
        }
        return cat.members;
    };

    // Pre-calculate clean splits for each category
    const categorySplits = React.useMemo(() => {
        return calculateCategorySplits(categories, rawIncomes, members, expenses);
    }, [categories, rawIncomes, members, expenses]);

    const [showAdd, setShowAdd] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [catName, setCatName] = useState("");
    const [catAmount, setCatAmount] = useState("");
    const [catIcon, setCatIcon] = useState("📁");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loadingAction, setLoadingAction] = useState(false);

    // Transfer State
    const [showTransfer, setShowTransfer] = useState(false);
    const [transferSourceUserId, setTransferSourceUserId] = useState("");
    const [transferTargetUserId, setTransferTargetUserId] = useState("");
    const [transferAmount, setTransferAmount] = useState("");
    const [transferCategoryId, setTransferCategoryId] = useState("");

    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

    const getUserName = (userId) => {
        const member = members.find(m => String(m.id) === String(userId));
        return member ? member.name : "Unknown User";
    };

    const getSpentInCategory = (userId, categoryId) => {
        return expenses
            .filter(e => String(e.category_id) === String(categoryId) && String(e.paid_by) === String(userId) && !e.description?.startsWith('[BUDGET_TRANSFER]'))
            .reduce((sum, e) => sum + e.amount, 0);
    };

    const handleAddCategory = async () => {
        const amount = parseFloat(catAmount);
        if (!catName.trim() || isNaN(amount) || amount <= 0) return;
        setLoadingAction(true);
        if (editingCategory) {
            await base44.entities.BudgetCategory.update(editingCategory.id, {
                name: catName.trim(),
                amount,
                icon: catIcon,
                members: selectedMembers.length > 0 ? selectedMembers : [],
            });
        } else {
            await base44.entities.BudgetCategory.create({
                group_id: group.id,
                name: catName.trim(),
                amount,
                icon: catIcon,
                members: selectedMembers.length > 0 ? selectedMembers : [],
            });
        }
        resetForm();
        setLoadingAction(false);
        setShowAdd(false);
        setEditingCategory(null);
        onRefresh();
    };

    const handleTransferBudget = async () => {
        const amount = parseFloat(transferAmount);
        if (!transferSourceUserId || !transferTargetUserId || isNaN(amount) || amount <= 0 || !transferCategoryId) return;

        setLoadingAction(true);
        try {
            const senderName = getUserName(transferSourceUserId);
            // Create a special expense record to represent the transfer
            // Description contains TO:{receiverId} for logic and human-readable text
            await base44.entities.Expense.create({
                group_id: group.id,
                category_id: transferCategoryId,
                description: `[BUDGET_TRANSFER] TO:${transferTargetUserId} FROM:${senderName}`,
                amount: amount,
                paid_by: transferSourceUserId,
                date: new Date().toISOString().split("T")[0],
            });
            
            setTransferAmount("");
            setTransferSourceUserId("");
            setTransferTargetUserId("");
            setTransferCategoryId("");
            setShowTransfer(false);
            
            // Critical: call onRefresh to trigger parent query invalidation
            if (onRefresh) {
                onRefresh();
            }
        } catch (e) {
            console.error("Transfer failed:", e);
        } finally {
            setLoadingAction(false);
        }
    };

    const resetForm = () => {
        setCatName("");
        setCatAmount("");
        setCatIcon("📁");
        setSelectedMembers([]);
    };

    const handleEditClick = (cat) => {
        setEditingCategory(cat);
        setCatName(cat.name);
        setCatAmount(cat.amount.toString());
        setCatIcon(cat.icon || "📁");
        setSelectedMembers(cat.members || []);
        setShowAdd(true);
    };

    const handleTransferClick = (cat, sourceUserId) => {
        setTransferCategoryId(cat.id);
        setTransferSourceUserId(sourceUserId);
        setTransferTargetUserId("");
        setTransferAmount("");
        setShowTransfer(true);
    };

    const toggleMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const totalSharePerMember = incomes
        .filter(i => (i.amount || 0) > 0)
        .map(income => {
            const share = categories.reduce((sum, cat) => {
                const split = categorySplits[cat.id]?.find(s => String(s.userId) === String(income.user));
                return sum + (split ? split.share : 0);
            }, 0);
            return { userId: income.user, share };
        });

    const totalBudget = categories.reduce((sum, c) => sum + (c.amount || 0), 0);

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden">
            <CardHeader className="p-4 sm:pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 dark:text-white">
                        <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
                        Budget Categories
                    </CardTitle>
                    <Button size="sm" className="h-8 text-xs sm:h-9 sm:text-sm" onClick={() => {
                        setEditingCategory(null);
                        resetForm();
                        setShowAdd(true);
                    }}>
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
                {categories.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                        No budget categories yet. Add one to see how expenses should be split.
                    </p>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {categories.map((cat) => {
                            const catMembers = getCategoryMembers(cat).map(m => String(m));
                            const relevantIncomes = incomes.filter(i => catMembers.includes(String(i.user)) && (i.amount || 0) > 0);
                            const splits = categorySplits[cat.id] || [];

                            return (
                                <div key={cat.id} className="rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-slate-50 dark:bg-slate-700/50">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="text-xl sm:text-2xl shrink-0">{cat.icon || ""}</span>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{cat.name}</span>
                                                {cat.members && cat.members.length > 0 && (
                                                    <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                                        <Users className="w-2.5 h-2.5" />
                                                        {cat.members.length} members
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                                ${Number(cat.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <div className="flex items-center">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 sm:h-7 sm:w-7"
                                                    onClick={() => handleEditClick(cat)}
                                                >
                                                    <Pencil className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 hover:text-indigo-500" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 sm:h-7 sm:w-7"
                                                    onClick={() => base44.entities.BudgetCategory.delete(cat.id).then(onRefresh)}
                                                >
                                                    <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    {splits.length > 0 && (
                                        <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                            {splits.map((split, idx) => {
                                                const share = split.share;
                                                const spent = getSpentInCategory(split.userId, cat.id);
                                                const remaining = share - spent;
                                                const pct = split.pct;
                                                const colors = [
                                                    "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
                                                    "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
                                                    "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
                                                    "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
                                                    "text-sky-600 bg-sky-50 dark:bg-sky-900/20",
                                                ];
                                                return (
                                                    <div key={split.userId} className="px-3 py-2 sm:px-4 sm:py-2.5 space-y-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center shrink-0">
                                                                    <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-300">
                                                                            {getUserName(split.userId)[0].toUpperCase()}
                                                                        </span>
                                                                </div>
                                                                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                                                                    {getUserName(split.userId)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {remaining > 0 && (
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-6 w-6 text-slate-400 hover:text-violet-500"
                                                                        title="Transfer some of this budget to someone else"
                                                                        onClick={() => handleTransferClick(cat, split.userId)}
                                                                    >
                                                                        <ArrowRightLeft className="w-3 h-3" />
                                                                    </Button>
                                                                )}
                                                                <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-medium ${colors[idx % colors.length]}`}>
                                                                    {pct}%
                                                                </span>
                                                                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 w-16 sm:w-24 text-right">
                                                                    ${Number(share).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="pl-7 sm:pl-8">
                                                            <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                                                <span className="text-slate-500 dark:text-slate-400">Spent: ${Number(spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                <span className={`font-medium ${remaining >= -0.001 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                    {remaining >= -0.001 ? `$${Number(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} left` : `$${Number(Math.abs(remaining)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} over`}
                                                                </span>
                                                            </div>
                                                            <div className="mt-0.5 sm:mt-1 h-1 sm:h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all ${remaining >= -0.001 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${Math.min((spent / Math.max(share, 0.01)) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Summary */}
                        <div className="mt-2 pt-3 sm:mt-4 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Total Monthly Budget</span>
                                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">${Number(totalBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {totalSharePerMember.length > 0 && (
                                <div className="space-y-1 sm:space-y-2">
                                    {totalSharePerMember.map((m, idx) => {
                                        const colors = [
                                            "bg-indigo-500",
                                            "bg-emerald-500",
                                            "bg-rose-500",
                                            "bg-amber-500",
                                            "bg-sky-500",
                                        ];
                                        return (
                                            <div key={m.userId} className="flex items-center justify-between text-xs sm:text-sm">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                                                    <span className="text-slate-600 dark:text-slate-400">{getUserName(m.userId)}</span>
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">${Number(m.share).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Add/Edit Category Dialog */}
            <Dialog open={showAdd} onOpenChange={(val) => {
                setShowAdd(val);
                if (!val) setEditingCategory(null);
            }}>
                <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">
                            {editingCategory ? "Edit Budget Category" : "Add Budget Category"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="flex items-end gap-3">
                            <div className="space-y-2 flex-1">
                                <Label className="dark:text-slate-300">Category Name</Label>
                                <Input
                                    placeholder="e.g. Rent, Groceries, Utilities"
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="dark:text-slate-300">Icon</Label>
                                <Input
                                    value={catIcon}
                                    onChange={(e) => setCatIcon(e.target.value)}
                                    placeholder="📁"
                                    className="w-12 h-10 p-0 text-center text-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    maxLength={2}
                                />
                            </div>
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
                            {loading ? "Saving..." : (editingCategory ? "Save Changes" : "Add Category")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transfer Budget Dialog */}
            <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
                <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-violet-500" />
                            Transfer Budget
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-100 dark:border-violet-800">
                            <p className="text-xs text-violet-700 dark:text-violet-300">
                                You are transferring budget from <strong>{getUserName(transferSourceUserId)}</strong> in the <strong>{categories.find(c => c.id === transferCategoryId)?.name}</strong> category.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="dark:text-slate-300">Recipient</Label>
                            <Select value={transferTargetUserId} onValueChange={setTransferTargetUserId}>
                                <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                                    <SelectValue placeholder="Select a member" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                    {members.filter(m => m.id !== transferSourceUserId).map(member => (
                                        <SelectItem key={member.id} value={member.id} className="dark:text-slate-300 dark:focus:bg-slate-800">
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="dark:text-slate-300">Amount to Give</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    className="pl-7 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500">
                                This will decrease {getUserName(transferSourceUserId)}'s budget and increase the recipient's budget.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTransfer(false)} className="dark:text-slate-300 dark:border-slate-700">Cancel</Button>
                        <Button
                            onClick={handleTransferBudget}
                            disabled={!transferTargetUserId || !transferAmount || loadingAction}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            {loadingAction ? "Transferring..." : "Complete Transfer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
