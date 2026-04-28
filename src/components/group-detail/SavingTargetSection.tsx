import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Target, Users, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/utils/utils";
import { useGroupData } from "@/hooks/use-group-data";
import SectionCard from "@/components/ui/SectionCard";

interface SavingTargetSectionProps {
    groupId: string;
}

export default function SavingTargetSection({ groupId }: SavingTargetSectionProps) {
    const { 
        members, 
        incomes, 
        isFetching: loading 
    } = useGroupData(groupId);

    const [targetAmount, setTargetAmount] = useState("");
    const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
    const [startingBalance, setStartingBalance] = useState("");
    const [monthlyExpenses, setMonthlyExpenses] = useState("");
    const [manualContributions, setManualContributions] = useState<Record<string, string>>({}); // { memberId: amount }

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
        const idealGroupContribution = requiredMonthlyNet; // Expenses do not increase the target
        const totalIncome = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        const idealBreakdown = members.map(member => {
            // Sum all incomes for this user
            const userIncomes = incomes.filter(i => String(i.user) === String(member.id));
            const income = userIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
            
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
        
        let projection: any = null;
        if (actualMonthlyNet <= 0) {
            projection = { error: "Goal never reached (Expenses ≥ Contributions)" };
        } else {
            const projectedMonths = remainingGoal / actualMonthlyNet;
            const projectedDate = new Date();
            // Adjust with - 1 to match inclusive month logic
            projectedDate.setMonth(today.getMonth() + Math.ceil(projectedMonths) - 1);
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
            remainingGoal,
            error: null as string | null
        };
    }, [targetAmount, targetDate, startingBalance, monthlyExpenses, members, incomes, manualContributions]);

    return (
        <SectionCard
            title="Saving Target Calculator"
            icon={Target}
            loading={loading}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 ml-1">Starting Balance</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <Input
                                type="number"
                                value={startingBalance}
                                onChange={(e) => setStartingBalance(e.target.value)}
                                className="pl-7 h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 ml-1">Monthly Expenses (from savings)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <Input
                                type="number"
                                value={monthlyExpenses}
                                onChange={(e) => setMonthlyExpenses(e.target.value)}
                                className="pl-7 h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                placeholder="0"
                            />
                        </div>
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
                                ${calculation.idealGroupContribution.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-1">
                                    <Users className="w-3 h-3" /> Monthly Split & Forecast
                                </label>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-[10px] px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                    onClick={() => setManualContributions({})}
                                >
                                    Reset to Income Split
                                </Button>
                            </div>
                            <div className="space-y-1.5 mt-2">
                                {calculation.idealBreakdown.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{member.name}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                Income Split: {member.incomePct.toFixed(1)}% (${member.idealContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                                            </p>
                                        </div>
                                        <div className="relative w-28">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                            <Input
                                                type="number"
                                                value={manualContributions[member.id] !== undefined ? manualContributions[member.id] : Math.round(member.idealContribution)}
                                                onChange={(e) => setManualContributions(prev => ({
                                                    ...prev,
                                                    [member.id]: e.target.value
                                                }))}
                                                className="pl-5 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {calculation.projection && (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* The Plan */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">The Goal (Plan)</p>
                                    <div className="space-y-1">
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{format(targetDate!, "MMM yyyy")}</p>
                                        <p className="text-xs text-slate-500">Need ${calculation.idealGroupContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo total</p>
                                    </div>
                                </div>

                                {/* The Forecast */}
                                <div className={cn(
                                    "p-4 rounded-2xl border transition-colors",
                                    calculation.projection.error 
                                        ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800"
                                        : calculation.projection.projectedDate <= targetDate!
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800"
                                            : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"
                                )}>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">The Forecast (Reality)</p>
                                    {calculation.projection.error ? (
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-red-600 dark:text-red-400">Never Reached</p>
                                            <p className="text-xs text-red-500/80">Expenses exceed contributions</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className={cn(
                                                "text-xl font-bold",
                                                calculation.projection.projectedDate <= targetDate! ? "text-emerald-600" : "text-amber-600"
                                            )}>
                                                {format(calculation.projection.projectedDate, "MMM yyyy")}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                At ${calculation.projection.actualGroupContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo actual
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {calculation?.error && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs rounded-lg border border-amber-100 dark:border-amber-800">
                        {calculation.error}
                    </div>
                )}
            </div>
        </SectionCard>
    );
}
