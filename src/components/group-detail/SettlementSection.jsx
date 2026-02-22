import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function SettlementSection({ group, expenses, incomes, categories }) {
    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalBudget = categories.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate spending summary per member
    const memberSummary = incomes.map(income => {
        const budgetShare = totalIncome > 0 ? (income.amount / totalIncome) * totalBudget : 0;
        const spent = expenses
            .filter(e => e.paid_by_email === income.user_email)
            .reduce((sum, e) => sum + e.amount, 0);

        return {
            email: income.user_email,
            name: income.user_name || income.user_email,
            budgetShare,
            spent,
            difference: spent - budgetShare,
        };
    });

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-white">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Spending Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                {expenses.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                        Add expenses to see spending details.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {/* Total summary */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Budget</div>
                                <div className="font-bold text-slate-900 dark:text-slate-100">${totalBudget.toFixed(2)}</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Spent</div>
                                <div className="font-bold text-slate-900 dark:text-slate-100">${totalExpenses.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Member spending breakdown */}
                        {memberSummary.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Budget vs Actual
                                </p>
                                {memberSummary.map((member, idx) => {
                                    const isOverBudget = member.difference > 0.01;
                                    const isUnderBudget = member.difference < -0.01;
                                    const percentage = member.budgetShare > 0 ? (member.spent / member.budgetShare) * 100 : 0;

                                    return (
                                        <div
                                            key={member.email}
                                            className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-700/50"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                            {member.name[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                                        {member.name}
                                                    </span>
                                                </div>
                                                {isOverBudget && (
                                                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                                        <TrendingUp className="w-3 h-3" />
                                                        <span className="font-medium">${Math.abs(member.difference).toFixed(2)} over</span>
                                                    </div>
                                                )}
                                                {isUnderBudget && (
                                                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                        <TrendingDown className="w-3 h-3" />
                                                        <span className="font-medium">${Math.abs(member.difference).toFixed(2)} under</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <span className="text-slate-500 dark:text-slate-400">
                                                    Budget: ${member.budgetShare.toFixed(2)}
                                                </span>
                                                <span className="text-slate-600 dark:text-slate-300 font-medium">
                                                    Spent: ${member.spent.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
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
