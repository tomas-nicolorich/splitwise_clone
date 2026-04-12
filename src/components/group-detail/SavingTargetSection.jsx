import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Target, Users, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SavingTargetSection({ members, incomes, loading }) {
    const [targetAmount, setTargetAmount] = useState("");
    const [targetDate, setTargetDate] = useState(undefined);
    const [startingBalance, setStartingBalance] = useState("");
    const [monthlyExpenses, setMonthlyExpenses] = useState("");
    const [manualContributions, setManualContributions] = useState({}); // { memberId: amount }

    const calculation = useMemo(() => {
        const amount = parseFloat(targetAmount);
        const startBal = parseFloat(startingBalance) || 0;
        const monthlyExp = parseFloat(monthlyExpenses) || 0;
        
        if (isNaN(amount) || !targetDate || members.length === 0) return null;

        const today = new Date();
        const goalDate = new Date(targetDate);
        
        // Inclusive month calculation
        const monthsRemaining = (goalDate.getFullYear() - today.getFullYear()) * 12 + (goalDate.getMonth() - today.getMonth()) + 1;
        
        if (monthsRemaining <= 0) return { error: "Target date must be in the future" };

        const remainingGoal = amount - startBal;
        if (remainingGoal <= 0) return { error: "Goal already reached with starting balance!" };

        // 1. The Plan (Goal-Based)
        const requiredMonthlyNet = remainingGoal / monthsRemaining;
        const idealGroupContribution = requiredMonthlyNet + monthlyExp;
        const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

        const idealBreakdown = members.map(member => {
            const income = incomes.find(i => i.user === member.id)?.amount || 0;
            const incomePct = totalIncome > 0 ? (income / totalIncome) : 0;
            const contribution = incomePct * idealGroupContribution;
            return {
                id: member.id,
                name: member.name,
                idealContribution: contribution,
                income,
                incomePct: incomePct * 100
            };
        });

        // 2. The Forecast (Reality-Based)
        const actualGroupContribution = members.reduce((sum, member) => {
            const manual = parseFloat(manualContributions[member.id]);
            if (!isNaN(manual)) return sum + manual;
            
            // Fallback to ideal split if not overridden
            const ideal = idealBreakdown.find(m => m.id === member.id)?.idealContribution || 0;
            return sum + ideal;
        }, 0);

        const actualMonthlyNet = actualGroupContribution - monthlyExp;
        
        let projection = null;
        if (actualMonthlyNet <= 0) {
            projection = { error: "Goal never reached (Expenses ≥ Contributions)" };
        } else {
            const projectedMonths = remainingGoal / actualMonthlyNet;
            const projectedDate = new Date();
            projectedDate.setMonth(today.getMonth() + Math.ceil(projectedMonths));
            projection = {
                projectedMonths: Math.ceil(projectedMonths),
                projectedDate,
                actualMonthlyNet,
                actualGroupContribution
            };
        }

        return {
            monthsRemaining,
            requiredMonthlyNet,
            idealGroupContribution,
            idealBreakdown,
            projection,
            remainingGoal
        };
    }, [targetAmount, targetDate, startingBalance, monthlyExpenses, members, incomes, manualContributions]);

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden">
            <CardHeader className="p-4 sm:pb-4">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-3 dark:text-white">
                    <div className="bg-indigo-50 dark:bg-indigo-900/40 p-1.5 rounded-lg">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Saving Target Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 ml-1">Target Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <Input
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                className="pl-7 h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                placeholder="24000"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 ml-1">Target Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full h-10 justify-start text-left font-normal bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
                                        !targetDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                    {targetDate ? format(targetDate, "PPP") : <span className="text-sm">Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={targetDate}
                                    onSelect={setTargetDate}
                                    initialFocus
                                    captionLayout="dropdown-buttons"
                                    fromYear={new Date().getFullYear()}
                                    toYear={new Date().getFullYear() + 10}
                                />
                            </PopoverContent>
                        </Popover>
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
                            <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-1">
                                <Users className="w-3 h-3" /> Monthly Split (Income-based)
                            </label>
                            <div className="space-y-1.5 mt-2">
                                {calculation.breakdown.map(member => (
                                    <div key={member.id} className="flex justify-between items-center px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/50 text-xs sm:text-sm">
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">{member.name}</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            ${member.contribution.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                            </div>
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
