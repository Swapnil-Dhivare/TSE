import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { safeNext } from "@/auth/redirect";

export default function AuthCallback() {
  const { status } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const error = params.get("error_description") ?? params.get("error");

  useEffect(() => {
    if (error || status === "loading") return;
    navigate(safeNext(params.get("next")), { replace: true });
  }, [status, error, params, navigate]);

  return (
    <div className="mx-auto max-w-md px-6 py-28 text-center">
      {error ? (
        <>
          <h1 className="font-display text-2xl font-bold text-ink">Sign-in failed</h1>
          <p className="mt-3 text-sm text-muted-foreground">{error}</p>
        </>
      ) : (
        <p className="text-muted-foreground">Signing you in…</p>
      )}
    </div>
  );
}
