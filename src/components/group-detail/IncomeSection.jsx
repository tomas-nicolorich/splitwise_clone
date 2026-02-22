import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Pencil, Check, X, User } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function IncomeSection({ group, incomes, user, onRefresh }) {
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState("");
    const [addingIncome, setAddingIncome] = useState(false);
    const [newAmount, setNewAmount] = useState("");
    const [addingForEmail, setAddingForEmail] = useState("");
    const [editingNameEmail, setEditingNameEmail] = useState(null);
    const [editNameValue, setEditNameValue] = useState("");
    const [userNames, setUserNames] = useState({});

    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const myIncome = incomes.find((i) => i.user_email === user.email);
    const allMembers = [group.owner_email, ...(group.members || [])];
    const isOwner = group.owner_email === user.email;

    React.useEffect(() => {
        const fetchUserNames = async () => {
            const users = await base44.entities.User.filter({ email: { $in: allMembers } });
            const names = {};
            users.forEach(u => {
                names[u.email] = u.display_name || u.full_name || u.email;
            });
            setUserNames(names);
        };
        fetchUserNames();
    }, [allMembers.join(',')]);

    const getUserName = (email) => userNames[email] || email;

    const getPercentage = (amount) => {
        if (totalIncome === 0) return 0;
        return ((amount / totalIncome) * 100).toFixed(1);
    };

    const handleSaveIncome = async () => {
        const amount = parseFloat(newAmount);
        if (isNaN(amount) || amount <= 0) return;

        const targetEmail = addingForEmail || user.email;
        const existingIncome = incomes.find(i => i.user_email === targetEmail);

        if (existingIncome) {
            await base44.entities.Income.update(existingIncome.id, { amount });
        } else {
            await base44.entities.Income.create({
                group_id: group.id,
                user_email: targetEmail,
                user_name: targetEmail,
                amount,
            });
        }
        setAddingIncome(false);
        setNewAmount("");
        setAddingForEmail("");
        onRefresh();
    };

    const handleUpdateIncome = async (incomeId) => {
        const amount = parseFloat(editAmount);
        if (isNaN(amount) || amount <= 0) return;
        await base44.entities.Income.update(incomeId, { amount });
        setEditingId(null);
        setEditAmount("");
        onRefresh();
    };

    const handleSaveName = async (email) => {
        if (!editNameValue.trim()) return;

        // Update current user if it's their own name, otherwise update via User entity
        if (email === user.email) {
            await base44.auth.updateMe({ display_name: editNameValue.trim() });
        } else {
            // Find the user by email and update their display_name
            const users = await base44.entities.User.filter({ email });
            if (users.length > 0) {
                await base44.entities.User.update(users[0].id, { display_name: editNameValue.trim() });
            }
        }

        setEditingNameEmail(null);
        setEditNameValue("");

        // Refresh user data to get updated names
        const allUsers = await base44.entities.User.filter({ email: { $in: allMembers } });
        const names = {};
        allUsers.forEach(u => {
            names[u.email] = u.display_name || u.full_name || u.email;
        });
        setUserNames(names);

        onRefresh();
    };

    const memberIncomeMap = {};
    incomes.forEach((i) => {
        memberIncomeMap[i.user_email] = i;
    });

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-white">
                        <DollarSign className="w-5 h-5 text-indigo-500" />
                        Income Overview
                    </CardTitle>
                    {!addingIncome && (
                        <Button
                            size="sm"
                            onClick={() => {
                                setAddingIncome(true);
                                setNewAmount("");
                                setAddingForEmail("");
                            }}

                        >
                            {isOwner ? "Add Income" : "Add My Income"}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {addingIncome && (
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 flex-wrap">
                        {isOwner && (
                            <Select value={addingForEmail} onValueChange={setAddingForEmail}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allMembers.map(email => (
                                        <SelectItem key={email} value={email}>{email}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {!isOwner && (
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-0 truncate">
                                {getUserName(user.email)}
                            </span>
                        )}
                        <Input
                            type="number"
                            placeholder="Monthly income"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            className="w-36"
                            autoFocus={!isOwner}
                        />
                        <Button size="icon" variant="ghost" onClick={handleSaveIncome} disabled={isOwner && !addingForEmail}>
                            <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => {
                            setAddingIncome(false);
                            setAddingForEmail("");
                        }}>
                            <X className="w-4 h-4 text-slate-400" />
                        </Button>
                    </div>
                )}

                {allMembers.map((email) => {
                    const income = memberIncomeMap[email];
                    if (!income) {
                        if (email === user.email && addingIncome) return null;
                        return (
                            <div key={email} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                                            {email[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{getUserName(email)}</span>
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500">No income set</span>
                            </div>
                        );
                    }

                    const isEditing = editingId === income.id;
                    const canEdit = income.user_email === user.email || isOwner;

                    return (
                        <div
                            key={income.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 gap-2"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                        {getUserName(income.user_email)[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    {editingNameEmail === income.user_email ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={editNameValue}
                                                onChange={(e) => setEditNameValue(e.target.value)}
                                                className="h-7 text-sm"
                                                placeholder="Enter name"
                                                autoFocus
                                            />
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSaveName(income.user_email)}>
                                                <Check className="w-3 h-3 text-green-600" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingNameEmail(null)}>
                                                <X className="w-3 h-3 text-slate-400" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                                {getUserName(income.user_email)}
                                                {income.user_email === user.email && <span className="text-indigo-500 dark:text-indigo-400 ml-1">(you)</span>}
                                            </p>
                                            {(income.user_email === user.email || isOwner) && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6"
                                                    onClick={() => {
                                                        setEditingNameEmail(income.user_email);
                                                        setEditNameValue(getUserName(income.user_email));
                                                    }}
                                                >
                                                    <User className="w-3 h-3 text-slate-400" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <>
                                        <Input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            className="w-28"
                                            autoFocus
                                        />
                                        <Button size="icon" variant="ghost" onClick={() => handleUpdateIncome(income.id)}>
                                            <Check className="w-4 h-4 text-green-600" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                                            <X className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                ${income.amount.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                {getPercentage(income.amount)}%
                                            </p>
                                        </div>
                                        {canEdit && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingId(income.id);
                                                    setEditAmount(income.amount.toString());
                                                }}
                                            >
                                                <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {totalIncome > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Household Income</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">${totalIncome.toLocaleString()}</span>
                        </div>
                        {/* Percentage bar */}
                        <div className="mt-3 h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
                            {incomes.map((income, idx) => {
                                const pct = (income.amount / totalIncome) * 100;
                                const colors = [
                                    "bg-indigo-500",
                                    "bg-violet-500",
                                    "bg-rose-400",
                                    "bg-amber-400",
                                    "bg-emerald-500",
                                ];
                                return (
                                    <div
                                        key={income.id}
                                        className={`${colors[idx % colors.length]} transition-all duration-500`}
                                        style={{ width: `${pct}%` }}
                                        title={`${income.user_name || income.user_email}: ${pct.toFixed(1)}%`}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex gap-3 mt-2 flex-wrap">
                            {incomes.map((income, idx) => {
                                const colors = [
                                    "bg-indigo-500",
                                    "bg-violet-500",
                                    "bg-rose-400",
                                    "bg-amber-400",
                                    "bg-emerald-500",
                                ];
                                return (
                                    <div key={income.id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                        <div className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                                        {getUserName(income.user_email)}
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
