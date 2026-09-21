import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, gcTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false },
    // Never auto-retry a mutation: a retried create-order is a duplicate-order bug.
    mutations: { retry: false },
  },
});
