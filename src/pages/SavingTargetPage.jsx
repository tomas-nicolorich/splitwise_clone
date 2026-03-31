import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/Layout";
import SavingTargetSection from "@/components/group-detail/SavingTargetSection";

export default function SavingTargetPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get("id");

    const { data: group, isLoading: groupLoading } = useQuery({
        queryKey: ["group", groupId],
        queryFn: async () => {
            const groups = await base44.entities.Group.filter({ id: groupId });
            return groups[0];
        },
        enabled: !!groupId,
    });

    const { data: members = [], isLoading: membersLoading } = useQuery({
        queryKey: ["members", group?.members],
        queryFn: async () => {
            if (!group?.members?.length) return [];
            return base44.entities.Users.filter({ id: { $in: group.members } });
        },
        enabled: !!group?.members?.length,
    });

    const { data: incomes = [], isLoading: incomesLoading } = useQuery({
        queryKey: ["incomes", groupId],
        queryFn: () => base44.entities.Income.filter({ group_id: groupId }),
        enabled: !!groupId,
    });

    if (groupLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link to={`/GroupDetail?id=${groupId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{group?.name}</h1>
                        <p className="text-sm text-slate-500">Saving Target Calculator</p>
                    </div>
                </div>
                <SavingTargetSection members={members} incomes={incomes} loading={membersLoading || incomesLoading} />
            </div>
        </Layout>
    );
}
