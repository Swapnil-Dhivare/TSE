import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function Gate({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-28 text-center text-muted-foreground">{label}</div>
  );
}

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <Gate label="Checking your session…" />;
  if (status === "unauthenticated") {
    const next = location.pathname + location.search;
    return <Navigate to={`/auth/sign-in?next=${encodeURIComponent(next)}`} replace />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { status, isAdmin } = useAuth();
  if (status === "loading") return <Gate label="Checking your session…" />;
  if (status === "unauthenticated") return <Navigate to="/auth/sign-in?next=/admin" replace />;
  // A 403, never a redirect — bouncing a signed-in non-admin to sign-in is an infinite loop.
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Not authorised</h1>
        <p className="mt-3 text-muted-foreground">This area is for TSE staff only.</p>
      </div>
    );
  }
  return <Outlet />;
}
