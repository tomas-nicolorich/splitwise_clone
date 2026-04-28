import { QueryClient, QueryCache } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const queryClientInstance = new QueryClient({
    queryCache: new QueryCache({
        onError: (error: Error) => {
            console.error('Query error:', error);
        },
    }),
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 5,    // 5 minutes
        },
    },
});

if (typeof window !== 'undefined') {
    const persister = createSyncStoragePersister({
        storage: window.localStorage,
    });

    persistQueryClient({
        queryClient: queryClientInstance as any,
        persister,
    });
}
