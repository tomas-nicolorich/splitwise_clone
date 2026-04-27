import React, { useState, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightLeft, List, History } from "lucide-react";
import { format } from "date-fns";
import { useGroupData } from "@/hooks/use-group-data";
import SectionCard from "@/components/ui/SectionCard";
import { getUserName } from "@/utils/utils";
import { Expense, User } from "@/api/types";

interface TransferRowProps {
    transfer: Expense;
    members: User[];
}

const TransferRow: React.FC<TransferRowProps> = ({ transfer, members }) => {
    // Extract receiver name/ID from description if possible, or use fallback
    // Description format: [BUDGET_TRANSFER] TO:{receiverId} FROM:{senderName}
    const description = transfer.description || "";
    const receiverMatch = description.match(/TO:(\d+)/);
    const receiverId = receiverMatch ? receiverMatch[1] : null;
    const receiverName = receiverId ? getUserName(receiverId, members) : "Unknown";
    const senderName = getUserName(transfer.paid_by, members);

    return (
        <div
            className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors gap-2"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    <span className="truncate">{senderName}</span>
                    <ArrowRightLeft className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{receiverName}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-1.5 py-0.5 bg-violet-50 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-full font-medium">
                        Budget Adjustment
                    </span>
                    {transfer.date && (
                        <span>• {format(new Date(transfer.date), "MMM d, yyyy")}</span>
                    )}
                </div>
            </div>
            <div className="shrink-0 text-right">
                <span className="text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400">
                    ${Number(transfer.amount).toFixed(2)}
                </span>
            </div>
        </div>
    );
};

interface BudgetTransfersSectionProps {
    groupId: string;
}

const BudgetTransfersSection: React.FC<BudgetTransfersSectionProps> = memo(function BudgetTransfersSection({ groupId }) {
    const { 
        expenses, 
        members, 
        isFetching 
    } = useGroupData(groupId);

    const [showAll, setShowAll] = useState(false);

    const transfers = useMemo(() => {
        return (expenses || [])
            .filter(e => e.description?.startsWith('[BUDGET_TRANSFER]'))
            .sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            });
    }, [expenses]);

    const displayedTransfers = transfers.slice(0, 3);

    if (transfers.length === 0 && !isFetching) return null;

    return (
        <SectionCard
            title="Budget Transfers"
            icon={History}
            loading={isFetching}
        >
            <div className="space-y-2">
                {displayedTransfers.map((transfer) => (
                    <TransferRow
                        key={transfer.id}
                        transfer={transfer}
                        members={members}
                    />
                ))}
                
                {transfers.length > 3 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-violet-600 dark:text-violet-400 text-xs sm:text-sm h-8 mt-1"
                        onClick={() => setShowAll(true)}
                    >
                        <History className="w-3.5 h-3.5 mr-1.5" />
                        See All ({transfers.length})
                    </Button>
                )}
            </div>

            {/* View All Modal */}
            <Dialog open={showAll} onOpenChange={setShowAll}>
                <DialogContent className="sm:max-w-2xl dark:bg-slate-800 dark:border-slate-700 h-[80vh] !flex !flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2 shrink-0 border-b dark:border-slate-700">
                        <DialogTitle className="dark:text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-violet-500" />
                            All Budget Transfers
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-6 space-y-2 py-4">
                            {transfers.map((transfer) => (
                                <TransferRow
                                    key={transfer.id}
                                    transfer={transfer}
                                    members={members}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </SectionCard>
    );
});

export default BudgetTransfersSection;
