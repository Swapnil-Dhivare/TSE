import { Outlet, ScrollRestoration } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/auth/AuthProvider";

/**
 * Providers live here, not in main.tsx: with RouterProvider there is no router
 * context above it, and AuthProvider needs router hooks.
 */
export function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ScrollRestoration />
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
