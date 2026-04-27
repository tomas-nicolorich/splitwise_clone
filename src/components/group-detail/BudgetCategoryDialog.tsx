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
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Dialog for adding or editing a budget category.
 */
export default function BudgetCategoryDialog({ 
    open, 
    onOpenChange, 
    category, 
    members, 
    onSave, 
    loading 
}) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [icon, setIcon] = useState("📁");
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        if (category) {
            setName(category.name || "");
            setAmount(category.amount?.toString() || "");
            setIcon(category.icon || "📁");
            setSelectedMembers(category.members || []);
        } else {
            setName("");
            setAmount("");
            setIcon("📁");
            setSelectedMembers([]);
        }
    }, [category, open]);

    const handleSave = () => {
        const parsedAmount = parseFloat(amount);
        if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
        
        onSave({
            id: category?.id,
            name: name.trim(),
            amount: parsedAmount,
            icon,
            members: selectedMembers,
        });
    };

    const toggleMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">
                        {category ? "Edit Budget Category" : "Add Budget Category"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="flex items-end gap-3">
                        <div className="space-y-2 flex-1">
                            <Label className="dark:text-slate-300">Category Name</Label>
                            <Input
                                placeholder="e.g. Rent, Groceries, Utilities"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="dark:text-slate-300">Icon</Label>
                            <Input
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="📁"
                                className="w-12 h-10 p-0 text-center text-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                maxLength={2}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Monthly Amount</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 1500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="dark:text-slate-300">Participating Members (Optional)</Label>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">If none selected, category applies to all group members.</p>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <Checkbox
                                        id={`member-${member.id}`}
                                        checked={selectedMembers.includes(member.id)}
                                        onCheckedChange={() => toggleMember(member.id)}
                                    />
                                    <label
                                        htmlFor={`member-${member.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300 cursor-pointer flex-1"
                                    >
                                        {member.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:text-slate-300 dark:border-slate-700">Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || !amount || loading}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? "Saving..." : (category ? "Save Changes" : "Add Category")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
