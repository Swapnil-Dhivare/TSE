import { Link, NavLink } from "react-router-dom";
import { PageTransition } from "@/components/motion/PageTransition";
import { useAuth } from "@/auth/AuthProvider";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/admin/events", label: "Events" },
  { to: "/admin/orders", label: "Orders" },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  return (
    <div className="flex min-h-screen flex-col text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-lg font-bold uppercase text-ink">TSE admin</Link>
            <nav className="flex gap-4">
              {LINKS.map((l) => (
                <NavLink key={l.to} to={l.to}
                  className={({ isActive }) => cn("text-sm font-medium", isActive ? "text-ink" : "text-muted-foreground hover:text-ink")}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{user?.email}</span>
            <button type="button" onClick={() => void signOut()}
              className="rounded-full border border-line px-4 py-1.5 font-semibold text-ink">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1"><PageTransition /></main>
    </div>
  );
}
