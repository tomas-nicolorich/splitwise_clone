import { Skeleton } from "@/components/ui/skeleton";

export default function SavingTargetSkeleton() {
    return (
        <div className="space-y-6">
            <div className="p-6 border rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    );
}
