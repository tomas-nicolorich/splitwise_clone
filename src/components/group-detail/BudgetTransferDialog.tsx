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
import { ArrowRightLeft } from "lucide-react";
import { getUserName } from "@/utils/utils";
import { User } from "@/api/types";

interface BudgetTransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sourceUserId: string;
    categoryId: string;
    categoryName: string;
    members: User[];
    onTransfer: (data: { sourceUserId: string; targetUserId: string; categoryId: string; amount: number }) => void;
    loading: boolean;
}

/**
 * Dialog for transferring budget between members.
 */
export default function BudgetTransferDialog({ 
    open, 
    onOpenChange, 
    sourceUserId, 
    categoryId, 
    categoryName, 
    members, 
    onTransfer, 
    loading 
}: BudgetTransferDialogProps) {
    const [targetUserId, setTargetUserId] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        if (open) {
            setTargetUserId("");
            setAmount("");
        }
    }, [open]);

    const handleTransfer = () => {
        const parsedAmount = parseFloat(amount);
        if (!targetUserId || isNaN(parsedAmount) || parsedAmount <= 0) return;
        
        onTransfer({
            sourceUserId,
            targetUserId,
            categoryId,
            amount: parsedAmount,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="dark:text-white flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-violet-500" />
                        Transfer Budget
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-100 dark:border-violet-800">
                        <p className="text-xs text-violet-700 dark:text-violet-300">
                            You are transferring budget from <strong>{getUserName(sourceUserId, members)}</strong> in the <strong>{categoryName}</strong> category.
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Recipient</Label>
                        <Select value={targetUserId} onValueChange={setTargetUserId}>
                            <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                                <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                {members.filter(m => String(m.id) !== String(sourceUserId)).map(member => (
                                    <SelectItem key={member.id} value={member.id} className="dark:text-slate-300 dark:focus:bg-slate-800">
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Amount to Give</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-7 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500">
                            This will decrease {getUserName(sourceUserId, members)}'s budget and increase the recipient's budget.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:text-slate-300 dark:border-slate-700">Cancel</Button>
                    <Button
                        onClick={handleTransfer}
                        disabled={!targetUserId || !amount || loading}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        {loading ? "Transferring..." : "Complete Transfer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
