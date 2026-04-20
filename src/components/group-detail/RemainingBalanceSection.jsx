import React, { useMemo, memo } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useGroupData } from "@/hooks/use-group-data";
import SectionCard from "@/components/ui/SectionCard";

const RemainingBalanceSection = memo(function RemainingBalanceSection({ groupId }) {
    const { 
        members, 
        incomes, 
        categorySplits, 
        isFetching 
    } = useGroupData(groupId);

    const userBalances = useMemo(() => {
        return members.map(member => {
            const income = incomes.find(i => String(i.user) === String(member.id));
            const totalIncome = income ? (Number(income.amount) || 0) : 0;
            
            let totalBudgeted = 0;
            // Iterate all categories and sum up this user's share
            Object.values(categorySplits).forEach(categoryShares => {
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
    }, [members, incomes, categorySplits]);

    const totalCombinedRemaining = useMemo(() => {
        return userBalances.reduce((sum, u) => sum + u.remaining, 0);
    }, [userBalances]);

    return (
        <SectionCard
            title="Remaining Balance"
            icon={Wallet}
            loading={isFetching}
        >
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
        </SectionCard>
    );
});

export default RemainingBalanceSection;
