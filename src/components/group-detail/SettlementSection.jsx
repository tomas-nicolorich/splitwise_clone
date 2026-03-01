import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SettlementSection({ group, expenses, incomes, categories, members }) {
    const [selectedCategoryId, setSelectedCategoryId] = useState("all");

    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

    const filteredCategories = selectedCategoryId === "all"
        ? categories
        : categories.filter(c => c.id === selectedCategoryId);

    const totalBudget = filteredCategories.reduce((sum, c) => sum + Number(c.amount), 0);

    const filteredExpenses = selectedCategoryId === "all"
        ? expenses
        : expenses.filter(e => e.category_id === selectedCategoryId);

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

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

    const getShareForCategory = (income, category) => {
        const catMembers = getCategoryMembers(category);
        if (!catMembers.includes(income.user)) return 0;

        const relevantIncomes = incomes.filter(i => catMembers.includes(i.user));
        const relevantTotalIncome = relevantIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);

        if (relevantTotalIncome === 0) return 0;
        return (income.amount / relevantTotalIncome) * Number(category.amount);
    };

    // Calculate spending summary per member
    const memberSummary = incomes
        .filter(i => (i.amount || 0) > 0)
        .map(income => {
            // Sum shares from each filtered category
            const budgetShare = filteredCategories.reduce((sum, cat) => {
                return sum + getShareForCategory(income, cat);
            }, 0);

            const spent = filteredExpenses
                .filter(e => e.paid_by === income.user)
                .reduce((sum, e) => sum + Number(e.amount), 0);

            return {
                id: income.user,
                name: getUserName(income.user),
                budgetShare,
                spent,
                difference: spent - budgetShare,
            };
        });

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader className="p-4 sm:pb-4">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2 dark:text-white">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        Spending Overview
                    </CardTitle>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                            <SelectTrigger className="h-7 sm:h-8 w-[100px] sm:w-[140px] text-[10px] sm:text-xs">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {expenses.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                        Add expenses to see spending details.
                    </p>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {/* Total summary */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5">Total Budget</div>
                                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">${Number(totalBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5">Total Spent</div>
                                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">${Number(totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                        </div>

                        {/* Member spending breakdown */}
                        {memberSummary.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Budget vs Actual
                                </p>
                                {memberSummary.map((member, idx) => {
                                    const isOverBudget = member.difference > 0.001;
                                    const isUnderBudget = member.difference < -0.001;
                                    const percentage = member.budgetShare > 0 ? (member.spent / member.budgetShare) * 100 : 0;

                                    return (
                                        <div
                                            key={member.id}
                                            className="p-2 sm:p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-700/50"
                                        >
                                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                            {member.name[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                                        {member.name}
                                                    </span>
                                                </div>
                                                {isOverBudget && (
                                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 shrink-0">
                                                        <TrendingUp className="w-3 h-3" />
                                                        <span className="font-medium">${Number(Math.abs(member.difference)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} over</span>
                                                    </div>
                                                )}
                                                {isUnderBudget && (
                                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                                                        <TrendingDown className="w-3 h-3" />
                                                        <span className="font-medium">${Number(Math.abs(member.difference)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} under</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1 sm:mb-1.5">
                                                <span className="text-slate-500 dark:text-slate-400">
                                                    Budget: ${Number(member.budgetShare).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-slate-600 dark:text-slate-300 font-medium">
                                                    Spent: ${Number(member.spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            <div className="h-1.5 sm:h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${percentage > 100 ? 'bg-amber-500' :
                                                            percentage > 80 ? 'bg-yellow-500' :
                                                                'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
