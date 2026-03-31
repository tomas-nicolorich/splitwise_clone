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
import { base44 } from "@/api/client";

export default function AddExpenseDialog({ 
    open, 
    onOpenChange, 
    editingExpense, 
    group, 
    categories, 
    user, 
    members, 
    onRefresh 
}) {
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
                setPaidByUserId(isOwner ? user?.id : "");
            }
        }
    }, [open, editingExpense, isOwner, user?.id]);

    const handleAddExpense = async () => {
        const parsedAmount = parseFloat(amount);
        if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !categoryId) return;
        if (isOwner && !paidByUserId) return;

        const targetUserId = isOwner ? paidByUserId : user?.id;

        setLoading(true);

        try {
            if (editingExpense) {
                await base44.entities.Expense.update(editingExpense.id, {
                    category_id: categoryId,
                    description: description.trim(),
                    amount: parsedAmount,
                    paid_by: targetUserId,
                });
            } else {
                await base44.entities.Expense.create({
                    group_id: group.id,
                    category_id: categoryId,
                    description: description.trim(),
                    amount: parsedAmount,
                    paid_by: targetUserId,
                    date: new Date().toISOString().split("T")[0],
                });
            }

            setLoading(false);
            onOpenChange(false);
            onRefresh();
        } catch (e) {
            console.error("Error saving expense:", e);
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleAddExpense();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {isOwner && (
                        <div className="space-y-2">
                            <Label>Paid By</Label>
                            <Select value={paidByUserId} onValueChange={setPaidByUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select who paid" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map(member => (
                                        <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a budget category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
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
                        <Label>Description</Label>
                        <Input
                            placeholder="e.g. Weekly groceries"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 150"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleAddExpense}
                        disabled={!description.trim() || !amount || !categoryId || (isOwner && !paidByUserId) || loading}
                    >
                        {loading ? (editingExpense ? "Saving..." : "Adding...") : (editingExpense ? "Save" : "Add Expense")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
