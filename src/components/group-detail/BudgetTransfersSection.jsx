import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightLeft, Loader2, List, History } from "lucide-react";
import { format } from "date-fns";

const TransferRow = ({ transfer, members }) => {
    const getUserName = (userId) => {
        const member = members.find(m => String(m.id) === String(userId));
        return member ? member.name : "Unknown User";
    };

    // Extract receiver name/ID from description if possible, or use fallback
    // Description format: [BUDGET_TRANSFER] TO:{receiverId} FROM:{senderName}
    const receiverMatch = transfer.description.match(/TO:(\d+)/);
    const receiverId = receiverMatch ? receiverMatch[1] : null;
    const receiverName = receiverId ? getUserName(receiverId) : "Unknown";
    const senderName = getUserName(transfer.paid_by);

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

export default function BudgetTransfersSection({ expenses, members, loading }) {
    const [showAll, setShowAll] = useState(false);

    const transfers = React.useMemo(() => {
        return (expenses || [])
            .filter(e => e.description?.startsWith('[BUDGET_TRANSFER]'))
            .sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0);
                const dateB = b.date ? new Date(b.date) : new Date(0);
                return dateB - dateA;
            });
    }, [expenses]);

    const displayedTransfers = transfers.slice(0, 3);

    if (transfers.length === 0 && !loading) return null;

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden">
            <CardHeader className="p-4 sm:pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 dark:text-white">
                        <History className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
                        Budget Transfers
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 min-h-[60px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                )}
                
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
                            <List className="w-3.5 h-3.5 mr-1.5" />
                            See All ({transfers.length})
                        </Button>
                    )}

                    {transfers.length === 0 && loading && (
                        <div className="py-8 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                        </div>
                    )}
                </div>
            </CardContent>

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
        </Card>
    );
}
