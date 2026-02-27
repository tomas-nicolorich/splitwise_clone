import React, { useState, useEffect } from "react";
import { base44 } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import GroupCard from "../components/groups/GroupCard.jsx";
import CreateGroupDialog from "../components/groups/CreateGroupDialog";
import { useAuth } from "../lib/AuthContext";

export default function Dashboard() {
    const { user } = useAuth();
    const [showCreate, setShowCreate] = useState(false);
    const queryClient = useQueryClient();

    const { data: groups = [], isLoading } = useQuery({
        queryKey: ["groups"],
        queryFn: () => base44.entities.Group.list("-created_date"),
        enabled: !!user,
    });

    const myGroups = groups.filter(
        (g) => g.members?.includes(user?.id)
    );

    const createMutation = useMutation({
        mutationFn: (data) =>
            base44.entities.Group.create({
                ...data,
                members: [user.id],
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
    });

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        My Groups
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        Track shared income and split expenses fairly.
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreate(true)}
                    className="shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Group
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
            ) : myGroups.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">No groups yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Create your first group to start tracking income.</p>
                    <Button onClick={() => setShowCreate(true)}>
                        Create Group
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myGroups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                    ))}
                </div>
            )}

            <CreateGroupDialog
                open={showCreate}
                onOpenChange={setShowCreate}
                onCreate={createMutation.mutateAsync}
            />
        </div>
    );
}
