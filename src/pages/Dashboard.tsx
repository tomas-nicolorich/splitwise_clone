import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import GroupCard from "../components/dashboard/GroupCard";
import CreateGroupDialog from "../components/dashboard/CreateGroupDialog";
import { useAuth } from "../contexts/AuthContext";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import { useGroups } from "@/hooks/use-groups";

export default function Dashboard() {
    const { user } = useAuth();
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const { groups, isLoading, actions } = useGroups();

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
                <DashboardSkeleton />
            ) : groups.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No groups yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Create your first group to start tracking income.</p>
                    <Button onClick={() => setShowCreate(true)}>
                        Create Group
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                    ))}
                </div>
            )}

            <CreateGroupDialog
                open={showCreate}
                onOpenChange={setShowCreate}
                onCreate={async (data) => {
                    await actions.createGroup(data);
                }}
            />
        </div>
    );
}
