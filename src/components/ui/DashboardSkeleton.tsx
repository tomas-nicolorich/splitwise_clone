import { Skeleton } from "@/components/ui/skeleton"

export function GroupCardSkeleton() {
    return (
        <div className="p-4 border rounded-xl border-slate-200">
            <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                </div>
            </div>
            <Skeleton className="h-6 w-full" />
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
                <GroupCardSkeleton key={i} />
            ))}
        </div>
    )
}
