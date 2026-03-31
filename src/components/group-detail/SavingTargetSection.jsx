import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Target, Users, Loader2 } from "lucide-react";

export default function SavingTargetSection({ members, incomes, loading }) {
    const [targetAmount, setTargetAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");

    const calculation = useMemo(() => {
        const amount = parseFloat(targetAmount);
        if (isNaN(amount) || !targetDate || members.length === 0) return null;

        const today = new Date();
        const goalDate = new Date(targetDate);
        
        // Inclusive month calculation
        const monthsRemaining = (goalDate.getFullYear() - today.getFullYear()) * 12 + (goalDate.getMonth() - today.getMonth()) + 1;
        
        if (monthsRemaining <= 0) return { error: "Target date must be in the future" };

        const monthlyTarget = amount / monthsRemaining;
        const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

        if (totalIncome === 0) return { error: "Please add income for at least one member" };

        const breakdown = members.map(member => {
            const income = incomes.find(i => i.user === member.id)?.amount || 0;
            const contribution = (income / totalIncome) * monthlyTarget;
            return {
                id: member.id,
                name: member.name,
                contribution,
                income
            };
        });

        return {
            monthsRemaining,
            monthlyTarget,
            breakdown
        };
    }, [targetAmount, targetDate, members, incomes]);

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden">
            <CardHeader className="p-4 sm:pb-4">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 dark:text-white">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                    Saving Target Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Target Amount</label>
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <Input
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                className="pl-6 h-9 text-sm"
                                placeholder="5000"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Target Date</label>
                        <Input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                </div>

                {calculation && !calculation.error && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Months Remaining:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{calculation.monthsRemaining}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Monthly Target:</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">
                                ${calculation.monthlyTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                            <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Users className="w-3 h-3" /> Monthly Split (Income-based)
                            </label>
                            {calculation.breakdown.map(member => (
                                <div key={member.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs">
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{member.name}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        ${member.contribution.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {calculation?.error && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs rounded-lg border border-amber-100 dark:border-amber-800">
                        {calculation.error}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
