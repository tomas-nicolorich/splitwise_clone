import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupData } from "@/hooks/use-group-data";
import { Expense } from "@/api/types";

interface AddExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingExpense?: Expense | null;
    groupId: string;
}

export default function AddExpenseDialog({ 
    open, 
    onOpenChange, 
    editingExpense, 
    groupId
}: AddExpenseDialogProps) {
    const { user } = useAuth();
    const { 
        group, 
        categories, 
        members, 
        actions 
    } = useGroupData(groupId);

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [paidByUserId, setPaidByUserId] = useState("");
    const [loading, setLoading] = useState(false);

    const isOwner = group?.members?.[0] === user?.id;

    useEffect(() => {
        if (open) {
            if (editingExpense) {
                setDescription(editingExpense.description || "");
                setAmount(editingExpense.amount?.toString() || "");
                setCategoryId(editingExpense.category_id || "");
                setPaidByUserId(editingExpense.paid_by || "");
            } else {
                setDescription("");
                setAmount("");
                setCategoryId("");
                setPaidByUserId(isOwner ? user?.id || "" : "");
            }
        }
    }, [open, editingExpense, isOwner, user?.id]);

    const handleAddExpense = async () => {
        const parsedAmount = parseFloat(amount);
        if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !categoryId) return;
        if (isOwner && !paidByUserId) return;

        const targetUserId = isOwner ? paidByUserId : user?.id;
        if (!targetUserId) return;

        setLoading(true);

        try {
            if (editingExpense) {
                await actions.updateExpense({
                    id: editingExpense.id,
                    category_id: categoryId,
                    description: description.trim(),
                    amount: parsedAmount,
                    paid_by: targetUserId,
                });
            } else {
                await actions.addExpense({
                    category_id: categoryId,
                    description: description.trim(),
                    amount: parsedAmount,
                    paid_by: targetUserId,
                    date: new Date().toISOString().split("T")[0],
                });
            }

            setLoading(false);
            onOpenChange(false);
        } catch (e) {
            console.error("Error saving expense:", e);
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAddExpense();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {isOwner && (
                        <div className="space-y-2">
                            <Label className="dark:text-slate-300">Paid By</Label>
                            <Select value={paidByUserId} onValueChange={setPaidByUserId}>
                                <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                                    <SelectValue placeholder="Select who paid" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                    {members.map(member => (
                                        <SelectItem key={member.id} value={member.id} className="dark:text-slate-300 dark:focus:bg-slate-800">{member.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                                <SelectValue placeholder="Select a budget category" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id} className="dark:text-slate-300 dark:focus:bg-slate-800">
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {categories.length === 0 && (
                            <p className="text-xs text-amber-600">Add a budget category first</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Description</Label>
                        <Input
                            placeholder="e.g. Weekly groceries"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-7 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:text-slate-300 dark:border-slate-700">Cancel</Button>
                    <Button
                        onClick={handleAddExpense}
                        disabled={!description.trim() || !amount || !categoryId || (isOwner && !paidByUserId) || loading}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? (editingExpense ? "Saving..." : "Adding...") : (editingExpense ? "Save" : "Add Expense")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
