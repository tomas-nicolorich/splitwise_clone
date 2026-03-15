import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { calculateCategorySplits } from "@/lib/financial-utils";
import { Wallet, Loader2, TrendingUp, TrendingDown } from "lucide-react";

export default function RemainingBalanceSection({ categories, incomes: rawIncomes, members, expenses, loading }) {
    
    const splits = React.useMemo(() => {
        return calculateCategorySplits(categories, rawIncomes, members, expenses);
    }, [categories, rawIncomes, members, expenses]);

    const incomes = React.useMemo(() => {
        const map = new Map();
        (rawIncomes || []).forEach(inc => {
            if (inc && inc.user) map.set(inc.user.toString(), inc);
        });
        return Array.from(map.values());
    }, [rawIncomes]);

    const userBalances = React.useMemo(() => {
        return members.map(member => {
            const income = incomes.find(i => String(i.user) === String(member.id));
            const totalIncome = income ? (Number(income.amount) || 0) : 0;
            
            let totalBudgeted = 0;
            // Iterate all categories and sum up this user's share
            Object.values(splits).forEach(categoryShares => {
                const userShare = categoryShares.find(s => String(s.userId) === String(member.id));
                if (userShare) {
                    totalBudgeted += userShare.share;
                }
            });

            return {
                userId: member.id,
                name: member.name,
                totalIncome,
                totalBudgeted,
                remaining: totalIncome - totalBudgeted
            };
        });
    }, [members, incomes, splits]);

    const totalCombinedRemaining = userBalances.reduce((sum, u) => sum + u.remaining, 0);

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden">
            <CardHeader className="p-4 sm:pb-4">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 dark:text-white">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    Remaining Balance
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 min-h-[100px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                )}
                
                <div className="space-y-3 sm:space-y-4">
                    {/* Combined Total */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Combined Remaining</span>
                        <span className={`text-lg font-bold ${totalCombinedRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            ${Number(totalCombinedRemaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Individual Balances */}
                    <div className="space-y-2">
                        {userBalances.map((user) => (
                            <div key={user.userId} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
                                                {user.name[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 font-semibold ${user.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {user.remaining >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        <span>${Number(Math.abs(user.remaining)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                                    <span>Income: ${Number(user.totalIncome).toLocaleString()}</span>
                                    <span>Budgeted: ${Number(user.totalBudgeted).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
