import { Skeleton } from "@/components/ui/skeleton";

export function SectionSkeleton({ title }) {
    return (
        <div className="p-4 border rounded-xl border-slate-200 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

export function GroupDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <SectionSkeleton />
                    <SectionSkeleton />
                    <SectionSkeleton />
                </div>
                <div className="space-y-6">
                    <SectionSkeleton />
                </div>
            </div>
        </div>
    );
}
