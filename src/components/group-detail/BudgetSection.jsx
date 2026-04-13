import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Plus, Trash2, Users, Pencil, ArrowRightLeft } from "lucide-react";
import { useGroupData } from "@/hooks/use-group-data";
import SectionCard from "@/components/ui/SectionCard";
import { getUserName } from "@/utils/utils";
import BudgetCategoryDialog from "./BudgetCategoryDialog";
import BudgetTransferDialog from "./BudgetTransferDialog";

export default function BudgetSection({ groupId }) {
    const { 
        group, 
        categories, 
        incomes, 
        expenses, 
        members, 
        categorySplits, 
        totalBudget,
        isFetching,
        actions 
    } = useGroupData(groupId);

    const [showAdd, setShowAdd] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // Transfer State
    const [showTransfer, setShowTransfer] = useState(false);
    const [transferSourceUserId, setTransferSourceUserId] = useState("");
    const [transferCategoryId, setTransferCategoryId] = useState("");

    const getSpentInCategory = (userId, categoryId) => {
        return expenses
            .filter(e => String(e.category_id) === String(categoryId) && String(e.paid_by) === String(userId) && !e.description?.startsWith('[BUDGET_TRANSFER]'))
            .reduce((sum, e) => sum + e.amount, 0);
    };

    const handleSaveCategory = async (data) => {
        setLoadingAction(true);
        try {
            if (data.id) {
                await actions.updateCategory(data);
            } else {
                await actions.addCategory(data);
            }
            setShowAdd(false);
            setEditingCategory(null);
        } catch (e) {
            console.error("Failed to save category:", e);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleTransferBudget = async ({ sourceUserId, targetUserId, categoryId, amount }) => {
        setLoadingAction(true);
        try {
            const senderName = getUserName(sourceUserId, members);
            await actions.addExpense({
                category_id: categoryId,
                description: `[BUDGET_TRANSFER] TO:${targetUserId} FROM:${senderName}`,
                amount: amount,
                paid_by: sourceUserId,
                date: new Date().toISOString().split("T")[0],
            });
            setShowTransfer(false);
        } catch (e) {
            console.error("Transfer failed:", e);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleEditClick = (cat) => {
        setEditingCategory(cat);
        setShowAdd(true);
    };

    const handleTransferClick = (cat, sourceUserId) => {
        setTransferCategoryId(cat.id);
        setTransferSourceUserId(sourceUserId);
        setShowTransfer(true);
    };

    const totalSharePerMember = useMemo(() => {
        return incomes
            .filter(i => (i.amount || 0) > 0)
            .map(income => {
                const share = categories.reduce((sum, cat) => {
                    const split = categorySplits[cat.id]?.find(s => String(s.userId) === String(income.user));
                    return sum + (split ? split.share : 0);
                }, 0);
                return { userId: income.user, share };
            });
    }, [incomes, categories, categorySplits]);

    const colors = [
        "bg-indigo-500",
        "bg-emerald-500",
        "bg-rose-500",
        "bg-amber-500",
        "bg-sky-500",
    ];

    const splitColors = [
        "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
        "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
        "text-sky-600 bg-sky-50 dark:bg-sky-900/20",
    ];

    return (
        <>
            <SectionCard
                title="Budget Categories"
                icon={LayoutGrid}
                loading={isFetching}
                actions={
                    <Button size="sm" className="h-8 text-xs sm:h-9 sm:text-sm" onClick={() => {
                        setEditingCategory(null);
                        setShowAdd(true);
                    }}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                }
            >
                {categories.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                        No budget categories yet. Add one to see how expenses should be split.
                    </p>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {categories.map((cat) => {
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
                                                    onClick={() => actions.deleteCategory(cat.id)}
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
                                                
                                                return (
                                                    <div key={split.userId} className="px-3 py-2 sm:px-4 sm:py-2.5 space-y-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center shrink-0">
                                                                    <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-300">
                                                                            {getUserName(split.userId, members)[0].toUpperCase()}
                                                                        </span>
                                                                </div>
                                                                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                                                                    {getUserName(split.userId, members)}
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
                                                                <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-medium ${splitColors[idx % splitColors.length]}`}>
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
                                        return (
                                            <div key={m.userId} className="flex items-center justify-between text-xs sm:text-sm">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                                                    <span className="text-slate-600 dark:text-slate-400">{getUserName(m.userId, members)}</span>
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
            </SectionCard>

            <BudgetCategoryDialog
                open={showAdd}
                onOpenChange={setShowAdd}
                category={editingCategory}
                members={members}
                onSave={handleSaveCategory}
                loading={loadingAction}
            />

            <BudgetTransferDialog
                open={showTransfer}
                onOpenChange={setShowTransfer}
                sourceUserId={transferSourceUserId}
                categoryId={transferCategoryId}
                categoryName={categories.find(c => c.id === transferCategoryId)?.name}
                members={members}
                onTransfer={handleTransferBudget}
                loading={loadingAction}
            />
        </>
    );
}
