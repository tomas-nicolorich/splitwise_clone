import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Custom hook to manage all groups for the dashboard.
 * @returns {Object} - Groups data, status, and mutations.
 */
export function useGroups() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: groups = [], isLoading, isFetching } = useQuery({
        queryKey: ["groups"],
        queryFn: () => base44.entities.Group.list("-created_date"),
        enabled: !!user,
    });

    const myGroups = groups.filter(
        (g) => g.members?.includes(user?.id)
    );

    const createGroup = useMutation({
        mutationFn: (data) =>
            base44.entities.Group.create({
                ...data,
                members: [user.id],
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
    });

    return {
        groups: myGroups,
        allGroups: groups,
        isLoading,
        isFetching,
        actions: {
            createGroup: createGroup.mutateAsync
        }
    };
}
