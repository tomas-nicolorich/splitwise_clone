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
