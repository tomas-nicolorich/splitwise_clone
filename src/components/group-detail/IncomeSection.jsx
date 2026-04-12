import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Pencil, Check, X, User, Loader2 } from "lucide-react";
import { base44 } from "@/api/client";

export default function IncomeSection({ group, incomes: rawIncomes, user, members, onRefresh, onRefreshMembers, loading }) {
    const incomes = React.useMemo(() => {
        const map = new Map();
        (rawIncomes || []).forEach(inc => {
            if (inc && inc.user) map.set(inc.user.toString(), inc);
        });
        return Array.from(map.values());
    }, [rawIncomes]);

    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState("");
    const [addingIncome, setAddingIncome] = useState(false);
    const [newAmount, setNewAmount] = useState("");
    const [addingForUserId, setAddingForUserId] = useState("");
    const [editingNameUserId, setEditingNameUserId] = useState(null);
    const [editNameValue, setEditNameValue] = useState("");

    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const isOwner = group.members?.[0] === user.id;

    const getUserName = (userId) => {
        const member = members.find(m => m.id === userId);
        return member ? member.name : "Unknown User";
    };

    const getPercentage = (amount) => {
        if (totalIncome === 0) return 0;
        return Math.round((amount / totalIncome) * 100);
    };

    const handleSaveIncome = async () => {
        const amount = parseFloat(newAmount);
        if (isNaN(amount) || amount < 0) return;

        const targetUserId = addingForUserId || user.id;
        const existingIncome = incomes.find(i => i.user === targetUserId);

        if (existingIncome) {
            await base44.entities.Income.update(existingIncome.id, { amount });
        } else {
            await base44.entities.Income.create({
                group_id: group.id,
                user: targetUserId,
                amount,
            });
        }
        setAddingIncome(false);
        setNewAmount("");
        setAddingForUserId("");
        onRefresh();
    };

    const handleUpdateIncome = async (incomeId) => {
        const amount = parseFloat(editAmount);
        if (isNaN(amount) || amount < 0) return;
        await base44.entities.Income.update(incomeId, { amount });
        setEditingId(null);
        setEditAmount("");
        onRefresh();
    };

    const handleSaveName = async (userId) => {
        if (!editNameValue.trim()) return;

        // Update current user if it's their own name, otherwise update via Users entity
        if (userId === user.id) {
            await base44.auth.updateMe({ full_name: editNameValue.trim() });
        } else {
            await base44.entities.Users.update(userId, { name: editNameValue.trim() });
        }

        setEditingNameUserId(null);
        setEditNameValue("");
        onRefreshMembers();
    };

    const memberIncomeMap = {};
    incomes.forEach((i) => {
        memberIncomeMap[i.user] = i;
    });

    const activeIncomes = incomes.filter(i => (i.amount || 0) > 0);

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden">
            <CardHeader className="p-4 sm:pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 dark:text-white">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                        Income Overview
                    </CardTitle>
                    {!addingIncome && (
                        <Button
                            size="sm"
                            className="h-8 text-xs sm:h-9 sm:text-sm"
                            onClick={() => {
                                setAddingIncome(true);
                                setNewAmount("");
                                setAddingForUserId("");
                            }}

                        >
                            {isOwner ? "Add Income" : "Add My Income"}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 sm:space-y-3 min-h-[100px]">
                {loading && !incomes.length ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                ) : (
                    <>
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            </div>
                        )}
                            </>
                )}
                {addingIncome && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 flex-wrap">
                        {isOwner && (
                            <Select value={addingForUserId} onValueChange={setAddingForUserId}>
                                <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
                                    <SelectValue placeholder="Select member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {!isOwner && (
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-0 truncate">
                                {getUserName(user.id)}
                            </span>
                        )}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                type="number"
                                placeholder="Monthly income"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                className="flex-1 sm:w-36 h-9 text-sm"
                                autoFocus={!isOwner}
                            />
                            <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={handleSaveIncome} disabled={isOwner && !addingForUserId}>
                                <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => {
                                setAddingIncome(false);
                                setAddingForUserId("");
                            }}>
                                <X className="w-4 h-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>
                )}

                {members.map((member) => {
                    const income = memberIncomeMap[member.id];
                    if (!income) {
                        if (member.id === user.id && addingIncome) return null;
                        return (
                            <div key={member.id} className="flex items-center justify-between py-2 px-3 sm:py-3 sm:px-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-300">
                                            {member.name[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{member.name}</span>
                                </div>
                                <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">No income set</span>
                            </div>
                        );
                    }

                    const isEditing = editingId === income.id;
                    const canEdit = member.id === user.id || isOwner;

                    return (
                        <div
                            key={income.id}
                            className="flex items-center justify-between py-2 px-3 sm:py-3 sm:px-4 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 gap-2"
                        >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                        {member.name[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    {editingNameUserId === member.id ? (
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <Input
                                                value={editNameValue}
                                                onChange={(e) => setEditNameValue(e.target.value)}
                                                className="h-7 text-xs sm:text-sm"
                                                placeholder="Enter name"
                                                autoFocus
                                            />
                                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => handleSaveName(member.id)}>
                                                <Check className="w-3 h-3 text-green-600" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => setEditingNameUserId(null)}>
                                                <X className="w-3 h-3 text-slate-400" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                                {member.name}
                                                {member.id === user.id && <span className="text-indigo-500 dark:text-indigo-400 ml-0.5 sm:ml-1">(you)</span>}
                                            </p>
                                            {(member.id === user.id || isOwner) && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-5 w-5 sm:h-6 sm:w-6"
                                                    onClick={() => {
                                                        setEditingNameUserId(member.id);
                                                        setEditNameValue(member.name);
                                                    }}
                                                >
                                                    <User className="w-2.5 h-2.5 sm:w-3 h-3 text-slate-400" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                {isEditing ? (
                                    <>
                                        <Input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            className="w-20 sm:w-28 h-8 text-xs sm:text-sm"
                                            autoFocus
                                        />
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUpdateIncome(income.id)}>
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                            <X className="w-3.5 h-3.5 text-slate-400" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-right">
                                            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                ${Number(income.amount).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                {getPercentage(income.amount)}%
                                            </p>
                                        </div>
                                        {canEdit && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 sm:h-8 sm:w-8"
                                                onClick={() => {
                                                    setEditingId(income.id);
                                                    setEditAmount(income.amount.toString());
                                                }}
                                            >
                                                <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {totalIncome > 0 && (
                    <div className="mt-2 pt-3 sm:mt-4 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Total Household Income</span>
                            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">${totalIncome.toLocaleString()}</span>
                        </div>
                        {/* Percentage bar */}
                        <div className="mt-2 sm:mt-3 h-2 sm:h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
                            {activeIncomes.map((income, idx) => {
                                const pct = (income.amount / totalIncome) * 100;
                                const colors = [
                                    "bg-indigo-500",
                                    "bg-emerald-500",
                                    "bg-rose-500",
                                    "bg-amber-500",
                                    "bg-sky-500",
                                ];
                                return (
                                    <div
                                        key={income.id}
                                        className={`${colors[idx % colors.length]} transition-all duration-500`}
                                        style={{ width: `${pct}%` }}
                                        title={`${getUserName(income.user)}: ${Math.round(pct)}%`}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex gap-2 sm:gap-3 mt-2 flex-wrap">
                            {activeIncomes.map((income, idx) => {
                                const colors = [
                                    "bg-indigo-500",
                                    "bg-emerald-500",
                                    "bg-rose-500",
                                    "bg-amber-500",
                                    "bg-sky-500",
                                ];
                                return (
                                    <div key={income.id} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                                        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                                        {getUserName(income.user)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
